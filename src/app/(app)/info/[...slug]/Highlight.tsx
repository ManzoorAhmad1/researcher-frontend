/* eslint-disable react-hooks/exhaustive-deps */
import React, { ReactElement, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import clsx from "clsx";
import { axiosInstancePrivate } from "@/utils/request";
import {
  DocumentLoadEvent,
  PdfJs,
  Viewer,
  Worker,
} from "@react-pdf-viewer/core";
import {
  pageNavigationPlugin,
  RenderCurrentPageLabelProps,
} from "@react-pdf-viewer/page-navigation";
import {
  defaultLayoutPlugin,
  ToolbarProps,
  ToolbarSlot,
} from "@react-pdf-viewer/default-layout";
import { useSelector } from "react-redux";
import { messageNodeBox } from "@/utils/commonUtils";
import { useRouter, useSearchParams } from "next/navigation";
import { FaArrowLeftLong } from "react-icons/fa6";
import { AppDispatch } from "@/reducer/store";
import { RiSearch2Line } from "react-icons/ri";
import { TwitterPicker } from "react-color";
import {
  HighlightArea,
  highlightPlugin,
  RenderHighlightContentProps,
  RenderHighlightTargetProps,
  RenderHighlightsProps,
} from "@react-pdf-viewer/highlight";
import { Textarea } from "@/components/ui/textarea";
import { RiArrowUpSLine } from "react-icons/ri";
import { Splitter, SplitterPanel } from "primereact/splitter";
import toast from "react-hot-toast";
import { BsInfoCircle } from "react-icons/bs";
import ThemeSearch from "@/components/ui/ThemeSearch";
import { Highlighter } from "lucide-react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useDispatch } from "react-redux";
import { MdKeyboardArrowDown } from "react-icons/md";
import { GoZoomIn } from "react-icons/go";
import { AiOutlineZoomOut } from "react-icons/ai";
import { LuPrinter } from "react-icons/lu";
import { FiDownload } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { IoOpenOutline } from "react-icons/io5";
import { FaUpDownLeftRight } from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/ui/button";
import CollaborateRoom from "./CollaborateRoom";
import { socket } from "./socket";
import ChatAI from "./ChatAI";
import { PDFData as PDFDataType, pdfQuestions } from "@/types/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { selectedValueInPDF } from "@/reducer/services/folderSlice";
import LightButton from "@/components/ui/LightButton";
import "./info.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import {
  pdfChatMessage,
  pdfInAiChat,
  questionsGenerate,
} from "@/utils/aiTemplates";
import { SupabaseClient } from "@supabase/supabase-js";
import { getFileById } from "@/apis/files";
import { updateFileStatus } from "@/apis/explore";

interface Note {
  id: number;
  content: string;
  highlightAreas: HighlightArea[];
  quote: string;
  color: string;
  newComment: string;
  comments: {
    user: string;
    comment: string;
  }[];
  isCommentDialogOpen: false;
  userName?: string;
}
interface HighlightAreas {
  top: number;
  left: number;
  width: number;
  height: number;
  pageIndex: number;
}
interface Comment {
  user: string;
  comment: string;
}
interface NewNote {
  id: number;
  color: string;
  quote: string;
  content: string;
  comments: Comment[];
  newComment: string;
  highlightAreas: HighlightAreas[];
  isCommentDialogOpen: boolean;
}
interface PDFData {
  id: number | null;
  created_at: string;
  note: NewNote[];
  file_link: string;
  file_name: string | null;
  file_updated_date: string | null;
  number_of_page: number | null;
  size: number | null;
  status: string | null;
  server: string | null;
  upload_user_name: string | null;
  upload_user_email: string | null;
  straico_file_url: string | null;
}
interface HighlightProps {
  fileUrl?: string;
  PDFData: PDFDataType;
  manageTab: boolean;
}

const setupPdfErrorHandling = () => {
  const handler = (event: ErrorEvent) => {
    if (
      (event.message &&
        (event.message.includes("Invalid page request") ||
          event.message.includes("Cannot read properties of null") ||
          event.message.includes("sendWithPromise"))) ||
      (event.error &&
        typeof event.error.message === "string" &&
        (event.error.message.includes("Invalid page request") ||
          event.error.message.includes("Cannot read properties of null") ||
          event.error.message.includes("sendWithPromise")))
    ) {
      event.preventDefault();
      console.warn("PDF.js error intercepted:", event.message);
    }
  };

  window.addEventListener("error", handler);
  return () => window.removeEventListener("error", handler);
};

