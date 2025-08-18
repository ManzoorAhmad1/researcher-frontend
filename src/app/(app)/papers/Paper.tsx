import React, { useState, useEffect, useRef } from "react";
import { addSearchPaperHistory, fetchDataByTitle } from "@/apis/user";
import { FaCaretRight, FaCaretDown } from "react-icons/fa";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "@/utils/components/pagination";
import { Button, Loader, Text } from "rizzui";
import FileRenderer from "./pdfviewer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPaperPdf } from "@/apis/explore";
import { FaCheck } from "react-icons/fa";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/reducer/store";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next-nprogress-bar";
import { papersQuestion } from "@/reducer/services/papersSlice";
import { IoSearchSharp } from "react-icons/io5";
import "./select.css";
import { RiExpandUpDownLine } from "react-icons/ri";
import { IoIosWarning } from "react-icons/io";
import { HiDocumentText } from "react-icons/hi2";
import { OptimizedImage } from "@/components/ui/optimized-image";
import LoadingText from "@/components/LoadingText";
import DropDowns from "@/components/coman/DropDowns";
import { Separator } from "@/components/ui/separator";
import { getFileHistory } from "@/apis/files";
import { searchArXivPapers } from "@/apis/arxiv";
import { useQueryRowValidation } from "@/components/common/useTextValidation";
import {
  ValidatedInput,
  ValidatedQueryInput,
} from "@/components/common/ValidatedInput";
import BuildQueryModal from "@/components/common/BuildQueryModal";
import SavedQueryModal from "@/components/common/SavedQueryModal";
import { useQueryModal } from "@/components/common/useQueryModal";
import useSocket from "@/app/(app)/info/[...slug]/socket";

interface PaperProps {
  setPapers: (data: any) => void;
  papers: any;
  selectedFilters: any;
}

