"use client";
import React, { useState, useEffect, useRef } from "react";
import TopicAnalysisSidebar from "./components/TopicAnalysisSidebar";
import TopicAnalysisBody from "./components/TopicAnalysisBody";
import { AppDispatch, RootState } from "@/reducer/store";
import { useDispatch, useSelector } from "react-redux";
import { convertToJson, generateHTML, openAImodelKey } from "./utils/const";
import { topicAnalysisPrompt } from "@/utils/aiTemplates";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import { LoaderCircle } from "lucide-react";
import HistoryDialog from "./dialogs/HistoryDialog";
import { ApiRes, HistoryData } from "./utils/types";
import ToastInfo from "@/components/coman/ToastInfo";
import AddToNoteDialog from "@/components/coman/AddToNoteDialog";
import { fetchFolderListApi } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import {
  fetchToAi,
  getTopicAnalysisSavedQueryHistory,
  topicAnalysisHistoryAdd,
  topicAnalysisHistoryUpdate,
} from "@/apis/topic-explorer";
import { IoClose, IoSearchSharp } from "react-icons/io5";
import { topicExploreDetails } from "@/reducer/topic-explorer/topicExplorerSlice";
import { OptimizedImage } from "@/components/ui/optimized-image";
import LoadingText from "@/components/LoadingText";
import toast from "react-hot-toast";
import { MdHistory } from "react-icons/md";
import { Text } from "rizzui";
import { useQueryRowValidation } from "@/components/common/useTextValidation";
import { ValidatedInput, ValidatedQueryInput } from "@/components/common/ValidatedInput";
import BuildQueryModal from "@/components/common/BuildQueryModal";
import SavedQueryModal from "@/components/common/SavedQueryModal";
import { useQueryModal } from "@/components/common/useQueryModal";

