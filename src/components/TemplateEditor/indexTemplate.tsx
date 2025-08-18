"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchApi } from "@/utils/fetchApi";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import moment from 'moment';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ModelList,
  CustomNode,
  NodeChange,
  EditPrompt,
  PromptQuestionType,
} from "@/types/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { Ellipsis, Plus, Minus, DivideIcon, FilePenLine, Save, CircleX, SquareCheck, Square, ChevronDown, Check, X, Lock, Globe, ChevronRight, ExternalLink, RefreshCw } from "lucide-react";
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
  Background,
  Panel,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RxDotFilled } from "react-icons/rx";
import { SettingIcon } from "@/app/(app)/creative-thinking/icons/icons";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { addSpaceBeforeCapitalWords, staticContent, termAndCondition, modelSupportedLanguages } from "@/utils/commonUtils";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Slider from "rc-slider";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from "@/components/ui/button";
import { HeaderTitle } from "@/components/Header/HeaderTitle";
import ColorSelectorNode from "./memoItem";
// import { driverObjGuide } from "./TemplateGuestTour";
import { Input } from "@/components/ui/input";
import {
  generateHandlingTemplate,
  requestTextHumanizationData,
  recommendSectionsPrompt,
} from "@/utils/aiTemplates";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { PromptQuestion } from "@/types/types";
import { handleRender } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "./index.css";
import "rc-slider/assets/index.css";
import { getTemplateById, updateTemplates, updatePromptTemplates } from "@/apis/templates";
import { FaHeartPulse } from "react-icons/fa6";

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

interface DetailItem {
  id: string;
  type: string;
  promptKey: string;
}

const ItemTypes = {
  CARD: 'card',
};

type editPromptType = EditPrompt | Item | null | any;

const initBgColor = "#1A192B";

const connectionLineStyle = { stroke: "#fff" };

const snapGrid: [number, number] = [20, 20];

const defaultViewport = { x: 0, y: 0, zoom: 0 };

const DraggableItem = ({ item, index, moveItem, changePromptKey, manageModel, editContentName, editPrompt }: any) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(draggedItem: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = (ref.current as HTMLElement)?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset?.y ? clientOffset.y - hoverBoundingRect.top : 0;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div
      ref={ref}
      style={{ opacity }}
      className={`p-2 my-1 text-base rounded-md cursor-pointer flex justify-between ${editPrompt?.id === item?.id
          ? "text-[#0E70FF]"
          : "text-[#666666] dark:text-[#CCCCCC]"
        }`}
      id={`item-${item.id}`}
      onClick={() => changePromptKey(item)}
    >
      <div className="whitespace-nowrap overflow-hidden text-ellipsis ">
        {item?.promptKey}
      </div>
      {editPrompt?.id !== item?.id ? (
        <div
          className="flex items-center rounded-[22px] p-1 dark:text-white individual-section-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            manageModel(e, item.id);
          }}
        >
          <Minus
            className="size-4 text-red-500"
          />
        </div>
      ) : (
        <div
          className="flex items-center rounded-[22px] p-1 "
          onClick={(e) => {
            e.stopPropagation();
            editContentName(item);
          }}
        >
          <FilePenLine
            className="size-4 text-[#ff9839]"
          />
        </div>
      )}
    </div>
  );
};

