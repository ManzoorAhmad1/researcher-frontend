"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { getNotesBookmarkAllData } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { FiUploadCloud } from "react-icons/fi";
import { CiEdit } from "react-icons/ci";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from "next-nprogress-bar";
import {
  createBookmark,
  getBookmark,
  updateBookmark,
} from "@/apis/notes-bookmarks";
import BookmarkShareDialog from "../../dialog/BookmarkShareDialog";
import aiRobot from "@/images/ai-robot.png";
import AddBookmarkCommentsDialog from "../../dialog/AddBookmarkCommentsDialog";
import BookmarhQuillEditor from "./BookmarhQuillEditor";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
interface FormData {
  title: string;
  link: string;
  description: string;
  image: any;
}
const CreateBookmark = () => {
  const quillRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const route = useRouter();
  const { slug } = params;
  const id = slug?.[slug.length - 1];
  const folder_id = slug?.[slug.length - 3];
  const { socket } = useSocket();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { project } = useSelector((state: any) => state?.project);
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const [description, setDescription] = useState("");
  const { pagination } = useSelector(
    (state: RootState) => state.notesbookmarks
  );
  const { currentPage } = pagination;
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userInfo = useSelector((state: RootState) => state.user.user?.user);
  const [commentsData, setCommentsData] = useState({});
  const [addComment, setAddComment] = useState(false);
  const [commentsDialogShow, setCommentsDialogShow] = useState(false);
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      link: "",
      description: "",
      image: null,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const members = JSON.stringify([
      {
        email: userInfo?.email,
        role: "Owner",
      },
    ]);
    setLoading(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("link", data.link);
    formData.append("folder_id", folder_id ? folder_id : "0");
    formData.append("type", "file");
    formData.append("description", data.description);
    formData.append("project_id", project?.id);
    formData.append("members", members);

    if (data.image) {
      formData.append("file", data.image);
    }

    if (!isError) {
      await updateBookmark(id, formData);
    } else {
      await createBookmark(workspace?.id, formData);
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
    route.back();
    setLoading(false);
  };

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

  const handleDescriptionChange = (value: string) => {
    if (value !== description) {
      setDescription(value);
      setValue("description", value);
      if (socket) {
        socket.emit("texteditor-description", value);
      }
    }
  };

  const fetchBookmark = async () => {
    if (id) {
      try {
        setIsLoading(true);
        const apiRes = await getBookmark(id);
        if (apiRes.success) {
          setValue("title", apiRes?.data?.title);
          setValue("link", apiRes?.data?.link);
          setValue("image", apiRes?.data?.image_url);
          setValue("description", apiRes?.data?.description);
          setDescription(apiRes?.data?.description);
          setCurrentImage(apiRes?.data?.image_url);

          const singleMembers = apiRes?.data.members?.find(
            (item: any) => item.email === userInfo?.email
          );
          if (singleMembers) {
            if (singleMembers?.role === "Owner") {
              setIsOwner(true);
              setIsPrivate(false);
            } else {
              setIsOwner(false);
            }
          } else {
            setIsPrivate(true);
          }
        } else {
          setIsError(true);
          setIsOwner(true);
        }
      } catch (error) {
        console.error("Failed to fetch bookmark:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddComments = () => {
    setAddComment((prev) => !prev);
  };

  useEffect(() => {
    fetchBookmark();
  }, [id, userInfo]);

  useEffect(() => {
    if (socket) {
      socket.on("updateBookmark", (data) => {
        if (id == data?.id) {
          setValue("title", data?.title);
          setValue("link", data?.link);
          setValue("image", data?.image_url);
          setValue("description", data?.description);
          setDescription(data?.description);
          setCurrentImage(data?.image_url);

          const singleMembers = data.members?.find(
            (item: any) => item.email === userInfo?.email
          );
          if (singleMembers) {
            if (singleMembers?.role === "Owner") {
              setIsOwner(true);
              setIsPrivate(false);
            } else {
              setIsPrivate(false);
              setIsOwner(false);
            }
          } else {
            setIsPrivate(true);
          }
        } else {
          setIsError(true);
          setIsOwner(true);
        }
      });

      return () => {
        socket.off("updateBookmark");
      };
    }
  }, [socket, userInfo]);

  return (
    <div className="fixed h-full w-full top-0 left-0 p-8 dark:bg-[#162227] overflow-auto z-10 bg-white z-20">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <LoaderCircle className="animate-spin h-10 w-10 mx-auto" />
        </div>
      ) : isPrivate ? (
        <>
          <div className="flex justify-center items-center flex-col h-full">
            <OptimizedImage
              src={
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//ai-robot.png`
              }
              alt=""
              className="max-w-[750px]"
              width={350}
              height={350}
            />
            <div className="text-center text-xl font-semibold mt-8 dark:text-[#CCCCCC]">
              You cannot access this bookmark because it is private.
            </div>
            <Button
              className="rounded-md btn text-white  hover:text-[white] text-[14px] mt-8"
              variant="outline"
              type="button"
              onClick={() => route.push("/knowledge-bank")}
            >
              Please go back
            </Button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center  relative left-[-9px]">
              <IoChevronBack
                className="text-3xl cursor-pointer"
                onClick={() => route.back()}
              />
              <span className="!m-0">Add Bookmark</span>
            </div>
            <div className="flex gap-2 justify-end items-center">
              <div className="flex gap-2 justify-end items-center">
                {!isError && (
                  <>
                    <Button
                      type="button"
                      className="rounded-md btn text-white h-7 w-21 hover:text-[white] text-[14px]"
                      variant="outline"
                      onClick={() => setShow(true)}
                    >
                      Comments list
                    </Button>
                    <Button
                      type="button"
                      className="rounded-md btn text-white h-7 w-21 hover:text-[white] text-[14px]"
                      variant="outline"
                      onClick={() => handleAddComments()}
                    >
                      Add Comment
                    </Button>
                    {isOwner && (
                      <Button
                        className="rounded-md btn text-white h-7 w-20 hover:text-[white] text-[14px]"
                        variant="outline"
                        type="button"
                        onClick={() => setShowBookmarkDialog(true)}
                      >
                        Share
                      </Button>
                    )}
                  </>
                )}
                {isOwner && (
                  <Button
                    className="rounded-md btn text-white h-7 w-21 hover:text-[white] text-[14px]"
                    variant="outline"
                  >
                    {loading ? (
                      <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <hr className="my-4 mb-6 dark:border-[#888888]" />
          <div className="h-full">
            <div className="mb-5">
              <div
                className="inline-block cursor-pointer relative"
                onClick={() =>
                  isOwner && document.getElementById("bookmark-img")?.click()
                }
              >
                <div className="w-[200px] h-[200px] border border-black dark:border-white rounded-lg border-dashed flex justify-center items-center overflow-hidden">
                  {!currentImage ? (
                    <FiUploadCloud className="text-5xl text-gray-400" />
                  ) : (
                    <div
                      className={`h-full w-full ${
                        isOwner && "bookmark-img-container"
                      }`}
                    >
                      <div className="bookmark-img">
                        <CiEdit className="text-5xl text-gray-400" />
                      </div>
                      <OptimizedImage
                        width={ImageSizes.logo.xxl.width}
                        height={ImageSizes.logo.xxl.height}
                        src={currentImage}
                        alt="Current"
                        className="h-[100%] object-cover rounded"
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
            <div className="flex gap-2 mb-5">
              <div className="w-full">
                <Input
                  readOnly={!isOwner}
                  placeholder="Title: Testing"
                  {...register("title", {
                    required: "Title is required",
                  })}
                />
                {errors.title && (
                  <p className="text-red-500 text-[12px]">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="w-full">
                <Input
                  readOnly={!isOwner}
                  placeholder="https://app.researchcollab.ai"
                  {...register("link", {
                    required: "Link is required",
                    pattern: {
                      value:
                        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                      message: "Please enter a valid URL",
                    },
                  })}
                />
                {errors.link && (
                  <p className="text-red-500 text-[12px]">
                    {errors.link.message}
                  </p>
                )}
              </div>
            </div>

            <BookmarhQuillEditor
              show={show}
              setShow={setShow}
              isOwner={isOwner}
              readOnly={!isOwner}
              addComment={addComment}
              description={description}
              setCommentsData={setCommentsData}
              setCommentsDialogShow={setCommentsDialogShow}
              handleDescriptionChange={handleDescriptionChange}
            />
          </div>
        </form>
      )}

      {showBookmarkDialog && (
        <BookmarkShareDialog
          showBookmarkDialog={showBookmarkDialog}
          setShowBookmarkDialog={setShowBookmarkDialog}
        />
      )}

      {commentsDialogShow && (
        <AddBookmarkCommentsDialog
          commentsData={commentsData}
          show={commentsDialogShow}
          setShow={setCommentsDialogShow}
        />
      )}
    </div>
  );
};
export default dynamic(() => Promise.resolve(CreateBookmark), { ssr: false });