const Highlight: React.FC<HighlightProps> = ({ PDFData, manageTab }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const search = searchParams.get("file_id");
  const pathName = searchParams.get("tab");
  const [titleMessage, setTitleMessage] = React.useState("");
  const [createErrorMessage, setCreateErrorMessage] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [createColorErrorMessage, setColorCreateErrorMessage] =
    React.useState(false);
  const [searchHighlight, setSearchHighlight] = React.useState("");
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteHighlightOpen, setIsDeleteHighlightOpen] =
    React.useState(false);
  const [deleteHighlightId, setDeleteHighlightId] = React.useState<number>();
  const [color, setColor] = React.useState("#FFFF00");
  const [chatMessages, setChatMessages] = React.useState<any[]>([]);
  const [notesRoom, setNotesRoom] = React.useState(PDFData.id);
  const [PDFFile, setPDFFile] = React.useState(PDFData.file_link);
  const [selectedText, setSelectedText] = useState("");
  const [currentDoc, setCurrentDoc] = React.useState<PdfJs.PdfDocument | null>(
    null
  );
  const [parentState, setParentState] = React.useState([]);
  const [pdfInAIPopover, setPDFInAIPopover] = React.useState(false);
  const [generateQuestion, setGenerateQuestion] = React.useState(false);
  const [ansPdfPageNumber, setAnsPdfPageNumber] = React.useState(0);
  const [openChatBox, setopenChatBox] = React.useState(true);
  const userData = useSelector((state: any) => state.user?.user?.user);
  const currentProject = useSelector((state: any) => state?.project);
  const [newQuestions, setNewQuestions] = React.useState<any[]>([]);
  const notesContainerRef = React.useRef<HTMLDivElement | null>(null);
  const supabase: SupabaseClient = createClient();
  const noteEles: Map<number, HTMLElement> = new Map();
  const workerURL = process.env.NEXT_PUBLIC_PDF_WORKER_URL || "";
  const screenWidth = window.innerWidth;
  const openAImodelKey = "openai/gpt-4o-mini";
  const dispatche: AppDispatch = useDispatch();
  const tabName = searchParams.get("tab");

  const popoverValues = [
    {
      text: "Summarize",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.25 15.5H2.75C1.50736 15.5 0.5 14.4927 0.5 13.25V1.25C0.5 0.83579 0.83579 0.5 1.25 0.5H11.75C12.1642 0.5 12.5 0.83579 12.5 1.25V10.25H15.5V13.25C15.5 14.4927 14.4927 15.5 13.25 15.5ZM12.5 11.75V13.25C12.5 13.6642 12.8358 14 13.25 14C13.6642 14 14 13.6642 14 13.25V11.75H12.5ZM11 14V2H2V13.25C2 13.6642 2.33579 14 2.75 14H11ZM3.5 4.25H9.5V5.75H3.5V4.25ZM3.5 7.25H9.5V8.75H3.5V7.25ZM3.5 10.25H7.25V11.75H3.5V10.25Z"
            fill="#999999"
          />
        </svg>
      ),
    },
    {
      text: "Explain Text",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.32211 10.75H14V1.75H2V11.7888L3.32211 10.75ZM3.84091 12.25L0.5 14.875V1C0.5 0.58579 0.83579 0.25 1.25 0.25H14.75C15.1642 0.25 15.5 0.58579 15.5 1V11.5C15.5 11.9142 15.1642 12.25 14.75 12.25H3.84091ZM7.25 8.5H8.75V10H7.25V8.5ZM5.42548 4.6101C5.66478 3.40689 6.7265 2.5 8 2.5C9.44975 2.5 10.625 3.67525 10.625 5.125C10.625 6.57475 9.44975 7.75 8 7.75H7.25V6.25H8C8.6213 6.25 9.125 5.7463 9.125 5.125C9.125 4.50368 8.6213 4 8 4C7.45422 4 6.9992 4.38867 6.8966 4.90433L5.42548 4.6101Z"
            fill="#999999"
          />
        </svg>
      ),
    },
  ];

  const sendNewNotes = (updatedNotes: Note[]) => {
    if (socket) {
      socket.emit(
        "send_update_notes",
        JSON.stringify({
          notes: updatedNotes,
          room: notesRoom,
          shareLink: !!search,
        })
      );
    }
  };

  const updateParentState = (newState: any) => {
    setParentState(newState);
  };

  const fetchData = async () => {
    if (notesRoom)
      try {
        const data = await getFileById(notesRoom || search)


        if (data?.data) {
          if (data?.data?.file_link) {
            setPDFFile(data?.data?.file_link);
          }
          if (data?.data?.note.length) setNotes(data?.data?.note);
        } else {
          console.error("Error fetching data:", data);
        }
      } catch { }
  };

  React.useEffect(() => {
    if (PDFData.straico_file_url && tabName == "chat") {
      PDFData.pdf_questions == null && handleGenerateQuestions(false);
    }
  }, [PDFData.straico_file_url, tabName]);

  React.useEffect(() => {
    fetchData();
  }, [notesRoom]);

  React.useEffect(() => {
    setNotesRoom(PDFData.id);
    !!search && socket && socket.emit("joinRoom", PDFData.id);
  }, [PDFData.id]);

  React.useEffect(() => {
    const handleReceiveMessage = (message: Note[]) => {
      setNotes(message);
    };

    if (socket) {
      socket.on("receive_message", handleReceiveMessage);
      socket.on("commentAdded", (updatedNotes: Note[]) => {
        setNotes(updatedNotes);
      });

      socket.on("receive_notes", (data: any) => {
        setNotes(data.notes);
      });

      return () => {
        if (socket) {
          socket.off("receive_message", handleReceiveMessage);
          socket.off("commentAdded");
        }
      };
    }
  }, []);

  React.useEffect(() => {
    return () => {
      noteEles.clear();
    };
  }, []);

  React.useEffect(() => {
    setChatMessages(notes);
  }, [notes]);

  useEffect(() => {
    const cleanup = setupPdfErrorHandling();
    return cleanup;
  }, []);

  const handleDocumentLoad = (e: DocumentLoadEvent) => {
    setCurrentDoc(e.doc);
    if (currentDoc && currentDoc !== e.doc) {
      setNotes([]);
    } else {
      setNotes(notes);
    }
  };

  const renderHighlightTarget = (props: RenderHighlightTargetProps) => {
    return (
      <div
        className="absolute transform translate-y-2 z-10 flex bg-gray-200"
        style={{
          left: `${props.selectionRegion.left}%`,
          top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
        }}
      >
        <CustomButton
          variant="secondary"
          onClick={() => {
            setTitleMessage("");
            setCreateErrorMessage(false);
            setIsDialogOpen(true);
            props.toggle();
          }}
          onTouchStart={() => {
            setTitleMessage("");
            setCreateErrorMessage(false);
            setIsDialogOpen(true);
            props.toggle();
          }}
        >
          <Highlighter />
        </CustomButton>
      </div>
    );
  };

  const renderHighlightContent = (props: RenderHighlightContentProps) => {
    const addNote = () => {
      if (notes.length > 0) {
        if (notes.some((note) => note.content === titleMessage.trim())) {
          setCreateErrorMessage(true);
        }
      }
      if (color == "#000000" || color.toString() == "#ffffff") {
        setColorCreateErrorMessage(true);
      }
      if (
        titleMessage !== "" &&
        !notes.some((note) => note.content === titleMessage.trim()) &&
        !(color == "#000000" || color.toString() == "#ffffff")
      ) {
        const note: Note = {
          id: (notes[notes.length - 1]?.id || 0) + 1,
          content: titleMessage,
          highlightAreas: props.highlightAreas,
          quote: props.selectedText,
          color: color,
          newComment: "",
          comments: [],
          isCommentDialogOpen: false,
          userName: `${userData?.first_name} ${userData?.last_name}`,
        };
        let noteData = notes.concat([note]);
        sendNewNotes(noteData);
        props.cancel();
        setTitleMessage("");
        setCreateErrorMessage(false);
        setColorCreateErrorMessage(false);
        setIsDialogOpen(false);
      }
    };

    const handelInputComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const length = value.length;

      e.target.style.height = "auto";
      e.target.style.height = `${screenWidth > 1024 ? 170 : 129}px`;

      if (length > 1500) {
        setCreateErrorMessage(true);
        setErrorMessage("Your comment exceeds the limit of 1500 characters.");
        setTitleMessage(value.slice(0, 1500));
      } else {
        setCreateErrorMessage(false);
        setErrorMessage("");
        setTitleMessage(value);
      }
    };

    const addComment = (selectedColor: { hex: string }) => {
      const twitterPicker = document.getElementsByClassName("twitter-picker");
      if (twitterPicker.length > 0) {
        const allSwatches = twitterPicker[0].querySelectorAll(`div[title]`);
        allSwatches.forEach((swatch) => {
          (swatch as HTMLElement).style.border = "none";
        });

        const selectedSwatch = twitterPicker[0].querySelector(
          `div[title="${selectedColor.hex.toUpperCase()}"]`
        );

        if (selectedSwatch) {
          (selectedSwatch as HTMLElement).style.border = "2px solid black";
        }
      }
      setColorCreateErrorMessage(false);
      setColor(selectedColor.hex);
    };

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comment</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <Textarea
              value={titleMessage}
              className="mt-2 mb-2 fixed-height overflow-y-auto h-46  max-h-46 placeholder:italic"
              placeholder="Write your comments here.(up to 250 words or 1500 characters)"
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                handelInputComment(e);
              }}
            />
            <span
              className={`${createErrorMessage ? "block" : "hidden"
                } mt-2 text-red-600 text-sm`}
            >
              {errorMessage || "Title is already exists."}
            </span>
          </div>
          <div className="mt-2">
            <TwitterPicker
              width="100%"
              colors={[
                "#FF6900",
                "#FCB900",
                "#7BDCB5",
                "#00D084",
                "#8ED1FC",
                "#0693E3",
                "#EB144C",
                "#F78DA7",
                "#9900EF",
                "#FFC700",
                "#0088FE",
                "#00C49F",
                "#FF00FF",
                "#800000",
                "#FFFF00",
                "#800080",
                "#FFA500",
                "#00FF00",
                "#008000",
                "#808000",
              ]}
              color={color}
              onChangeComplete={(selectedColor) => {
                addComment(selectedColor);
              }}
            />
          </div>
          <span
            className={`${createColorErrorMessage ? "block" : "hidden"
              } mt-2 text-red-600 text-sm`}
          >
            do not use white and black color as highlight.
          </span>
          <DialogFooter>
            <CustomButton
              className="rounded-[26px]"
              variant="secondary"
              onClick={() => {
                setTitleMessage("");
                setIsDialogOpen(false);
                setCreateErrorMessage(false);
              }}
            >
              Cancel
            </CustomButton>
            <CustomButton
              className="rounded-[26px]"
              disabled={titleMessage === ""}
              onClick={addNote}
            >
              Create
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const jumpToNote = (note: Note) => {
    activateTab(3);
    const notesContainer = notesContainerRef.current;
    if (noteEles.has(note.id) && notesContainer) {
      notesContainer.scrollTop =
        noteEles.get(note.id)?.getBoundingClientRect().top || 0;
    }
  };

  const renderHighlights = (props: RenderHighlightsProps) => {
    return (
      <div>
        {notes?.map((note) => (
          <React.Fragment key={note.id}>
            {note?.highlightAreas
              ?.filter((area) => area.pageIndex === props.pageIndex)
              ?.map((area, idx) => (
                <div
                  key={idx}
                  style={{
                    background: note.color,
                    opacity: 0.4,
                    ...props.getCssProperties(area, props.rotation),
                  }}
                  onClick={() => jumpToNote(note)}
                />
              ))}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const DeleteHighlightConfirmation = () => {
    const handleDeleteHighlight = () => {
      const updatedNotes = notes?.filter(
        (note) => note.id !== deleteHighlightId
      );
      sendNewNotes(updatedNotes);
      setDeleteHighlightId(undefined);
      setIsDeleteHighlightOpen(false);
    };
    return (
      <Dialog
        open={isDeleteHighlightOpen}
        onOpenChange={setIsDeleteHighlightOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete highlight</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            Are you sure you want to delete this highlight?
          </div>
          <DialogFooter>
            <CustomButton
              variant="secondary"
              onClick={() => {
                setDeleteHighlightId(undefined);
                setIsDeleteHighlightOpen(false);
              }}
            >
              Cancel
            </CustomButton>
            <CustomButton onClick={handleDeleteHighlight}>Yes</CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const highlightPluginInstance: any = highlightPlugin({
    renderHighlightTarget,
    renderHighlightContent,
    renderHighlights,
  });

  const { jumpToHighlightArea } = highlightPluginInstance;

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { CurrentPageLabel, GoToNextPage, GoToPreviousPage, jumpToPage } =
    pageNavigationPluginInstance;

  const handleHighlightSearch = (value: string) => {
    setSearchHighlight(value);
  };

  const getUsername = () => {
    const userData: string | null =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userData) {
      const userInfo = JSON.parse(userData);
      const nameBefore = userInfo?.email?.split("@")[0];
      return nameBefore;
    }
  };

  const addComment = (noteId: number) => {
    const userName = `${userData?.first_name} ${userData?.last_name}`

    const updatedNotes = notes?.map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          newComment: "",
          comments: note.comments?.length
            ? [
              ...note.comments,
              {
                user: userName,
                comment: note.newComment,
              },
            ]
            : [
              {
                user: userName,
                comment: note.newComment,
              },
            ],
        };
      }
      return note;
    });
    sendNewNotes(updatedNotes);
  };

  const setNewCommentHandler = (noteId: number, newComment: string) => {
    const updatedNotes = notes?.map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          newComment: newComment,
        };
      }
      return note;
    });
    setNotes(updatedNotes as Note[]);
  };

  const setIsCommentDialog = (noteId: number) => {
    const updatedNotes = notes?.map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          isCommentDialogOpen: !note.isCommentDialogOpen,
        };
      }
      return note;
    });
    setNotes(updatedNotes as Note[]);
  };

  const sidebarNotes = (
    <div
      ref={notesContainerRef}
      className="overflow-auto w-full sm:w-full dark:bg-[#152428]"
    >
      <div className="m-2 mt-3">
        <ThemeSearch
          className="color-black dark:color-[#999999] dark:border-[#223238]"
          placeholder="Search Highlights"
          onChange={(e) => handleHighlightSearch(e.target.value)}
          value={searchHighlight}
          StartAdornment={() => (
            <RiSearch2Line
              color="#999999"
              style={{ height: "22px", width: "22px" }}
            />
          )}
        />
      </div>
      {(searchHighlight === ""
        ? notes
        : notes.filter((hlt) => hlt.content.includes(searchHighlight))
      )?.map((note, index) => {
        const tag = messageNodeBox[index % messageNodeBox.length];
        return (
          <div
            key={note.id}
            className="flex flex-col justify-between items-center p-4 border-b border-black/30 dark:border-none"
          >
            <CollaborateRoom
              tag={tag}
              notes={notes}
              note={note}
              setNewCommentHandler={setNewCommentHandler}
              addComment={addComment}
              setIsDeleteHighlightOpen={setIsDeleteHighlightOpen}
              setDeleteHighlightId={setDeleteHighlightId}
              setIsCommentDialog={setIsCommentDialog}
              jumpToHighlightArea={jumpToHighlightArea}
              noteIndex={index || 0}
            />
          </div>
        );
      })}
    </div>
  );

  const renderToolbar = (Toolbar: (props: ToolbarProps) => ReactElement) => (
    <Toolbar>
      {(slots: ToolbarSlot) => {
        const {
          CurrentPageInput,
          Download,
          EnterFullScreen,
          GoToNextPage,
          GoToPreviousPage,
          NumberOfPages,
          Print,
          ShowSearchPopover,
          Zoom,
          ZoomIn,
          ZoomOut,
        } = slots;
        return (
          <div className="items-center flex w-full dark:bg-[#223238] bg-[#DEE6F1] dark:text-white my-1 dark:my-0 rounded-tl-sm rounded-tr-sm p-[3px] min-w-[100.2%] -ml-[1px]">
            <div className="px-1">
              <LightButton style={{ padding: "1px" }}>
                {" "}
                <ShowSearchPopover>
                  {({
                    className,
                    onClick,
                    ariaPressed,
                    ariaLabel,
                    tabIndex,
                    role,
                    title,
                  }: any) => (
                    <RiSearch2Line
                      color="#999999"
                      className="h-[22px] w-[22px] m-[4px] cursor-pointer"
                      onClick={onClick}
                      aria-pressed={ariaPressed}
                      aria-label={ariaLabel}
                      tabIndex={tabIndex}
                      role={role}
                      title={title}
                    />
                  )}
                </ShowSearchPopover>
              </LightButton>
            </div>
            <div className="px-1">
              <LightButton style={{ padding: "1px" }}>
                <GoToPreviousPage>
                  {({
                    className,
                    onClick,
                    ariaPressed,
                    ariaLabel,
                    tabIndex,
                    role,
                    title,
                  }: any) => (
                    <RiArrowUpSLine
                      color="#0E70FF"
                      className="h-[22px] w-[22px] m-[4px] cursor-pointer"
                      onClick={onClick}
                      aria-pressed={ariaPressed}
                      aria-label={ariaLabel}
                      tabIndex={tabIndex}
                      role={role}
                      title={title}
                    />
                  )}
                </GoToPreviousPage>
                <div className="flex items-center mx-2 dark:text-[#CCCCCC] text-[#666666]">
                  {" "}
                  <span className="ps-2">
                    <CurrentPageLabel>
                      {(props: RenderCurrentPageLabelProps) => (
                        <span>{props.currentPage + 1}</span>
                      )}
                    </CurrentPageLabel>
                    /
                  </span>{" "}
                  <NumberOfPages />
                </div>
                <GoToNextPage>
                  {({
                    className,
                    onClick,
                    ariaPressed,
                    ariaLabel,
                    tabIndex,
                    role,
                    title,
                  }: any) => (
                    <MdKeyboardArrowDown
                      color="#0E70FF"
                      className="h-[22px] w-[22px] m-[4px] cursor-pointer"
                      onClick={onClick}
                      aria-pressed={ariaPressed}
                      aria-label={ariaLabel}
                      tabIndex={tabIndex}
                      role={role}
                      title={title}
                    />
                  )}
                </GoToNextPage>
              </LightButton>
            </div>

            <div className="px-1 ml-auto">
              <LightButton style={{ padding: "1px" }}>
                {" "}
                <ZoomIn>
                  {({
                    className,
                    onClick,
                    ariaPressed,
                    ariaLabel,
                    tabIndex,
                    role,
                    title,
                  }: any) => (
                    <GoZoomIn
                      color="#999999"
                      className="h-[22px] w-[22px] m-[4px] cursor-pointer"
                      onClick={onClick}
                      aria-pressed={ariaPressed}
                      aria-label={ariaLabel}
                      tabIndex={tabIndex}
                      role={role}
                      title={title}
                    />
                  )}
                </ZoomIn>
                <Zoom />
                <ZoomOut>
                  {({
                    className,
                    onClick,
                    ariaPressed,
                    ariaLabel,
                    tabIndex,
                    role,
                    title,
                  }: any) => (
                    <AiOutlineZoomOut
                      color="#999999"
                      className="h-[22px] w-[22px] m-[4px] cursor-pointer"
                      onClick={onClick}
                      aria-pressed={ariaPressed}
                      aria-label={ariaLabel}
                      tabIndex={tabIndex}
                      role={role}
                      title={title}
                    />
                  )}
                </ZoomOut>
              </LightButton>
            </div>
            <div className="px-1  ml-auto">
              <LightButton style={{ padding: "1px" }}>
                <Print>
                  {({
                    className,
                    onClick,
                    ariaPressed,
                    ariaLabel,
                    tabIndex,
                    role,
                    title,
                  }: any) => (
                    <LuPrinter
                      color="#0E70FF"
                      className="h-[22px] w-[22px] m-[4px] cursor-pointer"
                      onClick={onClick}
                      aria-pressed={ariaPressed}
                      aria-label={ariaLabel}
                      tabIndex={tabIndex}
                      role={role}
                      title={title}
                    />
                  )}
                </Print>
              </LightButton>
            </div>
            <div className="px-1">
              <LightButton style={{ padding: "1px" }}>
                {" "}
                <Download>
                  {({
                    className,
                    onClick,
                    ariaPressed,
                    ariaLabel,
                    tabIndex,
                    role,
                    title,
                  }: any) => (
                    <FiDownload
                      color="#0E70FF"
                      className="h-[22px] w-[22px] m-[4px] cursor-pointer"
                      onClick={onClick}
                      aria-pressed={ariaPressed}
                      aria-label={ariaLabel}
                      tabIndex={tabIndex}
                      role={role}
                      title={title}
                    />
                  )}
                </Download>
              </LightButton>
            </div>
            <div className="px-1">
              <LightButton style={{ padding: "1px" }}>
                {" "}
                <EnterFullScreen>
                  {({
                    className,
                    onClick,
                    ariaPressed,
                    ariaLabel,
                    tabIndex,
                    role,
                    title,
                  }: any) => (
                    <span
                      onClick={() => onClick()}
                      aria-pressed={ariaPressed}
                      aria-label={ariaLabel}
                      tabIndex={tabIndex}
                      role={role}
                      title={title}
                    >
                      <FaUpDownLeftRight
                        color="#0E70FF"
                        className="h-[22px] w-[22px] m-[4px] cursor-pointer"
                      />
                    </span>
                  )}
                </EnterFullScreen>
              </LightButton>
            </div>
          </div>
        );
      }}
    </Toolbar>
  );

  const handleAIChat = (e: any) => {
    e.stopPropagation();
    if (selectedText) {
      setPDFInAIPopover(true);
    } else {
      toast((t) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <BsInfoCircle className="text-[#17a2b8] me-[8px]" />
          <span>Please select text</span>
        </div>
      ));
    }
  };

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => {
      let defaultTabsData = defaultTabs;
      defaultTabsData.push(
        {
          content: sidebarNotes,
          icon: (
            <span className="w-[30px] mix-blend-multiply cursor-pointer p-0 ms-1 mt-1 py-2">
              <svg
                width="25"
                height="25"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.34091 12.25L0 14.875V1C0 0.58579 0.33579 0.25 0.75 0.25H14.25C14.6642 0.25 15 0.58579 15 1V11.5C15 11.9142 14.6642 12.25 14.25 12.25H3.34091ZM2.82211 10.75H13.5V1.75H1.5V11.7888L2.82211 10.75ZM6.75 5.5H8.25V7H6.75V5.5ZM3.75 5.5H5.25V7H3.75V5.5ZM9.75 5.5H11.25V7H9.75V5.5Z"
                  fill="#999999"
                />
              </svg>
            </span>
          ),
          title: "Highlights",
        },
        {
          content: sidebarNotes,
          icon: (
            <Popover open={pdfInAIPopover}>
              <PopoverTrigger asChild>
                <span
                  onClick={handleAIChat}
                  className="w-[30px] mix-blend-multiply cursor-pointer p-0"
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 15 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.875 3.54933C8.32335 3.28997 8.625 2.80521 8.625 2.25C8.625 1.42157 7.95345 0.75 7.125 0.75C6.29657 0.75 5.625 1.42157 5.625 2.25C5.625 2.80521 5.92665 3.28997 6.375 3.54933V4.5H4.8755C2.38241 4.5 0.375 6.51262 0.375 8.99528V10.5047C0.375 12.9789 2.38994 15 4.8755 15H9.75L14.625 17.2498V8.99528C14.625 6.52109 12.6101 4.5 10.1245 4.5H7.875V3.54933ZM13.125 14.7168V8.99528C13.125 7.34654 11.7787 6 10.1245 6H4.8755C3.21344 6 1.875 7.33844 1.875 8.99528V10.5047C1.875 12.1535 3.22134 13.5 4.8755 13.5H10.5L13.125 14.7168ZM8.625 9H10.125V10.5H8.625V9ZM4.875 9H6.375V10.5H4.875V9Z"
                      fill="#999999"
                    />
                  </svg>
                </span>
              </PopoverTrigger>

              <PopoverContent
                onFocusOutside={() => setPDFInAIPopover(false)}
                side="right"
                sideOffset={10}
                className="bg-white border rounded shadow-lg text-black w-40 p-1 px-3 dark:border-[#CCCCCC14] dark:bg-[#364851]"
              >
                {popoverValues?.map((item, i) => (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setPDFInAIPopover(false);
                      dispatch(selectedValueInPDF({ selectedOption: item }));
                      if (pathName === "draft") {
                        router.push(`?tab=chat`);
                      }
                    }}
                    className="flex py-1 cursor-pointer select-none items-center"
                    key={i}
                  >
                    <span className="me-3 dark:text-[#CCCCCC]">
                      {item.icon}
                    </span>
                    <span className="dark:text-[#CCCCCC] text-[#333333]">
                      {item.text}
                    </span>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          ),
          title: !pdfInAIPopover ? "AI Chat with Selected Text" : "",
        }
      );
      return defaultTabsData.filter(
        (tab) => tab.title !== "Bookmark" && tab.title !== "Attachment"
      );
    },
    toolbarPlugin: {
      fullScreenPlugin: {
        renderExitFullScreenButton: (props) => (
          <div
            style={{
              position: "fixed",
              top: "50px",
              left: "50px",
              zIndex: 1,
            }}
          >
            <button onClick={props.onClick}>
              <FaArrowLeftLong className="text-[30px]" />
            </button>
          </div>
        ),
      },
    },
    renderToolbar,
  });

  const { activateTab } = defaultLayoutPluginInstance;

  const handleClick = (number: number) => {
    debouncedJumpToPage(number);
  };

  const handleTextSelection = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        setSelectedText(selection.toString());
        dispatch(selectedValueInPDF({ text: selection.toString() }));
      } else {
        setSelectedText("");
      }
    }, 100);
  };

  useEffect(() => {
    const selectionHandler = () => handleTextSelection();

    document.addEventListener("selectionchange", selectionHandler);
    document.addEventListener("mouseup", selectionHandler);
    document.addEventListener("touchend", selectionHandler);

    return () => {
      document.removeEventListener("selectionchange", selectionHandler);
      document.removeEventListener("mouseup", selectionHandler);
      document.removeEventListener("touchend", selectionHandler);
    };
  }, []);

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

  const straicoAPI = async (message: string) => {
    try {
      const response = await axiosInstancePrivate.post(
        "/users/generate-question",
        {
          message,
          openAImodelKey,
          file_urls: PDFData?.straico_file_url
            ? [PDFData.straico_file_url]
            : [],
        }
      );
      const data = response?.data?.response?.data;
      if (data) {
        return { data };
      }
      return null;
    } catch (error) {
      console.error("Error in straicoAPI:", error);
      return null;
    }
  };

  function createInArray(text: string) {
    const cleanedJSON = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJSON);
  }

  useEffect(() => { }, [userData?.id]);

  const handleGenerateQuestions = async (value: any) => {
    setGenerateQuestion(true);
    try {
      const { forward, message, mode } = (await verifyCreditApi(
        userData.id
      )) as { forward: boolean; message: string; mode: string };

      if (forward) {
        const message = `${questionsGenerate}`;
        const response = await straicoAPI(message);
        response?.data &&
          dispatche(
            updateCredits({
              credits: response?.data?.overall_price?.total,
              activity: "Generate Questions",
              credit_type: "AI Search",
            })
          );

        if (
          response?.data?.completions[openAImodelKey]?.completion?.choices
            ?.length > 0
        ) {
          const apiRes = createInArray(
            response?.data?.completions[openAImodelKey]?.completion?.choices[0]
              ?.message?.content
          );

          const allNewQuestion = [].concat(apiRes);

          setNewQuestions(allNewQuestion);
          response?.data &&
            PDFData.pdf_questions == null &&
            newQuestions.length == 0 &&
            addQuestion(allNewQuestion);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setGenerateQuestion(false);
  };

  const manageChatView = () => {
    setopenChatBox(!openChatBox);
  };
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
  const isBelow1250 = useMediaQuery({ maxWidth: 1249 });

  const debouncedJumpToPage = (pageNumber: number) => {
    if (typeof pageNumber !== "number" || pageNumber < 0) {
      pageNumber = 0;
    }

    setTimeout(() => {
      if (jumpToPage) {
        jumpToPage(pageNumber);
      }
    }, 300);
  };

  const pdfViewer = () => {
    return (
      <>
        {workerURL ? (
          <Worker workerUrl={workerURL}>
            <div
              className={clsx(
                isMobile && "h-[750px]",
                isLargeScreen && "h-[750px]",
                isXLScreenHeight ? "h-[750px]" : isXLScreen && "h-[950px]",
                is2XLScreen && "h-[1000px]",
                is3XLScreen && "h-[1132px]"
              )}
            >
              {PDFFile && (
                <Viewer
                  fileUrl={`${PDFFile}`}
                  plugins={[
                    highlightPluginInstance,
                    defaultLayoutPluginInstance,
                    pageNavigationPluginInstance,
                  ]}
                  initialPage={ansPdfPageNumber >= 0 ? ansPdfPageNumber : 0}
                  onDocumentLoad={handleDocumentLoad}
                />
              )}
            </div>
          </Worker>
        ) : (
          <div className="flex items-center justify-center h-[750px]">
            <p>PDF worker not available. Please check your configuration.</p>
          </div>
        )}
        <DeleteHighlightConfirmation />
      </>
    );
  };
  return (
    <>
    <div className="mb-12">
      {manageTab ? (
        <>
          <div
            className={clsx(isBelow1250 ? "hidden" : "block")}
            style={{ position: "relative" }}
          >
            {openChatBox ? (
              <Splitter className="bg-transparent">
                <SplitterPanel size={50} minSize={30}>
                  {pdfViewer()}
                </SplitterPanel>
                <SplitterPanel size={50} minSize={30} className="bg-transparent">
                  {manageTab && (
                    <div
                      className={clsx(
                        isMobile && "h-[592px]",
                        isLargeScreen && "h-[750px]",
                        isXLScreenHeight
                          ? "h-[750px]"
                          : isXLScreen && "h-[950px]",
                        is2XLScreen && "h-[1000px]",
                        is3XLScreen && "h-[1140px]",
                        "p-1.5 px-2.5 relative rounded-[24px] bg-white shadow-[rgba(0,0,0,0.35)_-7px_0px_13px] p-[18px] dark:bg-[#17252B]"
                      )}
                    >
                      <ChatAI
                        generateQuestion={generateQuestion}
                        showNotification={true}
                        handleClick={handleClick}
                        PDFData={{
                          ...PDFData,
                          ...(newQuestions.length > 0
                            ? { pdf_questions: newQuestions }
                            : {}),
                        }}
                        parentData={parentState}
                        updateParentData={updateParentState}
                        chatURL={PDFData.straico_file_url}
                        PDF_id={PDFData?.id}
                      />
                    </div>
                  )}
                </SplitterPanel>
              </Splitter>
            ) : (
              pdfViewer()
            )}
            <div
              className={`font-extrabold chat-hader-close mr-1 ${openChatBox ? "mt-0" : "mt-7"
                } pl-1 pr-1 absolute top-[18px] right-[10px]`}
              onClick={manageChatView}
            >
              {openChatBox ? (
                <IoClose
                  color="#fff"
                  className="cursor-pointer size-6"
                  size={25}
                  strokeWidth={9}
                />
              ) : (
                <IoOpenOutline
                  color="#fff"
                  className="cursor-pointer size-6"
                  size={25}
                  strokeWidth={9}
                />
              )}
            </div>
          </div>
          <div className={clsx(isBelow1250 ? "block" : "hidden")}>
            {workerURL ? (
              <Worker workerUrl={workerURL}>
                <div
                  className={clsx(
                    isMobile && "h-[592px]",
                    isLargeScreen && "h-[592px]",
                    isXLScreenHeight ? "h-[750px]" : isXLScreen && "h-[950px]",
                    is2XLScreen && "h-[950px]",
                    is3XLScreen && "h-[1160px]"
                  )}
                >
                  {PDFFile && (
                    <Viewer
                      fileUrl={`${PDFFile}`}
                      plugins={[
                        highlightPluginInstance,
                        defaultLayoutPluginInstance,
                        pageNavigationPluginInstance,
                      ]}
                      initialPage={ansPdfPageNumber >= 0 ? ansPdfPageNumber : 0}
                      onDocumentLoad={handleDocumentLoad}
                    />
                  )}
                </div>
              </Worker>
            ) : (
              <div className="flex items-center justify-center h-[592px]">
                <p>
                  PDF worker not available. Please check your configuration.
                </p>
              </div>
            )}
            {manageTab && (
              <div
                className={clsx(
                  isMobile && "h-[592px]",
                  isLargeScreen && "h-[750px]",
                  isXLScreenHeight ? "h-[750px]" : isXLScreen && "h-[950px]",
                  is2XLScreen && "h-[1000px]",
                  is3XLScreen && "h-[1010px]",
                  "p-1.5 px-2.5 relative rounded-[24px] bg-white shadow-[rgba(0,0,0,0.35)_-7px_0px_13px] p-[18px] dark:bg-[#17252B] mt-1 lg:mt-4"
                )}
              >
                <ChatAI
                  generateQuestion={generateQuestion}
                  handleClick={handleClick}
                  parentData={parentState}
                  updateParentData={updateParentState}
                  chatURL={PDFData.straico_file_url}
                  PDFData={{
                    ...PDFData,
                    ...(newQuestions.length > 0
                      ? { pdf_questions: newQuestions }
                      : {}),
                  }}
                  PDF_id={PDFData?.id}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {workerURL ? (
            <Worker workerUrl={workerURL}>
              <div
                className={clsx(
                  isMobile && "h-[750px]",
                  isLargeScreen && "h-[750px]",
                  isXLScreenHeight ? "h-[750px]" : isXLScreen && "h-[950px]",
                  is2XLScreen && "h-[950px]",
                  is3XLScreen && "h-[1140px]"
                )}
              >
                {PDFFile && (
                  <Viewer
                    fileUrl={`${PDFFile}`}
                    initialPage={ansPdfPageNumber >= 0 ? ansPdfPageNumber : 0}
                    plugins={[
                      highlightPluginInstance,
                      defaultLayoutPluginInstance,
                      pageNavigationPluginInstance,
                    ]}
                    onDocumentLoad={handleDocumentLoad}
                  />
                )}
              </div>
            </Worker>
          ) : (
            <div className="flex items-center justify-center h-[750px]">
              <p>PDF worker not available. Please check your configuration.</p>
            </div>
          )}

          <DeleteHighlightConfirmation />
        </>
      )}
      </div>
    </>
  );
};

export default Highlight;
