/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-key */
"use client";
import { useDrag, useDrop } from "react-dnd";
import { Button } from "@/components/ui/button";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { IoIosArrowUp } from "react-icons/io";
import { AiOutlineCheckCircle } from "react-icons/ai";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Folder as FolderType } from "@/types/types";
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { BsInfoCircle } from "react-icons/bs";
import { Checkbox } from "../ui/checkbox";
import ReferencesGeneratorDialog from "./ReferencesGeneratorDialog";
import { updateFileStatus } from "@/apis/explore";
import toast from "react-hot-toast";
import { useEffect, useRef, useState, useMemo } from "react";
import TableHeaderItem from "../coman/TableHeaderItem";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import TableFolderItem from "./TableFolderItem";
import TableFileItem, {
  pdfCategoryData,
  pdfMetadata,
  pdfSearchData,
} from "./TableFileItem";
import { useDispatch, useSelector } from "react-redux";
import { folderAiChatDialog } from "@/reducer/services/folderSlice";
import { AppDispatch, RootState } from "@/reducer/store";
import { AIChatDialog } from "./AIChatDialog";
import CustomFilter from "../coman/CustomFilter";
import Pagination from "../coman/Pagination";
import { tableColumnPositionChange } from "@/reducer/services/explorerTableSlice";
import UploadPDF from "./UploadPDF";
import { CreateFolderButton } from "./CreateFolderButton";
import ColumnsDialog from "./ColumnsDialog";
import { Loader } from "rizzui";
import { changePrivacyApi } from "@/apis/files";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import fetchSubscriptionData from "@/utils/funcToUpdateUser";
interface ExplorerTableProps {
  data: FolderType | any;
  fetchFolders?: any;
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  setPageNo?: any;
  pageNo?: number;
  handleSorting?: (value: string) => void;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  loading?: boolean;
  setLoading?: any;
  setFilters?: (value: any) => void;
  allFilters?: any;
  setLimit?: (limit: number) => void;
  limit?: number;
  slugId?: number;
  searchLoading: boolean;
  setSearchLoading: (item: boolean) => void;
  filterSubmit?: string;
  setFilterSubmit: (item: string) => void;
  selectedPapers: any;
  setSelectedPapers: (item: any) => void;
}

type SubFolderType = {
  name: string;
  size: number;
  createdDate: string;
  id: string;
  status: string;
  itemType: string;
  loading: string;
};

type FileType = {
  id: number;
  fileName: string;
  tags: { color: string; name: string }[];
  pages: number;
  size: string;
  dateProcessed: string;
  status: string;
  fileQueryName: string;
  itemType: string;
  ai_status: string;
  CitationCount: number;
  authors: string;
  publication_date: string;
  publication_year: string;
  pdf_search_data: pdfSearchData;
  pdf_metadata: pdfMetadata;
  pdf_category_data: pdfCategoryData;
  number_of_page?: number;
  private: boolean;
};

