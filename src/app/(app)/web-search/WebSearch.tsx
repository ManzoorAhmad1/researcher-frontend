/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { getNewsByTopic, saveNews } from "@/apis/explore";
import { usePostHog } from "posthog-js/react";
import { generateWebSearch } from "@/utils/aiTemplates";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import ArticleList from "./NewsList";
import HistoryDialog from "./dialogs/HistoryDialog";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import { openAImodelKey } from "./utils/const";
import { FormData, HistoryData } from "./utils/types";
import ExploreResearchTopics from "./ExploreResearchTopics";
import { useSelector } from "react-redux";
import AddToNoteDialog from "@/components/coman/AddToNoteDialog";
import { fetchFolderListApi } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import {
  fetchToAi,
  getGoogleLink,
  getWebSearchHistory,
  getWebSearchSavedQueryHistory,
  webSearchHistoryAdd,
  webSearchHistoryUpdate,
} from "@/apis/topic-explorer";
import ToastInfo from "@/components/coman/ToastInfo";
import { useQueryRowValidation } from "@/components/common/useTextValidation";
import { ValidatedQueryInput } from "@/components/common/ValidatedInput";
import { IoIosWarning } from "react-icons/io";
import BuildQueryModal from "@/components/common/BuildQueryModal";
import SavedQueryModal from "@/components/common/SavedQueryModal";
import { useQueryModal } from "@/components/common/useQueryModal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { IoSearchSharp } from "react-icons/io5";
import SaveKnowledgeBankBtn from "@/components/coman/SaveKnowledgeBankBtn";
import { topicExploreDetails } from "@/reducer/topic-explorer/topicExplorerSlice";
import toast from "react-hot-toast";

const defaultValues = {
  search: "",
};

const WebSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch: AppDispatch = useDispatch();
  const methods = useForm<FormData>({ defaultValues });
  const userData: string | null =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const userInfo = userData ? JSON.parse(userData) : "";
  const [loading, setLoading] = useState(false);
  const [apiRes, setApiRes] = useState<any>("");
  const [historyDialog, setHistoryDialog] = useState(false);
  const [historyDatas, setHistoryDatas] = useState<HistoryData[]>([]);
  const [singleHistoryDatas, setSingleHistoryDatas] = useState<
    HistoryData | undefined
  >();
  const { register, handleSubmit, setValue, getValues } = methods;
  const [addToNoteShow, setAddToNoteShow] = useState(false);
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { folderLoading } = useSelector(
    (state: RootState) => state.notesbookmarks
  );
  const { user } = useSelector((state: RootState) => state.user?.user || "");
  const { suggestion, suggestionLoading, suggestionError } = useSelector(
    (state: RootState) => state.webSearch || ""
  );

  const [alreadyNoted, setAlreadyNoted] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const posthog = usePostHog();
  const keywordsRef = useRef<string[]>([]);
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

  const { keywords: newKeywords } = useSelector(
    (state: RootState) => state.researchKeywords
  );
  const [loadingForTags, setLoadingForTags] = useState<boolean>(false);
 
  const [visibleKeywordCount, setVisibleKeywordCount] = useState(10);  
  // Add validation hook
  const validation = useQueryRowValidation();
  const {
    validateText,
    validateOnly,
    queryRowErrors,
    validateQueryRow,
    clearQueryRowError,
  } = validation;
  const [searchError, setSearchError] = useState<string>("");

  // Query modal management
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
    validation: modalValidation,
  } = queryModal;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  // Query History logic (dummy, you can connect to your API)
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
      const response = await getWebSearchSavedQueryHistory(
        user?.id || "",
        currentPage,
        true,
        10
      );
      const data = response?.data?.data || [];
      const totalCount = response?.data?.totalCount || 0;

      const transformed = data.map((item: any) => ({
        id: item.id,
        search_value: item.search_value,
        date: new Date(item.created_at).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      if (reset) {
        setQueryHistory(transformed);
        setHistoryPage(1);
      } else {
        setQueryHistory((prev) => {
          return [...prev, ...transformed];
        });
        setHistoryPage(currentPage);
      }

      // Check if there are more items to load
      let hasMore = false;
      if (totalCount > 0) {
        const newTotalCount = reset
          ? transformed.length
          : queryHistory.length + transformed.length;
        hasMore = newTotalCount < totalCount && data.length > 0;
      } else {
        // If no totalCount, assume there are more if we got a full page (10 items)
        hasMore = data.length === 10;
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

  // Enhanced: Parse a query like '"health" and "network"' into queryRows and open the builder modal
  const loadQueryFromHistoryCustom = (query: string) => {
    loadQueryFromHistory(query); // Use the global hook function
    setSearchError(""); // Clear any existing search error
    setInputValue(query); // Set the input value directly
    setValue("search", query); // Update form value
    setShowHistoryModal(false);
  };

  // Custom create query handler for WebSearch component
  const handleCreateQuery = () => {
    createQuery((query) => {
      setBuiltQuery(query);
      setSearchQuery(query);
      setValue("search", query);
      setInputValue(query);
      setSearchError(""); // Clear any existing error
      setShowBuildQueryModal(false);
    });
  };
  const history = async () => {
    setIsHistoryLoading(true);
    const apiRes = await getWebSearchHistory(workspace?.id);
    if (apiRes?.success) {
      setHistoryDatas(apiRes?.data);
    } else {
      setHistoryDatas([]);
    }
    setIsHistoryLoading(false);
  };

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const filterData = async () => {
      const lastCheckTime = localStorage.getItem("lastCreditCheckTime");
      const currentTime = new Date().getTime();

      if (!lastCheckTime || currentTime - parseInt(lastCheckTime) > 3600000) {
        const { forward, message, mode } = (await verifyCreditApi(
          user?.id
        )) as {
          forward: boolean;
          message: string;
          mode: string;
        };
        localStorage.setItem("lastCreditCheckTime", currentTime.toString());
      }
    };
    filterData();
  }, [user?.id]);

  // function extractJsonFromText(input: any) {
  //   const jsonMatch = input.match(/```json\s*([\s\S]*?)\s*```/);
  //   if (!jsonMatch) {
  //     toast.error(
  //       "The input seems unclear. Try adding a more descriptive prompt to explore"
  //     );
  //     throw new Error("No valid JSON block found in the input.");
  //   }

  //   try {
  //     const jsonString = jsonMatch[1];
  //     return JSON.parse(jsonString);
  //   } catch (error) {
  //     toast.error(
  //       "Something went wrong! Please try again!"
  //     );
  //     throw new Error("Failed to parse JSON: ");
  //   }
  // }

  function extractJsonFromText(input: string) {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = input.match(jsonRegex);

    if (!match || match.length < 2) {
      toast.error("The input seems unclear. Try refining your prompt.");
      throw new Error("No valid JSON block found.");
    }

    try {
      const jsonString = match[1].trim();
      const parsed = JSON.parse(jsonString);

      // Validate expected structure
      if (!parsed.article || !Array.isArray(parsed.keyWords)) {
        throw new Error("JSON structure is invalid.");
      }

      return parsed;
    } catch (error: any) {
      toast.error("Something went wrong while parsing the JSON.");
      throw new Error("Failed to parse JSON: " + error.message);
    }
  }

  // Helper to parse logical queries
  function parseLogicalQuery(query: string) {
    // Split by AND, OR, AND NOT (case-insensitive, with spaces)
    const regex = /\s+(AND NOT|AND|OR)\s+/gi;
    const parts = query.split(regex).filter(Boolean);
    let result: { term: string; operator: string | null }[] = [];
    let lastOperator: string | null = null;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (["AND", "OR", "AND NOT"].includes(part.toUpperCase())) {
        lastOperator = part.toUpperCase();
      } else {
        // Remove quotes if present
        const cleanTerm = part.replace(/^"|"$/g, "");
        result.push({ term: cleanTerm, operator: lastOperator });
        lastOperator = null;
      }
    }
    return result;
  }

  // Build a custom prompt for logical queries
  function buildLogicalPrompt(
    parsed: { term: string; operator: string | null }[]
  ) {
    // Group terms by operator
    let must: string[] = [];
    let mustNot: string[] = [];
    let optional: string[] = [];
    if (parsed.length === 1) {
      return generateWebSearch(parsed[0].term);
    }
    // The first term is always included, operator applies to the next
    if (!parsed[0].operator) {
      must.push(parsed[0].term);
    }
    for (let i = 1; i < parsed.length; i++) {
      const op = parsed[i].operator;
      const term = parsed[i].term;
      if (op === "AND") {
        must.push(term);
      } else if (op === "AND NOT") {
        mustNot.push(term);
      } else if (op === "OR") {
        optional.push(term);
      }
    }
    // Compose prompt
    let prompt = "";
    prompt += must.length
      ? `Focus on documents related to ALL of the following: ${must
          .map((t) => '"' + t + '"')
          .join(", ")}. `
      : "";
    prompt += optional.length
      ? `Optionally, include documents related to ANY of: ${optional
          .map((t) => '"' + t + '"')
          .join(", ")}. `
      : "";
    prompt += mustNot.length
      ? `Exclude documents related to: ${mustNot
          .map((t) => '"' + t + '"')
          .join(", ")}. `
      : "";
    prompt += "\n" + generateWebSearch(must.concat(optional).join(", "));
    return prompt;
  }

  const onSubmit = async (data: FormData) => {
    try {
      const { search } = data;

      // Validate search input
      const validationError = validateText(search);
      if (validationError) {
        setSearchError(validationError);
        setLoading(false);
        return;
      }

      setSearchError(""); // Clear error if validation passes

      setLoading(true);
      setShowKeywordSuggestions(false);

      if (!search?.trim()) {
        ToastInfo("Please enter value");
        return;
      }
      const { forward, message, mode } = (await verifyCreditApi(user?.id)) as {
        forward: boolean;
        message: string;
        mode: string;
      };

      if (forward) {
        // Detect logical operators
        const hasLogical = /\b(AND NOT|AND|OR)\b/i.test(search);
        let prompt = "";
        if (hasLogical) {
          const parsed = parseLogicalQuery(search);
          prompt = buildLogicalPrompt(parsed);
        } else {
          prompt = generateWebSearch(search);
        }
        const body = { prompt };

        posthog?.capture("web-search", {
          email: userInfo?.email,
          "search-key": search?.toLocaleLowerCase(),
        });

        const straicoApiRes = await fetchToAi(body);
        straicoApiRes?.data &&
          dispatch(
            updateCredits({
              credits: straicoApiRes?.data.overall_price?.total,
              activity: "Generate Web Search Topics",
              credit_type: "Summarization",
            })
          );

        if (
          straicoApiRes.data.completions[openAImodelKey].completion.choices
            .length > 0
        ) {
          if (
            straicoApiRes?.data?.completions[
              openAImodelKey
            ].completion.choices[0].message.content.includes("```json")
          ) {
            const jsonAns = await extractJsonFromText(
              straicoApiRes?.data?.completions[openAImodelKey].completion
                .choices[0].message.content
            );

            if (jsonAns?.makeSense) {
            const keyword = jsonAns?.keyWords
              ?.map((item: any) => item)
              ?.join(", ");
              
            const apiKeyWord = { query: keyword };
            const apiLinks = await getGoogleLink(apiKeyWord);
            const referencesSection =
              `\n\n---\n\n### References\n\n` +
              apiLinks.data?.map((link: string) => `- **${link}**`).join("\n");

            const finalArticle = jsonAns?.article + referencesSection;

            setApiRes(finalArticle);
            setLoading(false);
            setAlreadyNoted(false);
            const body = {
              workspace_id: workspace?.id,
              user_id: userInfo?.id,
              search_value: search?.toLocaleLowerCase(),
              answer: finalArticle,
              saved_query: saveQuery,
            };

            const apiHistoryRes = await webSearchHistoryAdd(body);
            if (apiHistoryRes?.success) {
              setSingleHistoryDatas(apiHistoryRes?.data[0]);
              history();
              setSaveQuery(false);
            }
            } else {
              setLoading(false);
              setAlreadyNoted(false);
              toast.error(jsonAns?.reason ||
                "The input seems unclear. Try adding a more descriptive prompt to explore"
              );
            }
          } else {
            setLoading(false);
            setAlreadyNoted(false);
            toast.error(
              "The input seems unclear. Try adding a more descriptive prompt to explore"
            );
          }
        }
      } else {
        setLoading(true);
        setAlreadyNoted(false);
        toast.error("Something went Wrong!");
      }
    } catch (error) {
      setLoading(false);
      setAlreadyNoted(false);
    }
  };

  const handleKeywordClick = (keyword: string) => {
    setValue("search", keyword);
    setInputValue(keyword);
    setShowKeywordSuggestions(false);
  };

  const onSelectSuggestion = (selected: string) => {
    const input = getValues("search");
    const lastSlashIndex = input.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const prefix = input.slice(0, lastSlashIndex).trimEnd();
      const newValue = `${prefix} ${selected}`.replace(/\s+/g, " ").trim();
      setValue("search", newValue);
      setInputValue(newValue);
    }

    setLoadingForTags(false);
  };

  const onSearchChange = (value: string) => {
    // Clear error when user starts typing
    if (searchError) {
      setSearchError("");
    }

    if (value.trim().endsWith("/")) {
      setLoadingForTags(true);
    } else {
      setLoadingForTags(false);
    }
  };

  useEffect(() => {
    const loadKeywords = () => {
      const userData =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userData && JSON.parse(userData).research_keywords) {
        const parsedKeywords = JSON.parse(userData).research_keywords;
        setKeywords(parsedKeywords);
        keywordsRef.current = parsedKeywords;

        if (!getValues("search") && newKeywords?.length > 0) {
          const randomIndex = Math.floor(Math.random() * newKeywords?.length);
          const randomKeyword = newKeywords[randomIndex];
          setValue("search", randomKeyword || "");
          setInputValue(randomKeyword || "");
        }
      }
    };

    loadKeywords();

    const handleStorageChange = () => {
      loadKeywords();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [setValue]);

  useEffect(() => {
    if (workspace?.id) {
      history();
      const topic = searchParams.get("topic");
      if (topic) {
        const decodedTopic = decodeURIComponent(topic);
        setValue("search", decodedTopic);
        setInputValue(decodedTopic);
      } else {
        if (keywords.length === 0 && !getValues("search")) {
          setApiRes("");
          setValue("search", "");
          setInputValue("");
        }
      }
    }
  }, [workspace?.id, searchParams]);

  // Reset pagination states when history modal is closed
  useEffect(() => {
    if (!showHistoryModal) {
      setHistoryPage(1);
      setLoadingMore(false);
      setHasMoreHistory(true);
    }
  }, [showHistoryModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowKeywordSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpen = async () => {
    const workspaceId = workspace?.id
      ? workspace?.id
      : localStorage.getItem("currentWorkspace");
    await dispatch(fetchFolderListApi({ id: workspaceId }));
    setAddToNoteShow(true);
  };

  const updateHistory = async () => {
    if (singleHistoryDatas && singleHistoryDatas?.id) {
      const apiRes = await webSearchHistoryUpdate(singleHistoryDatas?.id);
      if (apiRes?.success) {
        setAlreadyNoted(apiRes?.data?.save_in_notes);
      }
    }
  };

  const handleSend = () => {
    router.push(`/topic-analysis`);
    dispatch(
      topicExploreDetails({ keyWord: getValues("search"), ans: apiRes })
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowKeywordSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  useEffect(() => {
    if (workspace?.id) {
      history();
      const topic = searchParams.get("topic");
      if (topic) {
        const decodedTopic = decodeURIComponent(topic);
        setValue("search", decodedTopic);
        setInputValue(decodedTopic);
      } else if (userData && JSON.parse(userData).research_keywords) {
        const keywords = JSON.parse(userData).research_keywords;
        setKeywords(keywords);
        if (!getValues("search") && newKeywords?.length > 0) {
          const randomIndex = Math.floor(Math.random() * newKeywords?.length);
          const randomKeyword = newKeywords[randomIndex];
          setValue("search", randomKeyword || "");
          setInputValue(randomKeyword || "");
        }
      } else {
        setApiRes("");
        setValue("search", "");
        setInputValue("");
        setKeywords([]);
      }
    }
  }, [workspace?.id, searchParams]);

  const loadMoreHistory = () => {
    if (!loadingMore && hasMoreHistory) {
      historyGet(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    modalHandleScroll(e, loadMoreHistory);
  };

  const handleShowMoreKeywords = () => {
    const remaining = newKeywords.length - visibleKeywordCount;
    setVisibleKeywordCount((prev) => prev + Math.min(5, remaining));
  };

  const currentVisibleKeywords = Math.min(
    visibleKeywordCount,
    newKeywords.length
  );
  const remainingKeywords = newKeywords.length - currentVisibleKeywords;
  useEffect(() => {
    setVisibleKeywordCount(10);
  }, [newKeywords]);

  return (
    <div>
      <div className="relative top-[-16px] md:top-[-34px] ">
        <div className="w-[95%] md:w-[85%] justify-between mx-auto bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] box-shadow py-4 rounded-lg px-4 md:px-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col md:flex-row md:divide-x dark:divide-[#CCCCCC33] gap-4 md:gap-0"
          >
            <div
              className="text-[13px] flex-1 relative"
              ref={searchContainerRef}
            >
              <div className="flex flex-col border rounded-md md:border-0 overflow-hidden dark:bg-[#2C3A3F] dark:border-[#CCCCCC33]">
                <input
                  placeholder="Search for papers, related information and more "
                  value={inputValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInputValue(value);
                    setValue("search", value);
                    onSearchChange(value);
                  }}
                  onFocus={() => setShowKeywordSuggestions(true)}
                  className="outline-none w-full dark:bg-[#2C3A3F] py-2 px-3 bg-transparent"
                />
                {searchError && (
                  <div className="mt-1">
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <IoIosWarning className="text-sm text-red-500" />
                      {searchError}
                    </p>
                  </div>
                )}

                {showKeywordSuggestions && newKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-3 py-2 border-t dark:border-[#CCCCCC33]">
                    {/* Show visible keywords */}
                    {newKeywords
                      .filter(
                        (newKeyword: any) => newKeyword !== getValues("search")
                      )
                      .slice(0, currentVisibleKeywords)
                      .map((newKeyword: any, index: number) => (
                        <div
                          key={index}
                          onMouseDown={() => handleKeywordClick(newKeyword)}
                          className="px-3 py-1 text-xs sm:text-sm rounded-full border border-[#0E70FF] bg-[#0E70FF1F] hover:bg-[#0E70FF33] text-[#0E70FF] cursor-pointer flex items-center"
                        >
                          {newKeyword}
                        </div>
                      ))}

                    {remainingKeywords > 1 && (
                      <div
                        className="inline-block px-3 py-1 text-xs sm:text-sm rounded-full border border-[#0E70FF] bg-[#0E70FF1F] hover:bg-[#0E70FF33] text-[#0E70FF] cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowMoreKeywords();
                        }}
                      >
                        +{remainingKeywords - 1} more
                      </div>
                    )}
                  </div>
                )}

                {loadingForTags && (
                  <div
                    ref={wrapperRef}
                    className="absolute left-0 right-0 !mt-[40px] bg-[#ffffff] dark:bg-[#2C3A3F] border border-gray-500 dark:border-[#475154] rounded-lg shadow-lg z-10 p-2 max-h-80 overflow-y-auto"
                  >
                    {newKeywords.map((i: string) => (
                      <div
                        key={i}
                        onClick={() => {
                          onSelectSuggestion(i);
                        }}
                        className="cursor-pointer px-2 py-1 rounded-full hover:bg-[#E2EEFF] dark:hover:bg-[#3E4C51] transition-colors"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col flex-wrap md:flex-row items-center gap-3 md:gap-4 md:ps-6 justify-evenly">
              <button
                type="submit"
                className="button-full w-full sm:w-[100px] md:w-[120px]"
                disabled={loading}
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <>
                    <span
                      className={`text-nowrap flex justify-center items-center gap-2`}
                    >
                      <IoSearchSharp className="text-lg" /> Search
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="button-full w-full sm:w-[100px] md:w-[150px] whitespace-nowrap"
                onClick={() => setShowBuildQueryModal(true)}
                disabled={loading}
              >
                Advanced Search
              </button>

              <button
                type="button"
                className="button-full w-full sm:w-[100px] md:w-[120px] flex justify-center items-center gap-2"
                onClick={() => setHistoryDialog(true)}
              >
                <OptimizedImage
                  width={16}
                  height={16}
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//history.png`}
                  alt="history-icon"
                  className="w-4 h-4"
                />{" "}
                History
              </button>
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
                validation={modalValidation}
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
                onLoadQuery={loadQueryFromHistoryCustom}
                onScroll={handleScroll}
              />
            </div>
          </form>
        </div>
      </div>
      {suggestionLoading ? (
        <div className="w-[95%] md:w-[90%] mx-auto mt-6 md:mt-14">
          <div className=" flex flex-wrap justify-center gap-5">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="h-[80px] md:h-[92px] bg-gray-200 dark:bg-gray-700 animate-pulse w-full max-w-[470px] p-4 md:p-5 rounded-tl-3xl rounded rounded-b-3xl rounded-bl flex gap-4 items-center cursor-pointer border-2"
              ></div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {apiRes ? (
            <>
              <div className="flex flex-col sm:flex-row justify-end items-center mx-[5%] md:mx-0 md:me-[7.5%] lg:me-[9.7%] gap-2 mt-4 md:mt-0">
                <div className="w-full sm:w-[180px] md:w-[210px] flex justify-end items-center">
                  <SaveKnowledgeBankBtn
                    handleOpen={handleOpen}
                    alreadyNoted={alreadyNoted}
                    folderLoading={folderLoading}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSend()}
                  className="button-full w-full sm:w-auto"
                >
                  Send to Topic Analysis
                </button>
              </div>

              <div className="w-[95%] md:w-[85%] mx-auto mb-20">
                <MarkdownPreview
                  style={{ background: "transparent" }}
                  className="my-4 md:my-6 dark:text-[#CCCCCC]"
                  source={apiRes}
                  wrapperElement={{ "data-color-mode": "light" }}
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer">
                        {props.children}
                      </a>
                    ),
                  }}
                />
              </div>
            </>
          ) : (
            <>
              {suggestionError?.success && (
                <ExploreResearchTopics
                  setValue={setValue}
                  onSubmit={onSubmit}
                  handleSubmit={handleSubmit}
                  aiExploreResearchData={suggestion}
                  setInputValue={setInputValue}
                />
              )}
            </>
          )}

          {!suggestionError?.success && (
            <div className="flex justify-center items-center flex-col h-auto md:h-[60vh] px-4 mt-10 md:mt-0">
              <OptimizedImage
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//ai-robot.png`}
                alt=""
                className="w-full max-w-[400px] md:max-w-[750px]"
                width={350}
                height={350}
              />
              <div className="text-center text-lg md:text-xl font-semibold mt-4 md:mt-8 dark:text-[#CCCCCC]">
                {suggestionError?.message}
              </div>
            </div>
          )}

          {historyDialog && (
            <HistoryDialog
              setValue={setValue}
              setApiRes={setApiRes}
              historyDatas={historyDatas}
              historyDialog={historyDialog}
              setAlreadyNoted={setAlreadyNoted}
              setHistoryDialog={setHistoryDialog}
              setSingleHistoryDatas={setSingleHistoryDatas}
              isHistoryLoading={isHistoryLoading}
            />
          )}

          {addToNoteShow && (
            <AddToNoteDialog
              page="web-search"
              noteTitle={`${getValues("search")} - Web Search`}
              description={apiRes}
              singleHistoryDatas={singleHistoryDatas}
              updateHistory={updateHistory}
              addToNoteShow={addToNoteShow}
              setAddToNoteShow={setAddToNoteShow}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default WebSearch;
