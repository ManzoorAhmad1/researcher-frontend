/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createBookmark,
  generateBookmark,
  getBookmark,
  updateBookmark,
} from "@/apis/notes-bookmarks";
import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { getNotesBookmarkAllData } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import dynamic from "next/dynamic";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { AddBookmarkDialogProps } from "../utils/types";
import "../components/note/textEditor.css";
import Image from "next/image";
import { FiUploadCloud } from "react-icons/fi";
import { CiEdit } from "react-icons/ci";
import { IoChevronBack } from "react-icons/io5";
import { OptimizedImage } from "@/components/ui/optimized-image";
import "./react-select.css";
import toast from "react-hot-toast";
const ReactQuillNoSSR = dynamic(() => import("react-quill"), { ssr: false });

interface Tag {
  name: string;
  color: string;
}

interface FormData {
  title: string;
  link: string;
  description: string;
  image: any;
  tags: Tag[];
}

const AddBookmarkDialog: React.FC<AddBookmarkDialogProps> = ({
  bookmarkInfo,
  setBookmarkInfo,
}) => {
  const params = useParams();
  const { slug } = params;
  const id = slug?.[slug.length - 1];
  const { socket } = useSocket();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [gettingBookmark, setGettingBookmark] = useState(false);
  const [description, setDescription] = useState("");
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { project } = useSelector((state: any) => state?.project);
  const { pagination } = useSelector(
    (state: RootState) => state.notesbookmarks
  );
  const userInfo = useSelector((state: RootState) => state.user.user?.user);
  const [tagText, setTagText] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [fetching, setFetching] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const processedUrlRef = useRef<string | null>(null);

  const colorOptions = [
    { color: "#E9222229", borderColor: "#E92222" },
    { color: "#F59B1429", borderColor: "#F59B14" },
    { color: "#F5DE1429", borderColor: "#F5DE14" },
    { color: "#079E2829", borderColor: "#079E28" },
    { color: "#D4157E29", borderColor: "#D4157E" },
    { color: "#0E70FF29", borderColor: "#0E70FF" },
    { color: "#8D17B529", borderColor: "#8D17B5" },
  ];

  const getRandomColorFromOptions = () => {
    const randomIndex = Math.floor(Math.random() * colorOptions.length);
    return colorOptions[randomIndex].color;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagText.trim()) {
      e.preventDefault();
      const newTagName = tagText.trim();

      if (
        !tags.some((tag) => tag.name.toLowerCase() === newTagName.toLowerCase())
      ) {
        setTags([
          ...tags,
          {
            name: newTagName,
            color: getRandomColorFromOptions(),
          },
        ]);
      }
      setTagText("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const { currentPage } = pagination;
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      link: "",
      description: "",
      image: null,
      tags: [],
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    const members = JSON.stringify([
      {
        email: userInfo?.email,
        role: "Owner",
      },
    ]);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("link", data.link);
    formData.append("folder_id", id ? id : "0");
    formData.append("type", "file");
    formData.append("description", data.description);
    formData.append("project_id", project?.id);
    formData.append("tags", JSON.stringify(tags));
    formData.append("members", members);
    if (data.image) {
      formData.append("file", data.image);
    }

    if (bookmarkInfo?.id) {
      await updateBookmark(bookmarkInfo?.id, formData);
      toast.success("Bookmark updated successfully.");
    } else {
      await createBookmark(workspace?.id, formData);
      toast.success("Bookmark added successfully.");
    }

    const body = { workspace_id: workspace?.id, project_id: project?.id };
    dispatch(
      getNotesBookmarkAllData({
        id: id ? id : 0,
        currentPage,
        perPageLimit: 10,
        body,
      })
    );
    setBookmarkInfo({ show: false, id: "" });
    setLoading(false);
    reset({
      title: "",
      link: "",
      description: "",
      tags: [],
      image: null,
    });
    setCurrentImage("");
    setDescription("");
    setTags([]);
    setDataLoaded(false);
    processedUrlRef.current = null;
  };

  const genBookmarkData = async (url: string) => {
    setFetching(true);
    try {
      const response = await generateBookmark(workspace?.id, {
        url,
        projectId: project?.id,
      });
      if (response?.error) {
        toast.error(response?.message || "Something went wrong!");
      }
      const structuredTags = response?.data?.keywords?.map((tag: string) => {
        const randomColor =
          colorOptions[Math.floor(Math.random() * colorOptions.length)].color;
        return {
          name: tag,
          color: randomColor,
        };
      });

      setValue("title", response?.data?.title);
      // setValue("link", response?.link);
      setValue("image", response?.siteIcon);
      setValue("description", response?.data?.abstract);
      setTags(structuredTags || []);
      setDescription(response?.data?.abstract);
      setCurrentImage(response?.siteIcon);
      setDataLoaded(true);
      // console.log(response, "resres");
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  // useEffect(() => {
  //   const link = watch("link");

  //   // const isValidURL = (url: string) => {
  //   //   const pattern = new RegExp(
  //   //     /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  //   //     "i"
  //   //   );
  //   //   return pattern.test(url);
  //   // };
  //   function isValidURL(url: string): boolean {
  //     try {
  //       new URL(url);
  //       return true;
  //     } catch (_) {
  //       return false;
  //     }
  //   }

  //   const delayDebounce = setTimeout(() => {
  //     if (link && isValidURL(link) && !bookmarkInfo?.id) {
  //       genBookmarkData(link);
  //     }
  //   }, 500);

  //   return () => clearTimeout(delayDebounce);
  // }, [watch("link"), !bookmarkInfo?.id]);

  useEffect(() => {
    if (socket) {
      socket.on("update-texteditor-description", (content) => {
        setValue("description", content);
        setDescription(content);
      });

      return () => {
        socket.off("update-description");
      };
    }
  }, [socket]);

  const handleDescriptionChange = (value: string) => {
    if (value !== description) {
      setDescription(value);
      setValue("description", value);
      if (socket) {
        socket.emit("texteditor-description", value);
      }
    }
  };

  useEffect(() => {
    const fetchBookmark = async () => {
      if (bookmarkInfo?.id) {
        setGettingBookmark(true);
        try {
          const apiRes = await getBookmark(bookmarkInfo.id);
          if (apiRes.success) {
            setValue("title", apiRes?.data?.title);
            setValue("link", apiRes?.data?.link);
            setValue("image", apiRes?.data?.image_url);
            setValue("description", apiRes?.data?.description);
            setTags(apiRes?.data?.tags);
            setDescription(apiRes?.data?.description);
            setCurrentImage(apiRes?.data?.image_url);
            setDataLoaded(true);

            if (apiRes?.data?.tags) {
              try {
                const parsedTags = JSON.parse(apiRes?.data?.tags);
                if (Array.isArray(parsedTags)) {
                  setTags(parsedTags);
                }
              } catch (e) {
                console.error("Error parsing tags", e);
              }
            }
          }
          setGettingBookmark(false);
        } catch (error) {
          console.error("Failed to fetch bookmark:", error);
          setGettingBookmark(false);
        }
      }
    };

    fetchBookmark();
  }, [bookmarkInfo?.id]);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement> | any
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setCurrentImage(fileURL);
      setValue("image", event.target.files?.[0]);
    }
  };

  function normalizeUrl(url: string) {
    try {
      // If no scheme, prepend https://
      if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  function isValidURL(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const link = watch("link");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (link && isValidURL(normalizeUrl(link))) {
        const normalized = normalizeUrl(link);

        if (normalized !== processedUrlRef.current && !bookmarkInfo?.id) {
          processedUrlRef.current = normalized;
          setValue("link", normalized);
          genBookmarkData(normalized);
        }
      } else {
        processedUrlRef.current = null;
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [link, bookmarkInfo?.id]);

  return (
    <Dialog
      open={bookmarkInfo?.show}
      onOpenChange={() => {
        setBookmarkInfo({ show: false, id: "" });
        reset({
          title: "",
          link: "",
          description: "",
          tags: [],
          image: null,
        });
        setTags([]);
        setDescription("");
        setCurrentImage(null);
        setDataLoaded(false);
        processedUrlRef.current = null;
      }}
    >
      <DialogContent className="max-w-[510px] max-h-[95vh] overflow-y-auto">
        {gettingBookmark ? (
          <div className="h-40 flex justify-center items-center">
            <LoaderCircle className="animate-spin h-5 mx-auto" />
          </div>
        ) : (
          <div className="w-[450px]">
            <DialogHeader className="mb-3 flex items-center  flex-row">
              <span className="!m-0 text-2xl">
                {fetching ? "Fetching Details..." : "Add Bookmark"}
              </span>
            </DialogHeader>
            {dataLoaded && <h3 className="font-medium">BookMark Details</h3>}
            <form className="" onSubmit={handleSubmit(onSubmit)}>

              {dataLoaded && (
                <div className="w-[100px] mx-auto mb-4 mt-2">
                  <div className="w-full inline-block relative ">
                    <div
                      onClick={() =>
                        document.getElementById("bookmark-img")?.click()
                      }
                      className="w-[100px] cursor-pointer  h-[100px] dark:bg-[#202d32] mx-auto border border-[#f3f3f3] dark:border-[#909091] mx-a rounded-lg flex justify-center items-center overflow-hidden "
                    >
                      {!currentImage ? (
                        <FiUploadCloud className="text-5xl text-gray-400" />
                      ) : (
                        <div className="bookmark-img-container h-full w-full flex justify-center items-center ">
                          <div className="bookmark-img">
                            <CiEdit className="text-5xl text-gray-400" />
                          </div>
                          <OptimizedImage
                            width={100}
                            height={100}
                            src={currentImage}
                            alt="Current"
                            className="!h-full max-h-full max-w-full object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    hidden
                    id="bookmark-img"
                    type="file"
                    accept="image/*"
                    {...register("image")}
                    onChange={handleImageChange}
                  />
                </div>
              )}
              <div className="flex flex-col gap-4 mb-5">
                <div className="w-full">
                  <label className="text-sm font-medium">URL</label>
                  <div className="dark:bg-[#202d32]">
                    <Input
                      placeholder="https://app.researchcollab.ai"
                      {...register("link", {
                        required: "Link is required",
                        // pattern: {
                        //   value:
                        //     /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                        //   message: "Please enter a valid URL",
                        // },
                        validate: (value) => {
                          try {
                            new URL(normalizeUrl(value));
                            return true;
                          } catch {
                            return "Please enter a valid URL";
                          }
                        },
                      })}
                      className="dark:border-[#909091]"
                    />
                  </div>
                  {errors.link && (
                    <p className="text-red-500 text-[12px]">
                      {errors.link.message}
                    </p>
                  )}
                </div>
                {dataLoaded && (
                  <div className="w-full">
                    <label className="text-sm font-medium">TITLE</label>
                    <div className="dark:bg-[#202d32]">
                      <Input
                        placeholder="Title: Testing"
                        {...register("title", {
                          required: "Title is required",
                        })}
                        className="dark:border-[#909091]"
                      />
                    </div>
                    {errors.title && (
                      <p className="text-red-500 text-[12px]">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                )}
                {dataLoaded && (
                  <div>
                    <label className="text-sm font-medium">TAGS</label>
                    <div className="dark:bg-[#202d32]">
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 mt-1 dark:border-[#909091]"
                        placeholder="Add tags"
                        value={tagText}
                        onChange={(e) => setTagText(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags?.map((tag, index) => {
                        const colorOption = colorOptions.find(
                          (opt) => opt.color === tag.color
                        );
                        const displayName =
                          tag.name.length > 50
                            ? `${tag.name.substring(0, 47)}...`
                            : tag.name;
                        return (
                          <span
                            key={index}
                            className="text-sm px-3 py-1 rounded-lg flex items-center gap-1"
                            style={{
                              backgroundColor: tag.color,
                              border: colorOption
                                ? `1px solid ${colorOption.borderColor}`
                                : "none",
                            }}
                          >
                            {displayName}
                            <button
                              type="button"
                              className="ml-1 hover:text-red-600"
                              onClick={() => removeTag(index)}
                            >
                              &times;
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {dataLoaded && (
                <div className="w-full">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <ReactQuillNoSSR
                        {...field}
                        theme="snow"
                        value={description}
                        className="customQuill"
                        onChange={handleDescriptionChange}
                        placeholder="Write something amazing..."
                      />
                    )}
                  />
                </div>
              )}
              <DialogFooter className="mt-10">
                <div className="flex gap-2 justify-end items-center relative">
                  <Button
                    onClick={() => {
                      setBookmarkInfo({ show: false, id: "" });
                      reset({
                        title: "",
                        link: "",
                        description: "",
                        tags: [],
                        image: null,
                      });
                      setTags([]);
                      setDescription("");
                      setCurrentImage(null);
                      setDataLoaded(false);
                      processedUrlRef.current = null;
                    }}
                    className="rounded-[26px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
                    variant="outline"
                    type="button"
                  >
                    Cancel
                  </Button>
                  {dataLoaded && (
                    <Button
                      type="submit"
                      className="rounded-[26px] btn text-white h-9"
                    >
                      {loading ? (
                        <LoaderCircle className="animate-spin h-5 mx-auto" />
                      ) : (
                        <>
                          <span className="text-nowrap">Add Bookmark</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddBookmarkDialog;
