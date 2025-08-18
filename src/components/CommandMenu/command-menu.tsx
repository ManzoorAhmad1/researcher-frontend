/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { cn } from "@/lib/utils";
import {
  Command,
  File,
  Folder,
  LoaderCircle,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { CiSearch } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { getResearchKeywords, golbalSearch } from "@/apis/workspaces";
import { debounce } from "lodash";
import { BsSearch } from "react-icons/bs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Tooltip } from "rizzui";
import { Tags } from "@/app/(app)/knowledge-bank/utils/types";
import { useRouter } from "next-nprogress-bar";
import toast from "react-hot-toast";
import { getProjectByUser } from "@/apis/projects";
import { loadKeywords } from "@/reducer/global-search/globalSearchSlice";

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { user } = useSelector((state: RootState) => state.user.user);
  const { keywords } = useSelector((state: RootState) => state.researchKeywords);
  const [data, setData] = useState<any>({});
  const dispatch = useDispatch();

  const [loading, setLoading] = useState<boolean>();
  const [loadingForTags, setLoadingForTags] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState("")
  const [words, setWords] = useState([])

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setLoadingForTags(false);
      }
    };
 
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const getListOfKeywords = async (userId:any) => {
    try {
      const response = await getResearchKeywords(userId)
      setWords(response?.data)
      // console.log(response,"the keywords")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.log(error)
    }
  }

  useEffect(()=>{
    // getListOfKeywords(user?.id)
    dispatch(loadKeywords(user?.id) as any);
  },[dispatch, user])

  const handleSearch = async (values: string) => {
    if (values.trim().endsWith("/")) {
      setLoadingForTags(true);
    } else {
      setLoading(true);
      setLoadingForTags(false);
      try {
        const body = { search: values, workspace_id: workspace?.id };
        const apiRes = await golbalSearch(body);
        if (apiRes.success) {
          setData(apiRes?.data);
          setLoading(false);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  const debouncedHandleSearch = useCallback(
    debounce((values: string) => handleSearch(values), 300),
    [workspace]
  );

  const onSearchChange = (value: string) => {
    setTagInput(value);
    debouncedHandleSearch(value);
  };

  const onSelectSuggestion = (selected: string) => {
    const input = tagInput;
    const lastSlashIndex = input.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const prefix = input.slice(0, lastSlashIndex).trimEnd();
      const newValue = `${prefix} ${selected}`.replace(/\s+/g, " ").trim();
      setTagInput(newValue);
      debouncedHandleSearch(newValue);
    }

    setLoadingForTags(false);
  };


  const colors = [
    { color: "#E9222229", borderColor: "#E92222" },
    { color: "#F59B1429", borderColor: "#F59B14" },
    { color: "#F5DE1429", borderColor: "#F5DE14" },
    { color: "#079E2829", borderColor: "#079E28" },
    { color: "#D4157E29", borderColor: "#D4157E" },
    { color: "#0E70FF29", borderColor: "#0E70FF" },
    { color: "#8D17B529", borderColor: "#8D17B5" },
  ];

  const compareColor = (color: string) => {
    const matchedColor = colors.find((c) => c.color === color);
    if (matchedColor) {
      return matchedColor?.borderColor;
    } else {
      return color.slice(0, -2);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "hidden xl:flex justify-between xl:max-w-[350px] lg:max-w-[300px] max-w-[300px] appearance-none bg-background pl-4 shadow-none gap-3 rounded-full text-[#666666] dark:bg-[#FFFFFF14] font-normal"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex text-gray-400 dark:text-zinc-500 items-center gap-1 w-full">
          <CiSearch
            className="h-4 w-4 text-gray-400 dark:text-zinc-500 font-normal"
            style={{ width: "1rem" }}
          />
          <span className="truncate block max-w-[250px] max-[1373px]:max-w-[180px]">
            Type to search across all your research...
          </span>
        </span>
        <span className="inline-flex lg:hidden">Search...</span>
      </Button>

      <Button
        variant="outline"
        className={cn(
          "flex xl:hidden justify-between w-full appearance-none bg-background p-[12px] shadow-none gap-20 rounded-full text-[#666666] dark:bg-[#FFFFFF14]"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex dark:text-[#CCCCCC] items-center gap-1 ">
          <CiSearch className="h-4 w-4 dark:text-[#CCCCCC] font-normal" />{" "}
        </span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false);
          setData({});
          setLoadingForTags(false);
          setTagInput("");
        }}
      >
        <DialogContent
          className="max-w-[800px]"
          onFocusOutside={() => {
            setOpen(false);
            setData({});
            setLoadingForTags(false);
            setTagInput("");
          }}
        >
          <div>
            <DialogHeader className="mb-3" />
            <div className="max-h-[100vh] overflow-hidden mt-6">
              <div>
                <div className="relative">
                  <div className="flex gap-2 border-2 py-2 mt-1 items-center rounded-lg dark:border-[#475154]">
                    <BsSearch className="ms-2" />
                    <input
                      type="text"
                      name=""
                      id=""
                      value={tagInput}
                      className="w-full outline-none text-[14px] bg-transparent"
                      placeholder="Search..."
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <div>
                      {loading && (
                        <LoaderCircle className="animate-spin h-5 w-5 mx-auto dark:text-[#cccccc] me-3" />
                      )}
                    </div>
                  </div>
                  {
                    loadingForTags &&
                    <div ref={wrapperRef} className="absolute left-0 right-0 mt-1 bg-[#ffffff] dark:bg-[#162128] border border-gray-200 dark:border-[#475154] rounded-lg shadow-lg z-10 p-2 max-h-36 overflow-y-auto">
                      {keywords.map((i:string,index:number)=>(
                        <div key={index} onClick={()=> onSelectSuggestion(i)} className="cursor-pointer px-2 py-1 rounded-full hover:bg-[#E2EEFF] dark:hover:bg-[#3E4C51] transition-colors">{i}</div>
                      ))}
                    </div>
                  }
                </div>

                <div className="max-h-[74vh] overflow-auto mt-3">
                  {data?.dataLength > 0 ? (
                    <>
                      {(data?.papersFolders?.length > 0 || data?.noteAndBookmarkFolderData?.length > 0) && (
                        <div>
                          <h1>📂 Folders</h1>
                          {data?.papersFolders?.length > 0 &&
                            data?.papersFolders?.map((item: any, i: number) => {
                              return (
                                <div
                                  onClick={() => {
                                    router.push(`/explorer/${item.id}`);
                                    setOpen(false);
                                    setData({});
                                  }}
                                  className="py-2 hover:bg-[#d8e8ff70] dark:hover:bg-[#1A2A2E] px-3 rounded-lg animate-in duration-300"
                                  key={i}
                                >
                                  <div className="cursor-pointer flex justify-between w-full items-center">
                                    <div className="flex items-center gap-4 font-medium">
                                      <div className="">
                                        <span className="relative flex items-center flex-col justify-center w-10 h-10 bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-lg border border-yellow-300 shadow">
                                          <Folder
                                            width={25}
                                            height={25}
                                            color="#F4B400"
                                          />
                                          <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[10px] font-medium rounded-full shadow-lg border-2 border-white transition-all duration-200">
                                            {item?.folderDataLength || 0}
                                          </span>
                                        </span>
                                      </div>
                                      <div>
                                        <p className=" text-xs font-normal text-lightGray relative top-1">
                                          {item?.folder_name}
                                        </p>
                                        <p className="text-[10px] font-normal">
                                          <span className="">
                                            <span className="text-[#0f6fff]">
                                              Papers
                                            </span>{" "}
                                            |{" "}
                                            <span className="text-[#f59b14]">
                                              {item.project_id?.name}
                                            </span>
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                    {/* <div className="bg-[#F5F5F5] p-1 px-3 rounded-md text-[12px] border dark:bg-[#313E42]">
                                      Papers
                                    </div> */}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {data?.noteAndBookmarkFolderData?.length > 0 && (
                        <div>
                          {/* <h1>📝 Note And Bookmark Folder Data</h1> */}
                          {data?.noteAndBookmarkFolderData?.length > 0 &&
                            data?.noteAndBookmarkFolderData?.map(
                              (item: any, i: number) => {
                                return (
                                  <div
                                    onClick={() => {
                                      router.push(`/knowledge-bank/${item.id}`);
                                      setOpen(false);
                                      setData({});
                                    }}
                                    className="py-2 hover:bg-[#d8e8ff70] dark:hover:bg-[#1A2A2E] px-3 rounded-lg animate-in duration-300"
                                    key={i}
                                  >
                                    <div className="cursor-pointer flex justify-between w-full items-center">
                                      <div className="flex items-center gap-4 font-medium">
                                        <div className="">
                                          <span className="relative flex items-center flex-col justify-center w-10 h-10 bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-lg border border-yellow-300 shadow">
                                            <Folder
                                              width={25}
                                              height={25}
                                              color="#F4B400"
                                            />
                                            <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[10px] font-medium rounded-full shadow-lg border-2 border-white transition-all duration-200">
                                              {item?.folderDataLength || 0}
                                            </span>
                                          </span>
                                        </div>
                                        <div>
                                          <p className=" text-xs font-normal text-lightGray relative top-1">
                                            {item?.folder_name}
                                          </p>
                                          <p className="text-[10px] font-normal">
                                            <span className="">
                                              <span className="text-[#af2deb]">
                                                Notes and Bookmarks
                                              </span>{" "}
                                              |{" "}
                                              <span className="text-[#f59b14]">
                                                {item.project_id?.name}
                                              </span>
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                      {/* <div className="bg-[#F5F5F5] p-1 px-3 rounded-md text-[12px] border dark:bg-[#313E42]">
                                        Notes and Bookmarks
                                      </div> */}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                        </div>
                      )}

                      {data?.papers?.length > 0 && (
                        <div>
                          <h1>🧾 Papers</h1>
                          {data?.papers?.length > 0 &&
                            data?.papers?.map((file: any, i: number) => {
                              return (
                                <div
                                  onClick={() => {
                                    router.push(`/info/${file.id}`);
                                    // router.push(`/info/${getFolderPath(file.parent_id)}/${file.id}`);
                                    // toast(`/info${getFolderPath(file.parent_id)}/${file.id}`)
                                    // toast(`/info${getFolderPathinWords(file.parent_id)}/${file.id}`)
                                    setOpen(false);
                                    setData({});
                                  }}
                                  className="py-2 hover:bg-[#d8e8ff70] dark:hover:bg-[#1A2A2E] px-3 rounded-lg animate-in duration-300"
                                  key={i}
                                >
                                  <div className="cursor-pointer flex justify-between w-full items-center">
                                    <div className="flex items-center gap-2 font-medium">
                                      <span>
                                        <File
                                          width={18}
                                          height={18}
                                          className="text-[#999999] dark:text-white"
                                        />
                                      </span>
                                      <div>
                                        <p className="text-xs font-normal relative top-1">
                                          {file.file_name.length > 100
                                            ? file.file_name.slice(0, 100) +
                                              "..."
                                            : file.file_name}
                                        </p>
                                        <p className="text-[10px] font-normal">
                                          <span className="">
                                            <span className="text-[#0f6fff]">
                                              Papers
                                            </span>{" "}
                                            |{" "}
                                            <span className="text-[#f59b14]">
                                              {file.project?.name}
                                            </span>
                                          </span>
                                        </p>

                                        {/* {file?.id && (
                                          <p className="text-xs font-normal">
                                            Path :{" "}
                                            {`/info${getFolderPathinWords(file.parent_id)}/${file.id}`}
                                          </p>
                                        )} */}

                                        {/* {file?.pdf_search_data?.Authors && (
                                          <p className="text-xs font-normal">
                                            Author :{" "}
                                            {file?.pdf_search_data?.Authors}
                                          </p>
                                        )}

                                        {file.tags && file.tags.length > 0 && (
                                          <div className="flex">
                                            <div className="flex">
                                              {file.tags
                                                .slice(0, 3)
                                                .map((tag: Tags, index: number) => (
                                                  <div
                                                    key={index}
                                                    style={{
                                                      backgroundColor:
                                                        tag.color && tag.color,
                                                      color: compareColor(
                                                        tag.color
                                                      ),
                                                    }}
                                                    className="inline-block px-2 py-1 me-1 my-1 whitespace-nowrap text-sm rounded-lg cursor-pointer"
                                                  >
                                                    {tag.name}
                                                  </div>
                                                ))}
                                            </div>

                                            {file.tags.length > 3 && (
                                              <Tooltip
                                                color="invert"
                                                content={
                                                  <div className="flex space-x-2 ">
                                                    {file.tags
                                                      .slice(3)
                                                      .map(
                                                        (
                                                          t: Tags,
                                                          index: number
                                                        ) => (
                                                          <div
                                                            key={index}
                                                            style={{
                                                              backgroundColor:
                                                                t.color,
                                                              color: compareColor(
                                                                t.color
                                                              ),
                                                            }}
                                                            className="px-2 py-1 my-1 text-sm rounded-lg"
                                                          >
                                                            {t.name}
                                                          </div>
                                                        )
                                                      )}
                                                  </div>
                                                }
                                                placement="top"
                                              >
                                                <div className="inline-block px-2 py-1 mx-1 my-1 text-sm rounded-2xl border border-blue-400">
                                                  <span className="text-blue-400">
                                                    {file.tags.length - 3} +
                                                  </span>
                                                </div>
                                              </Tooltip>
                                            )}
                                          </div>
                                        )} */}
                                      </div>
                                    </div>
                                    {/* <div className="bg-[#F5F5F5] p-1 px-3 rounded-md text-[12px] border dark:bg-[#313E42]">
                                      Papers
                                    </div> */}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {data?.noteAndBookmarkFileData?.filter((item: any) => item?.type === "note").length > 0 && (
                        <div>
                          <h1>📕 Notes</h1>
                          {data?.noteAndBookmarkFileData?.length > 0 &&
                            data?.noteAndBookmarkFileData
                              ?.filter((item: any) => item?.type === "note")
                              ?.map((file: any, i: number) => {
                                return (
                                  <div
                                    onClick={() => {
                                      if (file?.type === "note") {
                                        router.push(
                                          `/knowledge-bank/note/${file?.document_id}`
                                        );
                                      } else {
                                        router.push(
                                          `/knowledge-bank/bookmark/${file?.id}`
                                        );
                                      }
                                      setOpen(false);
                                      setData({});
                                    }}
                                    className="py-2 hover:bg-[#d8e8ff70] dark:hover:bg-[#1A2A2E] px-3 rounded-lg animate-in duration-300"
                                    key={i}
                                  >
                                    <div className="cursor-pointer flex justify-between w-full items-center">
                                      <div className="flex items-center gap-2 font-medium">
                                        <span>
                                          <File
                                            width={18}
                                            height={18}
                                            className="text-[#999999] dark:text-white"
                                          />
                                        </span>
                                        <div>
                                          <p
                                            className={`text-xs font-normal relative top-1`}
                                          >
                                            {file.title.length > 80
                                              ? file.title.slice(0, 80) + "..."
                                              : file.title}
                                          </p>
                                          <p className="text-[10px] font-normal">
                                            <span className="">
                                              <span className="text-[#079d28]">
                                                Notes
                                              </span>{" "}
                                              |{" "}
                                              <span className="text-[#f59b14]">
                                                {file.project?.name}
                                              </span>
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                      <div className="">
                                        {file.tags && file.tags.length > 0 && (
                                          <div className="flex">
                                            <div className="flex">
                                              {file.tags
                                                .slice(0, 3)
                                                .map(
                                                  (
                                                    tag: Tags,
                                                    index: number
                                                  ) => (
                                                    <div
                                                      key={index}
                                                      style={{
                                                        backgroundColor:
                                                          tag.color &&
                                                          tag.color,
                                                        color: compareColor(
                                                          tag.color
                                                        ),
                                                      }}
                                                      className="inline-block px-[4px] py-[1px] me-1 my-1 whitespace-nowrap text-[10px] rounded-sm cursor-pointer"
                                                    >
                                                      {tag.name}
                                                    </div>
                                                  )
                                                )}
                                            </div>

                                            {file.tags.length > 3 && (
                                              <Tooltip
                                                color="invert"
                                                content={
                                                  <div className="flex space-x-2 ">
                                                    {file.tags
                                                      .slice(3)
                                                      .map(
                                                        (
                                                          t: Tags,
                                                          index: number
                                                        ) => (
                                                          <div
                                                            key={index}
                                                            style={{
                                                              backgroundColor:
                                                                t.color,
                                                              color:
                                                                compareColor(
                                                                  t.color
                                                                ),
                                                            }}
                                                            className="inline-block px-[4px] py-[1px] me-1 my-1 whitespace-nowrap text-[10px] rounded-sm cursor-pointer"
                                                          >
                                                            {t.name}
                                                          </div>
                                                        )
                                                      )}
                                                  </div>
                                                }
                                                placement="top"
                                              >
                                                <div className="inline-block px-[4px] py-[1px] me-1 my-1 whitespace-nowrap text-[10px] cursor-pointer rounded-2xl border border-blue-400">
                                                  <span className="text-blue-400">
                                                    {file.tags.length - 3} +
                                                  </span>
                                                </div>
                                              </Tooltip>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                        </div>
                      )}

                      {data?.noteAndBookmarkFileData?.filter((item: any) => item?.type !== "note").length > 0 && (
                        <div>
                          <h1>⭐️ Bookmarks</h1>
                          {data?.noteAndBookmarkFileData?.length > 0 &&
                            data?.noteAndBookmarkFileData
                              ?.filter((item: any) => item?.type !== "note")
                              ?.map((file: any, i: number) => {
                                return (
                                  <div
                                    onClick={() => {
                                      if (file?.type === "note") {
                                        router.push(
                                          `/knowledge-bank/note/${file?.document_id}`
                                        );
                                      } else {
                                        router.push(
                                          `/knowledge-bank/bookmark/${file?.id}`
                                        );
                                      }
                                      setOpen(false);
                                      setData({});
                                    }}
                                    className="py-2 hover:bg-[#d8e8ff70] dark:hover:bg-[#1A2A2E] px-3 rounded-lg animate-in duration-300"
                                    key={i}
                                  >
                                    <div className="cursor-pointer flex justify-between w-full items-center">
                                      <div className="flex items-center gap-2 font-medium">
                                        <span>
                                          <File
                                            width={18}
                                            height={18}
                                            className="text-[#999999] dark:text-white"
                                          />
                                        </span>
                                        <div>
                                          <p
                                            className={`text-xs font-normal relative top-1`}
                                          >
                                            {file.title.length > 80
                                              ? file.title.slice(0, 80) + "..."
                                              : file.title}
                                          </p>
                                          <p className="text-[10px] font-normal">
                                            <span className="">
                                              <span className="text-red-500">
                                                Bookmarks
                                              </span>{" "}
                                              |{" "}
                                              <span className="text-[#f59b14]">
                                                {file.project?.name}
                                              </span>
                                            </span>
                                          </p>

                                          {file.tags &&
                                            file.tags.length > 0 && (
                                              <div className="flex">
                                                <div className="flex">
                                                  {file.tags
                                                    .slice(0, 3)
                                                    .map(
                                                      (
                                                        tag: Tags,
                                                        index: number
                                                      ) => (
                                                        <div
                                                          key={index}
                                                          style={{
                                                            backgroundColor:
                                                              tag.color &&
                                                              tag.color,
                                                            color: compareColor(
                                                              tag.color
                                                            ),
                                                          }}
                                                          className="inline-block px-2 py-1 me-1 my-1 whitespace-nowrap text-sm rounded-lg cursor-pointer"
                                                        >
                                                          {tag.name}
                                                        </div>
                                                      )
                                                    )}
                                                </div>

                                                {file.tags.length > 3 && (
                                                  <Tooltip
                                                    color="invert"
                                                    content={
                                                      <div className="flex space-x-2 ">
                                                        {file.tags
                                                          .slice(3)
                                                          .map(
                                                            (
                                                              t: Tags,
                                                              index: number
                                                            ) => (
                                                              <div
                                                                key={index}
                                                                style={{
                                                                  backgroundColor:
                                                                    t.color,
                                                                  color:
                                                                    compareColor(
                                                                      t.color
                                                                    ),
                                                                }}
                                                                className="px-2 py-1 my-1 text-sm rounded-lg"
                                                              >
                                                                {t.name}
                                                              </div>
                                                            )
                                                          )}
                                                      </div>
                                                    }
                                                    placement="top"
                                                  >
                                                    <div className="inline-block px-2 py-1 mx-1 my-1 text-sm rounded-2xl border border-blue-400">
                                                      <span className="text-blue-400">
                                                        {file.tags.length - 3} +
                                                      </span>
                                                    </div>
                                                  </Tooltip>
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                      {/* <div className="bg-[#F5F5F5] p-1 px-3 rounded-md text-[12px] border dark:bg-[#313E42]">
                                        Bookmark
                                      </div> */}
                                    </div>
                                  </div>
                                );
                              })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-40 grid place-content-center">
                      You haven&apos;t searched for anything yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
