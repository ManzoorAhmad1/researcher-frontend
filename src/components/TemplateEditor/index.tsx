"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchApi } from "@/utils/fetchApi";
import {
  ModelList,
  CustomNode,
  NodeChange,
  EditPrompt,
  PromptQuestionType,
} from "@/types/types";
import { Ellipsis, Plus, Minus, DivideIcon, FilePenLine } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Edge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RxDotFilled } from "react-icons/rx";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { addSpaceBeforeCapitalWords } from "@/utils/commonUtils";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Slider from "rc-slider";
import { LightThemeButton, Button } from "@/components/ui/button";
import { HeaderTitle } from "@/components/Header/HeaderTitle";
import TemplateSimpalButton from "@/components/Explorer/TemplateSimpalButton";
import { Badge } from "@/components/ui/badge";
import ColorSelectorNode from "./memoItem";
import { driverObj } from "./TemplateTour";
import { Input } from "@/components/ui/input";
import {
  generateHandlingTemplate,
  requestTextHumanizationData,
  recommendSectionsPrompt,
} from "@/utils/aiTemplates";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { PromptQuestion } from "@/types/types";
import { handleRender } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { modelSupportedLanguages } from "@/utils/commonUtils";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "./index.css";
import "rc-slider/assets/index.css";
import { getTemplateById, updateTemplates } from "@/apis/templates";

interface promptQuestion {
  id: number;
  question?: string;
  position?: { x: number; y: number };
}
interface Item {
  id: number | string;
  promptKey: string;
  type: string;
  promptQuestion: promptQuestion[];
}

type editPromptType = EditPrompt | Item | null | any;

const initBgColor = "#1A192B";

const connectionLineStyle = { stroke: "#ff0000" };

const snapGrid: [number, number] = [20, 20];

const defaultViewport = { x: 0, y: 0, zoom: 0 };

