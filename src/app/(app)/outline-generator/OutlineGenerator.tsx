/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import DropDowns from "@/components/coman/DropDowns";
import {
  createScampArray,
  dropdown1,
  dropdownOptions,
  openAImodelKey,
} from "./utils/const";
import { outlineGenerator } from "@/utils/aiTemplates";
import { GoDot } from "react-icons/go";
import HistoryDialog from "./dialogs/HistoryDialog";
import { HistoryData } from "../web-search/utils/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import AddToNoteDialog from "@/components/coman/AddToNoteDialog";
import { fetchFolderListApi } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import ToastInfo from "@/components/coman/ToastInfo";
import {
  fetchToAi,
  getOutlineGeneratorHistory,
  getOutlineGeneratorSavedQueryHistory,
  outlineGeneratorHistoryAdd,
  outlineGeneratorHistoryUpdate,
} from "@/apis/topic-explorer";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { useSearchParams } from "next/navigation";
import { ValidatedInput } from "@/components/common/ValidatedInput";
import SaveKnowledgeBankBtn from "@/components/coman/SaveKnowledgeBankBtn";
import { outlineGeneratorDetails } from "@/reducer/topic-explorer/topicExplorerSlice";
import { OptimizedImage } from "@/components/ui/optimized-image";
import BuildQueryModal from "@/components/common/BuildQueryModal";
import SavedQueryModal from "@/components/common/SavedQueryModal";
import { useQueryModal } from "@/components/common/useQueryModal";

import { LuLightbulb } from "react-icons/lu";
import { MdHistory } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { Text } from "rizzui";

