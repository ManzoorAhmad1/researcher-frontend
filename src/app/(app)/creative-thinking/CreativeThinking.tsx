"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { generateIdeas } from "@/utils/aiTemplates";
import { LoaderCircle } from "lucide-react";
import ScamperCards from "./ScamperCards";
import SwipeableCardsDialog from "./dialogs/SwipeableCardsDialog";
import { scamperDataType } from "./utils/types";
import {
  createScampArray,
  openAImodelKey,
  scamperData,
  topic,
} from "./utils/const";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { useRouter } from "next-nprogress-bar";
import DropDowns from "@/components/coman/DropDowns";
import { jsPDF } from "jspdf";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { fetchFolderListApi } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import AddToNoteDialog from "@/components/coman/AddToNoteDialog";
import { Separator } from "@/components/ui/separator";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import {
  creativeThinkingHistoryAdd,
  creativeThinkingHistoryUpdate,
  fetchToAi,
  getCreateThinkingSavedQueryHistory,
  getWebSearchSavedQueryHistory,
} from "@/apis/topic-explorer";
import ToastInfo from "@/components/coman/ToastInfo";
import SaveKnowledgeBankBtn from "@/components/coman/SaveKnowledgeBankBtn";
import { topicExploreDetails } from "@/reducer/topic-explorer/topicExplorerSlice";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { LuLightbulb } from "react-icons/lu";
import { getFileHistory } from "@/apis/files";
import { MdHistory } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { Text } from "rizzui";
import { ValidatedInput, ValidatedQueryInput } from "@/components/common/ValidatedInput";
import { useTextValidation, useQueryRowValidation } from "@/components/common/useTextValidation";
import { useQueryModal } from "@/components/common/useQueryModal";
import BuildQueryModal from "@/components/common/BuildQueryModal";
import SavedQueryModal from "@/components/common/SavedQueryModal";