const Paper: React.FC<PaperProps> = ({
  papers,
  setPapers,
  selectedFilters,
}) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const supabase: SupabaseClient = createClient();
  const userData: string | null = localStorage.getItem("user");
  const userInfo = userData ? JSON.parse(userData) : "";
  const [isAdded, setIsAdded] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<"title" | "author">("title");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedPaperUrl, setSelectedPaperUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [pageNo, setPageNo] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const currentProject = useSelector((state: any) => state?.project);
  const papersPerPage = 10;
  const { question } = useSelector((state: any) => state?.papers);
  const userId = userInfo?.id || 0;
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "citationCount", direction: "desc" });

  const { socket } = useSocket();
  const [streamingPapers, setStreamingPapers] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingSources, setStreamingSources] = useState<{
    semantic_scholar: boolean;
    arxiv: boolean;
    google_scholar: boolean;
  }>({
    semantic_scholar: false,
    arxiv: false,
    google_scholar: false,
  });
  // Use the global query modal hook
  const queryModal = useQueryModal();
  const {
    showBuildQueryModal,
    setShowBuildQueryModal,
    showHistoryModal,
    setShowHistoryModal,
    queryRows,
    setQueryRows,
    builtQuery,
    setBuiltQuery,
    saveQuery,
    setSaveQuery,
    queryHistory,
    setQueryHistory,
    historyLoading,
    setHistoryLoading,
    historyPage,
    setHistoryPage,
    hasMoreHistory,
    setHasMoreHistory,
    loadingMore,
    setLoadingMore,
    generatePreviewQuery,
    resetQueryBuilder,
    createQuery,
    loadQueryFromHistory,
    handleScroll: modalHandleScroll,
    validation,
    dateRange,
    setDateRange,
  } = queryModal;

  // Validation state
  const [searchError, setSearchError] = useState<string>("");
  const { validateText, sanitizeText, validateAndShowToast } = validation;
  const loadingMessages = [
    "Initializing...",
    "Fetching papers...",
    "Processing and validating results...",
  ];
  
  // Options for the search type dropdown
  const searchOptions = [
    { label: "Title", value: "title" },
    { label: "Author", value: "author" },
  ];
  const historyGet = async (reset: boolean = true) => {
    if (reset) {
      setHistoryLoading(true);
      setQueryHistory([]);
      setHistoryPage(1);
      setHasMoreHistory(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = reset ? 1 : historyPage + 1;

      const response = await getFileHistory(userId, true, currentPage, 10);
      const historyData = response?.data?.data || [];
      const totalCount = response?.data?.totalCount || 0;

      // Transform the API response to match the expected format
      const transformedHistory = historyData.map((item: any) => ({
        id: item.id,
        search_value: item.search,
        date: new Date(item.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      if (reset) {
        setQueryHistory(transformedHistory);
        setHistoryPage(1);
      } else {
        setQueryHistory((prev) => {
          return [...prev, ...transformedHistory];
        });
        setHistoryPage(currentPage);
      }

      // Check if there are more items to load
      let hasMore = false;
      if (totalCount > 0) {
        const newTotalCount = reset
          ? transformedHistory.length
          : queryHistory.length + transformedHistory.length;
        hasMore = newTotalCount < totalCount && historyData.length > 0;
      } else {
        // If no totalCount, assume there are more if we got a full page (10 items)
        hasMore = historyData.length === 10;
      }
      setHasMoreHistory(hasMore);
    } catch (error) {
      console.error("Error fetching query history:", error);
      if (reset) {
        setQueryHistory([]);
      }
      setHasMoreHistory(false);
    } finally {
      if (reset) {
        setHistoryLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const loadMoreHistory = () => {
    if (!loadingMore && hasMoreHistory) {
      historyGet(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    modalHandleScroll(e, loadMoreHistory);
  };

  // Custom create query handler for Paper component
  const handleCreateQuery = () => {
    createQuery((query) => {
      setBuiltQuery(query);
      setSearchQuery(query);
      setSearchError(""); // Clear search error when query is created successfully
    });
  };
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handlePreviewClick = async (url: string) => {
    if (!url) {
      return;
    }
    try {
      const response = await axios.get(url, {
        responseType: "stream",
        maxRedirects: 10,
      });

      const contentType = response.headers["content-type"];
      const isPdf = contentType.includes("application/pdf");
      if (isPdf) {
        setSelectedPaperUrl(url);
        setTemplateModalOpen(true);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleExpandClick = (paperId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [paperId]: !prev[paperId],
    }));
  };

  const handleFavourite = async (
    paperId: string,
    url: any,
    title: string,
    citationCount: number
  ) => {
    try {
      setIsLoading((prev: any) => ({
        ...prev,
        [paperId]: true,
      }));

      let response: any = await createPaperPdf({
        title,
        url,
        project_id: currentProject?.project?.id,
        citationCount,
      });

      if (response.status === 200) {
        setIsAdded((prev: any) => ({
          ...prev,
          [paperId]: true,
        }));
      } 
      
    } catch (error: any) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 p-4">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 pt-0.5">
                <IoIosWarning className="text-yellow-500 text-md" />
              </div>
              <div className="flex-1">
                <Text className="text-gray-900 dark:text-gray-100 text-sm whitespace-normal break-words">
                  {error?.response?.data?.message || "An error occurred"}
                </Text>
              </div>
            </div>
          </div>
        </div>
      ));
    } finally {
      setIsLoading((prev: any) => ({
        ...prev,
        [paperId]: false,
      }));
    }
  };
  const ref = useRef(false);
  const addInSupabase = async (body: object) => {
    if (ref.current) return; // Prevent multiple submissions
    ref.current = true;
    const response = await addSearchPaperHistory({
      ...body,
      save_query: saveQuery,
    });

    if (response?.data?.isSuccess) {
      console.log("Search history saved successfully",'addInSupabase');
      setLoading(false);
    }
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as "title" | "author");
    setSearchError("");
    setIsOpen(false);
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    ref.current = false;
    let que;

    // Clear previous error
    setSearchError("");

    if (typeof suggestion === "string") {
      que = suggestion;
      setSearchQuery(suggestion);
    } else {
      que = searchQuery;
    }

    // Additional validation using the global validation hook
    if (!validateAndShowToast(que)) {
      const globalError = validateText(que);
      setSearchError(globalError);
      return;
    }

    // Sanitize the query
    que = sanitizeText(que);

    // Reset streaming states and clear existing papers
    setStreamingPapers([]);
    setPapers([]); // Clear existing papers immediately
    setIsStreaming(true);
    setStreamingSources({
      semantic_scholar: false,
      arxiv: false,
      google_scholar: false,
    });

    setLoading(true);
    dispatch(papersQuestion(question));
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      // Check if socket is available
      if (!socket) {
        setLoading(false);
        setIsStreaming(false);
        return;
      }
      
      console.log('Searching with dateRange:', dateRange);
      const backendData: any = await fetchDataByTitle(que, searchType, dateRange);
      if (
        backendData?.isSuccess &&
        backendData?.data &&
        !backendData?.streaming
      ) {
        setIsStreaming(false);
        setLoading(false);
        if (backendData.data.length > 0) {
          setPapers(backendData.data);
          toast.success("Successfully retrieved papers.");
          setSaveQuery(false);

          // Save search history
          const body = {
            user_id: userInfo?.id,
            search: que,
            history: backendData.data,
            save_query: saveQuery,
          };
          await addInSupabase(body);
        } else {
          setPapers([]);
        }
      }  else if (!backendData?.isSuccess) {
        setIsStreaming(false);
        setLoading(false);
        setStreamingPapers([]);
      }

      // Save initial search record for history
      const body = {
        user_id: userInfo?.id,
        search: que,
        history: [], // Will be updated when streaming completes
        save_query: saveQuery,
      };

      // Save initial search record (don't wait for this)
      try {
        await addInSupabase(body);
      } catch (historyError) {
        console.error("Failed to save search history:", historyError);
        // Don't block the search for history issues
      }
    } catch (error) {
      console.error("Error in search:", error);
      toast.error("Search failed. Please try again.");
      setLoading(false);
      setIsStreaming(false);
      setStreamingPapers([]);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPageNo(newPage);
  };

  const handleSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction: direction as "asc" | "desc" });
  };

  let filtered = [...papers];

  // If streaming, combine streaming papers with existing papers
  if (isStreaming || streamingPapers.length > 0) {
    const combinedPapers = [...papers, ...streamingPapers];
    // Remove duplicates based on paperId
    const uniquePapers = combinedPapers.filter(
      (paper, index, self) =>
        index === self.findIndex((p) => p.paperId === paper.paperId)
    );
    filtered = [...uniquePapers];
  }

  if (selectedFilters.type.length > 0) {
    filtered = filtered.filter((paper) =>
      selectedFilters.type.some((type: any) =>
        paper?.publicationTypes?.includes(type)
      )
    );
  }

  if (selectedFilters.date !== "All Research") {
    const currentDate = new Date();
    const timeMapping: Record<string, number> = {
      "Last 6 Months": 6 * 30 * 24 * 60 * 60 * 1000,
      "Last 1 Year": 12 * 30 * 24 * 60 * 60 * 1000,
      "Last 2 Years": 2 * 12 * 30 * 24 * 60 * 60 * 1000,
      "Last 5 Years": 5 * 12 * 30 * 24 * 60 * 60 * 1000,
      "Last 10 Years": 10 * 12 * 30 * 24 * 60 * 60 * 1000,
    };

    const timeLimit = timeMapping[selectedFilters.date];

    filtered = filtered.filter((paper) => {
      const publicationDate = new Date(paper.publicationDate);
      return currentDate.getTime() - publicationDate.getTime() <= timeLimit;
    });
  }

  if (selectedFilters.yearRange) {
    const [start, end] = selectedFilters.yearRange.split("-").map(Number);
    filtered = filtered.filter((paper) => {
      const publicationYear = new Date(paper.publicationDate).getFullYear();
      return publicationYear >= start && publicationYear <= end;
    });
  }

  const sortedFilteredPapers = filtered?.sort((a: any, b: any) => {
    if (sortConfig.direction === "asc") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    } else {
      return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
    }
  });

  const currentPagePapers = sortedFilteredPapers?.slice(
    (pageNo - 1) * papersPerPage,
    pageNo * papersPerPage
  );

  useEffect(() => {
    setSearchQuery(question);
  }, [question]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset pagination state when modal closes
  useEffect(() => {
    if (!showHistoryModal) {
      setHistoryPage(1);
      setHasMoreHistory(true);
      setQueryHistory([]);
    }
  }, [showHistoryModal]);

  // Socket.IO event listeners for real-time paper streaming
  useEffect(() => {
    if (!socket) return;
    // Listen for progress updates from each source
    const handlePaperProgress = (data: any) => {
      const { source, data: newPapers, responseTime } = data;
      if (newPapers && newPapers.length > 0) {
        setStreamingPapers((prev) => {
          // Remove duplicates and add new papers
          const existingIds = prev.map((p) => p.paperId);
          const uniqueNewPapers = newPapers.filter(
            (p: any) => !existingIds.includes(p.paperId)
          );
          return [...prev, ...uniqueNewPapers];
        });
      }

      // Update source completion status
      setStreamingSources((prev) => ({
        ...prev,
        [source]: true,
      }));
    };

    // Listen for search completion
    const handleSearchComplete = async (data: any) => {
      const { totalPapers, sources, totalResponseTime } = data;
      setIsStreaming(false);
      setLoading(false);

      // Final update with all accumulated papers
      if (streamingPapers.length > 0) {
        setPapers(streamingPapers);
        toast.success(
          `Successfully fetched ${totalPapers} papers. Please check now`
        );
        setSaveQuery(false);

        // Update search history with final results
        try {
          const body = {
            user_id: userInfo?.id,
            search: searchQuery,
            history: streamingPapers,
            save_query: saveQuery,
          };
          await addInSupabase(body);
        } catch (historyError) {
          console.error("Failed to update search history:", historyError);
        }
      } else {
        setPapers([]);
        toast.error("No papers found matching your search criteria");
      }
    };

    // Listen for search errors
    const handleSearchError = (data: any) => {
      const { error } = data;
      setIsStreaming(false);
      setLoading(false);
      setStreamingPapers([]);
      toast.error(`Search failed: ${error}`);
    };

    // Register event listeners
    socket.on("paper-search-progress", handlePaperProgress);
    socket.on("paper-search-complete", handleSearchComplete);
    socket.on("paper-search-error", handleSearchError);

    return () => {
      socket.off("paper-search-progress", handlePaperProgress);
      socket.off("paper-search-complete", handleSearchComplete);
      socket.off("paper-search-error", handleSearchError);
    };
  }, [socket, streamingPapers]);

  // Cleanup streaming state on unmount
  useEffect(() => {
    return () => {
      setIsStreaming(false);
      setStreamingPapers([]);
      setLoading(false);
    };
  }, []);

  return (
    <>
      <div className="relative top-[-34px] ">
        {loading ? <LoadingText messages={loadingMessages} /> : null}
        <div className="w-[85%] justify-between mx-auto bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] box-shadow rounded-lg px-8">
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x dark:divide-[#CCCCCC33] mt-2">
            <div className="flex col-span-1 w-full items-center gap-2 pe-3 mt-2 xl:mt-0">
              <OptimizedImage
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//vector.png`}
                alt="AI-icon"
                width={16}
                height={16}
              />
              <div className="flex-1">
                <DropDowns
                  toggleDropdown={toggleDropdown}
                  isOpen={isOpen}
                  options={searchOptions}
                  selectedValue={searchType ? (searchType === "title" ? "Title" : "Author") : "Please select"}
                  onSelect={handleSearchTypeChange}
                />
              </div>
            </div>
              
            <div className="flex col-span-1 xl:col-span-3 w-full items-center gap-4 xl:ps-6 pt-4 xl:pt-0 ">
              <div className="w-full relative">
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="text-[13px] flex-1">
                    <ValidatedInput
                      placeholder={searchType === "title" ? "Search by paper title..." : "Search by author name..."}
                      value={searchQuery}
                      onChange={(value) => {
                        setSearchQuery(value);
                        // Clear error when user starts typing
                        if (searchError) {
                          setSearchError("");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSelectSuggestion(searchQuery);
                        }
                      }}
                      onBlur={() => {
                       
                      }}
                      error={searchError}
                      className="outline-none bg-transparent w-full dark:bg-[#2C3A3F] h-10 "
                    />
                  </div>
                  <div className="flex flex-col items-center whitespace-nowrap">
                    <a 
                      href="#" 
                      className="whitespace-nowrap text-blue-600 dark:text-blue-400 text-sm hover:underline text-center"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowBuildQueryModal(true);
                      }}
                    >
                      Advanced Search
                    </a>
                  </div>
                </div>
                {/* Helper text and Quick Fix */}
                <div className="flex items-center justify-between mt-1 px-1">
                  {searchError && (searchError.includes("looks like a paper title") || searchError.includes("appears to be a paper title")) && (
                    <Button
                      onClick={() => {
                        setSearchType("title");
                        setSearchError("");
                        toast.success("Switched to Title search", { duration: 2000 });
                      }}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Switch to Title
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="mb-2" />
          
          {/* Row 2: Buttons */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 dark:divide-[#CCCCCC33] mb-2">
              <Button
                type="submit"
                className="button-full w-full  md:w-[130px]"
                onClick={handleSelectSuggestion}
                disabled={loading || !!searchError}
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mx-auto" />
                ) : (
                  <>
                    <span className="flex justify-center items-center gap-1 sm:gap-2">
                      <IoSearchSharp className="text-sm sm:text-lg" /> Search
                    </span>
                  </>
                )}
              </Button>
              
              
              <Button
                type="button"
                className="button-full w-full md:w-[120px]"
                onClick={() => router.push("/papers/history-timeline")}
                disabled={loading}
              >
                <OptimizedImage
                  width={16}
                  height={16}
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//history.png`}
                  alt="history-icon"
                  className="w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="whitespace-nowrap">History</span>
              </Button>
            </div>
        </div>

        {/* Streaming Progress Indicator */}
        {isStreaming && (
          <div className="w-[95%] sm:w-[90%] lg:w-[85%] mx-auto mt-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <LoaderCircle className="animate-spin h-4 w-4" />
              <span className="text-xs sm:text-sm">
                Fetching papers from multiple sources. Please wait while we
                retrieve the latest results...
              </span>
              {streamingPapers.length > 0 && (
                <span className="text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm">
                  ({streamingPapers.length} papers found)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center px-4 sm:px-6 min-h-[60vh]">
        {loading && !isStreaming ? (
          <p className="text-center"></p>
        ) : currentPagePapers?.length > 0 || isStreaming ? (
          <>
            <div className="border border-tableBorder rounded-xl w-full mb-24">
              <Table className="rounded-tr-xl rounded-tl-xl overflow-hidden">
                <TableHeader className="rounded-xl overflow-hidden">
                  <TableRow className="bg-[#F5F5F5] rounded-xl hover:bg-[none] dark:bg-[#3A474B]">
                    <TableHead className=" px-4 py-2 flex items-center gap-2 justify-center">
                      Title
                      <button onClick={() => handleSort("title")}>
                        <RiExpandUpDownLine
                          className={`transform ${
                            sortConfig.key === "title" &&
                            sortConfig.direction === "desc"
                          }`}
                        />
                      </button>
                    </TableHead>
                    <TableHead className=" px-4 py-2  items-center">
                      <div className="flex mb-2 gap-2">
                        Year
                        <button onClick={() => handleSort("year")}>
                          <RiExpandUpDownLine
                            className={`transform ${
                              sortConfig.key === "year" &&
                              sortConfig.direction === "desc"
                            }`}
                          />
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className=" px-4 py-2 gap-2 items-center justify-center flex ">
                      Authors
                      <button onClick={() => handleSort("authors")}>
                        <RiExpandUpDownLine
                          className={`transform ${
                            sortConfig.key === "authors" &&
                            sortConfig.direction === "desc"
                          }`}
                        />
                      </button>
                    </TableHead>
                    <TableHead className="px-4 py-2 items-center">
                      <div className="flex whitespace-nowrap">
                        Reference Count
                        <button onClick={() => handleSort("referenceCount")}>
                          <RiExpandUpDownLine
                            className={`transform ${
                              sortConfig.key === "referenceCount" &&
                              sortConfig.direction === "desc"
                            }`}
                          />
                        </button>
                      </div>
                    </TableHead>
                    <TableHead className="px-4 py-2 items-center flex whitespace-nowrap">
                      Citation Count
                      <button onClick={() => handleSort("citationCount")}>
                        <RiExpandUpDownLine
                          className={`transform ${
                            sortConfig.key === "citationCount" &&
                            sortConfig.direction === "desc"
                          }`}
                        />
                      </button>
                    </TableHead>
                    <TableHead className=" px-4 py-2 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPagePapers ? (
                    currentPagePapers.map((paper: any) => (
                      <>
                        <TableRow key={paper?.paperId} className="border-t">
                          <TableCell className="px-4">
                            <div className="flex items-center text-xs gap-2 font-medium">
                              <span className="ml-1">
                                <HiDocumentText className="w-9 h-9 text-[#143965] bg-[#DCE1E8] rounded-full p-1 border border-[#143965]" />
                              </span>
                              <div className="flex flex-col">
                                <span>{paper?.title}</span>
                              </div>
                              <span
                                className="cursor-pointer"
                                onClick={() =>
                                  handleExpandClick(paper?.paperId)
                                }
                              >
                                {expandedRows[paper?.paperId] ? (
                                  <FaCaretDown className="text-xl" />
                                ) : (
                                  <FaCaretRight className="text-xl" />
                                )}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className=" px-4 py-2 text-center">
                            <p className="text-sm">{paper?.year}</p>
                          </TableCell>

                          <TableCell className=" px-4 py-2 text-center">
                            <p className="text-sm">
                              {paper?.authors?.length > 0
                                ? (() => {
                                    // Lowercase searchQuery for comparison
                                    const searchLower = searchQuery
                                      .trim()
                                      .toLowerCase();
                                    // Separate matching and non-matching authors
                                    const matchingAuthors: any[] = [];
                                    const otherAuthors: any[] = [];
                                    paper.authors.forEach((author: any) => {
                                      if (
                                        author.name &&
                                        author.name
                                          .toLowerCase()
                                          .includes(searchLower) &&
                                        searchLower.length > 0
                                      ) {
                                        matchingAuthors.push(author);
                                      } else {
                                        otherAuthors.push(author);
                                      }
                                    });
                                    // Combine matching first, then others
                                    const orderedAuthors = [
                                      ...matchingAuthors,
                                      ...otherAuthors,
                                    ];
                                    // Show up to 4 authors, then "..."
                                    return orderedAuthors.map(
                                      (author: any, index: number) => (
                                        <span key={index}>
                                          {index < 3 && (
                                            <>
                                              {author.name}
                                              {index <
                                                Math.min(
                                                  orderedAuthors.length - 1,
                                                  2
                                                ) && ", "}
                                            </>
                                          )}
                                          {index === 3 && "..."}
                                        </span>
                                      )
                                    );
                                  })()
                                : "No authors available publicly"}
                            </p>
                          </TableCell>

                          <TableCell className=" px-4 py-2 text-center">
                            <p className="text-sm">
                              {paper?.referenceCount || 0}
                            </p>
                          </TableCell>
                          <TableCell className=" px-4 py-2 text-center">
                            <p className="text-sm">
                              {paper?.citationCount || 0}
                            </p>
                          </TableCell>

                          <TableCell className="px-4 py-2 text-center">
                            {paper?.openAccessPdf?.url ||
                            paper?.pdfUrl ||
                            paper?.link ? (
                              <>
                                <div className="flex justify-center gap-2 mt-2">
                                  {(paper?.openAccessPdf?.url ||
                                    paper?.pdfUrl) && (
                                    <Button
                                      className="h-8 button-full"
                                      variant="outline"
                                      onClick={() => {
                                        handlePreviewClick(
                                          paper?.openAccessPdf?.url ||
                                            paper?.pdfUrl
                                        );
                                      }}
                                    >
                                      Preview
                                    </Button>
                                  )}

                                  {(paper?.openAccessPdf?.url ||
                                    paper?.pdfUrl) && (
                                    <Button
                                      className="h-8 bg-blueTh min-w-40 text-black font-semibold flex items-center justify-center bg-[#E2EEFF] rounded-full"
                                      onClick={() => {
                                        handleFavourite(
                                          paper?.paperId,
                                          paper?.openAccessPdf?.url ||
                                            paper?.pdfUrl,
                                          paper?.title,
                                          paper?.citationCount
                                        );
                                      }}
                                      disabled={
                                        isLoading[paper.paperId] ||
                                        isAdded[paper.paperId] ||
                                        paper.is_disable_url
                                      }
                                    >
                                      {!paper?.is_disable_url &&
                                        (isLoading[paper?.paperId] ? (
                                          <Loader
                                            variant="threeDot"
                                            size="sm"
                                          />
                                        ) : isAdded[paper.paperId] ? (
                                          <FaCheck className="text-green-500 h-5 w-5" />
                                        ) : (
                                          "Add to My Papers"
                                        ))}
                                    </Button>
                                  )}

                                  {paper?.link &&
                                    !(
                                      paper?.openAccessPdf?.url || paper?.pdfUrl
                                    ) && (
                                      <Button
                                        className="h-8 text-xs"
                                        variant="outline"
                                        onClick={() =>
                                          window.open(paper.link, "_blank")
                                        }
                                      >
                                        View Paper
                                      </Button>
                                    )}
                                </div>

                                <FileRenderer
                                  templateModalOpen={templateModalOpen}
                                  setTemplateModalOpen={setTemplateModalOpen}
                                  url={selectedPaperUrl}
                                />
                              </>
                            ) : (
                              <div className="text-center">
                                <p className="text-sm text-gray-500 mb-2">
                                  Paper not available
                                </p>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>

                        {expandedRows[paper?.paperId] && (
                          <TableRow
                            key={`abstract-${paper?.paperId}`}
                            className="border-t  h-0"
                          >
                            <TableCell colSpan={6} className="px-4 py-2">
                              <div className="text-sm font-light whitespace-pre-wrap px-4">
                                {paper?.abstract || "No abstract available."}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))
                  ) : (
                    <p>NO paper found</p>
                  )}

                  {/* Skeleton loader - show during streaming */}
                  {isStreaming &&
                    (() => {
                      if (filtered.length > 1) {
                        const totalPages = Math.ceil(
                          filtered.length / papersPerPage
                        );
                        const isLastPage = pageNo === totalPages;
                        return isLastPage ? (
                          <TableRow
                            key="skeleton-loader"
                            className="border-t animate-pulse"
                          >
                            <TableCell className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                </div>
                                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : null;
                      } else if (
                        filtered.length === 0 &&
                        streamingPapers.length === 0
                      ) {
                        // Show skeleton when just starting search (no papers yet)
                        return (
                          <TableRow
                            key="skeleton-loader"
                            className="border-t animate-pulse"
                          >
                            <TableCell className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                </div>
                                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto"></div>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return null;
                    })()}
                </TableBody>
              </Table>
              <div className="py-4 flex rounded-br-xl rounded-bl-xl justify-end px-4 sm:px-6 bg-white border-t dark:bg-[#202D32]">
                <Pagination
                  total={filtered?.length}
                  defaultCurrent={pageNo}
                  onChange={handlePageChange}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full mt-8 py-12">
            <div className="mb-6">
              <HiDocumentText className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md text-sm sm:text-base">
              {searchType === "title" ? (
                <>
                  Start your research by searching for papers by <span className="font-semibold text-blue-600 dark:text-blue-400">📄 Title</span>.
                  <br />
                  Enter keywords that appear in the paper title.
                </>
              ) : (
                <>
                  Start your research by searching for papers by <span className="font-semibold text-blue-600 dark:text-blue-400">👤 Author</span>.
                  <br />
                  Enter the author's name (first name, last name, or both).
                </>
              )}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-2 text-center">
              Use the dropdown to switch between Title and Author search, or try the "Advanced Search" feature for more options.
            </p>
          </div>
        )}
      </div>
      {/* Advanced Search Modal */}
      <BuildQueryModal
        isOpen={showBuildQueryModal}
        onClose={() => {
          setShowBuildQueryModal(false);
        }}
        onOpenHistory={() => {
          setShowHistoryModal(true);
          historyGet(true);
        }}
        queryRows={queryRows}
        setQueryRows={setQueryRows}
        saveQuery={saveQuery}
        setSaveQuery={setSaveQuery}
        onCreateQuery={handleCreateQuery}
        onReset={resetQueryBuilder}
        generatePreviewQuery={generatePreviewQuery}
        validation={validation}
        dateRange={dateRange}
        setDateRange={setDateRange}
        showDateFilter={true}
      />

      {/* Query History Modal */}
      <SavedQueryModal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSearchError(""); // Clear search error when modal closes
        }}
        queryHistory={queryHistory}
        historyLoading={historyLoading}
        loadingMore={loadingMore}
        hasMoreHistory={hasMoreHistory}
        onLoadQuery={loadQueryFromHistory}
        onScroll={handleScroll}
      />
    </>
  );
};

export default Paper;