const Page = () => {
  const hasFetched = useRef(false);
  const dispatch: AppDispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [topicAnalysis, setTopicAnalysis] = useState<ApiRes[]>();
  const [apiRes, setApiRes] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [addToNoteShow, setAddToNoteShow] = useState(false);
  const [singleTopicAnalysis, setSingleTopicAnalysis] = useState<ApiRes>();
  const [isActive, setIsActive] = useState<number>(0);
  const userData: string | null =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const userInfo = userData ? JSON.parse(userData) : "";
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const [singleHistoryData, setSingleHistoryData] = useState<any>();
  const [alreadyNoted, setAlreadyNoted] = useState(false);
  const [description, setDescription] = useState<string>();
  const { user } = useSelector((state: RootState) => state.user?.user || "");
  const { topicExploreSetInfo } = useSelector(
    (state: RootState) => state.topicExplore
  );

  const { keywords } = useSelector((state: RootState) => state.researchKeywords);
  const [loadingForTags, setLoadingForTags] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
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
    createQuery: createQueryInternal,
    loadQueryFromHistory: loadQueryFromHistoryInternal,
    handleScroll: modalHandleScroll,
    validation
  } = queryModal;
  
  const { 
    validateText, 
    validateOnly, 
    queryRowErrors, 
    validateQueryRow, 
    clearQueryRowError 
  } = validation;
  // Using local state for input validation
  const [inputError, setInputError] = useState<string>("");

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

  const addHistory = async (body: object) => {
    const apiRes = await topicAnalysisHistoryAdd(body);
    if (apiRes?.success) {
      const html = generateHTML(apiRes?.data?.[0]?.data);
      setDescription(html);
      setSingleHistoryData(apiRes?.data?.[0]);
      setAlreadyNoted(false);
    }
  };

  const updateHistory = async () => {
    const apiRes = await topicAnalysisHistoryUpdate(singleHistoryData.id);
    if (apiRes?.success) {
      setAlreadyNoted(apiRes?.data?.save_in_notes);
    }
  };

  const loadingMessages = [
    "Gathering information…",
    "Searching for real world examples…",
    "Conducting initial risk analysis…",
    "Expert insights and opportunities",
    "Finalizing…",
  ];

  const handleSingleHistory = (value: HistoryData) => {
    setIsActive(0);
    setApiRes(true);
    setHistoryDialog(false);
    setInputValue(value?.value);
    setTopicAnalysis(value?.data);
    setSingleTopicAnalysis(undefined);
    setSingleHistoryData(value);
    setAlreadyNoted(value?.save_in_notes);
    const html = generateHTML(value?.data);
    setDescription(html);
  };

  const filterData = async () => {
    const lastCheckTime = localStorage.getItem("lastCreditCheckTime");
    const currentTime = new Date().getTime();

    if (!lastCheckTime || currentTime - parseInt(lastCheckTime) > 3600000) {
      const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
        forward: boolean;
        message: string;
        mode: string;
      };
      localStorage.setItem("lastCreditCheckTime", currentTime.toString());
    }
  };
    function parseLogicalQuery(query?: string) {
    const regex = /\s+(AND NOT|AND|OR)\s+/gi;
    const parts:any = query?.split(regex).filter(Boolean);
    let result: { term: string; operator: string | null }[] = [];
    let lastOperator: string | null = null;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (["AND", "OR", "AND NOT"].includes(part.toUpperCase())) {
        lastOperator = part.toUpperCase();
      } else {
        const cleanTerm = part.replace(/^"|"$/g, "");
        result.push({ term: cleanTerm, operator: lastOperator });
        lastOperator = null;
      }
    }
    return result;
  }
  function buildLogicalPrompt(
    parsed: { term: string; operator: string | null }[],
  ) {
    let must: string[] = [];
    let mustNot: string[] = [];
    let optional: string[] = [];
    if (parsed.length === 1) {
      return topicAnalysisPrompt(parsed[0].term);
    }
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
    let prompt = "";
    prompt += must.length
      ? `Focus on topics related to ALL of the following: ${must
          .map((t) => '"' + t + '"')
          .join(", ")}. `
      : "";
    prompt += optional.length
      ? `Optionally, include topics related to ANY of: ${optional
          .map((t) => '"' + t + '"')
          .join(", ")}. `
      : "";
    prompt += mustNot.length
      ? `Exclude topics related to: ${mustNot
          .map((t) => '"' + t + '"')
          .join(", ")}. `
      : "";
    prompt +=
      "\n" + topicAnalysisPrompt(must.concat(optional).join(", "));
    return prompt;
  }

  const handleGenerate = async (
    value: string,
    unique?: boolean,
    searchQuery?: string
  ) => {
    if (!value) {
      ToastInfo("Please enter research title");
      return;
    }
    
    // Validate input
    const validationError = validateText(value);
    if (validationError) {
      setInputError(validationError);
      return;
    }
    
    setInputError(""); // Clear error if validation passes
    
    try {
      setLoading(true);

        const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
          forward: boolean;
          message: string;
          mode: string;
        };

        if (forward) {
          const mainPrompt:any = searchQuery?.trim() ? searchQuery : value;
          // Detect logical operators
          const hasLogical = /\b(AND NOT|AND|OR)\b/i.test(mainPrompt);
          let prompt = "";
          if (hasLogical) {
            const parsed = parseLogicalQuery(mainPrompt);
            prompt = buildLogicalPrompt(parsed);
          } else {
            prompt = topicAnalysisPrompt(value);
          }
          const body = { prompt: `${topicAnalysisPrompt(value)}` };
          const apiRes = await fetchToAi(body);
          if (apiRes?.data) {
            dispatch(
              updateCredits({
                credits: apiRes?.data?.overall_price?.total,
                activity: "Topic Analysis",
                credit_type: "Analysis",
              })
            );

            const choices =
              apiRes?.data?.completions[openAImodelKey]?.completion?.choices;

            if (choices?.length > 0) {
              const descriptions = convertToJson(choices[0].message?.content);

              setTopicAnalysis(descriptions);
              setLoading(false);
              setApiRes(true);
              dispatch(topicExploreDetails({}));

              const body = {
                user_id: userInfo?.id,
                workspace_id: workspace?.id,
                value: unique ? topicExploreSetInfo.keyWord : value,
                unique,
                data: descriptions,
                saved_query:saveQuery
              };

              await addHistory(body);
              setSaveQuery(false)
            }
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error generating topic analysis:", error);
        setLoading(false);
      }
    };

  const addToNote = async () => {
    const workspaceId = workspace?.id
      ? workspace?.id
      : localStorage.getItem("currentWorkspace");
    await dispatch(fetchFolderListApi({ id: workspaceId }));
    setAddToNoteShow(true);
  };

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    filterData();
  }, [user?.id]);

  useEffect(() => {
    const hasValues =
      topicExploreSetInfo &&
      Object.values(topicExploreSetInfo).some(
        (value) => value !== null && value !== undefined && value !== ""
      );
    if (hasValues && !hasFetched.current) {
      hasFetched.current = true;
      setInputValue(topicExploreSetInfo?.keyWord);
      // handleGenerate(topicExploreSetInfo?.ans, true);
      handleGenerate(topicExploreSetInfo?.keyWord, true);
    }
  }, [topicExploreSetInfo]);
  
  // Reset pagination state when modal closes
  useEffect(() => {
    if (!showHistoryModal) {
      setHistoryPage(1);
      setHasMoreHistory(true);
      setQueryHistory([]);
    }
  }, [showHistoryModal]);
  
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

      const response = await getTopicAnalysisSavedQueryHistory(user?.id || "", currentPage, true, 10);
      const data = response?.data?.data || [];
      const totalCount = response?.data?.count || 0;
      
      const transformed = data.map((item: any) => ({
        id: item.id,
        search_value: item.value,
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
        setQueryHistory(prev => {
          return [...prev, ...transformed];
        });
        setHistoryPage(currentPage);
      }
      
      // Check if there are more items to load
      let hasMore = false;
      if (totalCount > 0) {
        const newTotalCount = reset ? transformed.length : queryHistory.length + transformed.length;
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
  
  // Create a custom wrapper for loadQueryFromHistory
  const loadQueryFromHistory = (query: string) => {
    loadQueryFromHistoryInternal(query);
    setInputError(""); // Clear any input errors
  };
  
  // Create a custom wrapper for createQuery
  const handleCreateQuery = () => {
    // Use the internal createQuery function that comes from useQueryModal
    // Pass the inputValue setter as a callback
    createQueryInternal((query: string) => {
      if (query) {
        setInputValue(query);
        setSearchQuery(query);
        setInputError(""); // Clear any input errors
      }
    });
  };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
       setInputValue(e.target.value);
    
      if (value.trim().endsWith("/")) {
        setLoadingForTags(true);
      } else {
        setLoadingForTags(false);
      }
    };

    const onSelectSuggestion = (selected: string) => {
      const input = inputValue;
      const lastSlashIndex = input.lastIndexOf("/");

      if (lastSlashIndex !== -1) {
        const prefix = input.slice(0, lastSlashIndex).trimEnd();
        const newValue = `${prefix} ${selected}`.replace(/\s+/g, " ").trim();
        setInputValue(newValue);
      }

      setLoadingForTags(false);
    };

  const loadMoreHistory = () => {
    if (!loadingMore && hasMoreHistory) {
      historyGet(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    modalHandleScroll(e, loadMoreHistory);
  };
  return (
    <div>
      <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen">
        <div
          className={`overflow-hidden transition-[width] duration-300 ease-in-out dark:bg-[#202E33] pt-[152px]
           ${
             apiRes
               ? "w-72 p-4 border-r border-[#E5E5E5] dark:border-[#505A5E]"
               : "w-0"
           }`}
        >
          <TopicAnalysisSidebar
            isActive={isActive}
            addToNote={addToNote}
            inputValue={inputValue}
            setIsActive={setIsActive}
            alreadyNoted={alreadyNoted}
            topicAnalysis={topicAnalysis}
            setSingleTopicAnalysis={setSingleTopicAnalysis}
          />
        </div>
        <div className="flex-1">
          <main className="bg-[#FAFAFA] dark:bg-[#020818] h-full overflow-scroll pb-0 mb-12">
            <section className="bg-[#F1F1F1] dark:bg-[#142328] flex justify-center pt-12 pb-20 flex-col items-center">
              <h1 className="text-xl font-medium text-[#333333] dark:text-[#CCCCCC]">
                Topic Analysis
              </h1>
              <p className="text-sm font-normal text-[#666666] mt-3 dark:text-[#999999]">
                Discover the latest research papers and websites tailored to
                your interest.
              </p>
            </section>

            <div className="relative top-[-34px]">
              {loading ? <LoadingText messages={loadingMessages} /> : null}
                <div className="w-[86%] justify-between mx-auto bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] box-shadow py-2 rounded-lg px-4 md:px-8">
                <div className="flex flex-col lg:flex-row lg:divide-x dark:divide-[#CCCCCC33] py-3 gap-4 lg:gap-0">
                  <div className="w-full flex items-center gap-4 lg:pe-5 relative">
                    <div className="w-full">
                      <ValidatedInput
                        placeholder="Search for papers, related information and more"
                        value={inputValue || searchQuery}
                        onChange={(value) => {
                          setInputValue(value);
                          // Clear error when user starts typing
                          if (inputError) {
                            setInputError("");
                          }
                          // Handle keyword suggestions
                          if (value.trim().endsWith("/")) {
                            setLoadingForTags(true);
                          } else {
                            setLoadingForTags(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const error = validateText(inputValue || searchQuery);
                            if (error) {
                              setInputError(error);
                            } else {
                              handleGenerate(inputValue || searchQuery);
                            }
                          }
                        }}
                        error={inputError}
                        className="outline-none w-full dark:bg-[#2C3A3F] bg-transparent text-[13px] truncate"
                      />
                      {
                        loadingForTags &&
                        <div ref={wrapperRef} className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#2C3A3F] border border-gray-200 dark:border-[#475154] rounded-lg shadow-lg z-10 p-2 max-h-80 overflow-y-auto">
                          {keywords.map((i: string) => (
                            <div
                              key={i}
                              onClick={() => onSelectSuggestion(i)}
                              className="cursor-pointer px-2 py-1 rounded-full hover:bg-[#E2EEFF] dark:hover:bg-[#3E4C51] transition-colors"
                            >
                              {i}
                            </div>
                          ))}
                        </div>
                      }
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-2 lg:ps-3 w-full lg:w-auto xl:w-[450px] lg:min-w-0 lg:flex-shrink-0">
                    <button
                      type="submit"
                      className="button-full w-full sm:w-auto sm:flex-1 lg:w-[130px] xl:w-[140px] lg:flex-initial flex-shrink-0 sm:min-w-[110px] lg:min-w-0 whitespace-nowrap"
                      disabled={loading}
                      onClick={() => handleGenerate(inputValue || searchQuery)}
                    >
                      {loading ? (
                        <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                      ) : (
                        <span className="flex justify-center items-center gap-1.5 text-sm lg:text-xs xl:text-sm whitespace-nowrap">
                          <IoSearchSharp className="text-base lg:text-sm xl:text-base flex-shrink-0" /> 
                          <span className=" sm:inline">Search</span>
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      className="button-full w-full sm:w-auto sm:flex-1 lg:w-[160px] xl:w-[170px] lg:flex-initial flex-shrink-0 sm:min-w-[130px] lg:min-w-0 whitespace-nowrap"
                      onClick={() => {
                        setShowBuildQueryModal(true);
                      }}
                      disabled={loading}
                    >
                      <span className="flex justify-center items-center text-sm lg:text-xs xl:text-sm whitespace-nowrap">
                        <span className=" md:inline">Advanced Search</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="button-full w-full sm:w-auto sm:flex-1 lg:w-[120px] xl:w-[140px] lg:flex-initial flex-shrink-0 sm:min-w-[100px] lg:min-w-0 whitespace-nowrap"
                      onClick={() => {
                        setHistoryDialog(true);
                      }}
                    >
                      <span className="flex justify-center items-center gap-1.5 text-sm lg:text-xs xl:text-sm whitespace-nowrap">
                        <OptimizedImage
                          width={14}
                          height={14}
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//history.png`}
                          alt="history-icon"
                          className="flex-shrink-0"
                        />
                        <span className=" sm:inline">History</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {apiRes && (
              <TopicAnalysisBody
                singleTopicAnalysis={singleTopicAnalysis}
                topicAnalysis={topicAnalysis}
              />
            )}

            {historyDialog && (
              <HistoryDialog
                historyDialog={historyDialog}
                setHistoryDialog={setHistoryDialog}
                handleSingleHistory={handleSingleHistory}
              />
            )}

            {addToNoteShow && (
              <AddToNoteDialog
                page="topic-analysis"
                noteTitle={`${inputValue} - Topic Analysis`}
                description={description}
                updateHistory={updateHistory}
                addToNoteShow={addToNoteShow}
                setAddToNoteShow={setAddToNoteShow}
                singleHistoryDatas={singleHistoryData}
              />
            )}
          </main>
        </div>
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
    />

    {/* Query History Modal */}
    <SavedQueryModal
      isOpen={showHistoryModal}
      onClose={() => {
        setShowHistoryModal(false);
      }}
      queryHistory={queryHistory}
      historyLoading={historyLoading}
      loadingMore={loadingMore}
      hasMoreHistory={hasMoreHistory}
      onLoadQuery={loadQueryFromHistory}
      onScroll={handleScroll}
    />
    </div>
  );
};

export default Page;