const CreativeThinking = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const userData: string | null =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const [isScamperData, setIsScamperData] =
    useState<scamperDataType[]>(scamperData);
  const userInfo = userData ? JSON.parse(userData) : "";
  const [isTopicValue, setTopicValue] = useState("Please select");
  const [loading, setLoading] = useState(false);
  const [swipeableCardsDialog, setSwipeableCardsDialog] = useState(false);
  const [scamperDataId, setScamperDataId] = useState<number>(0);
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [btnLabel, setbtnLabel] = useState("Generate");
  const [isOpen, setIsOpen] = useState(false);
  const [apiRes, setApiRes] = useState(false);
  const [isHideShowOpen, setIsHideShowOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState(
    "Enter a few Interesting Keywords"
  );
  const [addToNoteShow, setAddToNoteShow] = useState(false);
  const [alreadyNoted, setAlreadyNoted] = useState(false);
  const { folderLoading } = useSelector(
    (state: RootState) => state.notesbookmarks
  );
  const [singleHistoryDatas, setSingleHistoryDatas] = useState<any>();
  const [description, setDescription] = useState<string>();
  
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
    validation: modalValidation
  } = queryModal;
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Add validation hooks
  const validation = useQueryRowValidation();
  const { 
    validateText, 
    validateOnly, 
    queryRowErrors, 
    validateQueryRow, 
    clearQueryRowError 
  } = validation;
  const [inputError, setInputError] = useState<string>("");
  
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { user } = useSelector((state: RootState) => state.user?.user || "");

  const { keywords } = useSelector(
    (state: RootState) => state.researchKeywords
  );
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

  function generateHTML(data: scamperDataType[]) {
    let htmlContent = "";

    data?.forEach((item) => {
      htmlContent += `<p><strong>${item.title}</strong></p><p>${
        item.question
      }</p><p>${item.ans}</p><p><strong>References:</strong> <a href="${
        item.references || ""
      }" target="_blank">Link</a></p><p></p>`;
    });

    return htmlContent;
  }

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

  const updateHistory = async () => {
    const apiRes = await creativeThinkingHistoryUpdate(singleHistoryDatas.id);

    if (apiRes?.success) {
      setAlreadyNoted(apiRes?.data?.save_in_notes);
    }
  };

  const addCreativeThinking = async (body: object) => {
    const apiRes = await creativeThinkingHistoryAdd(body);
    if (apiRes?.success) {
      setLoading(false);
      setScamperDataId(apiRes?.data?.[0]?.id);
      setIsScamperData(apiRes?.data?.[0]?.scamper_datas);
      setSingleHistoryDatas(apiRes?.data?.[0]);
      setSwipeableCardsDialog(true);
      setApiRes(true);
      setDescription(generateHTML(apiRes?.data?.[0]?.scamper_datas));
    }
  };
  function parseLogicalQuery(query: string) {
    const regex = /\s+(AND NOT|AND|OR)\s+/gi;
    const parts = query.split(regex).filter(Boolean);
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
    searchType: string
  ) {
    let must: string[] = [];
    let mustNot: string[] = [];
    let optional: string[] = [];
    if (parsed.length === 1) {
      return generateIdeas(parsed[0].term, searchType);
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
      "\n" + generateIdeas(must.concat(optional).join(", "), searchType);
    return prompt;
  }
  const handleGenerate = async (
    searchType: string,
    searchValue: string,
    searchQuery: string
  ) => {
    if (!loading) {
      if (
        !searchType?.trim() &&
        !(searchValue?.trim() || searchQuery?.trim())
      ) {
        ToastInfo("Please select topic keywords and enter keywords");
        return;
      }
      if (!searchType?.trim()) {
        ToastInfo("Please select topic keywords");
        return;
      }
      if (!(searchValue?.trim() || searchQuery?.trim())) {
        ToastInfo("Please enter keywords");
        return;
      }
      
      // Validate the search input
      const inputToValidate = searchQuery?.trim() || searchValue?.trim();
      const validationError = validateText(inputToValidate);
      if (validationError) {
        setInputError(validationError);
        return;
      }
      
      setInputError(""); // Clear error if validation passes
      setAlreadyNoted(false);
      const { forward, message, mode } = (await verifyCreditApi(
        userInfo?.id
      )) as { forward: boolean; message: string; mode: string };

      if (forward) {
        setLoading(true);

        // Use searchQuery if present, otherwise searchValue
        const mainPrompt = searchQuery?.trim() ? searchQuery : searchValue;
        // Detect logical operators
        const hasLogical = /\b(AND NOT|AND|OR)\b/i.test(mainPrompt);
        let prompt = "";
        if (hasLogical) {
          const parsed = parseLogicalQuery(mainPrompt);
          prompt = buildLogicalPrompt(parsed, searchType);
        } else {
          prompt = generateIdeas(mainPrompt, searchType);
        }
        const body = { prompt };
        const apiRes = await fetchToAi(body);

        apiRes.data &&
          dispatch(
            updateCredits({
              credits: apiRes?.data?.overall_price?.total,
              activity: "Generate Creative Thinking",
              credit_type: "Summarization",
            })
          );
        if (
          apiRes?.data?.completions[openAImodelKey]?.completion?.choices
            ?.length > 0
        ) {
          const descriptions = createScampArray(
            apiRes?.data.completions[openAImodelKey]?.completion?.choices[0]
              ?.message?.content
          );
          if (descriptions) {
            const scamper_datas = scamperData.map((item) => {
              const descriptionEntry = descriptions[item.title];
              return {
                ...item,
                ans:
                  descriptionEntry &&
                  (descriptionEntry.description || descriptionEntry.question),
                references: descriptionEntry?.references || "",
              };
            });

            const keywordType = topic?.find(
              (item) => item.value === searchType
            );
            if (keywordType) {
              const body = {
                user_id: userInfo?.id,
                keyword_type: keywordType.label,
                keyword_name: inputValue || searchQuery,
                scamper_datas,
                workspace_id: workspace?.id,
                saved_query: saveQuery,
              };
              await addCreativeThinking(body);
              setSaveQuery(false);
            } else {
              console.log("No label found");
            }
          }
        }

        posthog?.capture("creative-thinking", {
          email: userInfo?.email,
          keyword: inputValue,
          "topic-keyword": selectedValue,
        });
      }
    }
  };

  const clearAll = () => {
    setInputValue("");
    setApiRes(false);
    setIsScamperData([]);
    setSelectedValue("Please select");
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value: string) => {
    if (value === "Questions") {
      setbtnLabel("Generate Questions");
      setPlaceholder("Enter keywords or an existing question.");
    } else {
      setbtnLabel("Generate ideas");
      setPlaceholder("Enter a few Interesting Keywords");
    }
    setSelectedValue(value);
    setTopicValue(value);
    setIsOpen(false);
  };

  const handleOpen = async () => {
    const workspaceId = workspace?.id
      ? workspace?.id
      : localStorage.getItem("currentWorkspace");
    await dispatch(fetchFolderListApi({ id: workspaceId }));
    setAddToNoteShow(true);
  };

  const sortedData = [...isScamperData].sort((a, b) => {
    return (b.interested === true ? 1 : 0) - (a.interested === true ? 1 : 0);
  });

  const getTextToCopy = () => {
    return sortedData
      ?.map((scamperData) => {
        return `${scamperData.title}\n${scamperData.ans}\n\n`;
      })
      .join("");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getTextToCopy());
      toast.success("Copy to clipboard!");
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDrawerClose = () => {
    setIsHideShowOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        handleDrawerClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHideShowOpen]);

  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    filterData();
  }, [user?.id]);

  // Reset pagination states when history modal is closed
  useEffect(() => {
    if (!showHistoryModal) {
      setHistoryPage(1);
      setLoadingMore(false);
      setHasMoreHistory(true);
    }
  }, [showHistoryModal]);

  const historyGet = async (reset: boolean = true) => {
    try {
      if (reset) {
        setHistoryLoading(true);
        setHistoryPage(1);
        setQueryHistory([]); // Clear existing data when resetting
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : historyPage + 1;
      console.log(`Fetching page ${currentPage}, reset: ${reset}`);

      const response = await getCreateThinkingSavedQueryHistory(
        user?.id || "",
        currentPage,
        true,
        10
      );
      setHistoryLoading(false);
      // Handle case where response is null/undefined or doesn't have data
      if (!response || !response.data?.data) {
        console.log("No response or data from API");
        setHasMoreHistory(false);
        return;
      }

      const data = Array.isArray(response.data?.data)
        ? response.data?.data
        : [];
      const transformed = data.map((item: any) => ({
        id: item.id,
        search_value: item.keyword_name || "Untitled Query",
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
      } else {
        // Append new data to existing data, avoiding duplicates
        setQueryHistory((prev: any[]) => {
          const existingIds = new Set(prev.map((item: any) => item.id));
          const newItems = transformed.filter(
            (item: { id: number; search_value: string; date: string }) =>
              !existingIds.has(item.id)
          );
          return [...prev, ...newItems];
        });
      }

      // Update pagination state
      setHistoryPage(currentPage);

      // Check if there are more items (if we got less than limit, no more data)
      setHasMoreHistory(data.length === 10);

      console.log(
        `Loaded ${data.length} items, hasMore: ${data.length === 10}`
      );
    } catch (error) {
      console.error("Error fetching query history:", error);
      setHasMoreHistory(false);
      setHistoryLoading(false);
      if (reset) {
        setQueryHistory([]);
      }
    } finally {
      setHistoryLoading(false);
      setLoadingMore(false);
    }
  };
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      let yOffset = 20;
      const lineHeight = 10;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - 2 * margin;

      sortedData.forEach((item, index) => {
        // Check if we need a new page
        if (yOffset > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yOffset = margin;
        }

        // Add title
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(item.title, maxWidth);
        doc.text(titleLines, margin, yOffset);
        yOffset += titleLines.length * lineHeight + lineHeight;

        // Add answer
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const answerLines = doc.splitTextToSize(item.ans || "", maxWidth);

        // Check if answer will fit on current page
        const answerHeight = answerLines.length * lineHeight;
        if (
          yOffset + answerHeight >
          doc.internal.pageSize.getHeight() - margin
        ) {
          doc.addPage();
          yOffset = margin;
        }

        doc.text(answerLines, margin, yOffset);
        yOffset += answerLines.length * lineHeight + lineHeight;

        // Add references if they exist
        if (item.references) {
          doc.setFontSize(10);
          const refText = `References: ${item.references}`;
          const refLines = doc.splitTextToSize(refText, maxWidth);

          // Check if references will fit on current page
          const refHeight = refLines.length * lineHeight;
          if (
            yOffset + refHeight >
            doc.internal.pageSize.getHeight() - margin
          ) {
            doc.addPage();
            yOffset = margin;
          }

          doc.text(refLines, margin, yOffset);
          yOffset += refLines.length * lineHeight + lineHeight;
        }

        // Add spacing between items
        yOffset += lineHeight;
      });

      doc.save("Creative-Thinking.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };
  const loadMoreHistory = () => {
    console.log(
      `Load more called - loadingMore: ${loadingMore}, hasMoreHistory: ${hasMoreHistory}, historyPage: ${historyPage}`
    );
    if (!loadingMore && hasMoreHistory && !historyLoading) {
      console.log("Triggering load more...");
      historyGet(false);
    }
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

  const handleKeywordSelect = (selected: string) => {
    const input = inputValue;
    const lastSlashIndex = input.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const prefix = input.slice(0, lastSlashIndex).trimEnd();
      const newValue = `${prefix} ${selected}`.replace(/\s+/g, " ").trim();
      setInputValue(newValue);
    }

    setLoadingForTags(false);
  };

  const handleScrollModal = (e: React.UIEvent<HTMLDivElement>) => {
    modalHandleScroll(e, loadMoreHistory);
  };

  // Custom create query handler for CreativeThinking component
  const handleCreateQuery = () => {
    createQuery((query: string) => {
      setBuiltQuery(query);
      setSearchQuery(query);
      setInputValue(query);
      setInputError(""); // Clear any existing errors
      setShowBuildQueryModal(false);
    });
  };

  return (
    <>
      <div className="relative top-[-34px] ">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate(selectedValue, inputValue, searchQuery);
          }}
          className="w-[85%] justify-between mx-auto bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] box-shadow py-2 rounded-lg px-8"
        >
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x dark:divide-[#CCCCCC33] mt-2">
            <div className="flex col-span-1 w-full items-center gap-4 pe-5">
              <OptimizedImage
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//vector.png`}
                alt="AI-icon"
                width={16}
                height={16}
              />
              <DropDowns
                labelName="Generate Topics or Questions?"
                toggleDropdown={toggleDropdown}
                isOpen={isOpen}
                options={topic}
                selectedValue={`${selectedValue || "Please select"}`}
                onSelect={handleSelect}
              />
            </div>

            <div className="flex col-span-2 w-full items-center gap-4 xl:ps-6 pt-4 xl:pt-0">
              <OptimizedImage
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//vector2.png`}
                alt="AI-icon"
                width={16}
                height={16}
              />
              <div className="w-full relative">
                <div className="text-[13px]">
                  <ValidatedInput
                    placeholder={placeholder}
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
                    error={inputError}
                    className="outline-none bg-transparent w-full dark:bg-[#2C3A3F]"
                  />
                </div>
                {loadingForTags && (
                  <div
                    ref={wrapperRef}
                    className="absolute left-0 right-0 mt-[10px] bg-[#ffffff] dark:bg-[#2C3A3F] border border-gray-200 dark:border-[#475154] rounded-lg shadow-lg z-10 p-2 max-h-80 overflow-y-auto"
                  >
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
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-3 dark:divide-[#CCCCCC33]">
            <div className="col-span-1" />
            <div className="col-span-2 w-full xl:ms-2 mb-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-start w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className={`button-full flex-1 sm:flex-none ${
                    btnLabel === "Generate Questions" 
                      ? "w-full sm:w-auto sm:min-w-[207px]" 
                      : "w-full sm:w-auto sm:min-w-[180px]"
                  }`}
                >
                  {loading ? (
                    <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    <>
                      <LuLightbulb className="text-lg" />
                      <span className="text-nowrap">{btnLabel}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="button-full flex-1 sm:flex-none w-full sm:w-auto sm:min-w-[130px] whitespace-nowrap"
                  onClick={() => setShowBuildQueryModal(true)}
                  disabled={loading}
                >
                  Advanced Search
                </button>
                <button
                  onClick={() =>
                    router.push("/creative-thinking/history-timeline")
                  }
                  type="button"
                  className="button-full flex-1 sm:flex-none w-full sm:w-auto sm:min-w-[120px]"
                >
                  <OptimizedImage
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//history.png`}
                    alt="history-icon"
                    width={16}
                    height={16}
                  />
                  History
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {apiRes && !swipeableCardsDialog && (
        <>
          {/* <div className="flex justify-end me-[9.7%] gap-2 mb-8">
            <button
              onClick={() => handleSend()}
              type="button"
              className="button-full"
            >
              Send to Topic Analysis
            </button>
          </div> */}
          <div className="w-[85%] xl:max-w-6xl mx-auto" id="divToPrint">
            <div className="mt-4">
              <ScamperCards
                scamperDataId={scamperDataId}
                isScamperData={isScamperData}
                setIsScamperData={setIsScamperData}
                inputValue={inputValue}
                isTopicValue={isTopicValue}
              />
            </div>
            <div className="flex justify-center gap-5 mt-5">
              <button
                onClick={clearAll}
                type="button"
                className="button-outline"
              >
                <OptimizedImage
                  width={16}
                  height={16}
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//clear.png`}
                  alt="clear-icon"
                />
                Clear All
              </button>
              <DropdownMenu onOpenChange={setIsOpen}>
                <DropdownMenuTrigger className="gap-3 cursor-pointer font-size-normal font-normal text-lightGray outline-none">
                  <button
                    onClick={() => setIsHideShowOpen(!isHideShowOpen)}
                    type="button"
                    className="button-full"
                  >
                    <OptimizedImage
                      width={16}
                      height={16}
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//download.png`}
                      alt="download-icon"
                    />
                    Export Ideas
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  className="p-2 bg-inputBackground border border-tableBorder"
                >
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={generatePDF}
                  >
                    Export to PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <hr className="pb-[10px] mt-[14px] border-tableBorder" />
                    <div
                      className="cursor-pointer"
                      onClick={copyToClipboard}
                    >
                      Copy to Clipboard
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-[210px] flex justify-start items-center">
                <SaveKnowledgeBankBtn
                  handleOpen={handleOpen}
                  alreadyNoted={alreadyNoted}
                  folderLoading={folderLoading}
                />
              </div>
            </div>
            <div className="h-24"></div>
          </div>
        </>
      )}

      {swipeableCardsDialog && (
        <SwipeableCardsDialog
          selectedValue={selectedValue}
          scamperDataId={scamperDataId}
          isScamperData={isScamperData}
          setIsScamperData={setIsScamperData}
          setSwipeableCardsDialog={setSwipeableCardsDialog}
          swipeableCardsDialog={swipeableCardsDialog}
        />
      )}

      {addToNoteShow && (
        <AddToNoteDialog
          page="creative-thinking"
          noteTitle={`${inputValue} - Creative Tool`}
          description={description}
          singleHistoryDatas={singleHistoryDatas}
          updateHistory={updateHistory}
          addToNoteShow={addToNoteShow}
          setAddToNoteShow={setAddToNoteShow}
        />
      )}

      {/* Advanced Search Modal */}
      <BuildQueryModal
        isOpen={showBuildQueryModal}
        onClose={() => {
          setShowBuildQueryModal(false);
          setInputError(""); // Clear errors when modal closes
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
        }}
        queryHistory={queryHistory}
        historyLoading={historyLoading}
        loadingMore={loadingMore}
        hasMoreHistory={hasMoreHistory}
        onLoadQuery={loadQueryFromHistory}
        onScroll={handleScrollModal}
      />
    </>
  );
};

export default CreativeThinking;
