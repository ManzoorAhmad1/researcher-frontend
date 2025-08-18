/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IoIosArrowUp } from "react-icons/io";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  ChevronDown,
  FolderPlus,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import {
  filterNotesBookmarkAllData,
  getNotesBookmarkAllData,
  getRefetchNotesBookmarkAllData,
  searchLoader,
  setPagination,
} from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { useParams, usePathname } from "next/navigation";
import { Loader } from "rizzui";
import Pagination from "@/components/coman/Pagination";
import {
  DeleteDialogInfo,
  notesBookmarksitem,
  TableViewProps,
} from "../../../utils/types";
import DraggableHeader from "../DraggableHeader";
import { AddTagsButton } from "../../../dialog/AddTagsButton";
import DeleteDialog from "../../../dialog/DeleteDialog";
import {
  deleteBookmarkFile,
  deleteFolderApi,
  deleteSoftNote,
  updateKnoledgeBankFolder,
  updateNote,
  updateBookmark,
  moveFileData,
} from "@/apis/notes-bookmarks";
import Folderbody from "./FolderBody";
import Notebody from "./NoteBody";
import BookmarkBody from "./BookmarkBody";
import RenameNoteTitleDialog from "../../../dialog/RenameNoteTitleDialog";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { moveColumn } from "@/reducer/notes-bookmarks/noteBookmarksTabelColumn";
import toast from "react-hot-toast";
import ExportSideBar from "../../../sidebar/ExportSideBar";
import ShareSideBar from "../../../sidebar/ShareSideBar";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { OptimizedImage } from "@/components/ui/optimized-image";
import ShowHideColumns from "../../../dialog/ShowHideColumns";
import { Card } from "@/components/ui/card";
import { MoveItemButton } from "../move/MoveItemButton";
// TableViewProps
const TableView: React.FC<any> = ({
  selectAll,
  tableColumns,
  setSelectAll,
  selectedItems,
  selectedOption,
  allSelectedOption,
  setSelectedItems,
  tableRef,
  setISTableColumns,
  isTableColumns,
  ImageSizes,
  handleSearch,
  setSearch,
  search,
  searchLoading,
  canScrollLeft,
  handleScroll,
  canScrollRight,
  setFilterShow,
  activeTabValue,
  setIsHideShowOpen,
  isHideShowOpen,
  selectedColumn,
  setSelectedColumn,
  filterShow,
  lastSelectedOption,
  option,
  handleChangeOption,
  handleClearFilter,
  filterLoading,
  handleFilterSubmit,
  setBookmarkInfo,
  setCreateFolderShow,
}) => {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const supabase: SupabaseClient = createClient();
  const params = useParams();
  const { socket } = useSocket();
  const { slug } = params;
  const { notesBookmarksDatas, loading, pagination } = useSelector(
    (state: RootState) => state.notesbookmarks
  );
  const currentProject = useSelector((state: any) => state?.project);
  const { perPageLimit, currentPage } = pagination;
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const [tageId, setTageId] = useState("");
  const [editeTitleId, setEditeTitleId] = useState<string>();
  const [renameNoteTitleDialogShow, setRenameNoteTitleDialogShow] =
    useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string | null>("");
  const [type, setType] = useState("");
  const [deleteDialogInfo, setDeleteDialogInfo] = useState<DeleteDialogInfo>({
    id: "",
    name: "",
    type: "",
    show: false,
  });
  const [shareId, setShareId] = useState("");
  const [visible, setVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [isFolderExpanded, setIsFolderExpanded] = useState(true);
  const [folderContainerHeight, setFolderContainerHeight] = useState(0);
  const [actualContentHeight, setActualContentHeight] = useState(0);
  const folderContainerRef = useRef<HTMLDivElement>(null);
  const { project } = useSelector((state: any) => state?.project);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState<boolean>(false);
  const [isMoveDataLoading, setIsMoveDataLoading] = useState<boolean>(false);
  const [allData, setAllData] = useState<any>(null);
  const [moveItemData, setMoveItemData] = useState<any>({});

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

  const { keywords } = useSelector(
    (state: RootState) => state.researchKeywords
  );
  const [loadingForTags, setLoadingForTags] = useState<boolean>(false);

  // Calculate counts for separate select all functionality
  const allFoldersCount = notesBookmarksDatas?.data?.filter((item: any) => item.type === "folder")?.length || 0;
  const allItemsCount = notesBookmarksDatas?.data?.filter((item: any) => item.type !== "folder")?.length || 0;
  
  const selectedFoldersCount = selectedItems?.filter((item: any) => 
    notesBookmarksDatas?.data?.some((dataItem: any) => 
      dataItem.type === "folder" && dataItem.id === item.id
    )
  ).length || 0;
  
  const selectedItemsCount = selectedItems?.filter((item: any) => 
    notesBookmarksDatas?.data?.some((dataItem: any) => 
      dataItem.type !== "folder" && dataItem.id === item.id
    )
  ).length || 0;

  const allFoldersSelected = allFoldersCount > 0 && selectedFoldersCount === allFoldersCount;
  const allItemsSelected = allItemsCount > 0 && selectedItemsCount === allItemsCount;

  const moveColumnFuntion = (fromIndex: number, toIndex: number) => {
    if (isTableColumns && isTableColumns?.length > 0) {
      const updatedColumns = [...isTableColumns];
      const [movedColumn] = updatedColumns.splice(fromIndex, 1);
      updatedColumns.splice(toIndex, 0, movedColumn);
      dispatch(moveColumn(updatedColumns));
      setISTableColumns(updatedColumns);
    }
  };

  const handlePageChange = (value: number) => {
    dispatch(setPagination({ currentPage: value }));
  };

  const handlePerPageChange = (limit: number) => {
    dispatch(setPagination({ perPageLimit: limit, currentPage: 1 }));
  };

  const toggleSelectAllFolders = (selectAll: boolean) => {
    if (selectAll) {
      const folderIds = notesBookmarksDatas?.data
        ?.filter((item: any) => item.type === "folder")
        ?.map((folder: any) => ({
          type: folder.type,
          id: folder.id,
        })) || [];
      setSelectedItems((prev: any[]) => {
        const itemIds = prev.filter(item => 
          notesBookmarksDatas?.data?.some((dataItem: any) => 
            dataItem.type !== "folder" && dataItem.id === item.id
          )
        );
        return [...itemIds, ...folderIds];
      });
    } else {
      setSelectedItems((prev: any[]) => 
        prev.filter(item => 
          notesBookmarksDatas?.data?.some((dataItem: any) => 
            dataItem.type !== "folder" && dataItem.id === item.id
          )
        )
      );
    }
  };

  const toggleSelectAllItems = (selectAll: boolean) => {
    if (selectAll) {
      const itemIds = notesBookmarksDatas?.data
        ?.filter((item: any) => item.type !== "folder")
        ?.map((item: any) => ({
          type: item.type,
          id: item.id,
        })) || [];
      setSelectedItems((prev: any[]) => {
        const folderIds = prev.filter(item => 
          notesBookmarksDatas?.data?.some((dataItem: any) => 
            dataItem.type === "folder" && dataItem.id === item.id
          )
        );
        return [...folderIds, ...itemIds];
      });
    } else {
      setSelectedItems((prev: any[]) => 
        prev.filter(item => 
          notesBookmarksDatas?.data?.some((dataItem: any) => 
            dataItem.type === "folder" && dataItem.id === item.id
          )
        )
      );
    }
  };

  // Updated handleAllSelect to only handle items (notes/bookmarks)
  const handleAllSelect = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    toggleSelectAllItems(newSelectAll);
  };

  const deleteFunction = async () => {
    const { type, id } = deleteDialogInfo || {};
    let apiRes;

    if (type === "folder") {
      apiRes = await deleteFolderApi(id);
    } else if (type === "note") {
      apiRes = await deleteSoftNote(id);
    } else {
      apiRes = await deleteBookmarkFile(id);
    }

    if (apiRes?.success) {
      toast.success(apiRes?.message);
      setDeleteDialogInfo((prev) => ({ ...prev, show: false }));
      const body = { workspace_id: workspace?.id, project_id: project?.id };
      dispatch(
        getRefetchNotesBookmarkAllData({
          id: slug?.length > 0 ? slug[slug.length - 1] : 0,
          currentPage: 1,
          perPageLimit: 10,
          body,
        })
      );
    }
  };

  const handleEdite = (item: any, type: string) => {
    setNoteTitle(item?.title || item?.folder_name);
    setRenameNoteTitleDialogShow(true);
    setType(type);
    setEditeTitleId(type === "note" ? item?.document_id : item?.id);
  };

  const renameTitle = async (data: { title: string }) => {
    try {
      const isFolder = type === "folder";
      const isBookmark = type === "bookmark";
      const body = isFolder
        ? { folder_name: data?.title }
        : { title: data?.title };

      let response;

      if (isFolder) {
        response = await updateKnoledgeBankFolder(editeTitleId as string, body);
      } else if (isBookmark) {
        const formData = new FormData();
        formData.append("title", data?.title);
        response = await updateBookmark(editeTitleId as string, formData);
      } else {
        response = await updateNote(editeTitleId as string, body);
      }

      if (response?.isSuccess || response?.success) {
        setRenameNoteTitleDialogShow(false);
        toast.success("Title updated successfully");
        const requestBody = {
          workspace_id: workspace?.id,
          project_id: project?.id,
        };
        dispatch(
          getRefetchNotesBookmarkAllData({
            id: slug?.length > 0 ? slug[slug.length - 1] : 0,
            currentPage: 1,
            perPageLimit: 10,
            body: requestBody,
          })
        );
      } else {
        toast.error(response?.message || "Failed to update title");
      }
    } catch (error: any) {
      console.log("erroreee", error);
      toast.error(error?.response?.data?.message || "Failed to update title");
    }
  };

  const toggleFolderExpansion = () => {
    setIsFolderExpanded(!isFolderExpanded);
  };

  useEffect(() => {
    if (isFolderExpanded && folderContainerRef.current) {
      const updateHeight = () => {
        const container = folderContainerRef.current;
        if (container) {
          const contentDiv = container.querySelector("div");
          if (contentDiv) {
            const contentHeight = contentDiv.scrollHeight;
            const actualHeight = Math.min(contentHeight, 240);
            setFolderContainerHeight(actualHeight);
            setActualContentHeight(contentHeight);
          }
        }
      };

      const folderCount =
        notesBookmarksDatas?.data?.filter((item: any) => item.type === "folder")
          ?.length || 0;
      if (folderCount > 0) {
        const estimatedHeight = Math.min(folderCount * 80 + 32, 240);
        setActualContentHeight(estimatedHeight);
        setFolderContainerHeight(estimatedHeight);
      }

      const timeoutId = setTimeout(updateHeight, 100);

      const handleResize = () => updateHeight();
      window.addEventListener("resize", handleResize);

      const resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });

      if (folderContainerRef.current) {
        resizeObserver.observe(folderContainerRef.current);
      }

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", handleResize);
        resizeObserver.disconnect();
      };
    } else {
      setFolderContainerHeight(0);
      setActualContentHeight(0);
    }
  }, [isFolderExpanded, notesBookmarksDatas?.data]);

  useEffect(() => {
    setISTableColumns(tableColumns);
  }, [tableColumns]);

  useEffect(() => {
    const project_id: any =
      currentProject?.project?.id && currentProject?.project?.id !== null
        ? currentProject?.project?.id
        : localStorage.getItem("currentProject");

    if (socket === null) {
      return;
    }
    if (socket) {
      socket.on("noteCreated", (noteCreated: any) => {
        if (noteCreated.projectId === project_id) {
          const body = { workspace_id: workspace?.id, project_id: project?.id };
          dispatch(
            getNotesBookmarkAllData({
              id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
              currentPage,
              perPageLimit,
              body,
            })
          );
        }
      });
      socket.on("bookmarkFolderCreated", (bookmarkFolderCreated: any) => {
        if (bookmarkFolderCreated.projectId === project_id) {
          const body = { workspace_id: workspace?.id, project_id: project?.id };
          dispatch(
            getNotesBookmarkAllData({
              id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
              currentPage,
              perPageLimit,
              body,
            })
          );
        }
      });

      socket.on("bookmarkCreated", (bookmarkCreated: any) => {
        const body = { workspace_id: workspace?.id, project_id: project?.id };
        dispatch(
          getNotesBookmarkAllData({
            id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
            currentPage,
            perPageLimit,
            body,
          })
        );
      });
      socket.on("noteDeleted", (bookmarkCreated: any) => {
        const body = { workspace_id: workspace?.id, project_id: project?.id };
        dispatch(
          getNotesBookmarkAllData({
            id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
            currentPage,
            perPageLimit,
            body,
          })
        );
      });

      socket.on("bookmarkDeleted", (bookmarkDeleted: any) => {
        const body = { workspace_id: workspace?.id, project_id: project?.id };
        dispatch(
          getNotesBookmarkAllData({
            id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
            currentPage,
            perPageLimit,
            body,
          })
        );
      });

      socket.on("bookmarkFolderUpdated", (bookmarkFolderUpdated: any) => {
        const body = { workspace_id: workspace?.id, project_id: project?.id };
        dispatch(
          getNotesBookmarkAllData({
            id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
            currentPage,
            perPageLimit,
            body,
          })
        );
      });
      return () => {
        socket.off("fileProcessing");
        socket.off("fileDeleted");
        socket.off("fileMoved");
        socket.off("folderCreated");
        socket.off("bookmarkFolderCreated");
        socket.off("bookmarkCreated");
        socket.off("noteDeleted");
        socket.off("folderDeleted");
        socket.off("bookmarkDeleted");
        socket.off("bookmarkFolderUpdated");
      };
    }
  }, [socket, workspace, project, currentProject]);

  useEffect(() => {
    if (perPageLimit && currentPage && workspace?.id && project?.id) {
      if (selectedOption) {
        const body = {
          type: ["Folder", ...selectedOption],
          workspace_id: workspace?.id,
          project_id: project?.id,
        };
        dispatch(
          filterNotesBookmarkAllData({
            id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
            body,
            currentPage,
            perPageLimit,
          })
        );
      } else {
        const body = { workspace_id: workspace?.id, project_id: project?.id };
        dispatch(
          getNotesBookmarkAllData({
            id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
            currentPage,
            perPageLimit,
            body,
          })
        );
      }
    }
  }, [dispatch, perPageLimit, currentPage, workspace?.id, project?.id]);

  //////////////////////////////////////////////
  const getLastItemFromUrl = (url: string) => {
    const parts = url.replace(/\/$/, "").split("/");
    return parseInt(parts[parts.length - 1]);
  };
  const handleMove = async (item: any) => {
    setMoveItemData(item);
    try {
      const lastItem = getLastItemFromUrl(pathname);
      const folderId = pathname.startsWith("/explorer")
        ? typeof lastItem === "number"
          ? lastItem
          : ""
        : "";
      setIsMoveDialogOpen(true);
      setIsMoveDataLoading(true);

      const response = await moveFileData(currentProject?.project?.id);
      setAllData(response);
    } catch (error) {
      console.log(error);
    } finally {
      setIsMoveDataLoading(false);
    }
  };

  const fetchFolders = async (restrictRefresh?: boolean) => {
    // if (!restrictRefresh) {
    //   setLoading(true);
    // }
    const project_id: any =
      currentProject?.project?.id && currentProject?.project?.id !== null
        ? currentProject?.project?.id
        : localStorage.getItem("currentProject");
    try {
      const body = { workspace_id: workspace?.id, project_id: project?.id };
      dispatch(
        getNotesBookmarkAllData({
          id: slug?.length > 0 ? slug?.[slug.length - 1] : 0,
          currentPage,
          perPageLimit,
          body,
        })
      );
    } catch (error) {
      console.error("Failed to fetch folders", error);
    }
    // finally {
    //   setLoading(false);
    //   setSearchLoading(false);
    // }
  };
  //////////////////////////////////////////////

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // dispatch(searchLoader());
    // handleSearch(value);
    // setSearch(value);

    if (value.trim().endsWith("/")) {
      setLoadingForTags(true);
      setSearch(value);
    } else {
      setLoadingForTags(false);
      dispatch(searchLoader());
      handleSearch(value);
      setSearch(value);
    }
  };

  const handleKeywordSelect = (selected: string) => {
    // setSearch(keyword);
    // handleSearch(keyword);
    // dispatch(searchLoader());
    // setLoadingForTags(false);
    const input = search;
    const lastSlashIndex = input.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const prefix = input.slice(0, lastSlashIndex).trimEnd();
      const newValue = `${prefix} ${selected}`.replace(/\s+/g, " ").trim();
      setSearch(newValue);
      handleSearch(newValue);
      dispatch(searchLoader());
    }

    setLoadingForTags(false);
  };
  return (
    <>
      {loading ? (
        // Loading skeleton for folders
        <div className="w-full flex justify-start mb-4 flex-col">
          <div className="font-semibold text-[16px] text-gray-800 dark:text-white mb-2 flex items-center gap-2 w-full">
            <div className="flex items-center gap-2 mr-3">
              <Checkbox
                checked={allFoldersSelected}
                onCheckedChange={() => {
                  const selectAll = !allFoldersSelected;
                  toggleSelectAllFolders(selectAll);
                }}
                aria-label="Select all folders"
              />
            </div>
            <OptimizedImage
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/Expfolder.svg`}
              alt="folder icon"
              width={18}
              height={18}
            />

            <span className="text-[13px] font-semibold text-[#333333] dark:text-white truncate px-[9px]">
              Folders
            </span>
            <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 rounded px-2 py-0.5 animate-pulse">
              0
            </span>
            <span className="flex-1 border-b border-gray-200 ml-4" />
          </div>
          <div className="bg-white dark:bg-[#202D32] rounded-lg shadow border border-gray-200 dark:border-[#393F49] p-4 w-full">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className=" h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Always show folders section
        <div className="w-full flex justify-start mb-4 flex-col">
          <div className="font-semibold text-[16px] text-gray-800 dark:text-white mb-2 flex items-center  w-full">
            <div className="flex items-center gap-2 mr-3">
              <Checkbox
                checked={allFoldersSelected}
                onCheckedChange={() => {
                  const selectAll = !allFoldersSelected;
                  toggleSelectAllFolders(selectAll);
                }}
                aria-label="Select all folders"
              />
            </div>
            <OptimizedImage
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/Expfolder.svg`}
              alt="folder icon"
              width={18}
              height={18}
              className="mb-[4px]"
            />

            <span className="text-[13px] font-semibold text-[#333333] dark:text-white truncate px-[9px]">
              Folders
            </span>
            <span className=" text-xs font-medium text-blue-600 bg-blue-50 rounded px-2  py-0.5">
              {notesBookmarksDatas?.data?.filter(
                (item: any) => item.type === "folder"
              )?.length ?? 0}
            </span>
            <div onClick={toggleFolderExpansion} className="cursor-pointer">
              <div
                className="transition-transform duration-300 ease-in-out"
                style={{
                  transform: isFolderExpanded
                    ? "rotate(0deg)"
                    : "rotate(-90deg)",
                }}
              >
                <MdKeyboardArrowDown size={22} />
              </div>
            </div>
            <span className="flex-1 border-b border-gray-200 ml-4" />
          </div>
          <div className="flex">
            <div
              ref={folderContainerRef}
              className="w-full pr-0 relative overflow-hidden flex flex-col"
              style={{
                height: isFolderExpanded ? `100%` : '0px',
                maxHeight: '240px',
                transition: 'height 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'height'
              }}
            >
              <div className="overflow-y-auto h-full scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div
                  className="bg-white dark:bg-[#202D32] rounded-lg shadow border border-gray-200 dark:border-[#393F49] p-3 w-full transform"
                  style={{
                    transform: isFolderExpanded
                      ? "translateY(0) scale(1)"
                      : "translateY(-10px) scale(0.98)",
                    opacity: isFolderExpanded ? 1 : 0,
                    transition:
                      "all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    willChange: "transform, opacity",
                  }}
                >
                  {notesBookmarksDatas?.data?.filter(
                    (item: any) => item.type === "folder"
                  )?.length > 0 ? (
                    // Actual folder content
                    <div className="gap-4 folder-grid">
                      {notesBookmarksDatas?.data
                        ?.filter((item: any) => item.type === "folder")
                        ?.map(
                          (
                            item: notesBookmarksitem & {
                              loading?: boolean;
                              progress?: number;
                            }
                          ) => (
                            <Folderbody
                              key={item.id}
                              item={item}
                              tableColumns={isTableColumns}
                              setDeleteDialogInfo={setDeleteDialogInfo}
                              handleEdite={handleEdite}
                              selectedItems={selectedItems}
                              setSelectedItems={setSelectedItems}
                            />
                          )
                        )}
                    </div>
                  ) : (
                    // No folders message
                    <div className="flex justify-center items-center h-32 flex-col gap-4">
                      <p className="text-sm text-center text-[#64748B]">
                        You have not created any folders yet. Begin by creating
                        one.
                      </p>
                      <Button
                      size="sm"
                      onClick={() => setCreateFolderShow(true)}
                      className=" h-8 btn flex gap-1 items-center justify-between rounded-[26px]"
                    >
                      <FolderPlus
                        width={16}
                        height={16}
                        className="text-white"
                      />
                        <span className="p-0 m-0 sr-only sm:not-sr-only sm:whitespace-nowrap font-size-normal text-white ">
                          Add Folder
                      </span>
                    </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* <div
              className="w-[50px] h-full relative cursor-pointer text-[18px] text-black flex items-center justify-center"
              onClick={toggleFolderExpansion}
            >
              <div className="flex flex-col items-center">
                <div className="border border-[1px] border-[rgba(14,112,255,1)] rounded-[25px] w-max p-1">
                  {isFolderExpanded ? (
                    <IoIosArrowUp color="rgba(14, 112, 255, 1)" size={16} />
                  ) : (
                    <MdKeyboardArrowDown color="rgba(14, 112, 255, 1)" size={16} />
                  )}
                </div>
              </div>
              <div
                className={`absolute top-[50px] left-1/2 transform -translate-x-1/2 bg-[rgba(204,204,204,1)] dark:bg-[#CCCCCC33] w-px transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`}
                style={{
                  height: isFolderExpanded ? `${Math.max(0, folderContainerHeight - 60)}px` : '0px'
                }}
              ></div>
            </div> */}
            {isFolderExpanded && <div className="flex-1 py-5"></div>}
          </div>
        </div>
      )}

      <div className="font-semibold text-[16px] text-gray-800 dark:text-white mb-2 flex items-center gap-2 w-full">
        {selectedOption.includes("Notes")
          ? "Notes"
          : selectedOption.includes("Bookmarks")
          ? "Bookmarks"
          : "Notes and Bookmarks"}
        <span className="flex-1 border-b border-gray-200 ml-4" />
      </div>

      <div>
        <div className="flex items-center justify-between pb-3 ">
          <div className="relative">
            <div className="bg-inputBackground border-gray-300 w-[350px] text-gray-900 rounded-full border flex px-3 py-2 gap-2">
              <OptimizedImage
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//search.svg`}
                alt="search icon"
                width={ImageSizes.icon.sm.width}
                height={ImageSizes.icon.sm.height}
              />
              <input
                autoFocus
                type="text"
                value={search}
                className="bg-transparent outline-none text-sm border-0 w-full dark:text-[#cccccc]"
                placeholder="Search Files"
                required
                // onChange={(e) => {
                //   dispatch(searchLoader());
                //   handleSearch(e.target.value);
                //   setSearch(e.target.value);
                // }}
                onChange={handleInputChange}
              />
              {searchLoading && (
                <LoaderCircle className="animate-spin h-5 w-5 mx-auto dark:text-[#cccccc]" />
              )}
            </div>
            {loadingForTags && (
              <div ref={wrapperRef} className="absolute left-0 right-0 mt-1 bg-[#ffffff] dark:bg-[#2C3A3F] border border-gray-200 dark:border-[#475154] rounded-lg shadow-lg z-10 p-2 max-h-80 overflow-y-auto">
                {keywords.map((i: string) => (
                  <div
                    key={i}
                    onClick={() => handleKeywordSelect(i)}
                    className="cursor-pointer px-2 py-1 rounded-full hover:bg-[#E2EEFF] dark:hover:bg-[#3E4C51] transition-colors"
                  >
                    {i}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 items-center relative">
            <div
              className="flex items-center gap-1 mr-2"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Button
                size="sm"
                variant="outline"
                className={`rounded-full p-0 w-8 h-8 flex items-center justify-center bg-[#0f63dd] hover:bg-[#0d4fa8] ${
                  !canScrollLeft
                    ? "opacity-50 cursor-not-allowed pointer-events-none hover:bg-[#0f63dd]"
                    : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (canScrollLeft) {
                    handleScroll("left");
                  }
                }}
                disabled={!canScrollLeft}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ChevronLeft className="h-5 w-5" color="white" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`rounded-full p-0 w-8 h-8 flex items-center justify-center bg-[#0f63dd] hover:bg-[#0d4fa8] ${
                  !canScrollRight
                    ? "opacity-50 cursor-not-allowed pointer-events-none hover:bg-[#0f63dd]"
                    : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (canScrollRight) {
                    handleScroll("right");
                  }
                }}
                disabled={!canScrollRight}
                onMouseDown={(e) => e.preventDefault()}
              >
                <ChevronRight className="h-5 w-5" color="white" />
              </Button>
            </div>

            {/* <div
              className="border rounded-full p-1.5"
              onClick={() => setFilterShow((prev: any) => !prev)}
            >
              <OptimizedImage
                src={
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//filter.svg`
                }
                alt="filter"
                height={ImageSizes.icon.xs.height}
                width={ImageSizes.icon.xs.width}
                className="cursor-pointer "
              />
            </div> */}

            <div className="flex gap-[12px] flex-wrap border bg-white dark:bg-transparent dark:border-[#cccccc] px-2 py-2 rounded-lg">
              <DropdownMenu>
                <DropdownMenuTrigger className="dropdownMenuTrigger flex justify-between  gap-2 items-center w-24">
                  <p className="text-xs font-normal ">
                    {lastSelectedOption || "Filter"}
                  </p>
                  <ChevronDown size={"12px"} color="#0E70FF" />
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent
                    className="dropdownMenu p-2 bg-inputBackground mt-2 relative left-[-7px]"
                    align="start"
                  >
                    {option?.map((item: any, i: any) => (
                      <DropdownMenuItem
                        key={i}
                        className="cursor-pointer px-2 py-1 flex gap-2"
                        onClick={() => {
                          handleChangeOption(item);
                          handleFilterSubmit([item]);
                        }}
                      >
                        <Checkbox
                          checked={allSelectedOption.includes(item)}
                          aria-label="Select all"
                          style={{
                            width: "16px",
                            height: "16px",
                          }}
                        />
                        {item}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </div>

            {activeTabValue === "list" && (
              <div
                onClick={() => setIsHideShowOpen(!isHideShowOpen)}
                className="flex items-center gap-1 px-4 py-1 rounded-xl  bg-[#d8e8ff] dark:bg-[#183450] cursor-pointer hover:bg-[#d0eafd]"
              >
                <ShowHideColumns
                  selectedColumn={selectedColumn}
                  setSelectedColumn={setSelectedColumn}
                  isHideShowOpen={isHideShowOpen}
                  setIsHideShowOpen={setIsHideShowOpen}
                />
                <span className="text-sm text-[#4b4b4b] dark:text-[#fff]">
                  Customize
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className={`h-0 transition-all overflow-hidden duration-300 ${
            filterShow && "h-[95px]"
          }`}
        >
          <Card
            className={`shadow-none bg-[#f2f2f284] dark:bg-secondaryBackground py-[13px] px-4 mb-4 border`}
          >
            <h2 className=" text-xs font-semibold ps-[.5px]">FILTER</h2>
            <div className="flex justify-between items-center mt-1">
              <div className="flex gap-[12px] flex-wrap border bg-white dark:bg-transparent dark:border-[#cccccc] px-2 py-2 rounded-lg">
                <DropdownMenu>
                  <DropdownMenuTrigger className="dropdownMenuTrigger flex justify-between  gap-2 items-center w-24">
                    <p className="text-xs font-normal ">
                      {lastSelectedOption || "Selected"}
                    </p>
                    <ChevronDown size={"12px"} color="#0E70FF" />
                  </DropdownMenuTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuContent
                      className="dropdownMenu p-2 bg-inputBackground mt-2 relative left-[-7px]"
                      align="start"
                    >
                      {option?.map((item: any, i: any) => (
                        <DropdownMenuItem
                          key={i}
                          className="cursor-pointer px-2 py-1 flex gap-2"
                          onClick={() => {
                            handleChangeOption(item);
                            handleFilterSubmit([item]);
                          }}
                        >
                          <Checkbox
                            checked={allSelectedOption.includes(item)}
                            aria-label="Select all"
                            style={{
                              width: "16px",
                              height: "16px",
                            }}
                          />
                          {item}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu>
              </div>
              <div className="flex gap-[12px]">
                {/* <Button
                  disabled={loading}
                  type="button"
                  variant={"outline"}
                  className="rounded-full text-[13px] border-[#0E70FF] text-[#0E70FF] px-[12px] py-[6px] font-normal h-8 w-20"
                  onClick={() => handleClearFilter()}
                >
                  {loading ? (
                    <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    "Clear All"
                  )}
                </Button>
                <Button
                  disabled={filterLoading}
                  type="button"
                  variant={"default"}
                  className="rounded-full text-[13px] btn px-[12px] py-[6px] font-normal h-8 dark:text-[#cccccc] w-20"
                  onClick={handleFilterSubmit}
                >
                  {filterLoading ? (
                    <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    "Apply"
                  )}
                </Button> */}
                {filterLoading && (
                  <div className="rounded-full text-[13px] px-[12px] py-[6px] font-normal h-8 dark:text-[#cccccc] w-20">
                    <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-0 right-0 h-full w-16 pointer-events-none"></div>
        <div>
          <div
            ref={tableRef}
            className="overflow-y-auto overflow-x-auto rounded-tl-xl rounded-tr-xl flex flex-col flex-nowrap border border-tableBorder table-scroll"
          >
            <Table>
              <TableHeader className="bg-greyTh">
                <TableRow className="text-[11px] cursor-move">
                  <TableHead>
                    <Checkbox
                      checked={allItemsSelected}
                      aria-label="Select all items"
                      onClick={() => {
                        const selectAll = !allItemsSelected;
                        toggleSelectAllItems(selectAll);
                      }}
                    />
                  </TableHead>

                  {isTableColumns &&
                    isTableColumns.map((column: any, index: number) => (
                      <>
                        {column?.visible && (
                          <DraggableHeader
                            key={column.field}
                            column={column}
                            index={index}
                            moveColumn={moveColumnFuntion}
                          />
                        )}
                      </>
                    ))}

                  <TableHead className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-none bg-greyTh"
                        >
                          <MoreVertical className="h-6 w-6" />
                          <span className="sr-only">Sort</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="p-2 bg-inputBackground border border-borderColor text-lightGray "
                      >
                        <DropdownMenuItem>With folders</DropdownMenuItem>
                        <DropdownMenuSeparator
                          color="borderColor"
                          className="border-borderColor"
                        />
                        <DropdownMenuItem>Folders on top</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableHead>
                </TableRow>
              </TableHeader>

              {loading ? (
                <TableBody>
                  {[...Array(6)].map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {/* <TableCell className="w-[40px]">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </TableCell> */}
                      {(isTableColumns || [])
                        .filter((col: any) => col?.visible)
                        .map((_: any, colIndex: number) => (
                          <TableCell key={colIndex}>
                            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          </TableCell>
                        ))}
                      <TableCell>
                        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody className="relative">
                  {notesBookmarksDatas?.data?.filter(
                    (item: any) => item.type !== "folder"
                  )?.length > 0 ? (
                    notesBookmarksDatas?.data
                      ?.filter((item: any) => item.type !== "folder")
                      ?.map((item: notesBookmarksitem, i: string) => (
                        <React.Fragment key={i}>
                          {item.type === "note" ? (
                            <Notebody
                              index={i}
                              item={item}
                              setTageId={setTageId}
                              tableColumns={isTableColumns}
                              setDeleteDialogInfo={setDeleteDialogInfo}
                              handleEdite={handleEdite}
                              selectedItems={selectedItems}
                              setSelectedItems={setSelectedItems}
                              setShareId={setShareId}
                              setVisible={setVisible}
                              setShareVisible={setShareVisible}
                              handleMove={handleMove}
                            />
                          ) : (
                            <BookmarkBody
                              item={item}
                              setTageId={setTageId}
                              tableColumns={isTableColumns}
                              setDeleteDialogInfo={setDeleteDialogInfo}
                              handleEdite={handleEdite}
                              selectedItems={selectedItems}
                              setSelectedItems={setSelectedItems}
                              handleMove={handleMove}
                              setBookmarkInfo={setBookmarkInfo}
                            />
                          )}
                        </React.Fragment>
                      ))
                  ) : (
                    <div className="flex justify-center items-center h-72">
                      <p className="text-md text-center text-[#64748B] absolute top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%]">
                        {!loading && selectedOption === "note"
                          ? "You have not created any notes yet. Begin by creating one."
                          : selectedOption === "bookmark"
                          ? "You have not created any bookmarks yet. Begin by creating one."
                          : "You have not created any note or bookmark yet. Begin by creating one."}
                      </p>
                    </div>
                  )}
                </TableBody>
              )}
            </Table>
          </div>

          {!loading &&
            notesBookmarksDatas?.data?.filter(
              (item: any) => item.type !== "folder"
            )?.length > 0 && (
              <div className="bg-secondaryBackground border border-t-0 w-full rounded-bl-xl rounded-br-xl dark:border-[#393F48]">
                <Pagination
                  totalPages={notesBookmarksDatas?.total}
                  handlePagination={handlePageChange}
                  currentPage={currentPage as number}
                  perPageLimit={perPageLimit as number}
                  handlePerPageChange={handlePerPageChange}
                />
              </div>
            )}
        </div>
      </div>

      {tageId && (
        <AddTagsButton
          tageId={tageId}
          isOpen={true}
          onOpenChange={() => setTageId("")}
        />
      )}

      <DeleteDialog
        deleteDialogInfo={deleteDialogInfo}
        setDeleteDialogInfo={setDeleteDialogInfo}
        deleteFunction={deleteFunction}
      />

      <RenameNoteTitleDialog
        noteTitle={noteTitle}
        renameTitle={renameTitle}
        renameNoteTitleDialogShow={renameNoteTitleDialogShow}
        setRenameNoteTitleDialogShow={setRenameNoteTitleDialogShow}
      />

      {visible && (
        <ExportSideBar
          shareId={shareId}
          visible={visible}
          setVisible={setVisible}
        />
      )}

      {shareVisible && (
        <ShareSideBar
          shareId={shareId}
          shareVisible={shareVisible}
          setShareVisible={setShareVisible}
        />
      )}

      {isMoveDialogOpen && (
        <MoveItemButton
          fetchFolders={fetchFolders}
          itemType={moveItemData?.itemType}
          data={[]}
          moveData={allData}
          itemId={moveItemData?.itemId}
          itemName={moveItemData?.itemName}
          isOpen={isMoveDialogOpen}
          onOpenChange={setIsMoveDialogOpen}
          isMoveDataLoading={isMoveDataLoading}
        />
      )}
    </>
  );
};

export default TableView;