const OutlineGenerator = () => {
  const hasFetched = useRef(false);
  const dispatch: AppDispatch = useDispatch();
  const searchParams = useSearchParams();
  const userData: string | null = localStorage.getItem("user");
  const userInfo = userData ? JSON.parse(userData) : "";
  const [loading, setLoading] = useState(false);
  const [generateOutlineData, setGenerateOutlineData] = useState<any>({});
  const [isOptions, setIsOptions] = useState([]);
  const [isSecOptions, setIsSecOptions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [historyDatas, setHistoryDatas] = useState<HistoryData[]>([]);
  const [formData, setFormData] = useState({
    search: "",
    type: "",
    level: "",
    complexity: 0,
  });
  const [addToNoteShow, setAddToNoteShow] = useState(false);
  const [description, setDescription] = useState("");
  const [singleHistoryDatas, setSingleHistoryDatas] = useState<any>();
  const [alreadyNoted, setAlreadyNoted] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { folderLoading } = useSelector(
    (state: RootState) => state.notesbookmarks
  );
  const { user } = useSelector((state: RootState) => state.user?.user || "");
  const { outlineGeneratorInfo } = useSelector(
    (state: RootState) => state.topicExplore
  );
  const [searchError, setSearchError] = useState<string>("");

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
    validation,
  } = queryModal;
  console.log(queryHistory, "queryHistory");
  const {
    validateText,
    validateOnly,
    queryRowErrors,
    validateQueryRow,
    clearQueryRowError,
  } = validation;

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

      const response = await getOutlineGeneratorSavedQueryHistory(
        user?.id || "",
        true,
        currentPage,
        10
      );
      const data = response?.data?.data || [];
      const totalCount = response?.data?.count || 0;
      console.log(data, "data");
      const transformed = data.map((item: any) => ({
        id: item.id,
        search_value: item.research_object?.search || "",
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

  // Create custom wrappers for the hook functions
  const loadQueryFromHistory = (query: string) => {
    loadQueryFromHistoryInternal(query);
    setSearchError(""); // Clear any search errors
  };

  const loadMoreHistory = () => {
    if (!loadingMore && hasMoreHistory) {
      historyGet(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    modalHandleScroll(e, loadMoreHistory);
  };

  // Create a custom wrapper for createQuery
  const handleCreateQuery = () => {
    // Use the internal createQuery function that comes from useQueryModal
    // Pass the formData setter as a callback
    createQueryInternal((query: string) => {
      if (query) {
        setFormData((prev) => ({ ...prev, search: query }));
        setSearchError(""); // Clear any input errors
        toast.success("Query built successfully!");
      }
    });
  };

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
  const historyOutlineGeneratorHistory = async () => {
    setIsHistoryLoading(true);
    const apiRes = await getOutlineGeneratorHistory(workspace?.id);
    console.log(apiRes, "apiRes,,,,,,,,,,,,,");
    if (apiRes?.success) {
      setHistoryDatas(apiRes?.data);
    }
    setIsHistoryLoading(false);
  };
  useEffect(() => {
    historyOutlineGeneratorHistory();
  }, []);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  function generateHTMLFromJSON(data: { [key: string]: string[] }) {
    let htmlContent = "";
    Object?.entries(data).forEach(([section, points]) => {
      htmlContent += `<p><strong>${section}</strong></p>`;
      if (Array.isArray(points)) {
        points.forEach((point) => {
          htmlContent += `<p>${point}</p>`;
        });
      } else {
        console.error(`Expected an array, but got:`, points);
      }
      htmlContent += `<p></p>`;
    });

    return htmlContent;
  }

  const updateHistory = async () => {
    const apiRes = await outlineGeneratorHistoryUpdate(singleHistoryDatas.id);

    if (apiRes?.success) {
      setAlreadyNoted(apiRes?.data?.save_in_notes);
    }
  };

  const toggleSecDropdown = () => {
    if (isOptions?.length > 0) {
      setIsSecOptions(!isSecOptions);
    } else {
      ToastInfo("Please select type");
    }
  };

  const handleSelect = (value: string) => {
    const newValue = value.split(" ").join("");
    handleChange("type", value);
    setIsOptions(dropdownOptions[newValue]);
    handleChange("level", dropdownOptions[newValue]?.[0]?.value);
    setIsOpen(false);
  };

  const handleSecSelect = (value: string) => {
    handleChange("level", value);
    setIsSecOptions(false);
  };

  const addHistory = async (body: object) => {
    const apiRes = await outlineGeneratorHistoryAdd(body);
    if (apiRes?.success) {
      setDescription(generateHTMLFromJSON(apiRes?.data?.[0]?.history?.data));
      setSingleHistoryDatas(apiRes?.data?.[0]);
      setAlreadyNoted(apiRes?.data?.[0].save_in_notes);
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
    type: string,
    level: string
  ) {
    let must: string[] = [];
    let mustNot: string[] = [];
    let optional: string[] = [];
    if (parsed.length === 1) {
      return outlineGenerator(parsed[0].term, type, level);
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
      "\n" + outlineGenerator(must.concat(optional).join(", "), type, level);
    return prompt;
  }
  const handleGenerate = async (
    search: string,
    type: string,
    level: string,
    unique?: boolean,
    searchQuery?: string
  ) => {
    if (!loading) {
      if (!search?.trim() && !type?.trim()) {
        ToastInfo("Please enter a research title and select a type");
        return;
      }
      if (!type?.trim()) {
        ToastInfo("Please select type");
        return;
      }
      if (!search?.trim()) {
        ToastInfo("Please enter research title");
        return;
      }

      // Validate search input
      const validationError = validateText(search);
      if (validationError) {
        setSearchError(validationError);
        return;
      }

      setSearchError(""); // Clear error if validation passes
      setLoading(true);

      const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
        forward: boolean;
        message: string;
        mode: string;
      };

      if (forward) {
        const mainPrompt = searchQuery?.trim() ? searchQuery : search;
        // Detect logical operators
        const hasLogical = /\b(AND NOT|AND|OR)\b/i.test(mainPrompt);
        let prompt = "";
        if (hasLogical) {
          const parsed = parseLogicalQuery(mainPrompt);
          prompt = buildLogicalPrompt(parsed, type, level);
        } else {
          prompt = outlineGenerator(search, type, level);
        }

        const body = { prompt };
        const apiRes = await fetchToAi(body);

        apiRes.data &&
          dispatch(
            updateCredits({
              credits: apiRes?.data?.overall_price?.total,
              activity: "Generate Outline",
              credit_type: "Summarization",
            })
          );

        if (
          apiRes?.data?.completions[openAImodelKey]?.completion?.choices
            ?.length > 0
        ) {
          const data = createScampArray(
            apiRes?.data?.completions[openAImodelKey]?.completion?.choices[0]
              ?.message?.content
          );

          const body = {
            user_id: userInfo?.id,
            research_object: {
              search: unique ? outlineGeneratorInfo?.keyWord : search,
              type,
              level,
            },
            history: data,
            workspace_id: workspace?.id,
            unique,
            saved_query: saveQuery,
          };
          setGenerateOutlineData(data);
          setLoading(false);
          dispatch(outlineGeneratorDetails({}));

          await addHistory(body);
          historyOutlineGeneratorHistory();

          setSaveQuery(false);
        }
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    // Clear error when search is updated
    if (field === "search") {
      setSearchError("");
    }
  };

  const handleChangeForSearchSuggetions = (selected: string) => {
    const input = formData?.search;
    const lastSlashIndex = input.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const prefix = input.slice(0, lastSlashIndex).trimEnd();
      const newValue = `${prefix} ${selected}`.replace(/\s+/g, " ").trim();
      setFormData((prevData) => ({
        ...prevData,
        ["search"]: newValue,
      }));
    }
    setLoadingForTags(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    // Only for "search" field, check for "/"
    if (field === "search") {
      if (value.trim().endsWith("/")) {
        setLoadingForTags(true);
      } else {
        setLoadingForTags(false);
      }
    }
  };

  const handleOpen = async () => {
    const workspaceId = workspace?.id
      ? workspace?.id
      : localStorage.getItem("currentWorkspace");
    await dispatch(fetchFolderListApi({ id: workspaceId }));
    setAddToNoteShow(true);
  };

  useEffect(() => {
    historyGet();
  }, [historyDialog]);

  // Reset pagination states when history modal is closed
  useEffect(() => {
    if (!showHistoryModal) {
      setHistoryPage(1);
      setLoadingMore(false);
      setHasMoreHistory(true);
    }
  }, [showHistoryModal]);

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    filterData();
  }, [user?.id]);

  useEffect(() => {
    if (generateOutlineData?.data) {
      setDescription(generateHTMLFromJSON(generateOutlineData?.data));
    }
  }, [generateOutlineData]);

  useEffect(() => {
    const hasValues =
      outlineGeneratorInfo &&
      Object.values(outlineGeneratorInfo).some(
        (value) => value !== null && value !== undefined && value !== ""
      );

    if (hasValues && !hasFetched.current) {
      hasFetched.current = true;

      setFormData({
        search: outlineGeneratorInfo?.keyWord,
        type: outlineGeneratorInfo?.type,
        level: outlineGeneratorInfo?.level,
        complexity: 3,
      });

      handleGenerate(
        outlineGeneratorInfo?.keyWord,
        outlineGeneratorInfo?.type,
        outlineGeneratorInfo?.level,
        true
      );
      setIsOptions(dropdownOptions[outlineGeneratorInfo?.type]);
    }
  }, [outlineGeneratorInfo]);

  return (
    <div>
      <div className="relative top-[-34px] mb-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate(
              formData.search,
              formData.type,
              formData.level,
              false,
              builtQuery
            );
          }}
          className="w-full max-w-[85%] mx-auto bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] box-shadow py-4 px-4 sm:px-8 rounded-lg"
        >
          <div className="flex flex-col lg:flex-row flex-wrap gap-y-4 md:justify-center md:items-center">
            {/* Search Input */}
            <div className="flex w-full lg:max-w-[23rem] items-center gap-4 outline-generator-input">
              <OptimizedImage
                width={16}
                height={16}
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//vector2.png`}
                alt="AI-icon"
              />
              <div className="w-full relative">
                <label className="text-[11px] text-[#666666] dark:text-[#999999] line-clamp-1">
                  Research Keywords
                </label>
                <div className="text-[13px]">
                  <ValidatedInput
                    placeholder="Research paper title or keywords"
                    value={formData.search}
                    onChange={(value) => {
                      handleInputChange("search", value);
                      // Clear error when user starts typing
                      if (searchError) {
                        setSearchError("");
                      }
                    }}
                    error={searchError}
                    className="outline-none w-full dark:bg-[#2C3A3F] truncate"
                  />
                </div>

                {/* {suggestions.length > 0 && (
                  <div className="bg-white dark:bg-[#2C3A3F] border rounded mt-1 text-sm max-h-40 overflow-auto shadow-md z-10 absolute">
                    {suggestions.map((suggestion) => (
                      <li
                        key={suggestion}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#455A64] cursor-pointer"
                        onClick={() => {
                          handleChange("search", suggestion); // update input
                          setSuggestions([]); // hide suggestions
                        }}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </div>
                )} */}
                {loadingForTags && (
                  <div
                    ref={wrapperRef}
                    className="absolute left-0 right-0 mt-1 bg-[#ffffff] dark:bg-[#2C3A3F] border border-gray-200 dark:border-[#475154] rounded-lg shadow-lg z-10 p-2 max-h-80 overflow-y-auto"
                  >
                    {keywords.map((i: string) => (
                      <div
                        onClick={() => {
                          handleChangeForSearchSuggetions(i); // correctly update form field
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

            {/* Type Dropdown */}
            <div className="flex w-full lg:max-w-60 items-center gap-4 px-0 lg:px-5 lg:border-l lg:border-[#CCCCCC] dark:lg:border-[#CCCCCC33]">
              <OptimizedImage
                width={16}
                height={16}
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//vector.png`}
                alt="AI-icon"
              />
              <DropDowns
                labelName="Type"
                toggleDropdown={toggleDropdown}
                isOpen={isOpen}
                options={dropdown1}
                selectedValue={formData.type}
                onSelect={handleSelect}
              />
            </div>

            {/* Level Dropdown */}
            <div className="flex w-full xl:max-w-60 items-center gap-4 px-0 lg:px-5 lg:border-l lg:border-[#CCCCCC] dark:lg:border-[#CCCCCC33]">
              <OptimizedImage
                width={16}
                height={16}
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//vector.png`}
                alt="AI-icon"
              />
              <DropDowns
                labelName="Level"
                toggleDropdown={toggleSecDropdown}
                isOpen={isSecOptions}
                options={isOptions}
                selectedValue={formData.level}
                onSelect={handleSecSelect}
              />
            </div>

            {/* Complexity Indicator */}
            <div className="w-full lg:w-auto px-0 lg:px-5 lg:border-l lg:border-[#CCCCCC] dark:lg:border-[#CCCCCC33]">
              <label className="text-[11px] text-[#666666] dark:text-[#999999]">
                Complexity
              </label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((item) => {
                  const selectedOption = isOptions?.find(
                    (option: any) => option.value === formData.level
                  );
                  return (
                    <div
                      key={item}
                      className={`w-2 h-2 g-5 rounded-full ${
                        selectedOption &&
                        selectedOption["complexity"] > item - 1
                          ? "bg-[#0E70FF]"
                          : "bg-[#D9D9D9]"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 ps-0 lg:ps-6 pt-2 lg:pt-0 lg:border-l lg:border-[#CCCCCC] dark:lg:border-[#CCCCCC33] md:border-none">
              <button
                type="submit"
                disabled={loading}
                className="button-full w-full sm:w-[186px]"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <>
                    <LuLightbulb className="text-lg" />
                    <span className="text-nowrap">Generate Outline</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="button-full w-full sm:max-w-[200px] whitespace-nowrap"
                onClick={() => setShowBuildQueryModal(true)}
                disabled={loading}
              >
                Advanced Search
              </button>
              <button
                onClick={() => setHistoryDialog(true)}
                type="button"
                className="button-full w-full sm:max-w-[180px]"
              >
                <OptimizedImage
                  width={16}
                  height={16}
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//history.png`}
                  alt="history-icon"
                />
                History
              </button>
            </div>
          </div>
        </form>

        {generateOutlineData?.data && (
          <>
            <div className="flex justify-end me-[9.6%] mt-5">
              <div className="w-[210px] flex justify-end items-center">
                <SaveKnowledgeBankBtn
                  handleOpen={handleOpen}
                  alreadyNoted={alreadyNoted}
                  folderLoading={folderLoading}
                />
              </div>
            </div>
            <div className="w-[85%] lg:max-w-6xl mx-auto mt-5">
              {Object.keys(generateOutlineData?.data).map(
                (key: string, i: number) => {
                  return (
                    <div
                      className='p-4 border -[var(--line,#E5E5E5)] rounded-lg mb-3 bg-white dark:bg-[#15252A] "border border-[#E5E5E5] dark:border-[#E5E5E514]'
                      key={i}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-[#0E70FF] text-[15px] font-medium">
                              {i + 1}. {key}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 w-full bg-white dark:bg-[#233137] dark:text-[#CCCCCC] p-3 text-[15px] border-[#e2e8f0] dark:border-[#CCCCCC33] border border-[var(--line-2, #CCCCCC)] rounded-lg font-normal">
                        {generateOutlineData?.data?.[key]?.map((item: any) => (
                          <div
                            className="my-1 flex gap-2 items-start"
                            key={item}
                          >
                            <GoDot className="w-[15px] mt-[5px]" />
                            <div className="flex-1">{item}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
        <HistoryDialog
          setIsOptions={setIsOptions}
          setFormData={setFormData}
          setGenerateOutlineData={setGenerateOutlineData}
          historyDialog={historyDialog}
          setHistoryDialog={setHistoryDialog}
          historyDatas={historyDatas}
          setSingleHistoryDatas={setSingleHistoryDatas}
          setAlreadyNoted={setAlreadyNoted}
          isHistoryLoading={isHistoryLoading}
        />

        {addToNoteShow && (
          <AddToNoteDialog
            page="outline"
            noteTitle={`${formData?.search} - Outline Generator`}
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
    </div>
  );
};

export default OutlineGenerator;