const PromptEditor: React.FC = () => {
  const [detailItems, setDetailItems] = useState<Item[] | any>([
    { id: 1, promptKey: "Paper Title", promptQuestion: [{
        id: 1,
        question: "Identify the title of the paper from the text.",
      }], type: "detail" },
    { id: 2, promptKey: "Authors", promptQuestion: [{
      id: 1,
      question: "Identify the authors mentioned in the paper.",
    }], type: "detail" },
    {
      id: 3,
      promptKey: "Publication Date",
      promptQuestion: [{
        id: 1,
        question: "Extract the publication date from the text.",
      }],
      type: "detail",
    },
    { id: 4, promptKey: "Journal Name", promptQuestion: [{
      id: 1,
      question: "Identify the journal in which the paper was published.",
    }], type: "detail" },
    {
      id: 5,
      promptKey: "5 Extracted Keywords",
      promptQuestion: [{
        id: 1,
        question: "Extract five important keywords from the text.",
      }],
      type: "detail",
    },
    { id: 6, promptKey: "Key Points", promptQuestion: [{
      id: 1,
      question: "Identify the key points discussed in the paper.",
    }], type: "contents" },
    {
      id: 7,
      promptKey: "Research Topic",
      promptQuestion: [{
        id: 1,
        question: "Identify the main research topic from the paper.",
      }],
      type: "contents",
    },
    {
      id: 8,
      promptKey: "Strengths and Weakness",
      promptQuestion: [{
        id: 1,
        question: "Identify the strengths and weaknesses of the study.",
      }],
      type: "contents",
    },
    {
      id: 9,
      promptKey: "Research Methods",
      promptQuestion: [{
        id: 1,
        question: "Identify the research methods used in the study.",
      }],
      type: "contents",
    },
    {
      id: 10,
      promptKey: "Statistical Methods",
      promptQuestion: [{
        id: 1,
        question: "Identify the statistical methods applied in the paper.",
      }],
      type: "contents",
    },
    {
      id: 11,
      promptKey: "Statistical Tools",
      promptQuestion: [{
        id: 1,
        question: "Identify the statistical tools or software used.",
      }],
      type: "contents",
    },
    { id: 12, promptKey: "Limitations", promptQuestion: [{
      id: 1,
      question: "Identify the limitations or constraints mentioned in the research.",
    }], type: "contents" },
    {
      id: 13,
      promptKey: "Future Directions",
      promptQuestion: [{
        id: 1,
        question: "Identify the suggested future research directions.",
      }],
      type: "contents",
    },
    { id: 14, promptKey: "Conclusions", promptQuestion: [{
      id: 1,
      question: "Identify the conclusions drawn from the research.",
    }], type: "contents" },
  ]);
  const [editPrompt, setEditPrompt] = useState<editPromptType | any>(null);
  const [promptModel, setPromptModel] = useState<ModelList | any>([]);
  const [selectedModel, setSelectedModel] =
    useState<string>("openai/gpt-4o-mini");
  const [nodes, setNodes, onNodesChange] = useNodesState<
    CustomNode | any | EditPrompt | promptQuestion
  >([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[] | any>([]);
  const [bgColor, setBgColor] = useState<string | any>(initBgColor);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<number | string | any>();
  const [manageDeleteBtn, setManageDeleteBtn] = useState<boolean | any>(true);
  const [showToolBox, setShowToolBox] = useState<boolean | any>(false);
  const [handlePromptAction, setHandlePromptAction] = useState<
    number | null | any
  >(null);
  const [isDefineModalOpen, setDefineModalOpen] = useState<boolean | any>(
    false
  );
  const [selectRange, setSelectRange] = useState<number | number[] | any>(150);
  const [selectLanguage, setSelectLanguage] = useState<string | any>("");
  const [expandInstructions, setExpandInstructions] = useState<boolean | any>(
    false
  );
  const [instructions, setInstructions] = useState<string | any>("");
  const [humanizeText, setHumanizeText] = useState<boolean | any>(false);
  const [humanizeTxt, setHumanizeTxt] = useState<string | any>("");
  const [InstructionsTxt, setInstructionsTxt] = useState<boolean | any>(false);
  const [humanizeTxtBox, setHumanizeTxtBox] = useState<boolean | any>(false);
  const [isActiveTab, setActiveTab] = React.useState("editor");
  const [file_url, setFileUrl] = React.useState(null);
  const [analysisData, setAnalysisData] = React.useState<any>(null);
  const [templateTitle, setTemplateTitle] = useState<string | any>("");
  const [fieldName, setFieldName] = useState<string | any>("");
  const [isFieldNameModalOpen, setFieldNameModalOpen] = useState<boolean | any>(
    false
  );
  const [editMode, setEditMode] = useState<boolean | any>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [contentErrorMessage, setContentErrorMessage] = useState("");
  const [isRemoveAllDialogOpen, setIsRemoveAllDialogOpen] = useState(false);
  const [removeAllDelay, setRemoveAllDelay] = useState(5);
  const removeAllTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [individualDeleteDelay, setIndividualDeleteDelay] = useState(5);
  const individualDeleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const supabase: SupabaseClient = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const textAreaRef = useRef<HTMLTextAreaElement | null | any>(null);
  const templateId = searchParams.get("templateId");
  const templateName = searchParams.get("templateName");
  const templateTeam = searchParams.get("templateTeam");
  const templateStatus = searchParams.get("templateStatus");
  const checkQuestionPostion = !!editPrompt?.promptQuestion;
  const promptQuestionCheck =
    !checkQuestionPostion ||
    editPrompt?.promptQuestion?.some((value: any) => value.question === "");
  const checkRemovePromptQuestion =
    !checkQuestionPostion || editPrompt?.promptQuestion?.length === 0;
  const removeSectionName = detailItems.find((value: any) => {
    return value?.id == deleteKey;
  })?.promptKey;
  const currentKey = detailItems.find(
    (item: any) => item.id === editPrompt?.id
  );
  useEffect(() => {
    getAIModel();
  }, []);

  useEffect(() => {
    manageNodesPosition();
  }, [nodes]);

  const manageNodesPosition = () => {
    const newPrp = editPrompt?.promptQuestion.map((value: promptQuestion) => {
      return {
        ...value,
        position: nodes[value?.id - 1]?.position,
      };
    });

    const managePrompt = {
      ...editPrompt,
      promptQuestion: newPrp as promptQuestion[],
    };

    const editPositionItem = detailItems.map((value: any) => {
      return value.id === editPrompt?.id ? managePrompt : value;
    }) as Item[];

    setDetailItems(editPositionItem);
  };

  useEffect(() => {
    resizeTextArea();
  }, [instructions]);

  const resizeTextArea = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  };

  const onChange = (value: string, data: { id: number }) => {
    setShowToolBox((preNewState: any) => {
      setEditPrompt((prevState: editPromptType | any) => {
        if (prevState) {
          const finalPrevState = prevState?.promptQuestion.map(
            (values: promptQuestion) => {
              return values.id === data.id
                ? { ...values, question: value }
                : values;
            }
          );

          const managePrompt = {
            ...editPrompt,
            promptQuestion: finalPrevState as promptQuestion[],
          };

          const editNewItem = detailItems.map((value: any) => {
            return value.id === editPrompt?.id ? managePrompt : value;
          }) as Item[];

          // setDetailItems(editNewItem);

          return {
            ...prevState,
            showToolBox: preNewState,
            promptQuestion: finalPrevState,
          };
        }
        return prevState;
      });

      setNodes((nds) =>
        nds.map((node) => {
          setBgColor(value);
          return node.data.id === data.id
            ? {
              ...node,
              data: {
                ...node.data,
                promptQuestions: value,
                showToolBox: preNewState,
              },
            }
            : node;
        })
      );
      return preNewState;
    });
  };

  const manageQuestionModel = () => {
    setDefineModalOpen(!isDefineModalOpen);
  };

  const addAction = (data: any) => {
    setHandlePromptAction(data.id);
    setDefineModalOpen(true);
  };

  const onChangeSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: { id: number }
  ) => {
    setEditPrompt((prevPrompt: editPromptType) => {
      if (prevPrompt) {
        const setModel = prevPrompt?.promptQuestion.map((value: any) => {
          return value.id == data.id ? { ...value, selectModel: event } : value;
        });

        return {
          ...prevPrompt,
          promptQuestion: setModel,
        };
      }
      return prevPrompt;
    });
  };

  const addSelectedPromptQuestion = async () => {
    let instructionsProperties = ``;

    if (!!selectRange) {
      instructionsProperties += `Please limit the response to ${selectRange} characters. `;
    }

    if (!!expandInstructions) {
      instructionsProperties += `please provide a more detailed expansion of the custom instructions. `;
    }

    if (instructions.length > 0 && InstructionsTxt) {
      instructionsProperties += `${instructions.replace(/\s+/g, " ").trim()} `;
    }

    if (!!humanizeText) {
      instructionsProperties += requestTextHumanizationData;
    }
    if (humanizeTxt.length > 0 && humanizeTxtBox) {
      instructionsProperties += `${humanizeTxt.replace(/\s+/g, " ").trim()} `;
    }

    if (!!selectLanguage) {
      instructionsProperties += `Please update the language used in the text to ${selectLanguage}. `;
    }

    const index = editPrompt?.promptQuestion.findIndex(
      (item: any) => item.id === handlePromptAction
    ) as number;
    const newQuestion: PromptQuestion = {
      id:
        (editPrompt?.promptQuestion && editPrompt.promptQuestion.length + 1) ||
        1,
      position: !!editPrompt?.promptQuestion[index].position
        ? {
          x: Number(editPrompt?.promptQuestion[index].position?.x),
          y: Number(editPrompt?.promptQuestion[index].position?.y) + 200,
        }
        : { x: 0, y: 200 },
      question: instructionsProperties,
    };

    if (index !== -1) {
      setEditPrompt((prevPrompt: editPromptType) => {
        if (prevPrompt) {
          const updatedPromptQuestions = [...prevPrompt.promptQuestion];
          updatedPromptQuestions.splice(index + 1, 0, newQuestion);
          updatedPromptQuestions.forEach((item, idx) => {
            if (idx > index + 1) {
              item.position = {
                x: Number(item.position?.x || 100),
                y: Number(item.position?.y || 150) + 200,
              };
            }
            return (item.id = idx + 1);
          });
          updateNodes(updatedPromptQuestions as PromptQuestionType[]);
          const managePrompt = {
            ...editPrompt,
            promptQuestion: updatedPromptQuestions as promptQuestion[],
          };
          const editNewItem = detailItems.map((value: any) => {
            return value.id === editPrompt?.id ? managePrompt : value;
          }) as Item[];

          setDetailItems(editNewItem);

          return {
            ...prevPrompt,
            promptQuestion: updatedPromptQuestions,
          };
        }

        return prevPrompt;
      });
    }

    setHandlePromptAction(null);
    setDefineModalOpen(false);
    setSelectRange(150);
    setSelectLanguage("");
    setExpandInstructions(false);
    setInstructions("");
    setHumanizeText(false);
    setHumanizeTxt("");
    setInstructionsTxt(false);
    setHumanizeTxtBox(false);
  };

  const getAIModel = async () => {
    try {
      const response = await fetchApi(
        `${process.env.NEXT_PUBLIC_STRAICO_API}/v0/models`,
        {
          method: "GET",
        }
      );
      setPromptModel(response);

      if (!response.success) {
        throw new Error(`HTTP error! status: ${response.success}`);
      }

      const pdfMetaData: ModelList = response.data;
      setPromptModel(pdfMetaData);
      demoNavigation();
    } catch (error) {
      console.error("Failed to fetch AI models:", error);
    }

    if (templateId) {
      try {

        const templateInfo = await getTemplateById(templateId);
        const data = templateInfo?.data?.data?.data;
        if (data && data !== null) {
          if (data.ai_model) {
            setSelectedModel(data.ai_model);
          }
          if (data?.template_json_data?.length > 0) {
            setDetailItems(data.template_json_data);
            const makeFIrstData = data.template_json_data.filter(
              (item: { type: string }) => item.type === "contents"
            )[0];
            setTemplateTitle(data.template_title);
            setEditPrompt(makeFIrstData);
            nodesSet(makeFIrstData);
          }
          if (data?.straico_file_url) {
            setFileUrl(data.straico_file_url);
          }
          if (data?.paper_analysis_data) {
            setAnalysisData(data.paper_analysis_data);
          }
        } else {
          toast.error(templateInfo?.data?.message);
        }
      } catch (error: any) {
        toast.error(error?.data?.message || error?.message || "An error occurred");
      }
    }
  };

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#fff" },
            markerEnd: {
              type: "arrowclosed",
              color: "black",
              markerWidth: 50,
              markerHeight: 20,
              strokeWidth: 5,
            },
          },
          eds
        )
      ),
    []
  );

  const templateKey = (key: string) => {
    const maxLength = 20;
    const invalidChars = /[^a-zA-Z0-9\s]/;

    if (key.length > maxLength) {
      setErrorMessage("Title must not exceed 20 characters.");
      return;
    }
    if (invalidChars.test(key)) {
      setErrorMessage("Title must contain only letters, numbers, or spaces.");
      return;
    }

    setErrorMessage("");
    setTemplateTitle(key);
  };

  const changeContentName = (key: string) => {
    const maxLength = 30;
    const invalidChars = /[^a-zA-Z0-9\s]/;

    if (key.length > maxLength) {
      setContentErrorMessage("Content must not exceed 30 characters.");
      return;
    }
    if (invalidChars.test(key)) {
      setContentErrorMessage(
        "Content must contain only letters, numbers, or spaces."
      );
      return;
    }
    setContentErrorMessage("");
    setFieldName(key);
  };

  const promptKey = (key: string) => {
    setEditPrompt((prevPrompt: editPromptType) => {
      if (prevPrompt) {
        return {
          ...prevPrompt,
          promptKey: key,
        };
      }
      return prevPrompt;
    });
  };

  const addPromptKey = (promptType: string) => {
    manageFieldNameModel();
    document.getElementById("myTextField")?.focus();
  };

  const addNewField = () => {
    const toPascalCaseWithUnderscore = (str: string) => {
      return str.replace(/\s+/g, "_");
    };

    if (editMode) {
      const valueExiest = !!detailItems.find((value: any) => {
        return value.id === editPrompt?.id;
      });
      const newPrp = editPrompt?.promptQuestion.map((value: promptQuestion) => {
        const boxPosition = nodes.find((newValue) => {
          return newValue.id == value.id;
        });
        return {
          ...value,
          position: boxPosition ? boxPosition.position : { x: 0, y: 0 },
        };
      });

      const managePrompt = {
        ...editPrompt,
        promptKey: fieldName,
        conversionPromptKey: toPascalCaseWithUnderscore(fieldName),
        promptQuestion: newPrp as promptQuestion[],
      };

      // If the prompt exists, update the item; otherwise, add a new one
      if (valueExiest) {
        const editNewItem = detailItems.map((value: any) => {
          return value.id === editPrompt?.id ? managePrompt : value;
        }) as Item[];
        setDetailItems(editNewItem);
      } else {
        const copyValue = [...detailItems];
        copyValue.push(managePrompt as Item);
        setDetailItems(copyValue);
      }
    } else {
      const copyValue = [...detailItems];
      const firstPrompt = [{
        id: 1,
        question: "Identify the objective, method, and main findings from the text.",
      }] as   PromptQuestionType[]
      const mockJson = {
        id: uuidv4(),
        promptKey: fieldName,
        conversionPromptKey: toPascalCaseWithUnderscore(fieldName),
        promptQuestion: firstPrompt,
        type: "contents",
      };
      setEditPrompt(mockJson);
      nodesSet(mockJson);
      copyValue.push(mockJson as Item);
      setDetailItems(copyValue);
      updateNodes(firstPrompt);
    }
    setEditMode(false);
    manageFieldNameModel();
  };

  const editContentName = (item: any) => {
    setEditMode(true);
    manageFieldNameModel();
    changeContentName(item.promptKey);
  };

  const changePromptKey = (item: Item) => {
    setEditPrompt(item);
    nodesSet(item);
  };

  const nodesSet = (item: Item) => {
    const refetchFinalQuestion = item?.promptQuestion?.map(
      (value: promptQuestion, index: number) => {
        const createID = value.id;
        return {
          id: createID.toString(),
          type: "selectorNode",
          data: {
            onChange,
            onChangeSelect,
            addAction,
            promptQuestions: value.question,
            id: createID,
            editPrompt,
            showToolBox,
          },
          style: { border: "1px solid #777", padding: 5 },
          position: value?.position
            ? value?.position
            : { x: 0, y: index * 200 },
        };
      }
    );
    setNodes(refetchFinalQuestion);

    const refetchFinalEdgeQuestion = item?.promptQuestion?.map(
      (value: promptQuestion, index: number) => {
        const source = value.id;
        const target = value.id + 1;
        return {
          id: `e1-${index + 2}`,
          source: source.toString(),
          target: target.toString(),
          animated: true,
          style: { stroke: "#777" },
          markerEnd: {
            type: "arrowclosed",
            color: "black",
            markerWidth: 50,
            markerHeight: 20,
            strokeWidth: 5,
          },
        };
      }
    );
    setEdges(refetchFinalEdgeQuestion);
  };

  const addNewPrompt = () => {
    if (templateTitle) {
      saveTemplate(detailItems);
    } else {
      setErrorMessage(
        "Please give a meaningful display name this template represents, 12 characters or less."
      );
    }
  };

  const saveTemplate = async (editNewItem: any) => {
    const generatedTemplate = generateHandlingTemplate(editNewItem);
    try {

      const response: any = await updateTemplates({
        template_title: templateTitle,
        template_json_data: editNewItem,
        template_prompt: generatedTemplate,
        ai_model: selectedModel,
      }, templateId as any);
      if (response?.data?.isSuccess) {
        toast.success("Template prompt added successfully!");
        backNavigation();
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      toast.error("Failed to add template prompt. Please try again.");
    }
  };

  const backNavigation = () => {
    router.push("/account/templates");
  };

  const addQuestion = () => {
    setEditPrompt((prevPrompt: editPromptType) => {
      if (prevPrompt) {
        const updatedPromptQuestions = [
          ...prevPrompt.promptQuestion,
        ] as PromptQuestionType[];
        updatedPromptQuestions.push({
          id: updatedPromptQuestions.length + 1,
          question: "",
        } as PromptQuestionType);
        updateNodes(updatedPromptQuestions);
        return {
          ...prevPrompt,
          promptQuestion: updatedPromptQuestions,
        };
      }
      return prevPrompt;
    });
  };

  const updateNodes = (updatedPromptQuestions: PromptQuestionType[]) => {
    // Generates and sets nodes and edges for "FlowChart" based on the updated prompt questions
    const refetchFinalQuestion = updatedPromptQuestions?.map(
      (value: PromptQuestionType, index: number) => {
        const createID = value.id;
        return {
          id: createID.toString(),
          type: "selectorNode",
          data: {
            onChange,
            onChangeSelect,
            addAction,
            promptQuestions: value.question,
            id: createID,
            editPrompt,
            showToolBox,
          },
          style: { border: "1px solid #777", padding: 5 },
          position: value.position ? value.position : { x: 0, y: index * 200 },
        };
      }
    );
    setNodes(refetchFinalQuestion);

    const refetchFinalEdgeQuestion = updatedPromptQuestions?.map(
      (value: PromptQuestionType, index: number) => {
        const source = value.id;
        const target = value.id + 1;
        return {
          id: `e1-${index + 2}`,
          source: source.toString(),
          target: target.toString(),
          animated: true,
          style: { stroke: "#777" },
        };
      }
    );
    setEdges(refetchFinalEdgeQuestion);
  };

  const removeQuestion = () => {
    setEditPrompt((prevPrompt: editPromptType) => {
      if (prevPrompt) {
        const updatedPromptQuestions = [
          ...prevPrompt.promptQuestion,
        ] as PromptQuestionType[];
        updatedPromptQuestions.pop();
        updateNodes(updatedPromptQuestions);
        return {
          ...prevPrompt,
          promptQuestion: updatedPromptQuestions,
        };
      }
      return prevPrompt;
    });
  };

  const newOnNodesChange = (change: NodeChange | any) => {
    if (change[0].type === "position") {
      const newMainPrompt = editPrompt?.promptQuestion.map(
        (value: promptQuestion | any) => {
          const fixPosition =
            value?.id == change[0].id
              ? {
                ...value,
                position: change[0].position
                  ? change[0].position
                  : { x: 0, y: 200 },
              }
              : value;
          return fixPosition;
        }
      );

      setEditPrompt((prevPrompt: editPromptType | null) => {
        if (prevPrompt) {
          return {
            ...prevPrompt,
            promptQuestion: newMainPrompt || [],
          };
        }
        return prevPrompt;
      });
    }
    onNodesChange(change);
  };

  const removeKey = () => {
    const updateKey = detailItems.filter((value: Item | any) => {
      return value.id !== deleteKey;
    });
    setDetailItems(updateKey);
    controlModel();
    setDeleteKey(0);
  };

  const manageModel = (
    e: React.MouseEvent<HTMLDivElement>,
    id: number | string | any
  ) => {
    e.stopPropagation();
    setAddModalOpen(!isAddModalOpen);
    setDeleteKey(id);
    setManageDeleteBtn(true);
    setIndividualDeleteDelay(5);
    if (individualDeleteTimeoutRef.current) clearInterval(individualDeleteTimeoutRef.current);
    let seconds = 5;
    individualDeleteTimeoutRef.current = setInterval(() => {
      seconds -= 1;
      setIndividualDeleteDelay(seconds);
      if (seconds <= 0) {
        setManageDeleteBtn(false);
        if (individualDeleteTimeoutRef.current) {
          clearInterval(individualDeleteTimeoutRef.current);
          individualDeleteTimeoutRef.current = null;
        }
      }
    }, 1000);
  };

  const controlModel = () => {
    setAddModalOpen(!isAddModalOpen);
    setIndividualDeleteDelay(5);
    if (individualDeleteTimeoutRef.current) {
      clearInterval(individualDeleteTimeoutRef.current);
      individualDeleteTimeoutRef.current = null;
    }
  };

  const demoNavigation = () => {
    const getStorage = localStorage.getItem("navigationDemo");
    const navigationDemo = getStorage && JSON.parse(getStorage);

    if (!navigationDemo) {
      localStorage.setItem("navigationDemo", JSON.stringify(true));
      driverObj.drive();
    }
  };

  const clickBox = () => {
    setNodes((nds) =>
      nds.map((node) => {
        return { ...node, data: { ...node.data, showToolBox: !showToolBox } };
      })
    );
    setShowToolBox(!showToolBox);
  };

  const manageFieldNameModel = () => {
    setFieldNameModalOpen(!isFieldNameModalOpen);
    setFieldName("");
  };

  const openRemoveAllDialog = () => {
    setIsRemoveAllDialogOpen(true);
    setRemoveAllDelay(5);
    if (removeAllTimeoutRef.current) clearInterval(removeAllTimeoutRef.current);
    let seconds = 5;
    removeAllTimeoutRef.current = setInterval(() => {
      seconds -= 1;
      setRemoveAllDelay(seconds);
      if (seconds <= 0 && removeAllTimeoutRef.current) {
        clearInterval(removeAllTimeoutRef.current);
        removeAllTimeoutRef.current = null;
      }
    }, 1000);
  };

  const closeRemoveAllDialog = () => {
    setIsRemoveAllDialogOpen(false);
    setRemoveAllDelay(5);
    if (removeAllTimeoutRef.current) {
      clearInterval(removeAllTimeoutRef.current);
      removeAllTimeoutRef.current = null;
    }
  };

  return (
    <>
      <div className="flex flex-wrap w-full justify-between" id="template-name">
        <div className="w-full sm:w-auto flex flex-wrap items-center">
          <HeaderTitle name={`${templateName}`} />
          <div className="pl-2 flex gap-2">
            <Badge
              variant="outline"
              className="ml-auto sm:ml-0 cursor-pointer bg-white h-max dark:text-black capitalize"
            >
              {templateStatus}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap w-full sm:flex-nowrap sm:w-auto">
          <div
            className="w-full sm:w-3/5 p-2 md:min-w-[10rem] lg:min-w-[20rem]"
            id="change-key-name"
          >
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Tab Name
            </label>
            <Input
              id="myTextField"
              value={templateTitle || ""}
              onChange={(e) => {
                templateKey(e.target.value);
              }}
            />
            <span className={` mt-2 text-[#fd9100] text-[0.70rem]`}>
              {errorMessage}&nbsp;
            </span>
          </div>
          <div className="flex flex-col w-full sm:w-auto p-2">
            <TemplateSimpalButton
              onClick={addNewPrompt}
              className={`${!editPrompt?.promptKey ? "opacity-60 pointer-events-none" : ""
                }`}
              id="add-prompt-btn"
              btnName="Save Template"
            />
            <TemplateSimpalButton
              id="add-prompt-btn"
              btnName="Cancel"
              onClick={() => {
                backNavigation();
              }}
            />
          </div>
        </div>
      </div>

      <div className="containerTemplate  md:pr-2 md:pl-2 sm:p-0 mb-12">
        <div className="flex sm:flex-wrap xl:flex-nowrap  flex-wrap gap-4 mt-3 w-full">
          <div className="w-full flex flex-col sm:w-[90%] md:w-[100%] lg:w-[100%] xl:w-[23%] 2xl:w-[23%] flex justify-center lg:block">
            <div className="sm:w-[90%] md:w-[100%] lg:w-[100%]">
              <div className="text-left" id="select-model">
                <form className="max-w-sm">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    AI Model
                  </label>
                  <select
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    <option value="" selected disabled>
                      Choose AI Model
                    </option>
                    {promptModel?.map((value: any, index: number) => {
                      return (
                        <option key={index} value={value?.model}>
                          {value?.name}
                        </option>
                      );
                    })}
                  </select>
                </form>
              </div>
              <div className="mt-4">
                {detailItems
                  .filter((item: any) => item.type === "detail")
                  .map((item: any, index: number) => (
                    <div
                      className={`p-2 my-1 border border-gray-300 rounded cursor-pointer flex justify-between text-black`}
                      style={{ backgroundColor: "#e8eefd" }}
                      id="focusButton"
                      key={index}
                    >
                      <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.promptKey}
                      </div>
                    </div>
                  ))}

                <div className="flex items-center justify-between m-2 relative">
                  <div className="flex-1 flex justify-center">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white text-center">
                      CONTENTS
                    </label>
                  </div>
                  <button
                    type="button"
                    title="Remove all contents"
                    className="ml-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 absolute right-0"
                    onClick={openRemoveAllDialog}
                  >
                    <Minus className="size-4 text-red-500" />
                  </button>
                </div>
                <div className="overflow-hidden max-h-[52dvh] overflow-y-auto">
                  {detailItems
                    .filter((item: any) => item.type === "contents")
                    .map((item: any, index: number) => (
                      <div
                        className={`p-2 my-1 border border-gray-300 rounded cursor-pointer flex justify-between ${editPrompt?.id === item?.id
                          ? "text-gray-800 font-bold shadow-[rgba(0,0,0,0.53)_1px_-5px_10px,rgba(0,0,0,0.53)_1px_5px_10px]"
                          : "text-black"
                          }`}
                        style={{
                          backgroundColor:
                            editPrompt?.id === item?.id ? "#cee4d1" : "#e8eefd",
                        }}
                        key={index}
                        id="select-template-key"
                        onClick={() => {
                          changePromptKey(item);
                        }}
                      >
                        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                          {item?.promptKey}
                        </div>
                        {editPrompt?.id !== item?.id ? (
                          <div
                            className="flex items-center bg-[#6887a9] rounded-[22px] p-1 shadow-[0_0_5px_5px_#9f8fbb]"
                            onClick={(e) => {
                              manageModel(e, item.id);
                            }}
                          >
                            <Minus
                              className="size-4"
                              style={{ color: "white" }}
                            />
                          </div>
                        ) : (
                          <div
                            className="flex items-center bg-[#6887a9] rounded-[22px] p-1 shadow-[0_0_5px_5px_#9f8fbb]"
                            onClick={(e) => {
                              editContentName(item);
                            }}
                          >
                            <FilePenLine
                              className="size-4"
                              style={{ color: "white" }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
                <div
                  className="font-medium text-white font-sans p-1 my-1 bg-[#6887a9] w-full rounded cursor-pointer flex justify-center"
                  onClick={() => {
                    addPromptKey("contents");
                  }}
                >
                  <Plus size={28} strokeWidth={3} style={{ color: "white" }} />
                </div>
              </div>
            </div>
          </div>

          <div className={`xl:w-[${file_url ? 45 : 77}%] w-[100%]`}>
            <label className="not-italic block mb-2 text-lg text-gray-900 dark:text-white font-semibold">
              {currentKey?.promptKey || " "} &nbsp;
            </label>
            <div style={{ height: "85vh" }} id="see-chart-area">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={newOnNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                style={{ background: "#dde8f4", borderRadius: "4px" }}
                nodeTypes={{
                  selectorNode: ColorSelectorNode,
                }}
                connectionLineStyle={connectionLineStyle}
                snapToGrid
                snapGrid={snapGrid}
                defaultViewport={defaultViewport}
                fitView
                zoomOnPinch={false}
                panOnScroll={false}
              >
                <Controls style={{ color: "#007bff" }} />
              </ReactFlow>
            </div>
            <section className="pb-[5px] flex justify-between">
              <div className="flex items-center text-lg font-medium">
                <input
                  type="checkbox"
                  disabled={
                    editPrompt?.promptQuestion
                      ? editPrompt.promptQuestion.length > 0
                        ? false
                        : true
                      : true
                  }
                  checked={showToolBox}
                  onChange={() => {
                    clickBox();
                  }}
                />{" "}
                &nbsp; &nbsp;Show Advanced Actions
              </div>
              <div className="max-w-max">
                <LightThemeButton
                  onClick={() => {
                    addQuestion();
                  }}
                  style={
                    promptQuestionCheck
                      ? { pointerEvents: "none", opacity: "0.6" }
                      : {}
                  }
                  id="add-question-btn"
                >
                  Add New Prompt
                </LightThemeButton>
              </div>
            </section>
          </div>
          {file_url && (
            <div className="xl:w-[65%] w-[100%]">
              <label className="not-italic block mb-2 text-lg text-gray-900 dark:text-white font-semibold">
                Preview
              </label>
              {templateTitle && (
                <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
                  <div
                    style={{
                      background:
                        "linear-gradient(0deg, #DB8606 -32.81%, #F59B14 107.89%)",
                      border: "2px solid #FDAB2F",
                    }}
                    className="cursor-pointer px-4 py-[5px] rounded-full text-sm font-medium transition-all bg-orange-400 text-white shadow-md  text-[#FFFFFF]"
                  >
                    {templateTitle}
                  </div>
                </div>
              )}

              <Card
                className="overflow-hidden w-full h-full flex flex-col max-h-[85dvh] overflow-y-auto"
                x-chunk="dashboard"
              >
                <CardContent className="p-0 text-sm h-full dark:bg-[#152428]">
                  <div className="p-3  items-center gap-2 p-4 pt-4  px-4 bg-[#F1F1F1] dark:bg-[#152428]">
                    <h1 className="font-poppins text-[16px] font-medium leading-[27px] text-left text-[#666666] dark:text-[#CCCCCC]">
                      {analysisData?.Title && Array.isArray(analysisData.Title)
                        ? analysisData.Title[0]
                        : ""}
                    </h1>
                    <div className="flex flex-col gap-y-1 w-[65%] mt-2">
                      <label className="font-poppins text-[10px] font-semibold leading-[15px] text-left text-[#999999]">
                        AUTHORS
                      </label>
                      <h1 className="font-poppins text-[15px] font-medium leading-[19.5px] text-left text-[#666666] dark:text-[#CCCCCC] text-sm">
                        {analysisData?.Authors &&
                          Array.isArray(analysisData.Authors)
                          ? analysisData.Authors[0]
                          : ""}
                      </h1>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex flex-col gap-y-1">
                      <label className="font-poppins text-[12px] font-semibold leading-[18px] text-left text-[#999999] ">
                        PUBLICATION
                      </label>
                      <div className="font-poppins text-[16px] font-medium leading-[27px] text-left text-[#333333] dark:text-[#CCCCCC]">
                        {analysisData?.JournalName &&
                          Array.isArray(analysisData.JournalName)
                          ? analysisData.JournalName[0]
                          : ""}
                      </div>
                      <label className="text-gray-400 font-poppins text-sm font-semibold leading-[22.5px] text-left mt-2">
                        Publication Date:
                        <span className="font-poppins text-sm font-medium leading-[22.5px] text-left text-gray-800  dark:text-[#CCCCCC]">
                          &nbsp;{" "}
                          {analysisData?.PublicationDate &&
                            Array.isArray(analysisData.PublicationDate)
                            ? analysisData.PublicationDate[0]
                            : ""}
                        </span>
                      </label>
                    </div>
                    {analysisData &&
                      Object.entries(analysisData).map(
                        ([key, value]: any, index: number) => {
                          if (
                            ![
                              "Title",
                              "PublicationDate",
                              "Authors",
                              "JournalName",
                            ].includes(key)
                          ) {
                            const clearSpace = addSpaceBeforeCapitalWords(key);

                            return (
                              <>
                                <div className="flex mt-2" key={index}>
                                  <span
                                    className={`font-poppins text-base font-medium leading-[25.5px] text-[#333333] dark:text-[#CCCCCC] px-1 h-[max-content]`}
                                    style={{
                                      border:
                                        editPrompt?.promptKey == clearSpace
                                          ? "3px solid #a6d4ad"
                                          : "3px solid rgba(255, 255, 255, 0)",
                                    }}
                                  >
                                    {clearSpace}
                                  </span>
                                  <div className="mt-1">
                                    {Array.isArray(value) ? (
                                      value?.map(
                                        (lineValue: string, index: number) => (
                                          <div className="flex" key={index}>
                                            <RxDotFilled
                                              width="30px"
                                              height="30px"
                                              className="dark:text-[#CCCCCC] text-[#333333] m-[0.3rem_8px] min-w-fit"
                                            />
                                            <div className="text-base dark:text-[#CCCCCC]">
                                              {lineValue}
                                            </div>
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <div className="flex" key={index}>
                                        <RxDotFilled
                                          width="30px"
                                          height="30px"
                                          className="dark:text-[#CCCCCC] text-[#333333] m-[0.3rem_8px] min-w-fit"
                                        />
                                        <div className="text-base dark:text-[#CCCCCC]">
                                          {value}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            );
                          }
                        }
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={controlModel}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="fixed p-6 bg-white rounded-md shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96">
          <DialogTitle className="text-xl font-semibold">
            Confirm delete
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600 italic text-[0.9rem]">
            Are you sure you want to delete the{" "}
            <span className="font-extrabold">{removeSectionName}</span>?
          </DialogDescription>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={() => setAddModalOpen(false)} variant="outline" className="rounded-[26px]">
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={manageDeleteBtn}
              onClick={removeKey}
              className="rounded-[26px]"
            >
              {manageDeleteBtn ? `Delete (${individualDeleteDelay})` : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isDefineModalOpen} onOpenChange={manageQuestionModel}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="fixed p-6 bg-white rounded-md shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:w-100 element">
          <DialogTitle className="text-xl font-semibold dark:text-[#353535]">
            List of Actions
          </DialogTitle>

          <DialogDescription className="mt-2 text-gray-600 italic text-[0.9rem]">
            <Tabs defaultValue="Shorten">
              <div className="gap-4 flex-col sm:flex-row flex max-h-[400px] py-1">
                <div
                  className="sectionScroll max-sm:max-h-[200px]"
                  style={{ overflowY: "auto" }}
                >
                  <TabsList className="flex flex-wrap flex-col w-full min-w-[200px] h-full">
                    <TabsTrigger value="Shorten">Shorten</TabsTrigger>
                    <TabsTrigger value="Expand">Expand</TabsTrigger>
                    <TabsTrigger value="Humanize">Humanize</TabsTrigger>
                    <TabsTrigger value="Change Language">
                      Change Language
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div
                  className="sectionScroll"
                  style={{ minWidth: "300px", overflowY: "auto" }}
                >
                  <TabsContent value="Shorten" className="px-1">
                    <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535]">
                      {" "}
                      Maximum characters:
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
                        }}
                      />
                    </div>
                    <Input
                      id="myTextField"
                      className="w-max mt-2 dark:bg-[#f6f6f6]"
                      value={String(selectRange)}
                      type="number"
                      onChange={(e) => {
                        setSelectRange(Number(e.target.value));
                      }}
                    />
                    <Separator className="my-4" />
                  </TabsContent>

                  <TabsContent value="Expand" className="px-1">
                    <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535] ">
                      <input
                        type="checkbox"
                        checked={expandInstructions}
                        onChange={() => {
                          setExpandInstructions(!expandInstructions);
                        }}
                      />
                      &nbsp;&nbsp;Expand Instructions
                    </label>

                    <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535]">
                      <input
                        type="checkbox"
                        checked={InstructionsTxt}
                        onChange={() => {
                          setInstructionsTxt(!InstructionsTxt);
                        }}
                      />
                      &nbsp;&nbsp;{`Custom Instruction (Optional)`}
                    </label>

                    {InstructionsTxt && (
                      <Textarea
                        ref={textAreaRef}
                        className="h-8 mt-2 mb-2 w-[350px] overflow-y-hidden dark:bg-[#f6f6f6]"
                        placeholder="Enter instructions"
                        value={instructions}
                        onChange={(
                          e: React.ChangeEvent<HTMLTextAreaElement>
                        ) => {
                          setInstructions(e.target.value);
                        }}
                      />
                    )}
                    <Separator className="my-4" />
                  </TabsContent>

                  <TabsContent value="Humanize" className="px-1">
                    <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535]">
                      <input
                        type="checkbox"
                        checked={humanizeText}
                        onChange={() => {
                          setHumanizeText(!humanizeText);
                        }}
                      />
                      &nbsp;&nbsp;Humanize text
                    </label>

                    <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535]">
                      <input
                        type="checkbox"
                        checked={humanizeTxtBox}
                        onChange={() => {
                          setHumanizeTxtBox(!humanizeTxtBox);
                        }}
                      />
                      &nbsp;&nbsp;{`Custom Instruction (Optional)`}
                    </label>

                    {humanizeTxtBox && (
                      <Textarea
                        ref={textAreaRef}
                        className="h-8 mt-2 mb-2 w-[350px] overflow-y-hidden dark:bg-[#f6f6f6]"
                        placeholder="Enter text"
                        value={humanizeTxt}
                        onChange={(
                          e: React.ChangeEvent<HTMLTextAreaElement>
                        ) => {
                          setHumanizeTxt(e.target.value);
                        }}
                      />
                    )}
                    <Separator className="my-4" />
                  </TabsContent>

                  <TabsContent value="Change Language" className="px-1">
                    <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Change Language
                    </label>
                    <form className="max-w-sm">
                      <select
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:bor.mx-autoder-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={selectLanguage}
                        onChange={(e) => setSelectLanguage(e.target.value)}
                      >
                        <option value="" selected disabled>
                          Select Language
                        </option>
                        {modelSupportedLanguages?.map((value, index) => {
                          return (
                            <option key={index} value={value}>
                              {value}
                            </option>
                          );
                        })}
                      </select>
                    </form>
                    <Separator className="my-4" />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </DialogDescription>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="default" onClick={addSelectedPromptQuestion} className="rounded-[26px]">
              Add Action
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isFieldNameModalOpen} onOpenChange={manageFieldNameModel}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="fixed p-6 bg-white rounded-md shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96">
          <DialogTitle className="text-xl font-semibold">Content</DialogTitle>
          <DialogDescription className="mt-2 text-gray-600 text-[0.9rem]">
            <div className="grid gap-2 relative">
              <Label htmlFor="name">Enter Content name</Label>
              <Input
                id="myTextField"
                value={fieldName || ""}
                onChange={(e) => {
                  changeContentName(e.target.value);
                }}
                autoFocus
              />
              <span className={` mt-2 text-[#fd9100] text-[0.70rem]`}>
                {contentErrorMessage}&nbsp;
              </span>
            </div>
          </DialogDescription>
          <div className="mt-6 flex justify-center gap-2">
            <Button
              onClick={() => {
                manageFieldNameModel();
                setEditMode(false);
              }}
              variant="outline"
              className="rounded-[26px]"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={!fieldName}
              onClick={addNewField}
              className="rounded-[26px]"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveAllDialogOpen} onOpenChange={closeRemoveAllDialog}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="fixed p-6 bg-white rounded-md shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96">
          <DialogTitle className="text-xl font-semibold text-red-600">Remove All Contents?</DialogTitle>
          <DialogDescription className="mt-2 text-gray-600 italic text-[0.9rem]">
            Are you sure you want to remove <b>all CONTENTS sections</b>? This action cannot be undone.
          </DialogDescription>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={closeRemoveAllDialog} variant="outline" className="rounded-[26px]">
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={removeAllDelay > 0}
              onClick={() => {
                setDetailItems((prev: Item[]) => prev.filter(item => item.type !== "contents"));
                closeRemoveAllDialog();
              }}
              className="rounded-[26px]"
            >
              {removeAllDelay > 0 ? `Remove All (${removeAllDelay})` : "Remove All"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PromptEditor;
