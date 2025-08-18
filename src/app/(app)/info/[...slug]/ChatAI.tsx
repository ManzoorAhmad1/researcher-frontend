/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { SendHorizontal, Pause } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { HiOutlineShare } from "react-icons/hi";
import { TbDownload } from "react-icons/tb";
import { RiArrowRightSLine } from "react-icons/ri";
import { IoIosArrowUp } from "react-icons/io";
import { MdKeyboardArrowDown } from "react-icons/md";
import { RiRefreshLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import Typewriter from "typewriter-effect";
import { Loader } from "rizzui";
import { RiDeleteBinLine } from "react-icons/ri";
import axios from "axios";
import { debounce } from "lodash";
import toast from "react-hot-toast";
import { BsFillStarFill } from "react-icons/bs";
import clsx from "clsx";
import { FaRegStar } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { RoundButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstancePrivate } from "@/utils/request";
import { sendComparisonRequest } from "@/utils/fetchApi";
import { ImCheckboxUnchecked, ImCheckboxChecked } from "react-icons/im";
import { FaCoins } from "react-icons/fa";
import {
  pdfChatMessage,
  pdfInAiChat,
  questionsGenerate,
  messageRes,
} from "@/utils/aiTemplates";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  comparedBothAnswer,
  PrimaryModelResponse,
  roundCredit,
  SecondaryModelResponse,
} from "@/utils/commonUtils";
import { handleRender } from "@/components/ui/slider";
import Slider from "rc-slider";
import makeAnimated from "react-select/animated";
import { SupabaseClient } from "@supabase/supabase-js";
import { fetchApi } from "@/utils/fetchApi";
import { createClient } from "@/utils/supabase/client";
import {
  clearPdfToAi,
  selectedValueInPDF,
} from "@/reducer/services/folderSlice";
import { RootState, AppDispatch } from "@/reducer/store";
import {
  useMultipleModelsMsg,
  FastAndCostEffectiveAI,
  SmartAI,
  ReasoningAI,
  modelPrompt,
} from "@/utils/commonUtils";
import Select, { SingleValue } from "react-select";
import ai_chat from "@/images/aiChat/ai_chat.svg";
import { Label } from "@/components/ui/label";
import RoundBtn from "@/components/ui/RoundBtn";
import LightButton from "@/components/ui/LightButton";
import { Separator } from "@/components/ui/separator";
import { PDFData as PDFDataType, pdfQuestions } from "@/types/types";
import "./info.css";
import { useRouter } from "next/navigation";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import { Button as CustomButton } from "@/components/ui/button";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import "./info.css";
import { addAiHistory, fetchAiHistory, updateAiHistory } from "@/apis/ai-chat";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  ModelList,
  multiModels,
  GroupModel,
  Option,
  pricing,
} from "@/types/types";
import { ImageSizes } from "@/utils/image-optimizations";
import { updateUserfeatures, updateUserChatPdfFeatures, updateUserPDFData } from "@/apis/user";
import preferences from "@/images/userProfileIcon/userPreferences";
import { updateFileStatus } from "@/apis/explore";

type UpdateParentDataFunction = (newState: Message[]) => void;
interface ChatAIProps {
  PDFData: PDFDataType;
  parentData: Message[];
  updateParentData: UpdateParentDataFunction;
  chatURL?: string | null[];
  PDF_id: number;
  handleClick: (number: any) => void;
  showNotification?: boolean;
  generateQuestion?: boolean;
}
interface Message {
  answerRole?: string;
  answer?: string | any;
  user?: string;
  text?: string;
  id?: string;
  pageNumber?: Number;
}

