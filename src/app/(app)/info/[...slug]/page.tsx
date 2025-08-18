/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { BiShareAlt } from "react-icons/bi";
import { MdOutlineDownloading } from "react-icons/md";
import { CgMoreVerticalO } from "react-icons/cg";
import { BsFillStarFill } from "react-icons/bs";
import { CiTextAlignJustify } from "react-icons/ci";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { getFolder, updateFileStatus } from "@/apis/explore";
import { Badge } from "@/components/ui/badge";
import { formatPaperDetailToCopyToClipboard } from "@/utils/commonUtils";
import * as Switch from "@radix-ui/react-switch";
import RoundBtn from "@/components/ui/RoundBtn";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent } from "@/components/ui/overviewTabs";
import { useRouter } from "next/navigation";
import { FileResearchDetails } from "../../dashboard/FileResearchDetails";
import Highlight from "./Highlight";
import { PDFData as PDFDataType } from "@/types/types";
import { CloudFog, Plus } from "lucide-react";
import toast from "react-hot-toast";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import CitationDialog from "./CitationDialog";
import useSocket from "./socket";
import { FileResearchCategory } from "../../dashboard/FileResearchCategory";
import { Breadcrumbs } from "@/components/coman/Breadcrumbs";
import { useSelector } from "react-redux";
import PaperEvaluation from "./PaperEvaluation";
import { generateDoc, getFavoritesByUserId, getRelativePdf } from "@/apis/files";
import TemplateAnalysis from "./TemplateAnalysis";
import { RotateCcw, History } from "lucide-react";
import { getRecentActivitiesByFileId } from "@/apis/recent-activities";
import ActivityTimeLineDialog from "@/components/coman/ActivityTimeLineDialog";
import { AddTagsButton } from "@/components/Explorer/AddTagsButton";
import { favorites, removeFavorite } from "@/apis/favorites/favorites";
import RelativePapersDialog from "./RelativePapersDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader } from "rizzui";
import { getFileById as getFileByIdApi } from "@/apis/files";
import WordCloudDialog from "./WordCloudDialog";

interface PageProps {
  params: { slug: string[] };
}

const initialResearchPaperData = {
  Title: "",
  Authors: "",
  PublicationDate: "",
  NumberOfPages: 0,
  UploadDate: "",
  FileSize: 0,
  UserDefinedTags: [],
  Abstract: "",
  OverallStrengthsAndWeaknesses: [],
  ResearchPublication: [],
  KeyPointsAndFindings: [],
  ResearchApproach: [],
  DataType: [],
  ResearchMethods: [],
  ModelsAndFrameworks: [],
  StatisticalApproachAndMethods: [],
  StatisticalToolsUsed: [],
  ResearchTopicAndQuestions: [],
  LimitationsSharedByTheAuthor: [],
  FutureDirectionsforFurtherResearch: [],
  Top5Keywords: [],
  JournalName: "",
};

const initialPDFData: PDFDataType = {
  id: 0,
  created_at: "",
  note: [],
  file_link: "",
  file_name: "",
  file_updated_date: "",
  number_of_page: 0,
  size: 0,
  status: "",
  server: "",
  upload_user_name: "",
  upload_user_email: "",
  last_update: "",
  straico_file_url: "",
  pdf_search_data: initialResearchPaperData,
  pdf_category_data: [],
  pdf_quality_data: null,
  pdf_questions: null,
  CitationCount: 0,
  pdf_template_data: null,
  projects: null,
  tags: undefined,
  file_status: "",
  ai_status: "",
};