export const ExplorerTable: React.FC<ExplorerTableProps> = ({
  data,
  fetchFolders,
  selectedItems,
  setSelectedItems,
  setPageNo,
  pageNo,
  handleSorting,
  searchQuery,
  setSearchQuery,
  loading,
  setLoading,
  setFilters,
  allFilters,
  limit,
  setLimit,
  slugId,
  searchLoading,
  setSearchLoading,
  filterSubmit,
  setFilterSubmit,
  selectedPapers,
  setSelectedPapers,
}) => {
  const { socket } = useSocket();
  const { aiChatDialog } = useSelector((state: any) => state.folder);
  const tableColumnsOptions = useSelector(
    (state: any) => state?.ExporerOptionalFilterData?.filterOptions
  );
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: any) => state.user?.user?.user);
  const searchRef: any = useRef<HTMLInputElement>(null);
  const currentProject = useSelector((state: any) => state?.project);
  const [isFileStatusloading, setIsFileLoading] = useState(false);
  const [fileId, setFileId] = useState<number | null>(null);
  const [privacyId, setPrivacyFileId] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tableColumns, setTableColumns] = useState<any>(tableColumnsOptions);
  const [selectedColumn, setSelectedColumn] = useState<any>(tableColumns);
  const [selectedSearchColumn, setSelectedSearchColumn] =
    useState<any>(selectedColumn);
  const [referencesGeneratorDialog, setReferencesGeneratorDialog] =
    useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [processedFileEvents, setProcessedFileEvents] = useState<Set<string>>(new Set());
  const lastProcessedTimeRef = useRef<number>(0);
  const processingRef = useRef(false);
  const DEBOUNCE_TIME = 1000; // 1 second debounce
  const userData = useSelector((state: any) => state?.user?.user?.user);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isFolderExpanded, setIsFolderExpanded] = useState(true);
  const [folderContainerHeight, setFolderContainerHeight] = useState(0);
  const [actualContentHeight, setActualContentHeight] = useState(0);
  const folderContainerRef = useRef<HTMLDivElement>(null);

  const { keywords } = useSelector((state: RootState) => state.researchKeywords);
  const [loadingForTags, setLoadingForTags] = useState<boolean>(false);

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
    if (searchRef.current && !loading && !isFileStatusloading) {
      searchRef.current.focus();
    }
  }, [loading, isFileStatusloading]);

  useEffect(() => {
    if (isFolderExpanded && folderContainerRef.current) {
      const updateHeight = () => {
        const container = folderContainerRef.current;
        if (container) {
          // Find the content div inside the container
          const contentDiv = container.querySelector('div');
          if (contentDiv) {
            // Get the actual rendered height of the content
            const contentHeight = contentDiv.scrollHeight;
            // Set the height for the vertical line, but cap it at 240px
            const actualHeight = Math.min(contentHeight, 240);
            setFolderContainerHeight(actualHeight);
            setActualContentHeight(contentHeight);
          }
        }
      };

      // Pre-calculate height immediately when expanding
      const folderCount = data?.subFolder?.length || 0;
      if (folderCount > 0) {
        // Estimate height based on folder count (roughly 80px per folder + padding)
        const estimatedHeight = Math.min(folderCount * 80 + 32, 240);
        setActualContentHeight(estimatedHeight);
        setFolderContainerHeight(estimatedHeight);
      }
      
      // Update after a short delay to get exact height
      const timeoutId = setTimeout(updateHeight, 100);
      
      // Also update when the window resizes
      const handleResize = () => updateHeight();
      window.addEventListener('resize', handleResize);
      
      // Use ResizeObserver to detect content changes
      const resizeObserver = new ResizeObserver(() => {
        updateHeight();
      });
      
      if (folderContainerRef.current) {
        resizeObserver.observe(folderContainerRef.current);
      }
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
      };
    } else {
      setFolderContainerHeight(0);
      setActualContentHeight(0);
    }
  }, [isFolderExpanded, data?.subFolder, data?.subFolder?.length]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    if (socket) {
      socket.on("fileProcessing", async (fileProcessing: any) => {
        fetchFolders(true);
        await fetchSubscriptionData(dispatch, userData);
        if (user?.id === fileProcessing?.userId) {
          fetchFolders(true);
        }
      });
      socket.on("autoReprocessing", (autoReprocessing: any) => {
        if (autoReprocessing?.project_id === currentProject?.project?.id) {
          fetchFolders(true);
        }
      });
      socket.on("ai-folder-chat", (res: any) => {
        if (user?.id === parseInt(res?.userId)) {
          toast.custom(
            (t) => (
              <div
                className={`${t.visible ? "animate-enter" : "animate-leave"
                  } bg-white p-4 shadow-md rounded-lg flex items-center justify-between cursor-pointer`}
                onClick={() => {
                  dispatch(
                    folderAiChatDialog({
                      id: res?.parent_id,
                      show: true,
                      question: res.question,
                    })
                  );
                  toast.dismiss(t.id);
                }}
              >
                <div className="flex items-center">
                  <AiOutlineCheckCircle
                    className="text-green-500 mr-2"
                    size={24}
                  />{" "}
                  {/* Success Icon */}
                  <span className="text-[#0000cd] underline">
                    AI Analysis completed folder: <span>{res?.message}</span>
                  </span>
                </div>
              </div>
            ),
            { duration: 7000 }
          );

          fetchFolders(true);
        }
      });
      return () => {
        socket.off("ai-folder-chat");
        socket.off("fileProcessing");
        socket.off("autoReprocessing");
      };
    }
  }, [socket, user?.id]);

  // Clear processed events on unmount
  useEffect(() => {
    return () => {
      setProcessedFileEvents(new Set());
      lastProcessedTimeRef.current = 0;
      processingRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (data?.files && data?.files?.length > 0) {
      const fileNames = data?.files
        ?.filter((file: any) => !file?.fileName?.includes("unknown"))
        ?.map((item: any) => ({
          label: item?.fileName,
          value: item?.fileName,
        }));
      const tagdata: any = [];
      const tags = data?.files?.map((item: any) => {
        const tag = item?.tags;

        if (tag && tag?.length > 0) {
          tagdata?.push(
            tag?.map((item: any) => ({
              label: item?.name,
              value: item?.name,
            }))
          );
        }

        return tagdata?.flat();
      });
      const updatedFilters = allFilters?.filter(
        (item: any) => item.name !== "Name" && item.name !== "Tags"
      );
      const FileNameSelectedFIlters = allFilters?.find(
        (item: any) => item.name === "Name"
      );
      const TagsSelectedFilters = allFilters?.find(
        (item: any) => item.name === "Tags"
      );
      setFilters?.([
        ...updatedFilters,
        {
          name: "Name",
          filters: fileNames,
          selectedFilters: FileNameSelectedFIlters?.selectedFilters,
          order: "order-1",
        },
        {
          name: "Tags",
          filters: removeDuplicates(tags?.flat()),
          selectedFilters: TagsSelectedFilters?.selectedFilters,
          order: "order-3",
        },
      ]);
    }
  }, [data]);

  function removeDuplicates(array: { label: string; value: string }[]) {
    const uniqueLabels = new Set();
    return array.filter((item: { label: string; value: string }) => {
      if (uniqueLabels.has(item.label)) {
        return false;
      }
      uniqueLabels.add(item.label);
      return true;
    });
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev: any) =>
      prev.includes(id)
        ? prev.filter((item: any) => item !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAllFiles = (selectAll: boolean) => {
    if (selectAll) {
      const fileIds = data?.files?.map((file: { id: number }) => String(file.id)) || [];
      setSelectedItems((prev: string[]) => {
        const folderIds = prev.filter(id => 
          data?.subFolder?.some((folder: { id: string }) => String(folder.id) === id)
        );
        return [...folderIds, ...fileIds];
      });
    } else {
      setSelectedItems((prev: string[]) => 
        prev.filter(id => 
          data?.subFolder?.some((folder: { id: string }) => String(folder.id) === id)
        )
      );
    }
  };

  const toggleSelectAllFolders = (selectAll: boolean) => {
    if (selectAll) {
      const folderIds = data?.subFolder?.map((folder: { id: string }) => String(folder.id)) || [];
      setSelectedItems((prev: string[]) => {
        const fileIds = prev.filter(id => 
          data?.files?.some((file: { id: number }) => String(file.id) === id)
        );
        return [...fileIds, ...folderIds];
      });
    } else {
      setSelectedItems((prev: string[]) => 
        prev.filter(id => 
          data?.files?.some((file: { id: number }) => String(file.id) === id)
        )
      );
    }
  };

  const allFilesCount = data?.files?.length || 0;
  const allFoldersCount = data?.subFolder?.length || 0;
  
  const selectedFilesCount = selectedItems?.filter(id => 
    data?.files?.some((file: { id: number }) => String(file.id) === id)
  ).length || 0;
  
  const selectedFoldersCount = selectedItems?.filter(id => 
    data?.subFolder?.some((folder: { id: string }) => String(folder.id) === id)
  ).length || 0;

  const allFilesSelected = allFilesCount > 0 && selectedFilesCount === allFilesCount;
  const allFoldersSelected = allFoldersCount > 0 && selectedFoldersCount === allFoldersCount;

  const handleFileStatus = async (status: string, id: number) => {
    setIsFileLoading(true);
    setFileId(id);
    try {
      const projectId: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");
      const response = await updateFileStatus(
        { data: { status }, projectId },
        id
      );

      if (response) {
        fetchFolders?.(true).then(() => {
          setFileId(null);
          toast.success(response?.data?.message);
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsFileLoading(false);
    }
  };

  const handlePrivacyChange = async (status: string, id: number) => {
    setPrivacyFileId(id);
    try {
      const body = { privacyValue: status, id };
      const response = await changePrivacyApi(body);
      if (response?.data.success) {
        fetchFolders?.(true).then(() => {
          setPrivacyFileId(null);
          toast.success(response?.data.message);
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPageNo(newPage);
  };

  const handleSort = (orderBy: string) => {
    handleSorting?.(orderBy);
  };

  const handleSearchChange = async (e: any) => {
    const value = e?.target?.value
    if (e.target.value.trim().endsWith("/")) {
      setLoadingForTags(true);
      setSearchQuery?.(value);
    } else {
      setSearchLoading(true);
      setLoadingForTags(false);
      setSearchQuery?.(value);
    }
  };

  const handleSearchSelect = (selected: string) => {
    // setSearchQuery?.(value);
    // setLoadingForTags(false);

    const input = searchQuery || "";
    const lastSlashIndex = input.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const prefix = input.slice(0, lastSlashIndex).trimEnd();
      const newValue = `${prefix} ${selected}`.replace(/\s+/g, " ").trim();
      setSearchQuery?.(newValue);
    }

    setLoadingForTags(false);
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const updatedColumns = [...selectedSearchColumn];
    const [movedColumn] = updatedColumns.splice(fromIndex, 1);
    updatedColumns.splice(toIndex, 0, movedColumn);
    setSelectedSearchColumn(updatedColumns);
    setTableColumns(updatedColumns);
    dispatch(tableColumnPositionChange(updatedColumns));
  };

  const handleGeneratorDialog = () => {
    if (selectedItems?.length > 0) {
      setReferencesGeneratorDialog(true);
    } else {
      toast((t) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <BsInfoCircle className="text-[#17a2b8] me-[8px]" />
          <span>Please select PDF</span>
        </div>
      ));
    }
  };

  const handleFilter = (
    filterName: string,
    filterItem: string,
    isChecked: boolean
  ) => {
    const originalFilters = allFilters?.filter(
      (item: any) => item.name !== filterName
    );
    let FileNameSelectedFIlters = allFilters?.find(
      (item: any) => item.name === filterName
    );
    FileNameSelectedFIlters = {
      ...FileNameSelectedFIlters,
      selectedFilters: isChecked
        ? [...FileNameSelectedFIlters.selectedFilters, filterItem]
        : FileNameSelectedFIlters.selectedFilters?.filter(
          (selected: any) => selected !== filterItem
        ),
    };
    setFilters?.([...originalFilters, FileNameSelectedFIlters]);
  };

  const handleClearFilter = (filterName?: string) => {
    setFilterSubmit("Clear");
    if (filterName) {
      const originalFilters = allFilters?.filter(
        (item: any) => item.name !== filterName
      );
      let FileNameSelectedFIlters = allFilters?.find(
        (item: any) => item.name === filterName
      );

      FileNameSelectedFIlters = {
        ...FileNameSelectedFIlters,
        selectedFilters: [],
      };
      setFilters?.([...originalFilters, FileNameSelectedFIlters]);
    } else {
      setFilters?.((prevFilters: any) =>
        prevFilters.map((filter: any) => ({
          ...filter,
          selectedFilters: [],
        }))
      );
    }
    setPageNo(-1);
  };

  const handleFilterSubmit = () => {
    setFilterSubmit("Apply");
    setPageNo(-1);
  };

  useEffect(() => {
    setSelectedSearchColumn(tableColumnsOptions);
    setTableColumns(tableColumnsOptions);
  }, [tableColumnsOptions]);

  const centerLoader = useMemo(
    () => tableColumns?.filter((item: any) => item?.visible)?.length + 3,
    [tableColumns]
  );

  const handleScroll = (direction: "left" | "right") => {
    if (!tableRef.current) return;

    // Prevent scrolling if button is disabled
    if (
      (direction === "left" && !canScrollLeft) ||
      (direction === "right" && !canScrollRight)
    ) {
      return;
    }

    const scrollAmount = 300;
    const currentScroll = tableRef.current.scrollLeft;
    const newScroll =
      direction === "left"
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    tableRef.current.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
  };

  const checkScrollable = () => {
    if (!tableRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
  };

  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener("scroll", checkScrollable);
      checkScrollable();
      setTimeout(checkScrollable, 500);
      setTimeout(checkScrollable, 500);
    }

    return () => {
      if (tableElement) {
        tableElement.removeEventListener("scroll", checkScrollable);
      }
    };
  }, [data, selectedSearchColumn]);

  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  const toggleFolderExpansion = () => {
    setIsFolderExpanded(!isFolderExpanded);
  };

  useEffect(() => {
    const handleRefetch = () => {
      if (fetchFolders) fetchFolders();
    };
    window.addEventListener('refetchPapers', handleRefetch);
    return () => window.removeEventListener('refetchPapers', handleRefetch);
  }, [fetchFolders]);

  return (
    <div className="mb-12">
      <>
        {loading || !data || data === null ? (
          // Loading skeleton for folders
          <div className="w-full flex justify-start mb-4 flex-col">
            <div className="font-semibold text-[16px] text-gray-800 dark:text-white mb-2 flex items-center  w-full">
            <OptimizedImage
                 src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/Expfolder.svg`}
                alt="folder icon"
                width={18}
                height={18}
              />
              <span className="text-[13px] font-semibold text-[#333333] dark:text-white truncate px-[9px]">
                Folders
              </span>
              <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 rounded px-2 py-0.5 animate-pulse">0</span>
              <span className="flex-1 border-b border-gray-200 ml-4" />
            </div>
            <div className="bg-white dark:bg-[#202D32] rounded-lg shadow border border-gray-200 dark:border-[#393F49] p-4 w-full">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        ) : data?.subFolder && data?.subFolder?.length > 0 ? (
          // Actual folder content
          <div className="w-full flex justify-start mb-4 flex-col">
            <div className=" dark:text-white mb-2 flex items-center  w-full">
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
              <span className="text-[13px] font-semibold text-[#333333] dark:text-white truncate !px-[9px]">
                Folders
              </span>
              
              <span className=" text-xs font-medium text-blue-600 bg-blue-50 rounded px-2 py-0.5">{data?.subFolder?.length ?? 0}</span>

              <div onClick={toggleFolderExpansion} className="cursor-pointer">
                <div className="transition-transform duration-300 ease-in-out" style={{
                  transform: isFolderExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                }}>
                  <MdKeyboardArrowDown size={22} />
                </div>
              </div>
              <span className="flex-1 border-b border-gray-200 ml-4" />
            </div>
            <div className="flex">
              <div
                ref={folderContainerRef}
                className={`w-full pr-0 relative overflow-hidden flex flex-col`}
                style={{
                  height: isFolderExpanded ? `100%` : '0px',
                  maxHeight: '280px',
                  transition: 'height 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  willChange: 'height'
                }}
              >
                <div className="overflow-y-auto h-full scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div 
                    className="bg-white dark:bg-[#202D32] rounded-lg shadow border border-gray-200 dark:border-[#393F49] p-4 w-full transform" 
                    style={{
                      transform: isFolderExpanded ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.98)',
                      opacity: isFolderExpanded ? 1 : 0,
                      transition: 'all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      willChange: 'transform, opacity'
                    }}
                  >
                    <div className="folder-grid gap-4">
                      {data?.subFolder?.map((folder: SubFolderType) => (
                        <TableFolderItem
                          key={folder.id}
                          folder={folder}
                          selectedItems={selectedItems}
                          toggleSelectItem={toggleSelectItem}
                          fetchFolders={fetchFolders}
                          data={data}
                          setSelectedItems={setSelectedItems}
                          tableColumns={selectedSearchColumn}
                          loading={folder?.loading}
                          isLoading={loading ? loading : false}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {isFolderExpanded && <div className="flex-1 py-5"></div>}
            </div>
          </div>
        ) : data?.subFolder && data?.subFolder?.length === 0 && !slugId ? (
          // No folders - show add folder button (only in root explorer, not in subfolders)
          <div className="w-full flex justify-start mb-4 flex-col">
            <div className="font-semibold text-[16px] text-gray-800 dark:text-white mb-2 flex items-center  w-full">
              <OptimizedImage
                 src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/Expfolder.svg`}
                alt="folder icon"
                width={18}
                height={18}
              />
              <span className="text-[13px] font-semibold text-[#333333] dark:text-white truncate !px-[9px]">
                Folders
              </span>
              <span className=" text-xs font-medium text-blue-600 bg-blue-50 rounded px-2 py-0.5">0</span>
              <span className="flex-1 border-b border-gray-200 ml-4" />
            </div>
            <div className="flex  ">
              <div
                ref={folderContainerRef}
                className={`w-full pr-0 relative overflow-hidden flex flex-col`}
                style={{
                  height: isFolderExpanded ? `100%` : '0px',
                  maxHeight: '240px',
                  transition: 'height 500ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className="overflow-y-auto h-full scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {isFolderExpanded ? (
                    <div className="bg-white dark:bg-[#202D32] rounded-lg shadow border border-gray-200 dark:border-[#393F49] p-4 w-full">
                      <div className="flex justify-center items-center h-32 flex-col gap-4">
                      <p className="text-sm text-center text-[#64748B]">
                        You have not created any folders yet. Begin by creating
                        one.
                      </p>
                        <CreateFolderButton
                          fetchFolders={fetchFolders}
                          slugId={slugId}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
             
              {isFolderExpanded && <div className="flex-1 py-5"></div>}
            </div>
          </div>
        ) : null}
        <div>
          <div className="font-semibold text-[16px] text-gray-800 dark:text-white mb-2 flex items-center gap-2 w-full">
            Papers
            <span className="flex-1 border-b border-gray-200 ml-4" />
          </div>

        </div>
        <div className="flex items-center justify-between pb-3">
          <div className="flex py-1 gap-4 items-center w-full max-w-[30%]">
            <div className="relative w-full ">
              <div className="bg-inputBackground border outline-none border-gray-300 text-gray-900 text-sm rounded-full w-[100%]   p-1.5 dark:text-white flex items-center">
                <span className=" text-gray-500 mx-2">
                  <OptimizedImage
                    src={
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//search.svg`
                    }
                    alt="search icon"
                    width={ImageSizes.icon.sm.width}
                    height={ImageSizes.icon.sm.height}
                  />
                </span>

                <input
                  ref={searchRef}
                  autoFocus
                  disabled={isFileStatusloading}
                  type="text"
                  id="simple-search"
                  onChange={(e) => handleSearchChange(e)}
                  value={searchQuery}
                  className="bg-transparent border-0 focus-visible:outline-none w-full"
                  placeholder="Search Files..."
                  required
                />
              </div>
              {loadingForTags && (
                <div ref={wrapperRef} className="absolute left-0 right-0 mt-1 bg-[#ffffff] dark:bg-[#2C3A3F] border border-gray-200 dark:border-[#475154] rounded-lg shadow-lg z-10 p-2 max-h-80 overflow-y-auto">
                  {keywords.map((i: string) => (
                    <div
                      key={i}
                      onClick={() => handleSearchSelect(i)}
                      className="cursor-pointer px-2 py-1 rounded-full hover:bg-[#E2EEFF] dark:hover:bg-[#3E4C51] transition-colors"
                    >
                      {i}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border rounded-full p-1.5 w-[30px] h-[28px]">
              <OptimizedImage
                src={
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//filter.svg`
                }
                alt="filter"
                width={ImageSizes.icon.xs.width}
                height={ImageSizes.icon.xs.height}
                className="cursor-pointer "
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              />
            </div>
          </div>
          <div className="flex gap-3 items-center relative">
            <div
              className="flex items-center gap-1 mr-2"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Button
                size="sm"
                variant="outline"
                className={`rounded-full p-0 w-8 h-8 flex items-center justify-center bg-[#0f63dd] hover:bg-[#0d4fa8] ${!canScrollLeft
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
                className={`rounded-full p-0 w-8 h-8 flex items-center justify-center bg-[#0f63dd] hover:bg-[#0d4fa8] ${!canScrollRight
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
            <div className="isolate z-20">
              <ColumnsDialog
                selectedColumn={selectedColumn}
                setSelectedColumn={setSelectedColumn}
                selectedSearchColumn={selectedSearchColumn}
                setSelectedSearchColumn={setSelectedSearchColumn}
              />
            </div>
          </div>

        </div>
        {isFilterOpen && (
          <CustomFilter
            filterSubmit={filterSubmit}
            filters={allFilters}
            handleFilter={handleFilter}
            handleClearFilter={handleClearFilter}
            handleFilterSubmit={handleFilterSubmit}
          />
        )}
        {loading ? (
          // Loading skeleton for files
          <div className="relative">
            <div className="absolute top-0 right-0 h-full w-16 pointer-events-none"></div>
            <div
              ref={tableRef}
              className="overflow-y-auto overflow-x-auto rounded-tl-xl rounded-tr-xl flex flex-col flex-nowrap border border-tableBorder table-scroll"
            >
              <Table>
                <TableHeader className="bg-greyTh">
                  <TableRow className="text-[11px] cursor-move">
                    <TableHead>
                      <div>
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </div>
                    </TableHead>
                    {selectedSearchColumn?.map((column: any, index: any) =>
                      column.visible ? (
                        <TableHead key={column.field}>
                          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </TableHead>
                      ) : null
                    )}
                    
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                        <TableCell className="w-[40px]">
                          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </TableCell>
                      {selectedSearchColumn
                        .filter((col: any) => col.visible)
                        .map((_: any, colIndex: number) => (
                          <TableCell key={colIndex}>
                            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          </TableCell>
                        ))}
                     
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : data && data?.files?.length === 0 && data?.subFolder?.length === 0 ? (
          // No files and no folders - show uploader
          <div className="dark:bg-[#202D32] flex justify-center items-center">
            <TableCell>
              <div className="flex justify-center items-center h-72">
                <p className="font-semibold text-lg text-center">
                  <UploadPDF setSelectedPapers={setSelectedPapers} />
                </p>
              </div>
            </TableCell>
          </div>
        ) : data && data?.files?.length === 0 ? (
          // No files but folders exist - show uploader
          <div className="dark:bg-[#202D32] flex justify-center items-center">
            <TableCell>
              <div className="flex justify-center items-center h-72">
                <p className="font-semibold text-lg text-center">
                  <UploadPDF setSelectedPapers={setSelectedPapers} />
                </p>
              </div>
            </TableCell>
          </div>
        ) : (
          // Show files table
          <div className="relative">
            <div className="absolute top-0 right-0 h-full w-16 pointer-events-none"></div>
            <div
              ref={tableRef}
              className="overflow-y-auto overflow-x-auto rounded-tl-xl rounded-tr-xl flex flex-col flex-nowrap border border-tableBorder table-scroll"
            >
              <Table>
                <TableHeader className="bg-greyTh">
                  <TableRow className="text-[11px] cursor-move">
                    <TableHead>
                      <div>
                        <Checkbox
                          checked={allFilesSelected}
                          onCheckedChange={() => {
                            const selectAll = !allFilesSelected;
                            toggleSelectAllFiles(selectAll);
                          }}
                          aria-label="Select all files"
                        />
                      </div>
                    </TableHead>

                    {selectedSearchColumn?.map((column: any, index: any) =>
                      column.visible ? (
                        <DraggableHeader
                          key={column.field}
                          column={column}
                          index={index}
                          moveColumn={moveColumn}
                          handleSort={handleSort}
                        />
                      ) : null
                    )}
                    <TableHead className="hidden lg:table-cell">
                      <MoreVertical className="h-5 w-5" />
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data?.files?.map((file: FileType) => (
                    <TableFileItem
                      key={file.id}
                      file={file}
                      selectedItems={selectedItems}
                      toggleSelectItem={toggleSelectItem}
                      index={file?.id}
                      loading={loading ? loading : false}
                      isFileStatusloading={isFileStatusloading}
                      handleFileStatus={handleFileStatus}
                      handlePrivacyChange={handlePrivacyChange}
                      fileId={fileId}
                      privacyId={privacyId}
                      fetchFolders={fetchFolders}
                      data={data}
                      tableColumns={selectedSearchColumn}
                      selectedPapers={selectedPapers}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </>

      {!loading && data?.length !== 0 && data.files.length > 0 && (
        <div className="bg-secondaryBackground border-t-0 border-tableBorder rounded-bl-xl rounded-br-xl border pb-3 dark:border-[#393F49]">
          <Pagination
            totalPages={data?.totalFiles}
            handlePagination={handlePageChange}
            currentPage={pageNo as number}
            perPageLimit={limit as number}
            setPerPageLimit={setLimit as any}
          />
        </div>
      )}

      {data?.files?.length > 0 && !loading && (
        <div className="mt-5 pb-4 flex justify-end">
          <Button size="sm" className="button-full" variant="outline">
            <span className="text-white" onClick={handleGeneratorDialog}>
              References Generator
            </span>
          </Button>
        </div>
      )}

      {referencesGeneratorDialog && (
        <ReferencesGeneratorDialog
          data={data}
          selectedItems={selectedItems}
          referencesGeneratorDialog={referencesGeneratorDialog}
          setReferencesGeneratorDialog={setReferencesGeneratorDialog}
        />
      )}

      <AIChatDialog
        fetchFolders={fetchFolders}
        isOpen={aiChatDialog?.show}
        onOpenChange={() => dispatch(folderAiChatDialog({}))}
      />
    </div>
  );
};

const DraggableHeader = ({ column, index, moveColumn, handleSort }: any) => {
  const [, ref] = useDrag({
    type: "column",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "column",
    drop(item: any) {
      if (item.index !== index) {
        moveColumn(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <TableHead ref={(node: any) => ref(drop(node)) as any}>
      <TableHeaderItem
        width={column.width}
        column={column}
        columnName={column?.name}
        fieldName={column?.field}
        handelSorting={handleSort}
      />
    </TableHead>
  );
};