const TemplatePromptEditor: React.FC = () => {
  const [detailItems, setDetailItems] = useState<Item[] | any>(staticContent);
  const [editPrompt, setEditPrompt] = useState<editPromptType | any>(null);
  const [promptModel, setPromptModel] = useState<ModelList | any>([]);
  const [selectedModel, setSelectedModel] =
    useState<string>("openai/gpt-4o-mini");
  const [nodes, setNodes, onNodesChange] = useNodesState<
    CustomNode | any | EditPrompt | promptQuestion
  >([]);
  const [history, setHistory] = useState<{ nodes: any[], edges: any[] }[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[] | any>([]);
  const [bgColor, setBgColor] = useState<string | any>(initBgColor);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<number | string | any>();
  const [manageDeleteBtn, setManageDeleteBtn] = useState<boolean | any>(true);
  const [showToolBox, setShowToolBox] = useState<boolean | any>(false);
  const [acceptTAC, setAcceptTAC] = useState<boolean | any>(false);
  const [acceptCondation, setAcceptCondation] = useState<boolean | any>(false);
  const [handlePromptAction, setHandlePromptAction] = useState<number | null | any>(null);
  const [isDefineModalOpen, setDefineModalOpen] = useState<boolean | any>(false);
  const [selectRange, setSelectRange] = useState<number | number[] | any>(150);
  const [selectTemplateRange, setSelectTemplateRange] = useState<number | number[] | any>(150);
  const [selectLanguage, setSelectLanguage] = useState<string | any>("");
  const [selectTemplateLanguage, setSelectTemplateLanguage] = useState<string | any>("");
  const [expandInstructions, setExpandInstructions] = useState<boolean | any>(false);
  const [expandTemplateInstructions, setExpandTemplateInstructions] = useState<boolean | any>(false);
  const [instructions, setInstructions] = useState<string | any>("");
  const [templateInstructions, setTemplateInstructions] = useState<string | any>("");
  const [humanizeText, setHumanizeText] = useState<boolean | any>(false);
  const [humanizeTemplateText, setHumanizeTemplateText] = useState<boolean | any>(false);
  const [humanizeTxt, setHumanizeTxt] = useState<string | any>("");
  const [humanizeTemplateTxt, setHumanizeTemplateTxt] = useState<string | any>("");
  const [InstructionsTxt, setInstructionsTxt] = useState<boolean | any>(false);
  const [InstructionsTemplateTxt, setInstructionsTemplateTxt] = useState<boolean | any>(false);
  const [humanizeTxtBox, setHumanizeTxtBox] = useState<boolean | any>(false);
  const [humanizeTemplateTxtBox, setHumanizeTemplateTxtBox] = useState<boolean | any>(false);
  const [isActiveTab, setActiveTab] = React.useState("editor");
  const [file_url, setFileUrl] = React.useState(null);
  const [analysisData, setAnalysisData] = React.useState<any>(null);
  const [templateTitle, setTemplateTitle] = useState<string | any>("");
  const [fieldName, setFieldName] = useState<string | any>("");
  const [isFieldNameModalOpen, setFieldNameModalOpen] = useState<boolean | any>(false);
  const [editMode, setEditMode] = useState<boolean | any>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [contentErrorMessage, setContentErrorMessage] = useState("");
  const [isRemoveAllDialogOpen, setIsRemoveAllDialogOpen] = useState(false);
  const [openTACModel, setOpenTACModel] = useState(false);
  const [removeAllDelay, setRemoveAllDelay] = useState(5);
  const [showPreview, setShowPreview] = useState(true);
  const removeAllTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [individualDeleteDelay, setIndividualDeleteDelay] = useState(5);
  const individualDeleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [templateData, setTemplateData] = useState<any>(null);
  const [settingOption, setSettingOption] = useState<any>("");
  const [templatePrompt, setTemplatePrompt] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [responseType, setResponseType] = useState<string>("none");
  const [selectorResponseType, setSelectorResponseType] = useState<string>("none");
  const [refreshCheckSection, setRefreshCheckSection] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [changeSetting, setChangeSetting] = useState<boolean>(false);
  const [dragSection, setDragSection] = useState<boolean>(false);
  const [restoreBox, setRestoreBox] = useState<boolean>(false)
  const [saveChanges, setSaveChanges]=useState<boolean>(true);

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


  useEffect(() => {
    if (nodes.length > 0 && currentHistoryIndex === -1) {
      addToHistory();
    }
  }, [nodes.length]);


  const getChangedQuestionIds = (mainState: any, updatedState: any) => {
    const changedIds: number[] = [];
    const mainMap = new Map(mainState.map((item: any) => [item.id, item.question]));
    updatedState.forEach((item: any) => {
      const originalQuestion = mainMap.get(item.id);
      if (originalQuestion !== item.question) {
        changedIds.push(item.id);
      }
    });
    return changedIds;
  }

  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const previousState = history[newIndex];

      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setCurrentHistoryIndex(newIndex);

      toast.success("Undo successful");
    } else {
      toast.error("Nothing to undo");
    }
  }, [currentHistoryIndex, history]);

  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const nextState = history[newIndex];

      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setCurrentHistoryIndex(newIndex);

      toast.success("Redo successful");
    } else {
      toast.error("Nothing to redo");
    }
  }, [currentHistoryIndex, history]);

  useEffect(() => {
    resizeTextArea();
  }, [instructions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);


  const handleSubmit = (settings: any) => {
    setShowModal(!showModal);
  };

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
    // setRestoreBox(true)
    // setDetailItems(editPositionItem);
  };



  const resizeTextArea = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  };

  const onChange = (value: string, data: { id: number }) => {
 setDetailItems((preDetailItemsState: any) => {
    setShowToolBox((preNewState: any) => {
      setEditPrompt((prevState: editPromptType | any) => {
        if (prevState) {

          setRefreshCheckSection((prev: any[] = []) => {
            if (!prev.includes(prevState?.id)) {
              return [...prev, prevState.id];
            }
            return prev;
          });
          const finalPrevState = prevState?.promptQuestion.map(
            (values: promptQuestion) => {
              return values.id === data.id
                ? { ...values, question: value }
                : values;
            }
          );
          const checkNewData = preDetailItemsState?.find((value: any) => { return value?.id == prevState?.id })
          const changed = getChangedQuestionIds(checkNewData?.promptQuestion || [], prevState?.promptQuestion || []);
          // const managePrompt = {
          //   ...editPrompt,
          //   promptQuestion: finalPrevState as promptQuestion[],
          // };

          // const editNewItem = detailItems.map((value: any) => {
          //   return value.id === editPrompt?.id ? managePrompt : value;
          // }) as Item[];

          // setDetailItems(editNewItem);
     setNodes((nds) =>
        nds.map((node) => {
          setBgColor(value);
          return node.data.id === data.id
            ? {
              ...node,
              data: {
                ...node.data,
                changed:changed,
              },
            }
            : node;
        })
      );
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
   return preDetailItemsState
     });
    setRestoreBox(true)
    setSaveChanges(false)
  };

  const onDelete=(data:any)=>{
    console.log("onDelete",data.id)
  }

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

    if (!!expandInstructions) {
      instructionsProperties += `please provide a more detailed expansion of the custom instructions. \n`;
    }

    if (instructions.length > 0 && InstructionsTxt) {
      instructionsProperties += `${instructions.replace(/\s+/g, " ").trim()} \n`;
    }

    if (!!humanizeText) {
      instructionsProperties += requestTextHumanizationData;
    }
    if (humanizeTxt.length > 0 && humanizeTxtBox) {
      instructionsProperties += `${humanizeTxt.replace(/\s+/g, " ").trim()} \n`;
    }

    if (!!selectLanguage) {
      instructionsProperties += `Please update the language used in the text to ${selectLanguage}. \n`;
    }

    if (selectorResponseType) {
      const typeLine =
        selectorResponseType === "concise"
          ? `# Response Behavior:
          - responseType = "concise" → Provide a concise summary in 1 sentences or bullet points, focusing only on key points.\n`
          : selectorResponseType === "detailed"
            ? `# Response Behavior:
            - responseType = "detailed" → Provide a multi-point detailed response in the format: "ans": [{data:"..."}] — each 'data' field should contain a meaningful sentence.\n`
            : `# Response Behavior:
            - responseType = "normal" → Provide a standard response with moderate detail — not too brief, not too elaborate. Format as plain text or simple bullet points.\n`;

      instructionsProperties += typeLine
      const typeAnswer =
        selectorResponseType === "concise"
          ? `**Response Format:** \n "ans": "Give a brief response in 1 lines or bullet points, The main factors influencing cloud ERP adoption are organizational culture and supportive regulations, which enhance flexibility and decision-making."`
          : selectorResponseType === "detailed"
            ? `**Response Format:** \n"ans": [{data: ""}] Provide a detailed and well-explained answer in at least 8-10 sentences. Include key context, supporting points, and any relevant insights that help understand the significance of the answer in relation to the research topic. give much more in-depth analysis, explanation, or extracted data compared to the standard one`
            : `**Response Format:** \n"ans": "Provide a detailed response of at least three to four sentences, explaining the extracted answer with relevant context or elaboration. Ensure the answer is clear and informative."`;

      instructionsProperties += typeAnswer
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

          setRefreshCheckSection((prev: any[] = []) => {
            if (!prev.includes(prevPrompt?.id)) {
              return [...prev, prevPrompt.id];
            }
            return prev;
          });

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
    setChangeSetting(false);
  };

  const addTemplatePrompt = async () => {
    let instructionsProperties = ``;

    // if (!!selectTemplateRange) {
    //   instructionsProperties += `Please limit the response to ${selectTemplateRange} characters. `;
    // }

    if (!!expandTemplateInstructions) {
      instructionsProperties += `please provide a more detailed expansion of the custom instructions. `;
    }

    if (templateInstructions.length > 0 && InstructionsTemplateTxt) {
      instructionsProperties += `${templateInstructions.replace(/\s+/g, " ").trim()} `;
    }

    if (!!humanizeTemplateText) {
      instructionsProperties += requestTextHumanizationData;
    }
    if (humanizeTemplateTxt.length > 0 && humanizeTemplateTxtBox) {
      instructionsProperties += `${humanizeTemplateTxt.replace(/\s+/g, " ").trim()} `;
    }

    if (!!selectTemplateLanguage) {
      instructionsProperties += `Please update the language used in the text to ${selectTemplateLanguage}. `;
    }
    setTemplatePrompt(instructionsProperties)
    setDropdownOpen(false);
  };


  const getAIModel = async () => {
    try {
      // const response = await fetchApi(
      //   `${process.env.NEXT_PUBLIC_STRAICO_API}/v0/models`,
      //   {
      //     method: "GET",
      //   }
      // );
      // setPromptModel(response);

      // if (!response.success) {
      //   throw new Error(`HTTP error! status: ${response.success}`);
      // }

      // const pdfMetaData: ModelList = response.data;
      // setPromptModel(pdfMetaData);
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
          setTemplateData(data)
          if (data?.template_json_data?.length > 0) {
            setDetailItems(data.template_json_data);
            const makeFIrstData = data.template_json_data.filter(
              (item: { type: string }) => item.type === "contents"
            )[0];
            // const makeFIrstData = data.template_json_data[0]
            setResponseType(data?.responsetype)
            setSelectTemplateLanguage(data?.templatelanguage)
            setHumanizeTemplateText(data?.humanizetemplate)
            setHumanizeTemplateTxt(data?.humanizetemplateinput)
            setTemplateTitle(data.template_title);
            setEditPrompt(makeFIrstData);
            nodesSet(makeFIrstData);
            setAcceptTAC(data?.community_public_template || false)
          }

          if (data?.straico_file_url) {
            setFileUrl(data.straico_file_url);
          }
          if (data?.paper_analysis_data) {
            setAnalysisData(data.paper_analysis_data);
          }
        } else {
          toast.error(templateInfo?.data?.message );
        }
      } catch (error: any) {
        toast.error(error?.templateInfo?.data?.message || error?.message || "An error occurred");
      }
    }
  };

  const tempSave = () => {
    const checkNode = nodes.map((value: any, index: number) => { return { id: index + 1, position: value.position, question: value.data.promptQuestions } })
    const modifyEditPrompt = {
      ...editPrompt,
      promptQuestion: checkNode
    }
    const saveTemplateData = detailItems.map((value: any) => {
      return value.id == editPrompt.id ? modifyEditPrompt : value
    })
    setDetailItems(saveTemplateData)
    setRestoreBox(false)
    setSaveChanges(true)
    setNodes((nds) =>
      nds.map((node) => {
        return { ...node, data: { ...node.data, changed: [] } };
      })
    );
  }



  const restore = () => {
    const restoreTemplateData = detailItems.find((value: any) => {
      return value.id == editPrompt.id
    })
    setEditPrompt(restoreTemplateData)
    nodesSet(restoreTemplateData);
    setRestoreBox(false)
    setRefreshCheckSection([])
    setSaveChanges(false)
    setNodes((nds) =>
      nds.map((node) => {
        return { ...node, data: { ...node.data, changed: [] } };
      })
    );
  }

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => {
        const newEdges = addEdge(
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
        );
        setTimeout(() => addToHistory(), 100);
        return newEdges;
      }),
    []
  );

  const onNodesDelete = useCallback(
    (deleted: any) => {
      addToHistory();
      let remainingNodes = [...nodes];
      setEdges(
        deleted.reduce((acc: any, node: any) => {
          const incomers = getIncomers(node, remainingNodes, acc);
          const outgoers = getOutgoers(node, remainingNodes, acc);
          const connectedEdges = getConnectedEdges([node], acc);

          const remainingEdges = acc.filter((edge: any) => !connectedEdges.includes(edge));

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
              animated: true,
              style: { stroke: "rgb(119, 119, 119)" },
              markerEnd: {
                type: "arrowclosed",
                color: "black",
                markerWidth: 50,
                markerHeight: 20,
                strokeWidth: 5,
              },
            })),
          );
    setRestoreBox(true)
    setSaveChanges(false)
          remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);

          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges]
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
      }] as PromptQuestionType[]
      const mockJson = {
        id: uuidv4(),
        promptKey: fieldName,
        conversionPromptKey: toPascalCaseWithUnderscore(fieldName),
        promptQuestion: firstPrompt,
        type: "contents",
      };
      setRefreshCheckSection((prev: any[] = []) => {
        if (!prev.includes(mockJson?.id)) {
          return [...prev, mockJson.id];
        }
        return prev;
      });
      setEditPrompt(mockJson);
      nodesSet(mockJson);
      copyValue.push(mockJson as Item);
      setDetailItems(copyValue);
      updateNodes(firstPrompt);
    }
    setEditMode(false);
    manageFieldNameModel();
    setFieldName("");
    setContentOpen(false)
  };

  const editContentName = (item: any) => {
    setEditMode(true);
    setContentOpen(true)

    manageFieldNameModel();
    changeContentName(item.promptKey);
  };

  const changePromptKey = (item: Item) => {
    setEditPrompt(item);
    nodesSet(item);
    setRestoreBox(false)
    setSaveChanges(true)
    setRefreshCheckSection([])
    setNodes((nds) =>
      nds.map((node) => {
        return { ...node, data: { ...node.data, changed: [] } };
      })
    );
    setNodes((nds) =>
      nds.map((node) => {
        return { ...node, data: { ...node.data, changed: [] } };
      })
    );
  };
  
  const nodesSet = (item: Item) => {
 const checkNewData=detailItems?.find((value: any) => value?.id == editPrompt?.id)
     const changed = getChangedQuestionIds(checkNewData?.promptQuestion || [], editPrompt?.promptQuestion || []);
    const refetchFinalQuestion = item?.promptQuestion?.map(
      (value: promptQuestion, index: number) => {
        const createID = value.id;
        return {
          id: createID.toString(),
          type: "selectorNode",
          data: {
            changed:changed,
            onDelete,
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
    if (templateTitle || templateData?.template_name) {
      saveTemplate(detailItems);
    } else {
      setErrorMessage(
        "Please give a meaningful display name this template represents, 12 characters or less."
      );
    }
  };

  const saveTemplate = async (editNewItem: any) => {
    const generatedTemplate = generateHandlingTemplate(editNewItem, templatePrompt, responseType);

    try {
      const response: any = await updateTemplates({
        template_title: templateTitle || `${templateData?.template_name} template`,
        template_json_data: editNewItem,
        template_prompt: generatedTemplate,
        ai_model: selectedModel,
        community_public_template: acceptTAC,
        responsetype: responseType,
        templatelanguage: selectTemplateLanguage,
        humanizetemplate: humanizeTemplateText,
        humanizetemplateinput: humanizeTemplateTxt,
        paper_analysis_data: analysisData,
      }, templateId as any);
      if (response?.data?.isSuccess) {
        toast.success("Template prompt added successfully!");
        backNavigation();
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
    }
  };

  const backNavigation = () => {
    router.push("/account/templates");
  };

  const addQuestion = () => {
    setEditPrompt((prevPrompt: editPromptType) => {
      if (prevPrompt) {
        const updatedPromptQuestions = [...prevPrompt.promptQuestion,] as PromptQuestionType[];
        updatedPromptQuestions.push({id: updatedPromptQuestions.length + 1,question: "",} as PromptQuestionType);
        updateNodes(updatedPromptQuestions);
        return {...prevPrompt,promptQuestion: updatedPromptQuestions,};
      }
      return prevPrompt;
    });
  };

  const updateNodes = (updatedPromptQuestions: PromptQuestionType[]) => {
 const checkNewData=detailItems?.find((value: any) => value?.id == editPrompt?.id)
     const changed = getChangedQuestionIds(checkNewData?.promptQuestion || [], editPrompt?.promptQuestion || []);
    const refetchFinalQuestion = updatedPromptQuestions?.map(
      (value: PromptQuestionType, index: number) => {
        const createID = value.id;
        return {
          id: createID.toString(),
          type: "selectorNode",
          data: {
            changed:changed,
            onDelete,
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

    setTimeout(() => {
      addToHistory();
    }, 100);
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
    if (change[0].type === "position" && change[0].dragging === false) {
      setTimeout(() => {
        addToHistory();
      }, 100);
    }
  };


  const addToHistory = () => {
    const currentState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    };

    if (currentHistoryIndex < history.length - 1) {
      setHistory(history.slice(0, currentHistoryIndex + 1));
    }

    setHistory(prev => [...prev, currentState]);
    setCurrentHistoryIndex(prev => prev + 1);
  };

  const removePreviewKey = (obj: any, keyToRemove: any) => {
    const copy = { ...obj }; ``
    delete copy[keyToRemove];
    return copy;
  }

  const removeKey = () => {
    const updateKey = detailItems.filter((value: Item | any) => {
      return value.id !== deleteKey;
    });
    const findKey = detailItems.find((value: Item | any) => {
      return value.id == deleteKey;
    });
    const updatedAnalysisData = removePreviewKey(analysisData, findKey.promptKey.replace(/\s+/g, ''));

    setAnalysisData(updatedAnalysisData);
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
      const driverObjGuide = driver({
        showProgress: true,
        allowClose: true,
        stagePadding: 8,
        smoothScroll: true,
        animate: true,
        steps: [
          {
            element: "#template-name",
            popover: {
              title: "Template Information",
              description: "This header shows the template's name and other key metadata extracted from your document.",
            },
          },
          {
            element: "#template-sections-panel",
            popover: {
              title: "Template Sections",
              description: "Here are the different content sections of your template. Click on one to load its questions into the editor.",
            },
          },
          {
            element: "#manage-sections-btn",
            popover: {
              title: "Manage Sections",
              description: "Click here to add new content sections or rename existing ones.",
            },
          },
          {
            // This is the new step for deleting a single section
            element: ".individual-section-delete-btn",
            popover: {
              title: "Delete a Section",
              description: "Click the minus icon next to any section to remove it individually. A confirmation will appear.",
            },
          },
          {
            element: "#remove-all-contents-btn",
            popover: {
              title: "Remove All Contents",
              description: "Use this button to quickly delete all custom sections you've added. A confirmation with a safety timer will appear to prevent accidents."
            }
          },
          {
            element: "#prompt-editor-panel",
            popover: {
              title: "Prompt Editor",
              description: "This is the main workspace. Here you can edit the questions for the selected section. You can also drag the nodes to rearrange their positions.",
            },
          },
          {
              element: "#add-question-btn",
              popover: {
                title: "Add a Question",
                description: "Click the plus button to add a new question node to the flow for the current section.",
              },
            },
          {
            element: "#advanced-actions-toggle",
            popover: {
              title: "Advanced Actions",
              description: "Check this box to reveal advanced settings on each question node, allowing for more specific instructions like changing the response type or language.",
            },
          },
          {
            element: "#preview-panel-toggle",
            popover: {
              title: "Toggle Preview",
              description: "Click the arrow to show or hide the preview panel, where you can see the AI-generated content.",
            },
          },
          {
            element: "#preview-panel",
             popover: {
               title: "Regenerate Preview",
               description: "After editing questions, click here to update the preview with the latest AI-generated responses.",
             },
           },
          {
            element: "#template-settings-btn",
            popover: {
              title: "Global Settings",
              description: "Configure global settings for the entire template, such as making it public or setting the default response style.",
            },
          },
          {
            element: "#save-template-btn",
            popover: {
              title: "Save Your Template",
              description: "When you've finished making all your changes, click here to save the entire template.",
            },
          },
        ],
      });
      driverObjGuide.drive();
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

  const acceptCheckBox = () => {
    setAcceptTAC(!acceptTAC)
  };
  const acceptTermAndCondation = () => {
    setAcceptCondation(!acceptCondation)
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

  const manageTACModel = () => {
    setOpenTACModel(!openTACModel);
  };

  const fieldConfig = [
    {
      key: "Title",
      label: "TITLE",
      fallback: "Title Lorem Ipsum",
      value: (data: any) => data?.Title?.[0],
    },
    {
      key: "Authors",
      label: "AUTHORS",
      fallback: "Henry M. Kim, Iryna Gel",
      value: (data: any) => data?.Authors?.join(', '),
    },
    {
      key: "JournalName",
      label: "JOURNAL NAME",
      fallback: "Journal Lorem Ipsum",
      value: (data: any) => data?.JournalName?.[0],
    },
    {
      key: "PublicationDate",
      label: "PUBLICATION DATE",
      fallback: "01/01/2024",
      value: (data: any) =>
        data?.PublicationDate?.[0]
          ? moment(data.PublicationDate[0], "MMMM YYYY").format("DD/MM/YYYY")
          : "",
    },
    {
      key: "DOI",
      label: "DOI",
      fallback: "vb54e-e5h6e5-5e6hj5",
      value: (data: any) => { 
        return data?.DOI[0] 
      }
    },
    {
      key: "Volume",
      label: "VOLUME",
      fallback: "1",
      value: (data: any) => { 
        return data?.Volume[0]
      }
    },
    {
      key: "Issue",
      label: "ISSUE",
      fallback: "1",
      value: (data: any) => { 
     return data?.Issue[0]}
    },
  ];

  const changePreview = () => {
    setShowPreview(!showPreview)
  }

  const selectSetting = (settingValue: string) => {
    setSettingOption(settingValue)
  }

  const manageSections = () => {
    setContentOpen(!contentOpen)
  }

  const manageReArrange = () => {
    const mainKey = detailItems.map((value: any) => {
      return value.promptKey.replace(/\s+/g, '');
    });
    const mainKeySet = new Set(mainKey);

    const orderedEntries = mainKey
      .filter((key: any) => key in analysisData)
      .map((key: any) => [key, analysisData[key]]);

    const remainingEntries = Object.entries(analysisData).filter(
      ([key]) => !mainKeySet.has(key)
    );
    const reorderedData = Object.fromEntries([...orderedEntries, ...remainingEntries]);
    setAnalysisData(reorderedData)
  }

  const refetchAIResponse = async () => {
    if (dragSection) {
      manageReArrange()
    } 
     if (refreshCheckSection.length > 0) {
      // manageReArrange()
      setLoading(true);
      try {
        const filterPreview = detailItems.filter((value: any) =>
          refreshCheckSection.includes(value.id)
        );

        const keyPrompt = filterPreview.map((value: any) => {
          const questions = value.promptQuestion
            .map((q: { question: string }) => `- ${q.question}.\n`)
            .join("");
          return `- **${value?.promptKey}**:\n${questions}`;
        });

        const generateTemplateData = await updatePromptTemplates({
          filterPreview,
          keyPrompt,
          templatePrompt,
          file_url,
        });

        const cleaned = Object.fromEntries(
          Object.entries(generateTemplateData?.data?.data || {}).map(([key, value]) => [key.replace(/\s+/g, ''), value])
        );
        let mainData = { ...analysisData };

        Object.entries(cleaned).forEach(([key, value]) => {
          if ((key in mainData)) {
            if (key in mainData) {
              mainData[key] = value;
            }
          } else {
            mainData[key] = value;
          }
        });

        setAnalysisData(mainData);
        setRefreshCheckSection([]);
        toast.success("Regenerate Template prompt added successfully!");
      } catch (error: any) {
        toast.success(error?.generateTemplateData?.data?.message || error?.message || "An error occurred");
        console.error("Error in refetchAIResponse:", error);
      } finally {
        setLoading(false);
      }
    }
    setDragSection(false)
  };

  const removeAllContents = () => {
 const mainData = detailItems.filter((item: any) => item.type !== "contents").map((value: any) => value.promptKey.replace(/\s+/g, ''))

    let cloneMainData = { ...analysisData };

    const cleanedData = Object.fromEntries(Object.entries(cloneMainData).filter(([key]) => mainData.includes(key)));

    setAnalysisData(cleanedData)
    setDetailItems([]);
    closeRemoveAllDialog();
  }

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setDetailItems((prevItems: DetailItem[]) => {
      const constantData = prevItems.filter((item: any) => item.type !== "detail")
      const detailData = prevItems.filter((item: any) => item.type == "detail")
      const updatedItems = [...constantData];
      const draggedItem = updatedItems[dragIndex];
      updatedItems.splice(dragIndex, 1);
      updatedItems.splice(hoverIndex, 0, draggedItem);
      setDragSection(true);
      return [...detailData, ...updatedItems];
    });
  }, []);

  const handleResponseTypeChange = (value: string  ) => {
      setChangeSetting(true);
      setSelectorResponseType(value);
  };

  const promptBoxGuide = () => {

    return (<>
      <div style={{}}>
        <div style={{ height: "85vh", position: 'relative' }} >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={newOnNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            style={{ background: "#F2F2F1" }}
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
            {/* <Background /> */}
            <Panel position="top-right" className="flex mr-0">
              <div id="add-node-btn" className="button-full cursor-pointer select-none text-nowrap flex items-center gap-1 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-2"
                onClick={() => {
                  if (editPrompt) {
                    addQuestion();
                  } else {
                    toast.error("Please select a template section first");
                  }
                }}
                style={promptQuestionCheck ? { pointerEvents: "none", opacity: "0.6" } : {}}
              >
                Add Node
              </div>
              <div id="restore-template-btn"
                className={`button-full select-none text-nowrap flex items-center gap-1 px-2 py-2 rounded-full transition-colors mr-2 ${templateId && restoreBox ? 'cursor-pointer bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-gray-400 text-gray-200'}`}
                style={!restoreBox ? { pointerEvents: "none", opacity: "0.6" } : {}}
                onClick={() => {
                  if (templateId) {
                    restore();
                  } else {
                    toast.error("No template to restore");
                  }
                }}
              >
                Restore
              </div>
              <div className="flex flex-col items-start">
                <div id="save-template-btn"
                  className="button-full cursor-pointer select-none text-nowrap flex items-center gap-1 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-2"
                  onClick={() => tempSave()}
                  style={ refreshCheckSection.length === 0 || saveChanges? { pointerEvents: "none", opacity: 0.6 }: {}}
                >
                  Save
                </div>
                {refreshCheckSection.length > 0 && !saveChanges && (
                  <span className="text-xs italic text-gray-400 font-semibold">
                    Unsaved changes
                  </span>
                )}
              </div>
              {/* <div id="undo-btn" 
                      className={`button-full select-none text-nowrap flex items-center gap-1 px-2 py-2 rounded-full transition-colors mr-2 ${currentHistoryIndex > 0 ? 'cursor-pointer bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-gray-400 text-gray-200'}`}
                      onClick={undo}
                      title="Undo (Ctrl+Z)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7v6h6"></path>
                        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                      </svg>
                      Undo
                    </div> */}
              {/* <div id="redo-btn" 
                      className={`button-full select-none text-nowrap flex items-center gap-1 px-2 py-2 rounded-full transition-colors mr-2 ${currentHistoryIndex < history.length - 1 ? 'cursor-pointer bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-gray-400 text-gray-200'}`}
                      onClick={redo}
                      title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 7v6h-6"></path>
                        <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
                      </svg>
                      Redo
                    </div> */}
            </Panel>
            <Controls position="top-right" style={{ color: "#007bff", marginTop: '85px' }} />
          </ReactFlow>
          {isDefineModalOpen && <div className="animate-grow-down" style={{ position: 'absolute', bottom: '0px', width: '100%', borderTop: '1px solid rgb(229, 229, 229)' }}>
            <div className=" flex items-center justify-center bg-black/50">
              <div className="bg-white w-[100%] p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">TEXT OUTPUT SETTINGS</h2>
                  <button onClick={manageQuestionModel} className="text-gray-500 hover:text-gray-700 text-xl">
                    <X className="size-6" />
                  </button>
                </div>

                <div className="mb-4">
                  {/* <label className="block text-sm font-medium text-gray-700 mb-1 ">
                          Maximum characters:
                        </label> */}


                  {/* <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535]">
                      {" "}
                      Maximum characters:
                    </label> */}
                  {/* <div className="px-[7px]">
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
                    </div> */}
                  {/* <Input
                          style={{ outline: 'none', boxShadow: 'none' }}
                          id="myTextField"
                          className="w-max mt-2 dark:bg-[#f6f6f6] mb-2"
                          value={String(selectRange)}
                          type="number"
                          onChange={(e) => {
                            setSelectRange(Number(e.target.value));
                          }}
                        /> */}
                  {/* <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535] ">
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
                          &nbsp;&nbsp;{`Expand Custom Instruction (Optional)`}
                        </label>

                        {InstructionsTxt && (
                          <Textarea
                          style={{ outline: 'none', boxShadow: 'none' }}
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
                        )} */}
                  <label className="not-italic block mb-2 font-size-md text-sm font-medium dark:text-white ">
                    {" "}
                    Response type:
                  </label>
                  <div className="inline-flex items-center py-1">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        checked={selectorResponseType == 'concise'}
                        value='concise'
                        onChange={(e) => {
                          handleResponseTypeChange('concise')
                        }}
                        type="radio"
                        className="peer h-5 w-5 cursor-pointer rounded-full border border-[#d8e8ff] transition-all"
                      />
                      <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                    </label>
                    <label className="not-italic block text-sm font-medium  dark:text-white">
                      &nbsp; Concise &nbsp;&nbsp;
                    </label>
                  </div>
                  <div className="inline-flex items-center py-1">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        checked={selectorResponseType == 'none'}
                        value="none"
                        onChange={(e) => {
                          handleResponseTypeChange('none')
                        }}
                        type="radio"
                        className="peer h-5 w-5 cursor-pointer rounded-full border border-[#d8e8ff] transition-all"
                        id="react"
                      />
                      <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                    </label>
                    <label className="not-italic block text-sm font-medium  dark:text-white">
                      {" "}
                      &nbsp; Standard (Default) &nbsp;&nbsp;
                    </label>
                  </div>
                  <div className="inline-flex items-center py-1">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        checked={selectorResponseType == 'detailed'}
                        value='detailed'
                        onChange={(e) => {
                          handleResponseTypeChange('detailed')
                        }}
                        type="radio"
                        className="peer h-5 w-5 cursor-pointer rounded-full border border-[#d8e8ff] transition-all"
                        id="react"
                      />
                      <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                    </label>
                    <label className="not-italic block text-sm font-medium dark:text-white">
                      {" "}
                      &nbsp; Detailed &nbsp;&nbsp;
                    </label>
                  </div>
                  <Separator className="my-4" />

                  <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535]">
                    <input
                      type="checkbox"
                      checked={humanizeText}
                      onChange={() => {
                        setChangeSetting(true);
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
                    &nbsp;&nbsp;{`Custom Instruction`}
                  </label>

                  {humanizeTxtBox && (
                    <Textarea
                      style={{ outline: 'none', boxShadow: 'none' }}
                      ref={textAreaRef}
                      className="h-8 mt-2 mb-2 w-[350px] overflow-y-hidden dark:bg-[#f6f6f6]"
                      placeholder="Enter text"
                      value={humanizeTxt}
                      onChange={(
                        e: React.ChangeEvent<HTMLTextAreaElement>
                      ) => {
                        setChangeSetting(true);
                        setHumanizeTxt(e.target.value);
                      }}
                    />
                  )}
                  <Separator className="my-4" />

                  <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Change Language
                  </label>
                  <form className="max-w-sm">
                    <select
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:bor.mx-autoder-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={selectLanguage}
                      onChange={(e) => {
                        setChangeSetting(true)
                        setSelectLanguage(e.target.value)
                      }}
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



                  {/* <textarea
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        rows={3}
                        placeholder="Add custom instruction here"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                      />
                      <p className="text-xs text-gray-400 mt-1">Suggested Length (~200 characters)</p> */}
                </div>

                {/* Checkboxes */}
                {/* <div className="mb-4 space-y-2">
                      <label className="flex items-center space-x-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={humanize}
                          onChange={() => setHumanize(!humanize)}
                          className="form-checkbox text-blue-600"
                        />
                        <span>Humanize Text</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={translate}
                          onChange={() => setTranslate(!translate)}
                          className="form-checkbox text-blue-600"
                        />
                        <span>Translate to selected language</span>
                      </label>
                    </div> */}

                {/* Language Dropdown */}
                {/* <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LANGUAGE
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                      >
                        <option value="">Select language</option>
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="ar">Arabic</option>
                        <option value="fr">French</option>
                      </select>
                    </div> */}

                <div className="flex justify-end space-x-4">
                  <Button className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] mr-3 hover:text-[#0E70FF] " type="button" onClick={() => {
                    manageQuestionModel();
                    setDropdownOpen(false);
                  }} variant="outline">
                    Cancel
                  </Button>

                  <Button type="submit" disabled={!changeSetting} className="rounded-[26px] btn dark:text-white" onClick={addSelectedPromptQuestion}>
                    Add Settings
                  </Button>

                </div>
              </div>
            </div>
          </div>}
        </div>

      </div>
    </>)
  }

  
  const promptBox = () => {

    return (<>
      <div className=" rounded-tr-[16px] flex">

        {!showPreview && <div className="rounded-tr-[16px] p-4 pb-0 font-medium text-[16px] text-[#333333] bg-white border-b-[2px] border-[#E5E5E5] w-[23rem] dark:bg-[#1a282e]" >
          <div className="flex items-center dark:text-[#ffffff]">
            <div className="flex">
              <ChevronDown className="text-[#0E70FF] rotate-270 size-5 mr-2 cursor-pointer " onClick={() => changePreview()} style={{ transform: 'rotate(270deg)' }} />Preview</div>
            &nbsp;&nbsp;
            <div className="flex items-center">
              <div className="button-full cursor-pointer select-none text-nowrap flex items-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-4"
                onClick={() => { refetchAIResponse() }}
                style={refreshCheckSection.length > 0 || dragSection && !loading ? {} : { pointerEvents: "none", opacity: "0.6" }}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </div>
            </div>
          </div>
        </div>}

        <div className="bg-[#DEE6F1] lg:rounded-tr-[16px] rounded-tr-[0px] p-4 py-3 flex w-full justify-between dark:bg-[#1a282e]" style={{ fontWeight: 500, fontSize: '16px', color: '#333333' }}>
          <div className="flex items-center dark:text-[#ffffff]">
            {editPrompt?.promptKey}
          </div>
          <div id="advanced-actions-toggle" className="text-base font-normal flex items-center">
            <div className="flex items-center">
              <div id="add-question-btn" className="button-full cursor-pointer select-none text-nowrap flex items-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-4"
                onClick={() => { addQuestion(); }}
                style={promptQuestionCheck ? { pointerEvents: "none", opacity: "0.6" } : {}}
              >
                <Plus className="h-4 w-4" />
              </div>
            </div>
            {showToolBox ? (<span style={{ backgroundColor: '#0E70FF', borderRadius: '3px', margin: '0px 2px' }}>
              <Check className="size-5 tex-[#ffffff] cursor-pointer" style={{ color: '#ffffff' }} onClick={() => { editPrompt.promptQuestion.length > 0 && clickBox(); }} />
            </span>) :
              <Square className="size-6 tex-[#CCCCCC] cursor-pointer" style={{ color: '#CCCCCC' }} onClick={() => { editPrompt.promptQuestion.length > 0 && clickBox() }} />}
            {/* <input
                  type="checkbox"
                  disabled={ editPrompt?.promptQuestion ? editPrompt.promptQuestion.length > 0 ? false : true : true}
                  checked={showToolBox}
                  onChange={() => { clickBox();}}
                /> */}
            {" "}
            &nbsp;<span className="text-[#333333] dark:text-[#CCCCCC]" style={{    fontFamily: '__Poppins_6bee3b'}}>Advanced Action</span>
          </div>
        </div>
      </div>
      <div style={{}}>
        <div style={{ height: "85vh", position: 'relative' }} >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={newOnNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            style={{ background: "#F2F2F1" }}
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
            {/* <Background /> */}
            <Panel position="top-right" className="flex mr-0">
             <div id="add-node-btn" className="button-full cursor-pointer select-none text-nowrap flex items-center gap-1 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-2"
                onClick={() => {
                  if (editPrompt) {
                    addQuestion();
                    // toast.success("New node added");
                  } else {
                    toast.error("Please select a template section first");
                  }
                }}
                style={promptQuestionCheck ? { pointerEvents: "none", opacity: "0.6" } : {}}
              >
                Add Node
              </div>
            <div id="restore-template-btn"
                className={`button-full select-none text-nowrap flex items-center gap-1 px-2 py-2 rounded-full transition-colors mr-2 ${templateId && restoreBox ? 'cursor-pointer bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-gray-400 text-gray-200'}`}
                style={!restoreBox ? { pointerEvents: "none", opacity: "0.6" } : {}}
                onClick={() => {
                  if (templateId) {
                    restore();
                  } else {
                    toast.error("No template to restore");
                  }
                }}
              >
                Restore
              </div>
              <div className="flex flex-col items-start">
                <div id="save-template-btn"
                  className="button-full cursor-pointer select-none text-nowrap flex items-center gap-1 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-2"
                  onClick={() => tempSave()}
                  style={ refreshCheckSection.length === 0 || saveChanges? { pointerEvents: "none", opacity: 0.6 }: {}}
                >
                  Save
                </div>
                {refreshCheckSection.length > 0 && !saveChanges && (
                  <span className="text-xs italic text-gray-400 font-semibold">
                    Unsaved changes
                  </span>
                )}
              </div>
            </Panel>
            <Controls position="top-right" style={{ color: "#007bff", marginTop: '85px' }} />
          </ReactFlow>
          {isDefineModalOpen && <div className="animate-grow-down" style={{ position: 'absolute', bottom: '0px', width: '100%', borderTop: '1px solid rgb(229, 229, 229)' }}>
            <div className=" flex items-center justify-center bg-black/50">
              <div className="bg-white w-[100%] p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">TEXT OUTPUT SETTINGS</h2>
                  <button onClick={manageQuestionModel} className="text-gray-500 hover:text-gray-700 text-xl">
                    <X className="size-6" />
                  </button>
                </div>

                <div className="mb-4">
                  {/* <label className="block text-sm font-medium text-gray-700 mb-1 ">
                          Maximum characters:
                        </label> */}


                  {/* <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535]">
                      {" "}
                      Maximum characters:
                    </label> */}
                  {/* <div className="px-[7px]">
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
                    </div> */}
                  {/* <Input
                          style={{ outline: 'none', boxShadow: 'none' }}
                          id="myTextField"
                          className="w-max mt-2 dark:bg-[#f6f6f6] mb-2"
                          value={String(selectRange)}
                          type="number"
                          onChange={(e) => {
                            setSelectRange(Number(e.target.value));
                          }}
                        /> */}
                  {/* <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535] ">
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
                          &nbsp;&nbsp;{`Expand Custom Instruction (Optional)`}
                        </label>

                        {InstructionsTxt && (
                          <Textarea
                          style={{ outline: 'none', boxShadow: 'none' }}
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
                        )} */}
                  <label className="not-italic block mb-2 font-size-md text-sm font-medium dark:text-white ">
                    {" "}
                    Response type:
                  </label>
                  <div className="inline-flex items-center py-1">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        checked={selectorResponseType == 'concise'}
                        value='concise'
                        onChange={(e) => {
                          handleResponseTypeChange('concise')
                        }}
                        type="radio"
                        className="peer h-5 w-5 cursor-pointer rounded-full border border-[#d8e8ff] transition-all"
                      />
                      <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                    </label>
                    <label className="not-italic block text-sm font-medium  dark:text-white">
                      &nbsp; Concise &nbsp;&nbsp;
                    </label>
                  </div>
                  <div className="inline-flex items-center py-1">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        checked={selectorResponseType == 'none'}
                        value="none"
                        onChange={(e) => {
                          handleResponseTypeChange('none')
                        }}
                        type="radio"
                        className="peer h-5 w-5 cursor-pointer rounded-full border border-[#d8e8ff] transition-all"
                        id="react"
                      />
                      <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                    </label>
                    <label className="not-italic block text-sm font-medium  dark:text-white">
                      {" "}
                      &nbsp; Standard (Default) &nbsp;&nbsp;
                    </label>
                  </div>
                  <div className="inline-flex items-center py-1">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        checked={selectorResponseType == 'detailed'}
                        value='detailed'
                        onChange={(e) => {
                          handleResponseTypeChange('detailed')
                        }}
                        type="radio"
                        className="peer h-5 w-5 cursor-pointer rounded-full border border-[#d8e8ff] transition-all"
                        id="react"
                      />
                      <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                    </label>
                    <label className="not-italic block text-sm font-medium dark:text-white">
                      {" "}
                      &nbsp; Detailed &nbsp;&nbsp;
                    </label>
                  </div>
                  <Separator className="my-4" />

                  <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535]">
                    <input
                      type="checkbox"
                      checked={humanizeText}
                      onChange={() => {
                        setChangeSetting(true);
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
                    &nbsp;&nbsp;{`Custom Instruction`}
                  </label>

                  {humanizeTxtBox && (
                    <Textarea
                      style={{ outline: 'none', boxShadow: 'none' }}
                      ref={textAreaRef}
                      className="h-8 mt-2 mb-2 w-[350px] overflow-y-hidden dark:bg-[#f6f6f6]"
                      placeholder="Enter text"
                      value={humanizeTxt}
                      onChange={(
                        e: React.ChangeEvent<HTMLTextAreaElement>
                      ) => {
                        setChangeSetting(true);
                        setHumanizeTxt(e.target.value);
                      }}
                    />
                  )}
                  <Separator className="my-4" />

                  <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Change Language
                  </label>
                  <form className="max-w-sm">
                    <select
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:bor.mx-autoder-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={selectLanguage}
                      onChange={(e) => {
                        setChangeSetting(true)
                        setSelectLanguage(e.target.value)
                      }}
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



                  {/* <textarea
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        rows={3}
                        placeholder="Add custom instruction here"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                      />
                      <p className="text-xs text-gray-400 mt-1">Suggested Length (~200 characters)</p> */}
                </div>

                {/* Checkboxes */}
                {/* <div className="mb-4 space-y-2">
                      <label className="flex items-center space-x-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={humanize}
                          onChange={() => setHumanize(!humanize)}
                          className="form-checkbox text-blue-600"
                        />
                        <span>Humanize Text</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={translate}
                          onChange={() => setTranslate(!translate)}
                          className="form-checkbox text-blue-600"
                        />
                        <span>Translate to selected language</span>
                      </label>
                    </div> */}

                {/* Language Dropdown */}
                {/* <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LANGUAGE
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                      >
                        <option value="">Select language</option>
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="ar">Arabic</option>
                        <option value="fr">French</option>
                      </select>
                    </div> */}

                <div className="flex justify-end space-x-4">
                  <Button className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] mr-3 hover:text-[#0E70FF] " type="button" onClick={() => {
                    manageQuestionModel();
                    setDropdownOpen(false);
                  }} variant="outline">
                    Cancel
                  </Button>

                  <Button type="submit" disabled={!changeSetting} className="rounded-[26px] btn dark:text-white" onClick={addSelectedPromptQuestion}>
                    Add Settings
                  </Button>

                </div>
              </div>
            </div>
          </div>}
        </div>

      </div>
    </>)
  }

  const promptView = () => {
    return (<>
      <div className='p-4 pt-0'>
        <Card
          className="overflow-hidden w-full h-full flex flex-col max-h-[83dvh] overflow-y-auto"
          x-chunk="dashboard"
          style={{ border: 'none' }} >
          <CardContent className="p-0 text-sm h-full dark:bg-[#1a282e]">
            {/* <div className="p-3  items-center gap-2 p-4 pt-4  px-4 bg-[#F1F1F1] dark:bg-[#152428]">
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
                  </div> */}
            <div className="">
              {/* <div className="flex flex-col gap-y-1">
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
                    </div> */}
              {analysisData &&
                Object.entries(analysisData).map(
                  ([key, value]: any, index: number) => {
                    if (
                      !["Volume",
                        "Issue",
                        "DOI",
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
                              borderRadius: '2px',
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
                                (lineValue: string, index: number) => {
                                  return (
                                    <div className="flex" key={index}>
                                      <RxDotFilled
                                        width="30px"
                                        height="30px"
                                        className="dark:text-[#CCCCCC] text-[#333333] m-[0.3rem_8px] min-w-fit"
                                      />
                                      <div className="text-sm dark:text-[#CCCCCC]">
                                        {lineValue}
                                      </div>
                                    </div>
                                  )
                                }
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
                    )}
                  }
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>)
  } 
  return (
    <>
      <div className=" w-full justify-between bg-[#F1F1F1] py-4 px-6 dark:bg-[#1a2a2e]" id="template-name">
        <div className="w-full sm:w-auto flex flex-wrap items-center">
          <HeaderTitle name={`${templateName}`} />
        </div>
        <div className="flex flex-col gap-4 md:flex-row w-full">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {fieldConfig.map(({ key, label, fallback, value }) => {
              const fieldValue = value(analysisData);
              if (!fieldValue) return null;

              return (
                <div key={key} className="w-full p-2">
                  <label className="block mb-1 text-[13px] font-semibold text-[#999999] dark:text-[#CCCCCC] ">
                    {label}
                  </label>
                  <div className="text-[16px] font-normal text-[#333333] dark:text-white max-w-full">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate text-ellipsis overflow-hidden whitespace-nowrap cursor-default max-w-[500px]">
                            {fieldValue || fallback}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          className="border border-tableBorder text-left text-[13px] z-10 rounded bg-headerBackground px-3 py-2 text-darkGray max-w-[500px] break-words"
                          side="top"
                          align="start"
                        >
                          {fieldValue || fallback}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-px self-stretch bg-[#CCCCCC] dark:bg-[#FFFFFF] mx-4"></div>

          <div className="flex items-center content-between ">

            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger id="public-settings-btn">
                <div id="template-settings-btn"
                  onClick={() => setDropdownOpen(true)}
                  className="border border-[#E5E5E5] p-1.5 cursor-pointer mr-5 text-[#333333] dark:border-[#FFFFFF] font-medium"
                  style={{ borderRadius: '25px', background: 'linear-gradient(to top, #F0F0F0, #FFFFFF)' }}
                >
                  <SettingIcon />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-4 bg-inputBackground">
                <DropdownMenuLabel>PUBLIC SHARED SETTINGS</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="flex items-center justify-center bg-black/50 min-w-[400px] dark:bg-[#3a474b]">
                  <div className="bg-white dark:bg-[#3a474b] w-[100%] p-4">
                    <div className="mb-4 h-[285px] overflow-y-auto">
                      <label className="not-italic block mb-2 font-size-md text-sm font-medium dark:text-white ">
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
                            }}
                            name="framework"
                            type="radio"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#d8e8ff] checked:border-[#d8e8ff] transition-all"
                          />
                          <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                        </label>
                        <label className="not-italic block text-sm font-medium  dark:text-white">
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
                            }}
                            name="framework"
                            type="radio"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#d8e8ff] checked:border-[#d8e8ff] transition-all"
                            id="react"
                          />
                          <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                        </label>
                        <label className="not-italic block text-sm font-medium  dark:text-white">
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
                            }}
                            name="framework"
                            type="radio"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#d8e8ff] checked:border-[#d8e8ff] transition-all"
                            id="react"
                          />
                          <span className="absolute bg-[#0f6fff] w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
                        </label>
                        <label className="not-italic block text-sm font-medium dark:text-white">
                          {" "}
                          &nbsp; Detailed &nbsp;&nbsp;
                        </label>
                      </div>
                      <Separator className="my-4" />
                      <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#CCCCCC]">
                        <input
                          type="checkbox"
                          checked={humanizeTemplateText}
                          onChange={() => setHumanizeTemplateText(!humanizeTemplateText)}
                        />
                        &nbsp;&nbsp;Humanize text
                      </label>
                      <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#CCCCCC]">
                        <input
                          type="checkbox"
                          checked={humanizeTemplateTxtBox}
                          onChange={() => setHumanizeTemplateTxtBox(!humanizeTemplateTxtBox)}
                        />
                        &nbsp;&nbsp; Custom Instruction
                      </label>
                      {humanizeTemplateTxtBox && (
                        <Textarea
                          style={{ outline: 'none', boxShadow: 'none' }}
                          ref={textAreaRef}
                          className="h-8 mt-2 mb-2 w-[350px] overflow-y-hidden dark:text-[#CCCCCC]"
                          placeholder="Enter text"
                          value={humanizeTemplateTxt}
                          onChange={(e) => setHumanizeTemplateTxt(e.target.value)}
                        />
                      )}
                      <Separator className="my-4" />
                      <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Change Language
                      </label>
                      <form className="max-w-sm">
                        <select
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:bor.mx-autoder-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          value={selectTemplateLanguage}
                          onChange={(e) => setSelectTemplateLanguage(e.target.value)}
                        >
                          <option value="" selected disabled>
                            Select Language
                          </option>
                          {modelSupportedLanguages?.map((value, index) => (
                            <option key={index} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </form>
                      <Separator className="my-4" />
                    </div>
                    <div>
                      <label className="inline-flex items-center cursor-pointer text-sm font-medium text-gray-900 dark:text-[#CCCCCC]">
                        <input
                          disabled={false}
                          type="checkbox"
                          checked={acceptTAC}
                          className="sr-only peer "
                          onChange={() => { acceptCheckBox() }}
                        />

                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#ff9839]"></div> &nbsp;&nbsp; Make this template public
                      </label>
                    </div>
                    <div className="flex space-x-4 items-center">

                      {acceptCondation ? (
                        <span style={{ backgroundColor: '#0E70FF', borderRadius: '3px', margin: '0px 2px' }}>
                          <Check className="size-5 tex-[#ffffff] cursor-pointer" style={{ color: '#ffffff' }} onClick={() => { acceptTermAndCondation(); }} />
                        </span>
                      ) : (
                        <Square className="size-6 tex-[#CCCCCC] cursor-pointer" style={{ color: '#CCCCCC' }} onClick={() => { acceptTermAndCondation() }} />
                      )}

                      <Label htmlFor="name" style={{ marginLeft: '3px' }} className="dark:text-[#CCCCCC] ml-0 text-[#0E70FF] cursor-pointer" onClick={manageTACModel}>
                        &nbsp; Agree to terms & conditions
                      </Label>
                      <div>
                        <Button className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] mr-3 hover:text-[#0E70FF] dark:bg-[#3a474b]" type="button" onClick={() => setDropdownOpen(false)} variant="outline">
                          Cancel
                        </Button>
                        <Button type="submit" className="rounded-[26px] btn dark:text-white" onClick={addTemplatePrompt}>
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="button-full cursor-pointer select-none flex items-center gap-2 bg-blue-600 text-white px-4 py-4 rounded-full hover:bg-blue-700 transition-colors text-wrap"
              onClick={addNewPrompt}
              id="save-template-btn"
            >
              <Save className="h-5 w-5" />
              Save Template
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 24px' }} className="bg-[#fafafa] dark:bg-[#011117] ">
        <div className="flex  flex-col lg:flex-row w-full rounded-2xl dark:bg-[#1a282e] bg-[#ffffff] border border-[#E5E5E5] dark:border-[#E5E5E50F]" style={{ borderRadius: '16px' }}>
          <div className="w-full  md:w-[20%] lg:w-[18%] p-4 border-r-2 border-[#E5E5E5] dark:border-[#CCCCCC33]">
            <div style={{ fontWeight: 500, fontSize: '16px', color: '#333333' }}>
              <div className="flex justify-between">
                <span className="dark:text-[#ffffff]">Sections</span>
                <span id="manage-sections-btn" className="transform scale-y-[-1] cursor-pointer" onClick={() => { manageSections() }}>
                  <ExternalLink className="text-[#0e70ff] transform scale-x-[-1]" />
                </span>
              </div>
              <div className={`bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33]  w-full my-[10px] p-[1px] size-auto`}></div>
            </div>
            <div id="sections-container">
              {contentOpen && (<div className="mb-2">
                <div className="grid gap-2 relative">
                  <Label htmlFor="name" style={{ color: '#666666' }} className="text-[#666666] dark:text-[#CCCCCC]">CONTENT NAME</Label>
                  <Input
                    style={{ outline: 'none', boxShadow: 'none' }}
                    id="myTextField"
                    value={fieldName || ""}
                    onChange={(e) => {
                      changeContentName(e.target.value);
                    }}
                    autoFocus
                  />
                  {contentErrorMessage && <span className={`text-[#fd9100] text-[0.70rem]`}>
                    {contentErrorMessage}&nbsp;
                  </span>}
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  {/* <Button
                    onClick={() => {
                      manageFieldNameModel();
                      setEditMode(false);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button> */}
                  <Button className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] px-5 py-0 hover:text-[#0E70FF] "
                    type="button"
                    disabled={!fieldName}
                    onClick={addNewField}
                    variant="outline">
                    {editMode ? "Edit" : "Add"} Content
                  </Button>
                </div>
                <div className={`bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33]  w-full my-[10px] p-[1px] size-auto`}></div>
              </div>)}
              <div id="template-sections-panel" className="overflow-hidden max-h-[65dvh] overflow-y-auto">
                <DndProvider backend={HTML5Backend}>
                  {detailItems.filter((item: any) => item.type === "contents")
                    .map((item: any, index: number) => (
                      <DraggableItem
                        key={item.id}
                        index={index}
                        item={item}
                        moveItem={moveItem}
                        editPrompt={editPrompt}
                        changePromptKey={changePromptKey}
                        manageModel={manageModel}
                        editContentName={editContentName}
                      />
                    ))}
                </DndProvider>
              </div>
              <div className="flex justify-center" style={{marginTop:'75px'}}>
                <Button
                  id="remove-all-contents-btn"
                  title="Remove all contents"
                  variant="destructive"
                  style={{ borderRadius: '20px' }}
                  onClick={openRemoveAllDialog}
                  className="text-wrap"
                  disabled={detailItems.length == 4}
                >
                  Remove all contents
                </Button>
              </div>
            </div>
          </div>


          <div className="block sm:hidden">
            {showPreview && file_url && (<div className={`w-full md:none  lg:w-[40%]  p-4 pt-2.5 pb-0  ${showPreview ? `border-l-2 ` : `border-l-0`} border-[#E5E5E5] dark:border-[#CCCCCC33]`}>

              <div style={{ fontWeight: 500, fontSize: '16px', color: '#333333' }} className="pt-2.5">
                <div className="flex pl-4">
                  <div  className="flex items-center dark:text-[#ffffff]">
                    <ChevronDown className="text-[#0E70FF] dark:text-[#0E70FF] size-5 mr-2 cursor-pointer " onClick={() => changePreview()} />Preview</div>
                  &nbsp;&nbsp;
                  <div className="flex items-center">
                    <div id="regenerate-preview-btn" className="button-full cursor-pointer select-none text-nowrap flex items-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-4"
                      onClick={() => { refetchAIResponse() }}
                      style={refreshCheckSection.length > 0 || dragSection && !loading ? {} : { pointerEvents: "none", opacity: "0.6" }}
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </div>
                  </div>
                </div>
                <div className={`bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33]  w-full my-[14px] mt-[10px] p-[1px] size-auto`}> </div>
              </div>
              {promptView()}
            </div>)}

            <div className={`w-full ${showPreview ? file_url ? 'lg:w-[42%]' : 'lg:w-[80%] ' : 'lg:w-[80%]'}  ${showPreview ? `border-l-2 ` : `border-l-0`} border-[#E5E5E5] dark:border-[#CCCCCC33] `}>
              {promptBoxGuide()}
            </div>
          </div>
          <div className='hidden sm:block w-full'>
            {showPreview && file_url &&(<Splitter className="bg-transparent" style={{ width: '100%' }}>
              <SplitterPanel size={(showPreview && file_url) ? 50 : 0} minSize={(showPreview && file_url) ? 30 : 0}>

                <div className={`w-full  ${showPreview ? `border-l-2 ` : `border-l-0`} border-[#E5E5E5] dark:border-[#CCCCCC33] `}>

                  <div style={{ fontWeight: 500, fontSize: '16px', color: '#333333' }} className="pt-2.5">
                    <div className="flex pl-4">
                      <span id="preview-panel-toggle" className="flex">
                        <div className="flex items-center dark:text-[#ffffff]">
                          <ChevronDown className="text-[#0E70FF] dark:text-[#0E70FF] size-5 mr-2 cursor-pointer " onClick={() => changePreview()} />Preview</div>    </span>
                        &nbsp;&nbsp;
                        <div className="flex items-center">
                          <span id="preview-panel">
                            <div className="button-full cursor-pointer select-none text-nowrap flex items-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-4"
                              onClick={() => { refetchAIResponse() }}
                              style={refreshCheckSection.length > 0 || dragSection && !loading ? {} : { pointerEvents: "none", opacity: "0.6" }}
                            >
                              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            </div>
                          </span>
                        </div>
                    </div>
                    <div className={`bg-[#E5E5E5] bg-[lineColor] dark:bg-[#CCCCCC33]  w-full my-[14px] mt-[10px] p-[1px] size-auto`}> </div>
                  </div>
                  {promptView()}
                </div>
              </SplitterPanel>
              <SplitterPanel size={(showPreview && file_url) ? 50 : 100} minSize={(showPreview && file_url) ? 30 : 100} style={{ borderLeftWidth: '2px', borderColor: '#e5e5e5' }} className="bg-transparent">


                <div className="w-full  pb-0">
                  <div className=" rounded-tr-[16px] flex">

                    {!showPreview && <div className="rounded-tr-[16px] p-4 pb-0 font-medium text-[16px] text-[#333333] bg-white border-b-[2px] border-[#E5E5E5] w-[23rem] dark:bg-[#1a282e]" >
                      <div className="flex items-center dark:text-[#ffffff]">
                        <div className="flex">
                          <ChevronDown className="text-[#0E70FF] rotate-270 size-5 mr-2 cursor-pointer " onClick={() => changePreview()} style={{ transform: 'rotate(270deg)' }} />Preview</div>
                        &nbsp;&nbsp;
                        <div className="flex items-center">
                          <div className="button-full cursor-pointer select-none text-nowrap flex items-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-4"
                            onClick={() => { refetchAIResponse() }}
                            style={refreshCheckSection.length > 0 || dragSection && !loading ? {} : { pointerEvents: "none", opacity: "0.6" }}
                          >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                          </div>
                        </div>
                      </div>
                    </div>}

                    <div className="bg-[#DEE6F1] lg:rounded-tr-[16px] rounded-tr-[0px] p-4 py-3 flex w-full justify-between dark:bg-[#1a282e]" style={{ fontWeight: 500, fontSize: '16px', color: '#333333' }}>
                      <div className="flex items-center dark:text-[#ffffff]">
                        {editPrompt?.promptKey}
                      </div>
                      <div id="advanced-actions-toggle" className="text-base font-normal flex items-center">
                        <div className="flex items-center">
                          <div id="add-question-btn" className="button-full cursor-pointer select-none text-nowrap flex items-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-4"
                            onClick={() => { addQuestion(); }}
                            style={promptQuestionCheck ? { pointerEvents: "none", opacity: "0.6" } : {}}
                          >
                            <Plus className="h-4 w-4" />
                          </div>
                        </div>
                        {showToolBox ? (<span style={{ backgroundColor: '#0E70FF', borderRadius: '3px', margin: '0px 2px' }}>
                          <Check className="size-5 tex-[#ffffff] cursor-pointer" style={{ color: '#ffffff' }} onClick={() => { editPrompt.promptQuestion.length > 0 && clickBox(); }} />
                        </span>) :
                          <Square className="size-6 tex-[#CCCCCC] cursor-pointer" style={{ color: '#CCCCCC' }} onClick={() => { editPrompt.promptQuestion.length > 0 && clickBox() }} />}
                        {/* <input
                            type="checkbox"
                              disabled={ editPrompt?.promptQuestion ? editPrompt.promptQuestion.length > 0 ? false : true : true}
                             checked={showToolBox}
                             onChange={() => { clickBox();}}
                              /> */}
                        {" "}
                        &nbsp;<span className="text-[#333333] dark:text-[#CCCCCC]" style={{ fontFamily: '__Poppins_6bee3b' }}>Advanced Action</span>
                      </div>
                    </div>
                  </div>
                  <span id="prompt-editor-panel">
                    {promptBoxGuide()}
                  </span>
                </div>

              </SplitterPanel>
            </Splitter>)} {!(showPreview && file_url)&& <>   <div className=" rounded-tr-[16px] flex">

           <div className="rounded-tr-[16px] p-4 pb-0 font-medium text-[16px] text-[#333333] bg-white border-b-[2px] border-[#E5E5E5] w-[23rem] dark:bg-[#1a282e]" >
                <div className="flex items-center dark:text-[#ffffff]">
                  <div className="flex">
                    <ChevronDown className="text-[#0E70FF] rotate-270 size-5 mr-2 cursor-pointer " onClick={() => changePreview()} style={{ transform: 'rotate(270deg)' }} />Preview</div>
                  &nbsp;&nbsp;
                  <div className="flex items-center">
                    <div className="button-full cursor-pointer select-none text-nowrap flex items-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-4"
                      onClick={() => { refetchAIResponse() }}
                      style={refreshCheckSection.length > 0 || dragSection && !loading ? {} : { pointerEvents: "none", opacity: "0.6" }}
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#DEE6F1] lg:rounded-tr-[16px] rounded-tr-[0px] p-4 py-3 flex w-full justify-between dark:bg-[#1a282e]" style={{ fontWeight: 500, fontSize: '16px', color: '#333333' }}>
                <div className="flex items-center dark:text-[#ffffff]">
                  {editPrompt?.promptKey}
                </div>
                <div id="advanced-actions-toggle" className="text-base font-normal flex items-center">
                  <div className="flex items-center">
                    <div id="add-question-btn" className="button-full cursor-pointer select-none text-nowrap flex items-center gap-2 bg-blue-600 text-white px-2 py-2 rounded-full hover:bg-blue-700 transition-colors mr-4"
                      onClick={() => { addQuestion(); }}
                      style={promptQuestionCheck ? { pointerEvents: "none", opacity: "0.6" } : {}}
                    >
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                  {showToolBox ? (<span style={{ backgroundColor: '#0E70FF', borderRadius: '3px', margin: '0px 2px' }}>
                    <Check className="size-5 tex-[#ffffff] cursor-pointer" style={{ color: '#ffffff' }} onClick={() => { editPrompt.promptQuestion.length > 0 && clickBox(); }} />
                  </span>) :
                    <Square className="size-6 tex-[#CCCCCC] cursor-pointer" style={{ color: '#CCCCCC' }} onClick={() => { editPrompt.promptQuestion.length > 0 && clickBox() }} />}
                  {/* <input
        type="checkbox"
          disabled={ editPrompt?.promptQuestion ? editPrompt.promptQuestion.length > 0 ? false : true : true}
         checked={showToolBox}
         onChange={() => { clickBox();}}
          /> */}
                  {" "}
                  &nbsp;<span className="text-[#333333] dark:text-[#CCCCCC]" style={{ fontFamily: '__Poppins_6bee3b' }}>Advanced Action</span>
                </div>
              </div>4
            </div><span id="prompt-editor-panel">{promptBox()} </span></>}
          </div>

        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={controlModel}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="fixed p-6 bg-white rounded-md shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96">
          <DialogTitle className="text-xl font-semibold text-[#333333]">
            Confirm delete
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600 italic text-[0.9rem]">
            Are you sure you want to delete the{" "}
            <span className="font-extrabold">{removeSectionName}</span>?
          </DialogDescription>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={() => setAddModalOpen(false)} className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] hover:text-[#0E70FF]"
              type="button" variant="outline">
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-[26px] btn dark:text-white"
              disabled={manageDeleteBtn}
              onClick={removeKey}
            >
              {manageDeleteBtn ? `Delete (${individualDeleteDelay})` : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
      // open={isDefineModalOpen} 
      // onOpenChange={manageQuestionModel}
      >
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
                    {/* <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535]">
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
                    /> */}
                    <Separator className="my-4" />
                  </TabsContent>

                  <TabsContent value="Expand" className="px-1">
                    {/* <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535] ">
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
                    )} */}
                    <Separator className="my-4" />
                  </TabsContent>

                  <TabsContent value="Humanize" className="px-1">
                    {/* <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-[#353535]">
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
                    <Separator className="my-4" /> */}
                  </TabsContent>

                  <TabsContent value="Change Language" className="px-1">
                    {/* <label className="not-italic block mb-2 text-sm font-medium text-gray-900 dark:text-white">
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
                    <Separator className="my-4" /> */}
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </DialogDescription>
          <div className="mt-6 flex justify-center gap-2 items-center">
            <Button className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] mr-3 dark:bg-[#0E70FF]" type="button" onClick={addSelectedPromptQuestion} variant="outline">Add Action</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* <Dialog open={isFieldNameModalOpen} onOpenChange={manageFieldNameModel}>
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
            >
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={!fieldName}
              onClick={addNewField}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}

      <Dialog open={openTACModel} onOpenChange={manageTACModel}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="fixed p-6 bg-white rounded-md shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px]">
          <DialogTitle className="font-semibold text-[#333333] flex justify-between text-lg"><div>COMMUNITY TERMS & CONDITIONS</div> <X className="size-7 text-[#9A9A9A] cursor-pointer" onClick={manageTACModel} /></DialogTitle>
          <DialogDescription className="mt-2 text-gray-600 italic text-[0.9rem]">
            <Label className="text-[#666666] dark:text-[#CCCCCC] not-italic font-normal text-xs mb-5">By submitting this template to the Community, you agree to the following:</Label>
            {termAndCondition.map((value, outerIndex) => (
              <div key={outerIndex} className="mb-4">
                <Label className="text-[#333333] dark:text-[#CCCCCC] text-xs font-semibold not-italic">
                  {outerIndex + 1}. {value.title}
                </Label>
                <ul className="list-disc ml-5 mt-1">
                  {value?.points?.map((pointValue, innerIndex) => (
                    <li
                      key={`${outerIndex}-${innerIndex}`}
                      className="text-[#666666] dark:text-[#CCCCCC] text-xs font-normal not-italic leading-[1.375]">
                      {pointValue}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={closeRemoveAllDialog} variant="outline" className="text-[#0E70FF] border-[#0E70FF] hover:text-[#0E70FF]" style={{ borderRadius: '20px' }}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-[26px] btn dark:text-white" onClick={() => {
              acceptTermAndCondation()
              manageTACModel()
            }}>  I Agree to these Terms & Conditions</Button>
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
            <Button onClick={closeRemoveAllDialog} variant="outline" style={{ borderRadius: '20px' }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              style={{ borderRadius: '20px' }}
              disabled={removeAllDelay > 0}
              onClick={() => {
                removeAllContents()
              }}
            >
              {removeAllDelay > 0 ? `Remove All (${removeAllDelay})` : "Remove All"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TemplatePromptEditor;