const ChatAI: React.FC<ChatAIProps> = ({
  handleClick,
  parentData,
  PDFData,
  updateParentData,
  chatURL,
  PDF_id,
  showNotification,
  generateQuestion = false,
}) => {
  const router = useRouter();
  const supabase: SupabaseClient = createClient();
  const dispatch = useDispatch();
  const dispatche: AppDispatch = useDispatch();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [favouriteChat, setfavouriteChat] = React.useState<any>([]);
  const [input, setInput] = React.useState<string>("");
  const [questions, setQuestions] = React.useState<any[]>([]);
  const [questionsShow, setQuestionsShow] = React.useState<boolean>(true);
  const [allQuestions, setAllQuestions] = React.useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [activeQuestion, setActiveQuestion] = React.useState<null | number>(null);
  const [isSidebarMinimized, setIsSidebarMinimized] = React.useState(false);
  const [showTicker, setShowTicker] = React.useState("");
  const [newUserModelData, setNewUserModelData] = useState<
    | null
    | {
      label: string;
      pricing: { coins: number; words: number };
      value: string;
    }[]
  >(null);
  const [reFreshQuestionLoader, setReFreshQuestionLoader] =
    React.useState<string>("");
  const [chatPdfSettingOpen, setChatPdfSettingOpen] = React.useState(false);
  const [enableButton, setEnableButton] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSecondError, setShowSecondError] = useState(false);
  const [modelData, setModelData] = useState<multiModels[]>([]);
  const [promptModel, setPromptModel] = useState<GroupModel[]>([
    {
      label: "Fast and Cost Effective A1:",
      options: [],
    },
    {
      label: "Smart A1:",
      options: [],
    },
    {
      label: "Reasoning A1:",
      options: [],
    },
    {
      label: "Other AI Models",
      options: [],
    },
  ]);

  const { pdfToAi } = useSelector((state: RootState) => state?.folder);
  const currentModel = useSelector((state: any) => state?.user.currentModel);

  const { user } = useSelector((state: RootState) => state.user?.user || "");
  const currentProject = useSelector((state: any) => state?.project);
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const [checkUseModel, setCheckUseModel] = useState<boolean>(user?.use_multiple_models || false);
  // const [checkResponseLength, setCheckResponseLength] = useState<boolean>(user?.check_response_length || false);
  const [selectedOption, setSelectedOption] = useState<Option[]>(
    user?.selected_models?.length == 0 ? [] : user?.selected_models
  );
  // const [selectRange, setSelectRange] = useState<number | number[] | any>(user?.select_range || 150);
  const [responseType, setResponseType] = useState<string>(user?.response_type || "none");
  const [manageOptionButton, setManageOptionButton] = useState(true)

  const openAImodelKey = "openai/gpt-4o-mini";
  const perplexitymodelKey = "perplexity/llama-3.1-sonar-small-128k-online";

  function createInArray(text: string) {
    const cleanedJSON = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJSON);
  }

  const hasRunRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

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
    if (showNotification) {
      filterData();
    }
  }, []);

  const getAIModel = async () => {
    try {
      const response = await fetchApi(
        `${process.env.NEXT_PUBLIC_STRAICO_API}/v0/models`,
        { method: "GET" }
      );

      if (!response.success) {
        throw new Error(`HTTP error! status: ${response.success}`);
      }
      manageModel(response.data);
    } catch (error) {
      console.error("Failed to fetch AI models:", error);
    }
  };

  const straicoAPInewCall = async (message: string, multimodel?: any[], signal?: AbortSignal) => {
    const response = await axiosInstancePrivate.post(
      `/straico-mdel/chat-pdf-multi-model`,
      {
        models: multimodel ? multimodel : [openAImodelKey],
        message,
        file_urls: [chatURL],
      },
      { signal }
    );
    return response;
  };
  const manageModel = (allModel: multiModels[]) => {
    let GroupModel: GroupModel[] = [
      { label: "Fast and Cost Effective A1:", options: [] },
      { label: "Smart A1:", options: [] },
      { label: "Reasoning A1:", options: [] },
      { label: "Other AI Models", options: [] },
    ];

    setModelData(
      allModel.map((value) => {
        if (FastAndCostEffectiveAI.includes(value.name)) {
          return {
            name: value.name,
            pricing: value.pricing,
            category: "Fast and Cost Effective A1",
          };
        }
        if (SmartAI.includes(value.name)) {
          return {
            name: value.name,
            pricing: value.pricing,
            category: "Smart A1",
          };
        }
        if (ReasoningAI.includes(value.name)) {
          return {
            name: value.name,
            pricing: value.pricing,
            category: "Reasoning A1",
          };
        } else {
          return {
            name: value.name,
            pricing: value.pricing,
            category: "Other AI Models",
          };
        }
      })
    );

    allModel.forEach((value: multiModels) => {
      if (FastAndCostEffectiveAI.includes(value.name))
        GroupModel[0].options.push({
          label: value.name,
          value: value.model,
          pricing: value.pricing,
        } as { label: string; value: string; pricing: pricing });
      if (SmartAI.includes(value.name))
        GroupModel[1].options.push({
          label: value.name,
          value: value.model,
          pricing: value.pricing,
        } as { label: string; value: string; pricing: pricing });
      if (ReasoningAI.includes(value.name))
        GroupModel[2].options.push({
          label: value.name,
          value: value.model,
          pricing: value.pricing,
        } as { label: string; value: string; pricing: pricing });
      else
        GroupModel[3].options.push({
          label: value.name,
          value: value.model,
          pricing: value.pricing,
        } as { label: string; value: string; pricing: pricing });
    });

    setPromptModel(GroupModel);
  };

  const fetchHistory = async () => {
    const apiRes = await fetchAiHistory(PDF_id);
    return apiRes;
  };

  const addHistory = async (msg: object) => {
    const body = {
      pdf_id: PDF_id,
      history: msg,
    };

    const apiRes = await fetchHistory();
    if (!apiRes.success || apiRes.data.history.length == 0) {
      await addAiHistory(body);
    } else {
      await updateAiHistory(PDF_id, { history: msg });
    }
  };

  const updateFavouriteChat = async (chatId: number | any) => {

    const filterfavChatIds = favouriteChat.includes(chatId);
    const favChatIds = filterfavChatIds
      ? favouriteChat.filter((value: any) => {
        return value !== chatId;
      })
      : [...favouriteChat, chatId];


    const response = await updateAiHistory(PDF_id, { favourite_chat: favChatIds });


    if (response?.success !== true) {
      console.error("Error updating favourite_chat:", response?.message);
    } else {
      setfavouriteChat(response?.data?.favourite_chat);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const pdfTextSendMessage = async (text?: string, option?: string) => {
    const data = await fetchHistory();
    const messageID = uuidv4();
    if (text?.trim()) {
      const newMessages = [
        ...(data?.history || []),
        { user: "Me", text: text, id: messageID },
      ];
      setMessages(newMessages);
      try {
        setLoading(true);
        const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
          forward: boolean;
          message: string;
          mode: string;
        };

        if (forward) {
          const message = pdfInAiChat(text, option);
          const response = await straicoAPInewCall(message);
          response.data &&
            dispatche(
              updateCredits({
                credits: response.data.overall_price.total,
                activity: "Chatting with paper",
                credit_type: "Chatting",
              })
            );

          if (
            response.data.completions[openAImodelKey].completion.choices
              .length > 0
          ) {
            const jsonRes = createInArray(
              response.data.completions[openAImodelKey].completion.choices[0]
                .message.content
            );

            const newResponseMessage: Message = {
              answerRole:
                response.data.completions[openAImodelKey].completion.choices[0]
                  .message.role,
              answer: jsonRes?.ans,
              pageNumber: jsonRes?.pageNumber,
            };

            const addAnswer = newMessages?.map((value) => {
              if (value.id === messageID) {
                return { ...value, ...newResponseMessage };
              }
              return value;
            });
            await addHistory(addAnswer);
            setMessages(addAnswer);
            dispatch(selectedValueInPDF({}));
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
    setLoading(false);
  };
  const stopSendMessage = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setShowTicker("");
      setLoading(false);
      setReFreshQuestionLoader("")
    }
  }

  const handleSendMessage = async (text?: string, option?: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setShowTicker(
      "analyzing using " +
      ((newUserModelData && newUserModelData[0]?.label) || currentModel)
    );

    await delay(100);
    const messageID = uuidv4();
    const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
      forward: boolean;
      message: string;
      mode: string;
    };

    setLoading(true);
    if (forward) {
      if (input.trim() || (typeof text == "string" && text?.trim())) {
        const allText = (typeof text == "string" && text) || input;
        const newMessages = [
          ...messages,
          { user: "Me", text: allText, id: messageID },
        ];
        setMessages(newMessages);
        setInput("");
        try {

          const message = option ? pdfInAiChat(text || '', option, responseType) : messageRes(allText, responseType);
          const finalModel = newUserModelData ? newUserModelData.length == 1 ? [newUserModelData[0].value] : [newUserModelData[0].value, newUserModelData[1].value] : [openAImodelKey];
          const response = await straicoAPInewCall(message, finalModel, signal);

          await delay(3000);
          response.data &&
            dispatche(
              updateCredits({
                credits: response.data.overall_price.total,
                activity: "Chatting with paper",
                credit_type: "Chatting",
              })
            );

          if (newUserModelData?.length == 2) {
            setShowTicker(
              `cross-checking using ${newUserModelData && newUserModelData[1].label
              }`
            );
            await delay(3000);
            if (response.data.completions[newUserModelData[0].value].completion.choices.length > 0) {
              const generatedTemplate = await sendComparisonRequest(
                message,
                response.data.completions[newUserModelData[0].value].completion
                  .choices[0].message.content,
                response.data.completions[newUserModelData[1].value]?.completion
                  .choices[0].message.content
                  ? response.data.completions[newUserModelData[1].value]
                    ?.completion.choices[0].message.content
                  : response.data.completions[newUserModelData[0].value]
                    .completion.choices[0].message.content,
                [chatURL],
                [newUserModelData[0].value, newUserModelData[1].value]
              );
              setShowTicker("thinking and finalizing the response");
              await delay(3000);
              const jsonRes = createInArray(
                generatedTemplate?.data.completions[newUserModelData[0].value]
                  .completion.choices[0].message.content
              );
              const newResponseMessage: Message = {
                answerRole:
                  response.data.completions[newUserModelData[0].value]
                    .completion.choices[0].message.role,
                answer: jsonRes?.ans,
                pageNumber: jsonRes?.pageNumber,
              };
              const addAnswer = newMessages?.map((value) => {
                if (value.id === messageID) {
                  return { ...value, ...newResponseMessage };
                }
                return value;
              });
              await addHistory(addAnswer);
              setMessages(addAnswer);
              updateParentData(addAnswer);
              dispatche(
                updateCredits({
                  credits: generatedTemplate?.data.overall_price.total,
                  activity: "Multimodal Chatting with Paper",
                  credit_type: "Chatting",
                })
              );
            }
          } else if (finalModel?.length == 1) {

            if (response.data.completions[finalModel[0]].completion.choices.length > 0) {

              const jsonRes = createInArray(
                response.data.completions[finalModel[0]].completion.choices[0]
                  .message.content
              );
              const newResponseMessage: Message = {
                answerRole:
                  response.data.completions[finalModel[0]].completion
                    .choices[0].message.role,
                answer: jsonRes?.ans,
                pageNumber: jsonRes?.pageNumber,
              };
              setShowTicker("thinking and finalizing the response");
              await delay(3000);
              const addAnswer = newMessages?.map((value) => {
                if (value.id === messageID) {
                  return { ...value, ...newResponseMessage };
                }
                return value;
              });
              await addHistory(addAnswer);
              setMessages(addAnswer);
              updateParentData(addAnswer);
            }
          } else {
            if (
              response.data.completions[openAImodelKey].completion.choices
                .length > 0
            ) {
              const jsonRes = createInArray(
                response.data.completions[openAImodelKey].completion.choices[0]
                  .message.content
              );
              const newResponseMessage: Message = {
                answerRole:
                  response.data.completions[openAImodelKey].completion
                    .choices[0].message.role,
                answer: jsonRes?.ans,
                pageNumber: jsonRes?.pageNumber,
              };
              setShowTicker("thinking and finalizing the response");
              await delay(3000);
              const addAnswer = newMessages?.map((value) => {
                if (value.id === messageID) {
                  return { ...value, ...newResponseMessage };
                }
                return value;
              });
              await addHistory(addAnswer);
              setMessages(addAnswer);
              updateParentData(addAnswer);
            }
          }
        } catch (error: any) {
          try {
            if (axios.isCancel(error) || error.name === "CanceledError" || error.code === "ERR_CANCELED") {
              toast.success("Processing stopped. Enter a new prompt to begin.");
              const updatedMessages = newMessages?.filter((value) => value.id !== messageID);

              setMessages(updatedMessages);
              updateParentData(updatedMessages);
              await addHistory(updatedMessages);
              return;
            }

            setMessages((prev) =>
              prev.filter((value) => value.id !== messageID)
            );

            const errorMessage = error?.message || error?.toString();
            const parsedError = JSON.parse(errorMessage.replace("Error: ", ""));
            if (parsedError?.error) {
              toast.error(parsedError.error);
            } else {
              console.error("An unexpected error occurred.");
            }
          } catch (parseError) {
            console.error("An unexpected error occurred.");
          }
        }
      }
    }
    setLoading(false);
    setShowTicker("");
  };

  const handleClickQuestions = async (text: string, i: number) => {
    if (!loading) {
      setActiveQuestion(i)
      await handleSendMessage(text);
    }
  };

  const addQuestion = async (allNewQuestion: pdfQuestions[]) => {
    if (!allNewQuestion || !PDFData.id) {
      console.error(
        "Invalid input: either `allNewQuestion` or `userId` is missing."
      );
      return;
    }

    try {

      const projectId: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");
      const response = await updateFileStatus(
        { data: { pdf_questions: allNewQuestion }, projectId },
        PDFData.id
      );
      if (response?.data?.isSuccess !== true) {
        console.error("Error updating questions:", response?.data?.message);
        return;
      }
    } catch (err) {
      console.error("Unexpected error in `addQuestion`:", err);
    }
  };

  const handleGenerateQuestions = async (value: boolean) => {
    setQuestionsLoading(true);
    try {
      const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
        forward: boolean;
        message: string;
        mode: string;
      };

      if (forward) {
        const message = `${value
          ? `avoiding this question ${JSON.stringify(
            allQuestions
          )} after ${questionsGenerate}`
          : questionsGenerate
          }`;
        const response = await straicoAPInewCall(message);

        response.data &&
          dispatche(
            updateCredits({
              credits: response.data.overall_price.total,
              activity: "Generate Questions",
              credit_type: "AI Search",
            })
          );

        if (
          response.data.completions[openAImodelKey].completion.choices.length >
          0
        ) {
          const apiRes = createInArray(
            response.data.completions[openAImodelKey].completion.choices[0]
              .message.content
          );
          const allNewQuestion = questions.concat(apiRes);

          response.data &&
            PDFData.pdf_questions == null &&
            questions.length == 0 &&
            addQuestion(allNewQuestion);

          setQuestions(allNewQuestion);
          setAllQuestions([...allQuestions, ...apiRes]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setQuestionsLoading(false);
  };

  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  const shareChat = (msg: Message) => {
    const answerText = Array.isArray(msg.answer)
      ? msg.answer.map((item: any) => item.data).join("\n")
      : msg.answer.data;

    const formatText = `
    Question: ${msg.text}\n
    Answer: ${answerText}`;

    navigator.clipboard
      .writeText(formatText)
      .then(() => {
        toast.success("Copied chat successfully!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  const createDocx = (data: Message) => {
    const answerText = Array.isArray(data.answer)
      ? data.answer
        .map((obj, index) => `• ${JSON.stringify(obj.data, null, 2)}`)
        .join("\n")
      : data.answer || "";

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.text}`,
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Answer:",
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            ...answerText.split("\n").map(
              (line: string) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      size: 20,
                    }),
                  ],
                  spacing: {
                    after: 200,
                  },
                })
            ),
          ],
        },
      ],
    });

    return doc;
  };

  const downloadDocx = async (filename: any, data: Message) => {
    const doc = createDocx(data);
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (msg: Message) => {
    downloadDocx(`ResearchCollab Chat(${+new Date()}).docx`, msg);
  };

  const deleteChat = async (msg: Message) => {
    const removeMessage = messages.filter((value) => value.id !== msg.id);
    try {

      const response = await updateAiHistory(PDF_id, { history: removeMessage });
      if (response?.success !== true) {
        console.error("Error updating the chat history:", response?.message);
      } else {
        setMessages(removeMessage);
      }
    } catch (error) {
      console.error("Error in deleteChat function:", error);
    }
  };

  const reFreshQuestion = async (msg: Message) => {
    setReFreshQuestionLoader(msg?.id || "");
    setLoading(true);
    if (input.trim() || msg.text?.trim()) {
      try {
        const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
          forward: boolean;
          message: string;
          mode: string;
        };

        if (forward) {
          const allText = input || msg.text;
          const message = pdfChatMessage(allText, responseType);

          // const message = messageRes(allText, responseType, selectRange, checkResponseLength);

          const finalModel = newUserModelData ? newUserModelData.length == 1 ? [newUserModelData[0].value] : [newUserModelData[0].value, newUserModelData[1].value] : [openAImodelKey];
          // const finalModel = newUserModelData
          //   ? [newUserModelData[0]?.value, newUserModelData[1].value]
          //   : [openAImodelKey];
          const response = await straicoAPInewCall(message, finalModel);

          response.data &&
            dispatche(
              updateCredits({
                credits: response.data.overall_price.total,
                activity: "Regenerate Questions",
                credit_type: "AI Search",
              })
            );

          if (
            response.data.completions[finalModel[0]].completion.choices
              .length > 0
          ) {
            const jsonRes = createInArray(
              response.data.completions[finalModel[0]].completion.choices[0]
                .message.content
            );
            const newResponseMessage: Message = {
              answerRole:
                response.data.completions[finalModel[0]].completion.choices[0]
                  .message.role,
              answer: jsonRes?.ans,
              pageNumber: jsonRes?.pageNumber,
            };

            const addAnswer = messages?.map((value) => {
              if (value.id === msg.id) {
                return { ...value, ...newResponseMessage };
              }
              return value;
            });
            await addHistory(addAnswer);
            setMessages(addAnswer);
            updateParentData(addAnswer);
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
    setLoading(false);
    setReFreshQuestionLoader("");
  };

  const scrollIntoView = (
    itemId: string,
    position: "start" | "center" | "end" | "nearest" = "end"
  ) => {
    const sanitizedId = itemId.replace(/\s+/g, "-");
    const item = document.getElementById(itemId);

    if (item) {
      setTimeout(() => {
        item.scrollIntoView({
          behavior: "smooth",
          block: position,
          inline: "start",
        });
      }, 800);
    } else {
      console.log(`Element not found for selector ${sanitizedId}`);
    }
  };

  React.useEffect(() => {
    const debouncedSendMessage = debounce(() => {
      const fetchAndSendMessage = async () => {
        if (pdfToAi?.selectedOption) {
          await handleSendMessage(pdfToAi?.pdfselectedValue, pdfToAi?.selectedOption.text)
          // await pdfTextSendMessage(
          //   pdfToAi?.pdfselectedValue,
          //   pdfToAi?.selectedOption
          // );
        }
      };

      fetchAndSendMessage();
      dispatch(clearPdfToAi({}));
    }, 300);

    debouncedSendMessage();

    return () => debouncedSendMessage.cancel();
  }, [pdfToAi?.selectedOption]);

  React.useEffect(() => {
    scrollIntoView(`${messages?.length}`, "start");
  }, [messages]);

  React.useEffect(() => {
    const messageData = parentData;
    if (messageData.length > 0) {
      setMessages(messageData);
    }
    getUserModel();
  }, []);

  const getUserModel = async () => {
    try {
      const response = await axiosInstancePrivate.post(
        `/straico-mdel/get-new-model`,
        {
          userId: user?.id,
        }
      );

      response.data.data[0].selected_models.length > 0 ?
        setNewUserModelData(response.data.data[0].selected_models) : setNewUserModelData(null);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      if (PDF_id) {
        try {
          const apiRes = await fetchHistory();
          if (apiRes?.success) {
            setMessages(apiRes?.data?.history);
          }

          if (
            apiRes?.data?.favourite_chat &&
            apiRes?.data?.favourite_chat !== null
          ) {
            setfavouriteChat(apiRes?.data?.favourite_chat);
          }
        } catch (error) {
          console.error("Error fetching history:", error);
        }
      }
    };
    getAIModel();

    fetchData();
  }, [PDF_id]);

  React.useEffect(() => {
    if (PDFData.pdf_questions) {
      if (PDFData.pdf_questions) {
        setQuestions(PDFData.pdf_questions);
      }
    }
  }, [chatURL, PDFData.pdf_questions]);
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const isLargeScreen = useMediaQuery({ minWidth: 640, maxWidth: 1279 });
  const isXLScreen = useMediaQuery({ minWidth: 1280, maxWidth: 1919 });
  const isXLScreenHeight = useMediaQuery({
    minWidth: 1280,
    maxWidth: 1919,
    maxHeight: 1024,
  });
  const is2XLScreen = useMediaQuery({ minWidth: 1920 });
  const is3XLScreen = useMediaQuery({ minWidth: 2300 });

  const openSelectAiChatSettingModel = () => {
    setChatPdfSettingOpen(!chatPdfSettingOpen)
  }

  const manageReminder = async () => {
    setCheckUseModel(!checkUseModel);
    !!checkUseModel && setSelectedOption([selectedOption[0]])
    setManageOptionButton(false)
    setEnableButton(true);
  };

  // const manageResponseLength = async () => {
  //   setCheckResponseLength(!checkResponseLength);
  //   setManageOptionButton(false)
  // };

  const handleChangeOne = (selectedOptionOne: any) => {
    const updateData = [...selectedOption];

    if (selectedOptionOne === null) {
      updateData[0] = updateData[2];
    } else if (updateData[0]) {
      updateData[0] = {
        ...updateData[0],
        ...selectedOptionOne,
      };
    } else {
      updateData[0] = selectedOptionOne;
    }
    setEnableButton(true);
    setSelectedOption(updateData);
    const isChecked = updateData?.some((item) => item !== null)
    // setCheckUseModel(isChecked)
    setManageOptionButton(false)
  };

  const handleChangeTwo = (selectedOptionTwo: any) => {
    if (!checkUseModel) {
      setShowSecondError(true);
      return;
    }
    setShowSecondError(false);
    const updateData = [...selectedOption];

    if (selectedOptionTwo === null) {
      updateData[1] = updateData[2];
    } else if (updateData[1]) {
      updateData[1] = {
        ...updateData[1],
        ...selectedOptionTwo,
      };
    } else {
      updateData[1] = selectedOptionTwo;
    }

    setEnableButton(true);
    setSelectedOption(updateData);

    const isChecked = updateData?.some((item) => item !== null)
    setCheckUseModel(isChecked)
    setManageOptionButton(false)
  };


  const saveSetting = async () => {
    // if (checkResponseLength && (!selectRange || selectRange < 10 || selectRange > 700)) {
    //    toast.error("Please set a valid response length between 10 and 700 characters");
    //    return;
    //  }

    if (checkUseModel) {
      const multiModalLength = selectedOption?.filter((item) => item != null);

      if (multiModalLength?.length !== 2) {
        toast.error("Please select both Primary and Secondary AI models");
        return;
      }
    }

    const multiModalLength = selectedOption?.filter((item) => item != null);
    const newSelectModel = checkUseModel ? [...selectedOption] : [];

    try {
      if (checkUseModel && multiModalLength?.length === 2) {

        if (multiModalLength?.length === 2) {

          await dispatche(
            updateUserChatPdfFeatures({
              use_multiple_models: checkUseModel,
              selected_models: newSelectModel,
              check_response_length: false,
              select_range: 150,
              response_type: responseType,
              userId: user?.id
            })
          );
          checkUseModel && setSelectedOption(newSelectModel);
        }
      } else if (multiModalLength?.length === 1 && selectedOption[0]?.value) {

        await dispatche(
          updateUserChatPdfFeatures({
            use_multiple_models: false,
            selected_models: selectedOption,
            check_response_length: false,
            select_range: 150,
            response_type: responseType,
            userId: user?.id
          })
        );
        setSelectedOption(selectedOption);

      } else if (user?.use_multiple_models !== checkUseModel) {

        await dispatche(
          updateUserChatPdfFeatures({
            use_multiple_models: checkUseModel,
            selected_models: [],
            check_response_length: false,
            select_range: 150,
            response_type: responseType,
            userId: user?.id
          })
        );
        setSelectedOption([]);
      }
      else if (!selectedOption[0]?.value) {

        await dispatche(
          updateUserChatPdfFeatures({
            use_multiple_models: checkUseModel,
            selected_models: [],
            check_response_length: false,
            select_range: 150,
            response_type: responseType,
            userId: user?.id
          })
        );
        setSelectedOption([]);
      }

      setEnableButton(false);
      openSelectAiChatSettingModel();
      await dispatche(updateUserPDFData())
      getUserModel()
      setManageOptionButton(true)
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
    }
  }

  return (
    <>
      <div className="chat-AI">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="font-extrabold chat-hader">
              <OptimizedImage
                src={
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//ai_chat.svg`
                }
                alt="Logo"
                height={ImageSizes.icon.md.height}
                width={ImageSizes.icon.md.width}
                layout="intrinsic"
              />
            </div>
            <div className="text-[#666666] text-lg font-[500] leading-6 ml-2 dark:text-[#666666]">
              AI Chat Assistance
            </div>
          </div>
          {/* <div className="mr-12 flex items-center">
            <div className={`font-extrabold cursor-pointer button-full-pr mr-1 mt-0 pl-1 pr-1`}
            onClick={openSelectAiChatSettingModel}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.5 7.99985C0.5 7.35147 0.582275 6.7223 0.736962 6.12223C1.55466 6.16462 2.36636 5.75761 2.80385 4.99986C3.241 4.24269 3.18804 3.33703 2.74341 2.65026C3.63765 1.77147 4.75124 1.11516 5.99452 0.770996C6.36665 1.50039 7.12497 1.99986 8 1.99986C8.87502 1.99986 9.63335 1.50039 10.0055 0.770996C11.2488 1.11516 12.3624 1.77147 13.2566 2.65026C12.8119 3.33703 12.759 4.24269 13.1961 4.99986C13.6336 5.75761 14.4453 6.16462 15.2631 6.12223C15.4177 6.7223 15.5 7.35147 15.5 7.99985C15.5 8.64822 15.4177 9.2774 15.2631 9.87747C14.4453 9.8351 13.6336 10.2421 13.1961 10.9998C12.759 11.757 12.8119 12.6627 13.2566 13.3494C12.3624 14.2282 11.2488 14.8845 10.0055 15.2287C9.63335 14.4993 8.87502 13.9998 8 13.9998C7.12497 13.9998 6.36665 14.4993 5.99452 15.2287C4.75124 14.8845 3.63765 14.2282 2.74341 13.3494C3.18804 12.6627 3.241 11.757 2.80385 10.9998C2.36636 10.2421 1.55466 9.8351 0.736962 9.87747C0.582275 9.2774 0.5 8.64822 0.5 7.99985ZM4.10289 10.2498C4.57546 11.0684 4.71093 12.0094 4.52613 12.8927C4.83198 13.1103 5.15754 13.2989 5.49867 13.4556C6.17132 12.8534 7.0544 12.4998 8 12.4998C8.9456 12.4998 9.82865 12.8534 10.5013 13.4556C10.8424 13.2989 11.168 13.1103 11.4738 12.8927C11.289 12.0094 11.4245 11.0684 11.8971 10.2498C12.3696 9.43137 13.1169 8.8436 13.9741 8.56197C13.9913 8.37612 14 8.1887 14 7.99985C14 7.81107 13.9913 7.62357 13.9741 7.4378C13.1169 7.15617 12.3696 6.5684 11.8971 5.74986C11.4245 4.93134 11.289 3.99033 11.4738 3.10704C11.168 2.88941 10.8424 2.70085 10.5013 2.54414C9.82865 3.14633 8.9456 3.49986 8 3.49986C7.0544 3.49986 6.17132 3.14633 5.49867 2.54414C5.15754 2.70085 4.83198 2.88941 4.52613 3.10704C4.71093 3.99033 4.57546 4.93134 4.10289 5.74986C3.63032 6.5684 2.88315 7.15617 2.02588 7.4378C2.00868 7.62357 2 7.81107 2 7.99985C2 8.1887 2.00868 8.37612 2.02588 8.56197C2.88315 8.8436 3.63032 9.43137 4.10289 10.2498ZM8 10.2498C6.75732 10.2498 5.75 9.24252 5.75 7.99985C5.75 6.75725 6.75732 5.74986 8 5.74986C9.24267 5.74986 10.25 6.75725 10.25 7.99985C10.25 9.24252 9.24267 10.2498 8 10.2498ZM8 8.74985C8.41422 8.74985 8.75 8.41407 8.75 7.99985C8.75 7.58562 8.41422 7.24985 8 7.24985C7.58577 7.24985 7.25 7.58562 7.25 7.99985C7.25 8.41407 7.58577 8.74985 8 8.74985Z" fill={"white"} />
              </svg>
            </div>
          </div> */}
        </div>

        <div
          className={clsx(
            isMobile && "h-[592px]",
            isLargeScreen && "h-[595px]",
            isXLScreenHeight ? "h-[595px]" : isXLScreen && "h-[788px]",
            is2XLScreen && "h-[846px]",
            is3XLScreen && "h-[970px]",
            "flex flex-col max-w-full w-full overflow-hidden"
          )}
          style={is3XLScreen ? { height: "970px" } : {}}
        >
          <div className="flex-1 p-0.5 overflow-y-auto scrollbar-hide mt-4">
            <div className="flex">
              {messages?.length > 0 && (
                <div className="rounded-[25px] border-[2px] border-[#0e70ff] w-[33px] h-[32px] p-[4px_6px] mt-[16px]">
                  <svg
                    width="15"
                    height="18"
                    viewBox="0 0 15 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M7.73111 3.72401C8.1905 3.46687 8.49958 2.98625 8.49958 2.43578C8.49958 1.61444 7.81149 0.948608 6.96264 0.948608C6.11381 0.948608 5.42569 1.61444 5.42569 2.43578C5.42569 2.98625 5.73477 3.46687 6.19416 3.72401V4.66655H4.65773C2.10323 4.66655 0.0463867 6.66196 0.0463867 9.12339V10.6199C0.0463867 13.073 2.11096 15.0768 4.65773 15.0768H9.65229L14.6474 17.3074V9.12339C14.6474 6.67036 12.5828 4.66655 10.036 4.66655H7.73111V3.72401ZM13.1104 14.796V9.12339C13.1104 7.48876 11.7309 6.15373 10.036 6.15373H4.65773C2.95473 6.15373 1.58333 7.48072 1.58333 9.12339V10.6199C1.58333 12.2546 2.96283 13.5896 4.65773 13.5896H10.4208L13.1104 14.796ZM8.49958 9.12808H10.0365V10.6153H8.49958V9.12808ZM4.65722 9.12808H6.19416V10.6153H4.65722V9.12808Z"
                      fill="#0E70FF"
                    />
                  </svg>
                </div>
              )}

              <div>
                {messages?.length > 0 &&
                  messages?.map((msg: Message, index: number) => {
                    return (
                      <>
                        <div
                          id={`${index + 1}`}
                          className="border-[1px] border-[#e5e5e5] dark:border-[#E5E5E50A] dark:bg-[#E5E5E50A] p-[14px] rounded-[16px] m-[18px_6px]"
                          key={index}
                        >
                          <label className="flex flex-col">
                            <Label className="text-[18px] font-medium leading-[27px] text-[#0e70ff]">
                              {typeof msg?.text === "string" && msg.text}
                            </Label>
                          </label>
                          <Separator className="my-4" />
                          {Array.isArray(msg?.answer) &&
                            msg?.answer.length > 0 ? (
                            msg?.answer?.length > 0 &&
                            msg?.answer?.map((item: any, i: number) => (
                              <ul key={i} className="ps-6">
                                <li className="!list-disc text-black dark:text-white">
                                  {item.data}
                                </li>
                              </ul>
                            ))
                          ) : (
                            <div className="text-black dark:text-white">
                              {msg?.answer && msg?.answer}
                            </div>
                          )}
                          {msg.id === reFreshQuestionLoader ? (
                            showTicker ? (
                              <Typewriter
                                options={{
                                  strings: showTicker,
                                  autoStart: true,
                                  delay: 20,
                                  deleteSpeed: 10,
                                  wrapperClassName:
                                    "head_tags text-blue-500 font-bold text-sm text-gray-400 italic",
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center">
                                <Loader variant="threeDot" size="lg" />
                              </div>
                            )
                          ) : messages?.length === index + 1 &&
                            loading &&
                            !reFreshQuestionLoader ? (
                            showTicker ? (
                              <Typewriter
                                options={{
                                  strings: showTicker,
                                  autoStart: true,
                                  delay: 20,
                                  deleteSpeed: 10,
                                  wrapperClassName:
                                    "head_tags text-blue-500 font-bold text-sm text-gray-400 italic",
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center">
                                <Loader variant="threeDot" size="lg" />
                              </div>
                            )
                          ) : null}

                          {msg?.answer && (
                            <div className="mt-3 flex items-center gap-4">
                              <LightButton>
                                <div
                                  className="cursor-pointer flex items-center me-4"
                                  onClick={() => {
                                    updateFavouriteChat(msg?.id);
                                  }}
                                >
                                  {favouriteChat?.includes(msg.id) ? (
                                    <BsFillStarFill
                                      className="w-[19px] h-[19px]"
                                      color="#FDBB11"
                                    />
                                  ) : (
                                    <FaRegStar
                                      className="w-[19px] h-[19px]"
                                      color="#FDBB11"
                                    />
                                  )}
                                </div>
                                <HiOutlineShare
                                  color="rgba(14, 112, 255, 1)"
                                  className="me-4 w-[20px] h-[20px] cursor-pointer"
                                  onClick={() => {
                                    shareChat(msg);
                                  }}
                                />
                                <TbDownload
                                  color="rgba(14, 112, 255, 1)"
                                  className="me-4 w-[20px] h-[20px] cursor-pointer"
                                  onClick={() => {
                                    handleDownload(msg);
                                  }}
                                />
                                <RiRefreshLine
                                  color="rgba(14, 112, 255, 1)"
                                  className={`me-4 w-[20px] h-[20px] ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                  onClick={() => {
                                    reFreshQuestion(msg);
                                  }}
                                />
                                <RiDeleteBinLine
                                  color="rgba(14, 112, 255, 1)"
                                  className="w-[20px] h-[20px] cursor-pointer"
                                  onClick={() => {
                                    deleteChat(msg);
                                  }}
                                />
                              </LightButton>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="flex">
            <div
              className={`w-full p-[10px_35px] pr-0 relative ${isSidebarMinimized ? "h-0" : "h-[max-content]"
                } transition-[height] duration-300 ease-in-out flex flex-col`}
            >
              <div>
                {isSidebarMinimized ? null : (
                  <span>
                    {" "}
                    {questionsLoading || generateQuestion ? (
                      <div className="h-36 grid place-items-center">
                        <Loader variant="threeDot" size="lg" />
                      </div>
                    ) : (
                      <>
                        {questionsShow && (
                          <div className="grid grid-cols-2 gap-2 mt-3 mb-2 max-h-[200px] overflow-y-auto scrollbar-none">
                            {questions?.length > 0 &&
                              questions?.map((item, i) => {
                                return (
                                  <div
                                    onClick={() =>
                                      handleClickQuestions(item?.question, i)
                                    }
                                    style={{ cursor: `${loading ? 'no-drop' : 'pointer'}` }}
                                    key={i}
                                    className={` col-span-1 rounded-md p-[10px] px-[14px] flex items-center font-poppins text-[15px] font-medium leading-[22.5px]
                                   ${i === activeQuestion
                                        ? "bg-gradient-to-r from-[#1A65D2] to-[#8F05CF] text-white dark:text-[#FFFFFF]"
                                        : "bg-gradient-to-r from-[rgba(26,101,210,0.1)] to-[rgba(143,5,207,0.1)] text-[#666666] dark:text-[#CCCCCC]"
                                      }  tracking-wide `}
                                  >
                                    {item?.question}
                                  </div>
                                )
                              })}
                          </div>
                        )}
                      </>
                    )}
                  </span>
                )}
              </div>
              <div
                className={` ${isSidebarMinimized ? "w-[100%]" : "w-[0%]"} h-[68%] absolute top-[20px] left-0 cursor-pointer text-[18px] text-black`}
                onClick={toggleSidebar}
              >
                <div className="flex w-full items-center">
                  <div className="border border-[1px] border-[rgba(14,112,255,1)] rounded-[25px] w-max">
                    {isSidebarMinimized ? (
                      <IoIosArrowUp color="rgba(14, 112, 255, 1)" />
                    ) : (
                      <MdKeyboardArrowDown color="rgba(14, 112, 255, 1)" />
                    )}
                  </div>
                  <div className={`${isSidebarMinimized ? "bg-[rgba(204,204,204,1)] bg-[lineColor] dark:bg-[#CCCCCC33] h-[0.2px] w-full ml-2 " : ""}`} />
                </div>
                <div
                  className={`bg-[rgba(204,204,204,1)] bg-[lineColor] dark:bg-[#CCCCCC33] mr-6 mt-2 mb-2.5 ml-1 w-px ${isSidebarMinimized ? "h-0" : "h-[95%]"
                    } p-[0.5px] ml-[0.60rem]`}
                ></div>
              </div>
              {!questionsLoading && !isSidebarMinimized && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                  }}
                  className="flex justify-end items-center"
                >
                  <Label
                    className="cursor-pointer text-[rgba(14,112,255,1)] font-poppins text-[15px] font-[500] leading-[22.5px]"
                    onClick={() => {
                      handleGenerateQuestions(true);
                    }}
                  >
                    More questions &nbsp;
                  </Label>
                  <MdKeyboardArrowDown
                    color="rgba(14, 112, 255, 1)"
                    className="cursor-pointer"
                    onClick={() => {
                      handleGenerateQuestions(true);
                    }}
                  />
                </div>
              )}
            </div>
            {isSidebarMinimized && <div className="flex-1 py-5"></div>}
          </div>
        </div>
        <div className="flex border border-[rgba(204,204,204,1)] dark:border-[#CCCCCC14] rounded-[28px] p-[6px_8px] mt-[38px] dark:bg-[#CCCCCC14]">
          <Input
            onKeyPress={(e) => handleKeyPress(e)}
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any question"
            className="flex-1 border border-gray-300 p-2 text-lg text-[0.9rem] focus-visible:ring-2 focus-visible:outline-none rounded-l-md border-0 rounded-l-[7px] h-[2.2rem] dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0 dark:bg-transparent placeholder:dark:text-[#CCCCCC] dark:text-[#CCCCCC] bg-transparent"
            style={
              {
                "--tw-ring-color": "hsl(222.2deg 84% 4.9% / 0%)",
                "--tw-ring-shadow":
                  "var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) hsl(222.2deg 84% 4.9% / 0%)",
              } as React.CSSProperties
            }
          />
          <div className="flex">
            <div className="mr-1 flex items-center">
              <div className={`font-extrabold cursor-pointer button-full-pr mr-1 mt-0 pl-1 pr-1`}
                onClick={openSelectAiChatSettingModel}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 7.99985C0.5 7.35147 0.582275 6.7223 0.736962 6.12223C1.55466 6.16462 2.36636 5.75761 2.80385 4.99986C3.241 4.24269 3.18804 3.33703 2.74341 2.65026C3.63765 1.77147 4.75124 1.11516 5.99452 0.770996C6.36665 1.50039 7.12497 1.99986 8 1.99986C8.87502 1.99986 9.63335 1.50039 10.0055 0.770996C11.2488 1.11516 12.3624 1.77147 13.2566 2.65026C12.8119 3.33703 12.759 4.24269 13.1961 4.99986C13.6336 5.75761 14.4453 6.16462 15.2631 6.12223C15.4177 6.7223 15.5 7.35147 15.5 7.99985C15.5 8.64822 15.4177 9.2774 15.2631 9.87747C14.4453 9.8351 13.6336 10.2421 13.1961 10.9998C12.759 11.757 12.8119 12.6627 13.2566 13.3494C12.3624 14.2282 11.2488 14.8845 10.0055 15.2287C9.63335 14.4993 8.87502 13.9998 8 13.9998C7.12497 13.9998 6.36665 14.4993 5.99452 15.2287C4.75124 14.8845 3.63765 14.2282 2.74341 13.3494C3.18804 12.6627 3.241 11.757 2.80385 10.9998C2.36636 10.2421 1.55466 9.8351 0.736962 9.87747C0.582275 9.2774 0.5 8.64822 0.5 7.99985ZM4.10289 10.2498C4.57546 11.0684 4.71093 12.0094 4.52613 12.8927C4.83198 13.1103 5.15754 13.2989 5.49867 13.4556C6.17132 12.8534 7.0544 12.4998 8 12.4998C8.9456 12.4998 9.82865 12.8534 10.5013 13.4556C10.8424 13.2989 11.168 13.1103 11.4738 12.8927C11.289 12.0094 11.4245 11.0684 11.8971 10.2498C12.3696 9.43137 13.1169 8.8436 13.9741 8.56197C13.9913 8.37612 14 8.1887 14 7.99985C14 7.81107 13.9913 7.62357 13.9741 7.4378C13.1169 7.15617 12.3696 6.5684 11.8971 5.74986C11.4245 4.93134 11.289 3.99033 11.4738 3.10704C11.168 2.88941 10.8424 2.70085 10.5013 2.54414C9.82865 3.14633 8.9456 3.49986 8 3.49986C7.0544 3.49986 6.17132 3.14633 5.49867 2.54414C5.15754 2.70085 4.83198 2.88941 4.52613 3.10704C4.71093 3.99033 4.57546 4.93134 4.10289 5.74986C3.63032 6.5684 2.88315 7.15617 2.02588 7.4378C2.00868 7.62357 2 7.81107 2 7.99985C2 8.1887 2.00868 8.37612 2.02588 8.56197C2.88315 8.8436 3.63032 9.43137 4.10289 10.2498ZM8 10.2498C6.75732 10.2498 5.75 9.24252 5.75 7.99985C5.75 6.75725 6.75732 5.74986 8 5.74986C9.24267 5.74986 10.25 6.75725 10.25 7.99985C10.25 9.24252 9.24267 10.2498 8 10.2498ZM8 8.74985C8.41422 8.74985 8.75 8.41407 8.75 7.99985C8.75 7.58562 8.41422 7.24985 8 7.24985C7.58577 7.24985 7.25 7.58562 7.25 7.99985C7.25 8.41407 7.58577 8.74985 8 8.74985Z" fill={"white"} />
                </svg>
              </div>
            </div>
            {!loading ? (<RoundBtn
              disabled={loading || !input}
              onClick={handleSendMessage}
              className="chat-round-button px-[17px] py-[6px] shadow-[0px_8px_18px_rgba(17,17,26,0.16),0px_8px_24px_rgba(17,17,26,0.13),0px_30px_24px_rgba(17,17,26,0)]"
              label={
                <span className="flex items-center">
                  <SendHorizontal className="h-[20px] w-[20px]" />
                </span>
              }
            />) : (<RoundBtn
              onClick={stopSendMessage}
              className="chat-round-button px-[17px] py-[6px] shadow-[0px_8px_18px_rgba(17,17,26,0.16),0px_8px_24px_rgba(17,17,26,0.13),0px_30px_24px_rgba(17,17,26,0)]"
              label={
                <span className="flex items-center">
                  <Pause className="h-[20px] w-[20px]" />
                </span>
              }
            />)}
          </div>
        </div>
      </div>
      <Dialog
        open={chatPdfSettingOpen}
        onOpenChange={openSelectAiChatSettingModel}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customization Options</DialogTitle>
          </DialogHeader>
          <div className="lg:w-[100%] xl:w-[100%]">
            <div className="flex flex-wrap gap-4">
              <div className="max-w-full sm:min-w-min lg:min-w-[250px] xl:min-w-[450px]  flex-1">
                <div className="w-max font-size-md mt-4 font-medium text-darkGray flex-col sm:flex-row items-start">
                  Select Primary Model
                </div>
                <div>
                  <Select
                    closeMenuOnSelect={true}
                    components={makeAnimated()}
                    isClearable
                    onChange={handleChangeOne}
                    value={!!selectedOption ? [selectedOption[0]] : []}
                    options={promptModel?.map((value) => {
                      return {
                        label: value.label,
                        options: value.options.filter((val) => {
                          return val.value !== selectedOption[1]?.value;
                        }),
                      };
                    })}
                    placeholder={"Select AI Models"}
                    isSearchable={true}
                    getOptionLabel={(e: any) => e.label}
                    // isDisabled={!checkUseModel}
                    formatOptionLabel={(e: any) => (
                      <div title={e.label}>{e.label}</div>
                    )}
                    menuPosition="absolute"
                    className="mt-3"
                    classNames={{
                      control: ({ isDisabled }) =>
                        `  border  dark:bg-[#15252a] rounded ${isDisabled
                          ? " dark:bg-[#414546]"
                          : " dark:bg-[#15252a]"
                        } ${isDisabled
                          ? "dark:border-[#e6e6e652]"
                          : "dark:border-[#15252a]"
                        }`,
                      menu: () =>
                        `dark:bg-[#15252a] border border-gray-300  rounded-md shadow-lg`,
                      menuList: () => " overflow-y-auto",
                      option: ({ isFocused, isSelected }) =>
                        `cursor-pointer ${isSelected
                          ? "bg-blue-500 text-white"
                          : isFocused
                            ? "bg-gray-200 dark:bg-[#15252a]"
                            : "bg-white dark:bg-[#15252a]"
                        }`,
                      singleValue: () => "text-gray-900 dark:text-white",
                      placeholder: () => "text-gray-400 dark:text-gray-500",
                      input: () => "text-gray-900 dark:text-white",
                    }}
                  />
                </div>
                {showError && (
                  <p className="text-red-500 text-sm mt-1">
                    Please check the &apos;Cross Select&apos; before selecting
                    a model.
                  </p>
                )}
              </div>
            </div>
            <Label className="font-poppins mt-2 text-sm font-normal leading-[19.5px] text-left items-center text-center flex">
              <>
                {checkUseModel ? (
                  <ImCheckboxChecked
                    color="#999999"
                    onClick={() => {
                      manageReminder();
                    }}
                    className="cursor-pointer h-4 w-4 mr-2"
                  />
                ) : (
                  <ImCheckboxUnchecked
                    color="#999999"
                    onClick={() => {
                      manageReminder();
                    }}
                    className="cursor-pointer h-4 w-4 mr-2"
                  />
                )}
              </>
              <p className="font-size-md font-medium text-darkGray text-center whitespace-nowrap">
                Cross Select using Multiple Models &nbsp;&nbsp;
              </p>
            </Label>
            <div className="flex flex-wrap gap-4">

              <div className="max-w-full sm:min-w-min lg:min-w-[250px] xl:min-w-[450px]  flex-1">
                <div className="w-max font-size-md mt-2 font-medium text-darkGray flex-col sm:flex-row items-start">
                  Secondary AI Model
                </div>
                <div
                  onClick={() => {
                    if (!checkUseModel) {
                      setShowSecondError(true);
                    } else {
                      setShowSecondError(false);
                    }
                  }}
                >
                  <Select
                    closeMenuOnSelect={true}
                    components={makeAnimated()}
                    isClearable
                    onChange={handleChangeTwo}
                    value={!!selectedOption[1] ? selectedOption[1] : []}
                    options={promptModel.map((value) => {
                      return {
                        label: value.label,
                        options: value.options.filter((val) => {
                          return val.value !== selectedOption[0]?.value;
                        }),
                      };
                    })}
                    placeholder={"Select AI Models"}
                    isSearchable={true}
                    getOptionLabel={(e: any) => e.label}
                    isDisabled={!checkUseModel}
                    formatOptionLabel={(e: any) => (
                      <div title={e.label}>{e.label}</div>
                    )}
                    menuPosition="absolute"
                    className="mt-3"
                    classNames={{
                      control: ({ isDisabled }) =>
                        `  border  dark:bg-[#15252a] rounded ${isDisabled
                          ? " dark:bg-[#414546]"
                          : " dark:bg-[#15252a]"
                        } ${isDisabled
                          ? "dark:border-[#e6e6e652]"
                          : "dark:border-[#15252a]"
                        }`,
                      menu: () =>
                        `dark:bg-[#15252a] border border-gray-300  rounded-md shadow-lg`,
                      menuList: () => " overflow-y-auto",
                      option: ({ isFocused, isSelected }) =>
                        `cursor-pointer ${isSelected
                          ? "bg-blue-500 text-white"
                          : isFocused
                            ? "bg-gray-200 dark:bg-[#15252a]"
                            : "bg-white dark:bg-[#15252a]"
                        }`,
                      singleValue: () => "text-gray-900 dark:text-white",
                      placeholder: () => "text-gray-400 dark:text-gray-500",
                      input: () => "text-gray-900 dark:text-white",
                    }}
                  />
                </div>
                {showSecondError && (
                  <p className="text-red-500 text-sm mt-1">
                    Please check the &apos;Cross Select&apos; before selecting
                    a model.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2">

              {/* <Separator className="my-4" />
            <Label className="font-poppins text-sm font-normal leading-[19.5px] text-left items-center text-center flex">
              <>
                {checkResponseLength ? (
                  <ImCheckboxChecked
                    color="#999999"
                    onClick={() => {
                      manageResponseLength();
                    }}
                    className="cursor-pointer h-4 w-4 mr-2"
                  />
                ) : (
                  <ImCheckboxUnchecked
                    color="#999999"
                    onClick={() => {
                      manageResponseLength();
                    }}
                    className="cursor-pointer h-4 w-4 mr-2"
                  />
                )}
              </>
              <p className="font-size-md font-medium text-darkGray text-center whitespace-nowrap">
              Response Length &nbsp;&nbsp;
              </p>
            </Label>

              <label className="not-italic block mb-2 font-size-md text-sm font-medium text-darkGray">
                {" "}
                Maximum length:
              </label>
              <div className="px-[7px]">
                <Slider
                  min={10}
                  max={700}
                  defaultValue={selectRange}
                  value={selectRange}
                  handleRender={handleRender}
                  onChange={(range: number | number[]) => {
                    setSelectRange(range);
                    setManageOptionButton(false)
                  }}
                  disabled={!checkResponseLength}
                  handleStyle={{ zIndex: 0 }}
                />
              </div>
              <div>
                <Input
                  id="myTextField"
                  className="w-max mt-2 dark:bg-[#f6f6f6] w-[105px]"
                  value={String(selectRange)}
                  type="number"
                  onChange={(e) => {
                    setSelectRange(Number(e.target.value));
                    setManageOptionButton(false)
                  }}
                  disabled={!checkResponseLength}
                />
              </div> */}
              <Separator className="my-4" />
              <label className="not-italic block mb-2 font-size-md text-sm font-medium dark:text-white text-darkGray">
                {" "}
                Response type:
              </label>
              <div className="inline-flex items-center py-1">
                <label className="relative flex items-center cursor-pointer">
                  <input
                    checked={responseType == "concise"}
                    value="generate_template"
                    onChange={(e) => {
                      setResponseType("concise");
                      setManageOptionButton(false)
                    }}
                    name="framework"
                    type="radio"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#d8e8ff] checked:border-[#d8e8ff] transition-all"
                  />
                  <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                </label>
                <label className="not-italic block text-sm font-medium text-darkGray dark:text-white">
                  &nbsp; Concise &nbsp;&nbsp;
                </label>
              </div>
              <div className="inline-flex items-center py-1">
                <label className="relative flex items-center cursor-pointer">
                  <input
                    checked={responseType == 'none'}
                    value="none"
                    onChange={(e) => {
                      setResponseType('none');
                      setManageOptionButton(false)
                    }}
                    name="framework"
                    type="radio"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#d8e8ff] checked:border-[#d8e8ff] transition-all"
                    id="react"
                  />
                  <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                </label>
                <label className="not-italic block text-sm font-medium text-darkGray dark:text-white">
                  {" "}
                  &nbsp; Standard (Default) &nbsp;&nbsp;
                </label>
              </div>
              <div className="inline-flex items-center py-1">
                <label className="relative flex items-center cursor-pointer">
                  <input
                    checked={responseType == "detailed"}
                    value="detailed"
                    onChange={(e) => {
                      setResponseType("detailed");
                      setManageOptionButton(false)
                    }}
                    name="framework"
                    type="radio"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#d8e8ff] checked:border-[#d8e8ff] transition-all"
                    id="react"
                  />
                  <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                </label>
                <label className="not-italic block text-sm font-medium text-darkGray dark:text-white">
                  {" "}
                  &nbsp; Detailed &nbsp;&nbsp;
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-center" style={{ display: 'flex', justifyContent: 'center' }}>
            <RoundButton
              disabled={manageOptionButton}
              onClick={() => {
                saveSetting();
              }}
              className="rounded-[26px]"
            >
              Save Changes
            </RoundButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ChatAI;

export const styles = {
  button: {
    borderRadius: "0px 7px 7px 0px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "5px 15px",
    cursor: "pointer" as "pointer",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  myMsgBack: {
    borderRadius: "7px",
    backgroundColor: "transprent",
    maxWidth: "75%",
    padding: "4px 8px",
  },
  otherMsgBack: {
    padding: "4px 8px",
    borderRadius: "7px",
    backgroundColor: "#faf9ff",
    maxWidth: "75%",
    boxShadow:
      "rgba(0, 0, 0, 0.1) 0px 0px 2px 0px, rgba(0, 0, 0, 0.1) 0px 0px 2px 0px",
  },
};