export default function PdfInfo({ params }: PageProps) {
  const currentProject = useSelector((state: any) => state?.project);
  const userData = useSelector((state: any) => state?.user?.user?.user);
  const searchParams = useSearchParams();
  const search = searchParams.get("file_id");
  const tabName = searchParams.get("tab");
  const [PDFData, setPDFData] = React.useState<PDFDataType>(initialPDFData);
  const [userJoinRoom, setUserJoinRoom] = React.useState(false);
  const [citationDialog, setCitationDialog] = React.useState(false);
  const [isActiveTab, setActiveTab] = React.useState("all");
  const [hideSideView, setHideSideView] = React.useState(true);
  const { socket } = useSocket();
  const { back, push } = useRouter();
  const [breadcrums, setBreadcrums] = useState<any[]>([]);
  const fileName = String(params.slug);
  const supabase: SupabaseClient = createClient();
  const pathname = usePathname();
  const { slug }: any = params;
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isFavouriteLoading, setIsFavouriteLoading] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState<boolean>(false);
  const [isFavourited, setIsfavourited] = useState(false);
  const [getFileById, setGetFileById] = useState<any>({});
  const [show, setShow] = useState(false);
  const [showWordCloud, setShowWordCloud] = useState(false);
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const [isAuthorsOverflow, setIsAuthorsOverflow] = useState(false);
  const authorsRef = useRef<HTMLHeadingElement | null>(null);

  const [truncatedTabs, setTruncatedTabs] = useState<{[key: string]: boolean}>({});
  const tabRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const [isTemplateLoading, setIsTemplateLoading] = useState(true);
  const setTabRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    tabRefs.current[index] = el;
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      const el = authorsRef.current;
      if (el) {
        setIsAuthorsOverflow(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [PDFData?.pdf_search_data?.Authors]);

  function leaveChat() {
    if (socket) {
      userJoinRoom && socket.emit("leaveRoom", PDFData.id);
    }
  }

  window.addEventListener("beforeunload", () => {
    leaveChat();
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setIsTemplateLoading(true);
      

      const response = await getFileByIdApi(params.slug.at(-1));
      setGetFileById(response?.data);


      

        const favoritesData = await getFavoritesByUserId(userData?.id, params.slug.at(-1) as string);

      if (favoritesData?.data?.isSuccess == false) {
        setIsfavourited(false);
      } else {
        if (
          !favoritesData?.data?.data ||
          favoritesData?.data?.data === null ||
          favoritesData?.data?.data?.length === 0
        ) {
          setIsfavourited(false);
        } else {
          setIsfavourited(true);
        }
      }
      if (response?.data) {
        setPDFData(response?.data);
        setTimeout(() => {
          setIsTemplateLoading(false);
        }, 1000);
        
      } else {
        console.error("Error fetching data:", );
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchDataById = async () => {
    try {
      const response = await getFileByIdApi(params.slug.at(-1));


        const favoritesData = await getFavoritesByUserId(userData?.id,search as string);

     


      if (favoritesData?.data?.isSuccess == false) {
        setIsfavourited(false);
      } else {
        if (
          !favoritesData?.data?.data ||
          favoritesData?.data?.data === null ||
          favoritesData?.data?.data?.length === 0
        ) {
          setIsfavourited(false);
        } else {
          setIsfavourited(true);
        }
      }

      if (response?.data) {
        setPDFData(response?.data);
        if (socket) {
          response?.data?.id && socket.emit("joinRoom", response?.data?.id) && setUserJoinRoom(true);
        }
      } else {
        console.error("Error fetching data:", response?.data?.message);
      }
    } catch {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const joinFirstRoom = () => {
    if (socket) {
      PDFData.id &&
        socket.emit("joinRoom", PDFData.id) &&
        setUserJoinRoom(true);
    }
  };

  const manageRoom = () => {
    search && !userJoinRoom && joinFirstRoom();
  };

  React.useEffect(() => {
    manageRoom();
  }, []);

  React.useEffect(() => {
    !!search ? getByFileName() : getById();
  }, [search]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    if (socket) {
      socket.on("fileReanalyzed", (fileReanalyzed: any) => {
        const id: any = search || params.slug.at(-1);
        if (+fileReanalyzed?.file_id === +id) {
          !!search ? getByFileName() : getById();
        }
      });
      socket.on("fileProcessing", (fileProcessing: any) => {
        const id: any = search || params.slug.at(-1);
        !!search ? getByFileName() : getById();
      });
      return () => {
        socket.off("fileReanalyzed");
        socket.off("fileProcessing");
      };
    }
  }, [socket]);

  const getById = () => {
    fetchData();
  };

  const getByFileName = () => {
    fetchDataById();
  };

  const sharePDF = () => {
    const newUrl = `${window.location.origin}${pathname}?file_id=${PDFData.id}`;
    navigator.clipboard
      .writeText(newUrl)
      .then(() => {
        toast.success("PDF URL successfully copied to clipboard!");
        push(newUrl);
        joinFirstRoom();
        setUserJoinRoom(true);
      })
      .catch((err) => {
        console.error("Could not copy URL: ", err);
      });
  };

  React.useEffect(() => {
    if (tabName === "chat" || tabName === "draft") {
      setActiveTab(tabName);
    }
  }, [tabName]);

  React.useEffect(() => {
    setBreadcrums([
      { type: "icon", icon: "" },
      {
        type: "select",
        value: pathname === "/explorer" ? "explorer" : "#",
        title: currentProject?.project?.name,
        options: [
          { label: "Project Overview", value: "project-overview" },
          { label: "Papers", value: "explorer" },
          { label: "Knowledge Bank", value: "knowledge-bank" },
        ],
        handleSelect: (status: string) => {
          if (status === "explorer") push(`/${status}`);
        },
      },
      { type: "label", value: "PAPERS" },
      { type: "icon", icon: "" },
      { type: "label", value: "PAPER DETAILS" },
    ]);
  }, [currentProject]);

  const handleChange = (value: string) => {
    setActiveTab(value);
    push(
      `/info/${
        params.slug.length == 1 ? params.slug : params.slug.join("/")
      }?tab=${value}`
    );
  };

  const showSide = () => {
    setHideSideView(!hideSideView);
  };

  useEffect(() => {
    setBreadcrums([
      { type: "icon", icon: "" },
      {
        type: "select",
        value: pathname === "/info" ? "info" : "#",
        title: currentProject?.project?.name,
        options: [
          { label: "Project Overview", value: "project-overview" },
          { label: "Papers", value: "explorer" },
          { label: "Knowledge Bank", value: "knowledge-bank" },
        ],
        handleSelect: (status: string) => {
          if (status === "explorer") push(`/${status}`);
        },
      },
      {
        type: "label",
        value: "PAPERS",
        handleBack: () => {
          push("/explorer");
        },
      },
    ]);

    if (slug && slug?.length > 0) {
      handleFoldeeBreadcrum();
    }
  }, [currentProject, slug]);

  const handleFoldeeBreadcrum = async () => {
    const updatedItems: { type: string; icon?: string; value?: string }[] = [
      { type: "icon", icon: "" },
    ];
    const folderBreadCrum: string[] = await Promise.all(
      slug?.map(async (slugItem: string) => {
        const folder = await getFolder(slugItem);
        return folder?.data?.folder_name;
      })
    );
    if (folderBreadCrum && folderBreadCrum?.length > 0) {
      const updatedFolderBreadCrums = folderBreadCrum?.map(
        (item: string, index: number) => {
          return {
            type: "label",
            value: item,
            handleBack: () => {
              const stepsBack = index - (folderBreadCrum.length - 1);

              if (stepsBack !== 0) {
                for (let i = 0; i < Math.abs(stepsBack); i++) {
                  back();
                }
              }
            },
          };
        }
      );

      updatedFolderBreadCrums.forEach(
        (
          item: {
            type: string;
            value: string;
            handleBack?: () => void;
          },
          index: number
        ) => {
          const isLastItem = index === updatedFolderBreadCrums?.length - 1;
          updatedItems.push(item);

          if (!isLastItem) updatedItems.push({ type: "icon", icon: "" });
        }
      );
      updatedItems.splice(-2, 2);
      updatedItems.push({ type: "label", value: "Paper Details" });

      setBreadcrums([
        { type: "icon", icon: "" },
        {
          type: "select",
          value: pathname === "/explorer" ? "explorer" : "#",
          title: currentProject?.project?.name,
          options: [
            { label: "Project Overview", value: "project-overview" },
            { label: "Papers", value: "explorer" },
            { label: "Knowledge Bank", value: "knowledge-bank" },
          ],
          handleSelect: (status: string) => {
            if (status === "explorer") push(`/${status}`);
          },
        },
        {
          type: "label",
          value: "PAPERS",
          handleBack: () => {
            push("/explorer");
          },
        },
        ...updatedItems,
      ]);
    }
  };

  React.useEffect(() => {
    setActiveTab(tabName || "all");
  }, [tabName]);

  const generatePdfFile = async () => {
    try {
      const fileId = slug.length == 1 ? slug[0] : slug[slug.length - 1];
      setIsLoading(true);
      const data = await generateDoc(fileId as string, "pdf");
      const blob = new Blob([data?.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${
        PDFData?.pdf_search_data?.Title || PDFData?.file_name
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Something went wrong downloading pdf file please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const generateWordFile = async () => {
    try {
      setIsLoading(true);
      const fileId = slug.length == 1 ? slug[0] : slug[slug.length - 1];
      const response = await generateDoc(fileId as string, "docx");
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${PDFData?.pdf_search_data?.Title || PDFData?.file_name}.docx`
      ); // Replace with your desired file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up
    } catch (error) {
      toast.error(
        "Something went wrong downloading word file please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const formattedText = formatPaperDetailToCopyToClipboard(PDFData);
    navigator.clipboard
      .writeText(formattedText)
      .then(() => {
        toast.success("Text copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy text: " + err);
      });
  };

  const handlePaperDownload = async (value: string) => {
    if (value === "copy") {
      copyToClipboard();
    }
    if (value === "pdf") {
      await generatePdfFile();
    }
    if (value === "docx") {
      await generateWordFile();
    }
  };

  const handleFileRenanlyze = async () => {
    try {
      setIsReanalyzing(true);
      const projectId: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");
      const id: any = params.slug.at(-1);
      const response = await updateFileStatus(
        { data: { file_status: "reanalyz paper" }, projectId },
        id
      );

      if (response) {
        toast.success(
          "Reanalyzing is in process.Will take few minutes to reflect changes"
        );
        await fetchData?.();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsReanalyzing(false);
    }
  };
  const handleChangeHistory = async (type: string) => {
    try {
      const fileId = slug.length == 1 ? slug[0] : slug[slug.length - 1];
      setIsHistoryDialogOpen(true);
      setIsHistoryLoading(true);
      let response: any = await getRecentActivitiesByFileId({
        type,
        fileId: fileId,
      });
      setHistory(response?.data?.data?.recent_activities);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };
  const handleFavorites = async () => {
    try {
      setIsFavouriteLoading(true);
      let result: any;
      const fileId = slug.length == 1 ? slug[0] : slug[slug.length - 1];
      const authorName =
        getFileById?.pdf_search_data?.Authors ||
        getFileById?.pdf_metadata?.Authors ||
        null;
      if (isFavourited) {
        result = await removeFavorite(fileId.toString());
      } else {
        result = await favorites({
          itemId: fileId.toString(),
          itemType: "file",
          author_name: authorName,
        });
      }
      if (result?.data?.isSuccess) {
        toast.success(result?.data?.message);
        !!search ? getByFileName() : getById();
      } else {
        toast.error(
          result?.response?.data?.message ||
            result?.message ||
            "An error occurred."
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsFavouriteLoading(false);
    }
  };

  const colors = [
    { color: "#E9222229", borderColor: "#E92222" },
    { color: "#F59B1429", borderColor: "#F59B14" },
    { color: "#F5DE1429", borderColor: "#F5DE14" },
    { color: "#079E2829", borderColor: "#079E28" },
    { color: "#D4157E29", borderColor: "#D4157E" },
    { color: "#0E70FF29", borderColor: "#0E70FF" },
    { color: "#8D17B529", borderColor: "#8D17B5" },
  ];

  const compareColor: any = (color: any, per: any) => {
    const matchedColor = colors.find((c) => c.color === color);
    if (matchedColor) {
      return matchedColor?.borderColor;
    } else {
      return color.slice(0, -2);
    }
  };

  useEffect(() => {
    const checkTruncation = () => {
      const newTruncatedTabs: {[key: string]: boolean} = {};
      Object.entries(tabRefs.current).forEach(([index, element]) => {
        if (element) {
          newTruncatedTabs[index] = element.scrollWidth > element.clientWidth;
        }
      });
      setTruncatedTabs(newTruncatedTabs);
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, []);

  return (
    <>
      <main className="grid flex-1 items-start sm:py-0">
        <div className="flex items-center gap-2 p-4 sm:px-6 pt-4  px-4 bg-[#F1F1F1] dark:bg-[#152428]">
          <div className="flex flex-col w-full grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <Breadcrumbs
                breadcrums={breadcrums}
                primaryColor="#0E70FF"
                secondaryColor="#999999"
              />
              {currentProject?.project?.name ?
                <div className="uppercase text-[#0E70FF] font-semibold border border-[#0E70FF] px-3 py-1 rounded-md">
                  {currentProject?.project?.name}
                </div>
              :
                <div className="h-6 w-[100px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
              }
            </div>
            <div className="flex justify-between items-center">
              <h1 className="font-poppins text-[18px] font-medium leading-[27px] text-left text-[#666666] dark:text-[#CCCCCC]">
                {PDFData?.pdf_search_data?.Title ||
                  PDFData?.file_name ||
                  "please wait file is processing ..."}
              </h1>
              <span
                className={`lg:mr-[100px] md:mr-[50px] sm:mr-[10px] p-[7px] ${
                  isFavourited ? "bg-[#FDBB1133]" : "bg-[#ffffff33]"
                } rounded-[20px] cursor-pointer`}
                onClick={() => (!isFavouriteLoading ? handleFavorites() : {})}
              >
                <BsFillStarFill
                  width="16.5px"
                  height="15.77px"
                  color={isFavourited ? "#FDBB11" : "#d1d5db"}
                />
              </span>
            </div>
            <div>
              <div className="flex justify-between w-full gap-3">
                <div className="flex flex-col gap-y-1 w-[67%]">
                  <label className="font-poppins text-[10px] font-semibold leading-[15px] text-left text-[#999999]">
                    AUTHORS
                  </label>
                  <div className="relative">
                    <h1
                      ref={authorsRef}
                      className={`font-poppins text-[13px] font-normal leading-[19.5px] text-left text-[#666666] dark:text-[#CCCCCC] font-poppins text-sm font-normal leading-[19.5px] text-left overflow-hidden transition-all duration-500 ease-in-out ${showAllAuthors ? 'max-h-[500px] opacity-100' : 'max-h-[24px] opacity-80 whitespace-nowrap text-ellipsis'}`}
                      style={{
                        maxWidth: '100%',
                        whiteSpace: showAllAuthors ? 'normal' : 'nowrap',
                        textOverflow: showAllAuthors ? 'clip' : 'ellipsis',
                        cursor: isAuthorsOverflow ? 'pointer' : 'default',
                        transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1)',
                      }}
                      onClick={() => {
                        if (isAuthorsOverflow) setShowAllAuthors(!showAllAuthors);
                      }}
                    >
                      {PDFData?.pdf_search_data?.Authors}
                    </h1>
                    {isAuthorsOverflow && !showAllAuthors && (
                      <button
                        className="absolute !right-[-60px] top-[2px] text-xs text-blue-600 hover:underline z-10 transition-opacity duration-300 opacity-80 hover:opacity-100"
                        onClick={e => {
                          e.stopPropagation();
                          setShowAllAuthors(true);
                        }}
                      >
                        See more
                      </button>
                    )}
                    {isAuthorsOverflow && showAllAuthors && (
                      <button
                        className="block mt-1 text-xs text-blue-600 hover:underline z-10 transition-opacity duration-300 opacity-80 hover:opacity-100 text-left"
                        onClick={e => {
                          e.stopPropagation();
                          setShowAllAuthors(false);
                        }}
                      >
                        See less
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex flex-col gap-y-1 mb-[4px]">
                    <label className="font-poppins text-[10px] font-semibold leading-[15px] text-left text-[#999999]">
                      TAGS
                    </label>
                    <div className="flex flex-wrap">
                      {PDFData?.tags?.length > 0 && (
                        <>
                          {PDFData?.tags?.map((value: any, index: number) => {
                            return (
                              <Badge
                                key={index}
                                variant="outline"
                                className="ml-auto sm:ml-0 cursor-pointer flex items-center justify-center px-3 py-1 mr-1 mb-1"
                                style={{
                                  backgroundColor: value.color,
                                  color: compareColor(value.color),
                                }}
                              >
                                {value.name || value}{" "}
                              </Badge>
                            );
                          })}
                        </>
                      )}

                      <div style={{ width: "max-content" }}>
                        <div
                          onClick={() => setIsAddTagDialogOpen(true)}
                          className="border  rounded-[25px] cursor-pointer bg-white  text-[#007EEF] p-[3px]"
                        >
                          <Plus color="#0E70FF" size={15} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="gap-3 cursor-pointer font-size-normal font-normal text-lightGray">
                      <Badge
                        variant="outline"
                        className={`text-[#1679AB] hover:text-[#1679AB]  bg-[#a2d9f5] hover:bg-[#a2d9f5] ml-auto sm:ml-0 cursor-pointer flex items-center justify-center px-3 py-1 mr-1 mb-1`}
                      >
                        <History style={{ height: "20px", width: "20px" }} />{" "}
                        &nbsp;
                        <span className="whitespace-nowrap">
                          Activity Timeline...
                        </span>
                      </Badge>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="p-4 bg-inputBackground">
                      <DropdownMenuItem
                        onClick={() => handleChangeHistory("day")}
                      >
                        Day
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleChangeHistory("week")}
                      >
                        Week
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleChangeHistory("month")}
                      >
                        Month
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleChangeHistory("year")}
                      >
                        Year
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 dark:bg-[#021217]">
          <Tabs value={isActiveTab}>
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center bg-gray-100 rounded-full border border-[#E7E7E7] dark:border-[#e7e7e73b] dark:bg-[#152428] w-max">
                {[
                  { title: "Overview", value: "all" },
                  { title: "Category", value: "category" },
                  { title: "Evaluation", value: "evaluation" },
                  ...(isTemplateLoading  
                    ? [{
                        title: (
                          <div className="flex items-center">
                            <span className="animate-pulse ml-1 mt-[-7px] text-[23px]">...</span>
                          </div>
                        ),
                        value: "analysis",
                      }]
                    : PDFData?.projects?.templates &&
                      PDFData?.file_status !== "failed" &&
                      PDFData?.pdf_template_data &&
                      PDFData?.pdf_template_data !== null
                      ? [{
                          title: PDFData.projects.templates.template_title ||
                               PDFData?.projects?.templates?.template_name,
                          value: "analysis",
                        }]
                      : []),
                  { title: "Viewer", value: "draft" },
                  { title: "AI Chat", value: "chat" },
                ].map((tab: { title: string; value: string }, index) => (
                  <div
                    key={index}
                    style={{
                      background:
                        isActiveTab === tab.value
                          ? "linear-gradient(0deg, #DB8606 -32.81%, #F59B14 107.89%)"
                          : "",
                      border:
                        isActiveTab === tab.value
                          ? "2px solid #FDAB2F"
                          : "2px solid #fdab2f00",
                    }}
                    className={`cursor-pointer px-4 py-[5px] rounded-full text-sm font-medium transition-all relative group
                   ${
                     isActiveTab === tab.value
                       ? "bg-orange-400 text-white shadow-md  text-[#FFFFFF]"
                       : "text-gray-500 text-[#666666]  dark:text-[#999999]"
                   }`}
                    onClick={() => handleChange(tab.value)}
                  >
                    <div 
                      ref={(el: HTMLDivElement | null): void => {
                        tabRefs.current[index] = el;
                      }}
                      className="max-w-[120px] truncate lg:max-w-none lg:truncate-none"
                    >
                      {truncatedTabs[index] ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>{tab.title}</span>
                            </TooltipTrigger>
                            <TooltipContent className="border border-tableBorder text-left w-full max-w-[300px] font-size-small z-10 rounded-sm bg-headerBackground px-2 py-2 text-darkGray">
                              {tab.title}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span>{tab.title}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                {(isActiveTab == "all" || isActiveTab == "category") && (
                  <div className="flex justify-center">
                    <Switch.Root
                      className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 ease-in-out ${
                        !hideSideView ? "bg-blue-600" : "bg-gray-300"
                      }`}
                      id="switch"
                      checked={!hideSideView}
                      onClick={showSide}
                    >
                      <Switch.Thumb
                        className={`block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
                          !hideSideView ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </Switch.Root>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Select a tag:</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Science
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Favorites
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Articles
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>...</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="button-full w-[145px] cursor-pointer select-none text-nowrap" onClick={()=>setShow(true)}>Related Papers</div>

                <DropdownMenu>
                  <DropdownMenuTrigger className="gap-3 cursor-pointer font-size-normal font-normal text-lightGray outline-none">
                    <RoundBtn
                      onClick={sharePDF}
                      label={
                        <span className="flex items-center">
                          More{" "}
                          <CgMoreVerticalO
                            className="ml-2"
                            style={{ height: "20px", width: "20px" }}
                          />
                        </span>
                      }
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="p-4 bg-inputBackground">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCitationDialog(true)}>
                      <span className="flex items-center">
                        <CiTextAlignJustify
                          style={{ height: "15px", width: "15px" }}
                        />{" "}
                        &nbsp;Cite
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => sharePDF()}>
                      <span className="flex items-center">
                        <BiShareAlt style={{ height: "15px", width: "15px" }} />{" "}
                        &nbsp;Share
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFileRenanlyze()}>
                      <span className="flex items-center">
                        <RotateCcw style={{ height: "15px", width: "15px" }} />{" "}
                        &nbsp;Reanalyze
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span className="flex items-center">
                          <MdOutlineDownloading
                            style={{ height: "16px", width: "16px" }}
                          />{" "}
                          &nbsp;Download As
                        </span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="p-4 bg-inputBackground">
                        <DropdownMenuItem
                          onClick={() => handlePaperDownload?.("pdf")}
                        >
                          PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePaperDownload?.("docx")}
                        >
                          Word
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePaperDownload?.("copy")}
                        >
                          Copy to Clipboard
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem onClick={() => setShowWordCloud(true)}>
                      <span className="flex items-center">
                        <CloudFog style={{ height: "15px", width: "15px" }} />{" "}
                        &nbsp;Word Cloud
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <CitationDialog
              citationDialog={citationDialog}
              setCitationDialog={setCitationDialog}
              PDFData={PDFData}
            />

            {PDFData?.ai_status === "processing" ? (
              <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  AI Analysis in Progress
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Our AI is currently analyzing this research paper. This
                  process may take a few minutes. You&apos;ll be able to view
                  the complete analysis once it&apos;s finished.
                </p>
              </div>
            ) : (
              <>
                <TabsContent value="all">
                  <FileResearchDetails
                    fileName={fileName}
                    PDFData={PDFData}
                    hideSideView={hideSideView}
                  />
                </TabsContent>
                <TabsContent value="category">
                  <FileResearchCategory
                    fileName={fileName}
                    PDFData={PDFData}
                    hideSideView={hideSideView}
                  />
                </TabsContent>
                <TabsContent value="draft">
                  {isActiveTab == "draft" && (
                    <Highlight PDFData={PDFData} manageTab={false} />
                  )}
                </TabsContent>
                <TabsContent value="chat">
                  {isActiveTab == "chat" && (
                    <Highlight PDFData={PDFData} manageTab={true} />
                  )}
                </TabsContent>

                <TabsContent value="evaluation">
                  <PaperEvaluation
                    data={PDFData?.pdf_quality_data}
                    citation={PDFData?.CitationCount}
                  />
                </TabsContent>
                <TabsContent value="analysis">
                  <TemplateAnalysis
                    data={PDFData?.pdf_template_data}
                    hideSideView={hideSideView}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
        <ActivityTimeLineDialog
          isHistoryDialogOpen={isHistoryDialogOpen}
          setIsHistoryDialogOpen={setIsHistoryDialogOpen}
          history={history}
          isLoading={isHistoryLoading}
        />
        <AddTagsButton
          fetchFolders={fetchData}
          itemId={PDFData?.id}
          isOpen={isAddTagDialogOpen}
          onOpenChange={setIsAddTagDialogOpen}
        />

        <RelativePapersDialog
          PDFData={PDFData}
          show={show}
          setShow={setShow}
          id={params.slug.at(-1)}
        />

        <WordCloudDialog
          PDFData={PDFData}
          showWordCloud={showWordCloud}
          setShowWordCloud={setShowWordCloud}
          id={params.slug.at(-1)}
        />
      </main>
    </>
  );
}
