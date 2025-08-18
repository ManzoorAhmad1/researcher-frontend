import React, { useCallback, useEffect, useState, useRef } from "react";
import { useDrag } from "react-dnd";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  ChevronDown,
  CircleCheckBig,
  Dot,
  File,
  FileText,
  Clock,
  User,
  Ban,
  Loader as PendingLoader,
  FileLock2,
} from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
} from "../ui/review-stage-select ";

import { usePathname } from "next/navigation";
import { Badge } from "../ui/badge";
import { Loader } from "rizzui";
import { TEMPLATE_PRIVACY, TEMPLATE_STATUS } from "@/constant";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { ExplorerDropdownItem } from "./ExplorerDropdownItem";
import { Folder as FolderType } from "@/types/types";
import Image from "next/image";
import moment from "moment";
import { getRecentActivitiesByFileId } from "@/apis/recent-activities";
import toast from "react-hot-toast";
import ActivityTimeLineDialog from "../coman/ActivityTimeLineDialog";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { AddTagsButton } from "./AddTagsButton";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Tooltip } from "rizzui";
import {
  Tooltip as UiTooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export type pdfCategoryData = {
  Metrics: {
    HIndex: string;
    ImpactFactor: string;
  };
  DataType: string;
  Keywords: string[];
  Citations: {
    References: string[];
    CitationCount: number;
  };
  Limitations: string[];
  ResearchDesign: {
    Qualitative: boolean;
    MixedMethods: boolean;
    Quantitative: boolean;
  };
  FutureDirections: string[];
  ImpactAssessment: {
    PolicyImplications: boolean;
    PracticalApplications: boolean;
  };
  ResearchApproach: string;
  ResearchQuestion: string;
  PublicationDetails: {
    JournalName: string;
    PublicationYear: string;
    AuthorAffiliations: string[];
  };
  GeographicalContext: {
    Region: string;
    ComparativeStudies: boolean;
  };
  TheoreticalFramework: string[];
  StakeholderPerspective: {
    EndUsers: boolean;
    Practitioners: boolean;
    DecisionMakers: boolean;
  };
  IndustryApplicationContext: string[];
};
export interface pdfSearchData {
  Title: string;
  Authors: string;
  PublicationDate: string;
  NumberOfPages: number;
  UploadDate: string;
  UserDefinedTags: string[];
  Abstract: string;
  OverallStrengthsAndWeaknesses: string[];
  ResearchPublication: string[];
  KeyPointsAndFindings: string[];
  ResearchApproach: string[];
  DataType: string[];
  ResearchMethods: string[];
  ModelsAndFrameworks: string[];
  StatisticalApproachAndMethods: string[];
  StatisticalToolsUsed: string[];
  ResearchTopicAndQuestions: string[];
  LimitationsSharedByTheAuthor: string[];
  FutureDirectionsforFurtherResearch: string[];
  Top5Keywords: string[];
  JournalName: string;
  Summary: string;
}

export type pdfMetadata = {
  Abstract: string;
  PublicationDate: string;
  Authors: string;
  NumberOfPages: number;
  UploadDate: string;
  UserDefinedTags: string[];
  Keywords: string[];
  PublicationYear: string;
  JournalName: string;
  Strengths: string;
  Weaknesses: string;
  KeyPointsAndFindings: string;
  ResearchApproach: string;
  DataType: string;
  ResearchMethods: string;
  ModelsAndFrameworks: string;
  StatisticalApproachAndMethods: string;
  CitationCount: number;
};

type File = {
  id: number;
  fileName: string;
  tags: { color: string; name: string }[];
  pages: number;
  size: string;
  dateProcessed: string;
  status: string;
  fileQueryName: string;
  itemType: string;
  ai_status: string;
  CitationCount: number;
  authors: string;
  publication_date: string;
  publication_year: string;
  pdf_search_data: pdfSearchData;
  pdf_metadata: pdfMetadata;
  pdf_category_data: pdfCategoryData;
  number_of_page?: number;
  private: boolean;
};
interface TableFileItemProps {
  file: File;
  selectedItems: string[];
  toggleSelectItem: (id: string) => void;
  index: number;
  loading: boolean;
  isFileStatusloading: boolean;
  handleFileStatus: (status: string, id: number) => void;
  handlePrivacyChange: (status: string, id: number) => void;
  fileId: number | null;
  privacyId: number | null;
  fetchFolders?: () => void;
  data: FolderType | any;
  tableColumns: any;
  selectedPapers: any;
}
const TableFileItem: React.FC<TableFileItemProps> = React.memo(
  ({
    file,
    selectedItems,
    toggleSelectItem,
    index,
    loading,
    isFileStatusloading,
    handleFileStatus,
    handlePrivacyChange,
    fileId,
    privacyId,
    fetchFolders,
    data,
    tableColumns,
    selectedPapers,
  }) => {
    const user = useSelector((state: RootState) => state.user?.user?.user);
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [progressBar, setProgressBar] = useState<any[]>([]);
    const { socket } = useSocket();
    const [filePercentage, setFilePercentage] = useState(0);
    const progressIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});
    const progressRef = useRef<{ [key: string]: number }>({});
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastDisplayedPercentageRef = useRef<{ [key: string]: number }>({});
    const lastMilestoneRef = useRef<{ [key: string]: number }>({});
    const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);

    useEffect(() => {
      if (socket) {
        socket.on("uploadProgressBar", (data) => {
          if (data?.userId?.toString() === user?.id?.toString()) {
            progressRef.current[data.fileName] = data.percentCompleted;

            const currentPercentage = data.percentCompleted;
            const lastMilestone = lastMilestoneRef.current[data.fileName] || 0;

            const milestones = [0, 25, 50, 75, 100];

            const nextMilestone = milestones.find(
              (m) => m > lastMilestone && currentPercentage >= m
            );

            if (nextMilestone !== undefined) {
              lastMilestoneRef.current[data.fileName] = nextMilestone;

              if (updateTimerRef.current) {
                clearTimeout(updateTimerRef.current);
              }

              setProgressBar((prev) => {
                const updatedProgress = [...prev];
                const fileIndex = updatedProgress.findIndex(
                  (file) => file.fileName === data.fileName
                );

                const progressEntry = {
                  fileName: data.fileName,
                  percentCompleted: nextMilestone,
                  status: data.status,
                };

                if (fileIndex !== -1) {
                  updatedProgress[fileIndex] = progressEntry;
                } else {
                  updatedProgress.push(progressEntry);
                }

                return updatedProgress;
              });
            } else {
              if (updateTimerRef.current) {
                clearTimeout(updateTimerRef.current);
              }

              updateTimerRef.current = setTimeout(() => {
                const nextPotentialMilestone = milestones.find(
                  (m) => m > currentPercentage
                );
                if (
                  nextPotentialMilestone !== undefined &&
                  nextPotentialMilestone - currentPercentage <= 5
                ) {
                  lastMilestoneRef.current[data.fileName] =
                    nextPotentialMilestone;

                  setProgressBar((prev) => {
                    const updatedProgress = [...prev];
                    const fileIndex = updatedProgress.findIndex(
                      (file) => file.fileName === data.fileName
                    );

                    const progressEntry = {
                      fileName: data.fileName,
                      percentCompleted: nextPotentialMilestone,
                      status: data.status,
                    };

                    if (fileIndex !== -1) {
                      updatedProgress[fileIndex] = progressEntry;
                    } else {
                      updatedProgress.push(progressEntry);
                    }

                    return updatedProgress;
                  });
                }
              }, 200);
            }

            if (data.status === "completed") {
              if (progressIntervals.current[data.fileName]) {
                clearInterval(progressIntervals.current[data.fileName]);
                delete progressIntervals.current[data.fileName];
              }

              delete progressRef.current[data.fileName];
              delete lastMilestoneRef.current[data.fileName];

              setTimeout(() => {
                setProgressBar((current) =>
                  current.filter((p) => p.fileName !== data.fileName)
                );
              }, 2000);
            }
          }
        });

        socket.on("aiAnanlysisProgress", (aiAnanlysisProgress: any) => {
          if (
            aiAnanlysisProgress?.fileId?.toString() === file?.id?.toString()
          ) {
            setFilePercentage(aiAnanlysisProgress?.percentage);
          }
        });

        return () => {
          socket.off("uploadProgressBar");
          Object.values(progressIntervals.current).forEach((interval) => {
            clearInterval(interval);
          });
          if (updateTimerRef.current) {
            clearTimeout(updateTimerRef.current);
          }
        };
      }
    }, [socket, user, file]);

    const [{ isDragging }, drag] = useDrag({
      type: "file",
      item: {
        files: selectedItems.length ? selectedItems : [file?.id?.toString()],
      },

      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    const pathname = usePathname();
    const result = pathname.startsWith("/explorer/")
      ? pathname.replace(/^\/explorer\//, "") + "/"
      : "/";

    function lightenColor(color: any, percent: any) {
      const num = parseInt(color.slice(1), 16);
      const amt = Math.round(2.55 * percent);
      const r = (num >> 16) + amt;
      const g = ((num >> 8) & 0x00ff) + amt;
      const b = (num & 0x0000ff) + amt;
      return `#${(
        0x1000000 +
        (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 +
        (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 +
        (b < 255 ? (b < 1 ? 0 : b) : 255)
      )
        .toString(16)
        .slice(1)}`;
    }

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

    function bytesToMB(bytes: any) {
      const MB = 1024 * 1024;
      return (bytes / MB).toFixed(2);
    }

    const handleReviewStageColor = (status: string) => {
      switch (status) {
        case "cited":
          return "bg-[#079E28]";
        case "unread":
          return "bg-[#0E70FF]";
        case "key":
          return "bg-[#F59B14]";
        default:
          return "bg-[#87CEEB]";
      }
    };

    const handleChangeHistory = async (fileid: string, type: string) => {
      try {
        setIsHistoryDialogOpen(true);
        setIsLoading(true);
        let response: any = await getRecentActivitiesByFileId({
          type,
          fileId: fileid,
        });
        setHistory(response?.data?.data?.recent_activities);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "An error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };

    const radius = 10;
    const circumference = 2 * Math.PI * radius;
    const totalProgressPercentage =
      selectedPapers?.length > 0
        ? Math.floor(
            progressBar.reduce(
              (acc, file) => acc + (file?.percentCompleted || 0),
              0
            ) / selectedPapers.length
          )
        : 0;
    const offset =
      circumference - (circumference * totalProgressPercentage) / 100;

    return (
      <TableRow
        ref={drag as any}
        className={`text-lightGray relative group ${
          file.status === "cited" && "bg-[#00a43419] hover:bg-[#00a43466]"
        }`}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: "move",
        }}
      >
        <TableCell
          className="max-w-[20px] checkbox-column align-top"
          style={{ width: "0px", paddingRight: "0px" }}
        >
          <Checkbox
            checked={selectedItems.includes(String(index))}
            onCheckedChange={() => toggleSelectItem(String(index))}
            aria-label={`Select ${file.fileName}`}
            disabled={file.ai_status === "Pending Upload"}
          />
        </TableCell>

        {tableColumns?.map((column: any) => {
          if (column?.field === "file_name" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.name}>
                {file?.ai_status === "processing" || file?.ai_status === "Pending Upload" ? (
                  <div className="flex items-center justify-center h-full" style={{ width: column.width }}>
                    <Loader variant="threeDot" size="sm" />
                  </div>
                ) : (
                  <Link
                    className="inline-block"
                    href={`/info/${result}${file?.id}`}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-start font-medium">
                      <span className="ml-1 mr-2">
                        {file?.private ? (
                          <FileLock2 width={20} height={20} color="#999999" />
                        ) : (
                          <File width={18} height={18} color="#999999" />
                        )}
                      </span>

                      <p
                        style={{ fontSize: column?.font_size }}
                        className={`text-xs font-normal ${
                          column?.truncate && "line-clamp-1"
                        }`}
                      >
                        {file?.pdf_search_data?.Title || file.fileName}
                      </p>
                    </div>
                  </Link>
                )}
              </TableCell>
            );
          }

          if (column?.field === "privacy" && column?.visible) {
            return (
              <TableCell key={column?.name} className="table-cell align-top">
                {file?.ai_status !== "Pending Upload" ? (
                  <div className="flex items-center gap-2">
                    <Select
                      disabled={loading || isFileStatusloading}
                      value={file?.private?.toString()}
                      onValueChange={(status: string) => {
                        handlePrivacyChange(status, file.id);
                      }}
                    >
                      <SelectTrigger>
                        {file?.status && (
                          <div className="flex items-center gap-6 border px-[10px]  rounded-[7px] border-[#CCCCCC]">
                            {privacyId === file.id ? (
                              <div className="flex items-center justify-center !w-[80px] py-1 ">
                                <Loader
                                  className=""
                                  variant="threeDot"
                                  size="sm"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-[6px] py-[6px]">
                                <p 
                                  className="text-xs font-normal flex items-center gap-2"
                                  style={{ fontSize: column?.font_size }}
                                >
                                  {file?.private ? (
                                    <FaRegEyeSlash className="text-[16px]" />
                                  ) : (
                                    <FaRegEye className="text-[16px]" />
                                  )}{" "}
                                  {file?.private ? "Private" : "Public"}
                                </p>
                                <ChevronDown size={"12px"} color="#999999" />
                              </div>
                            )}
                          </div>
                        )}
                      </SelectTrigger>
                      <SelectContent className="bg-inputBackground text-darkGray">
                        {TEMPLATE_PRIVACY.map((item, index) => {
                          return (
                            <SelectItem key={index} value={item?.value}>
                              {item?.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div
                    style={{ width: column.width }}
                    className="h-[30px] rounded-[7px] bg-gray-200 animate-pulse"
                  />
                )}
              </TableCell>
            );
          }

          if (column?.field === "status" && column?.visible) {
            return (
              <TableCell key={column?.name} className="table-cell align-top">
                {file?.ai_status !== "Pending Upload" ? (
                  <Select
                    disabled={loading || isFileStatusloading}
                    value={file.status}
                    onValueChange={(status: string) => {
                      handleFileStatus(status, file.id);
                    }}
                  >
                    <SelectTrigger>
                      {file?.status && (
                        <div className="flex items-center gap-6 border px-[10px]  rounded-[7px] border-[#CCCCCC]">
                          {fileId === file.id ? (
                            <div className="flex items-center justify-center !w-[80px] py-1">
                              <Loader
                                className=""
                                variant="threeDot"
                                size="sm"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-[6px] py-[6px]">
                              <div
                                className={`w-[7px] h-[7px] ${handleReviewStageColor(
                                  file?.status
                                )} rounded-full`}
                              />
                              <p
                                className="text-xs font-normal"
                                style={{ fontSize: column?.font_size }}
                              >
                                {file?.status?.charAt(0).toUpperCase() +
                                  file?.status.slice(1)}
                              </p>
                              <ChevronDown size={"12px"} color="#999999" />
                            </div>
                          )}
                        </div>
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-inputBackground text-darkGray">
                      {TEMPLATE_STATUS.map((item, index) => {
                        return (
                          <SelectItem key={index} value={item?.value}>
                            {item?.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <div
                    style={{ width: column.width }}
                    className="h-[30px] rounded-[7px] bg-gray-200 animate-pulse"
                  />
                )}
              </TableCell>
            );
          }

          if (column?.field === "tags" && column?.visible) {
            return (
              <TableCell
                className=" align-top flex items-center gap-2 px-1"
                key={column?.name}
                style={{ width: column.width }}
              >
                {file.tags && file.tags.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    <div className="flex gap-2">
                      {file.tags.slice(0, 2).map((tag, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: tag.color && tag.color,
                            color: compareColor(tag.color),
                            fontSize: column?.font_size,
                          }}
                          className="inline-block px-2 py-1 mx-1 my-1 text-sm rounded-lg cursor-pointer"
                        >
                          {tag.name}
                        </div>
                      ))}
                    </div>

                    {file.tags.length > 2 && (
                      <div className="flex mt-1">
                        <div
                          style={{
                            backgroundColor: file.tags[2].color,
                            color: compareColor(file.tags[2].color),
                            fontSize: column?.font_size,
                          }}
                          className="inline-block px-2 py-1 mx-1 my-1 whitespace-nowrap text-sm rounded-lg cursor-pointer"
                        >
                          {file.tags[2].name}
                        </div>

                        {file.tags.length > 3 && (
                          <Tooltip
                            color="invert"
                            content={
                              <div className="flex space-x-2 ">
                                {file.tags.slice(3).map((t, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      backgroundColor: t.color,
                                      color: compareColor(t.color),
                                      fontSize: column?.font_size,
                                    }}
                                    className="px-2 py-1 my-1 text-sm rounded-lg"
                                  >
                                    {t.name}
                                  </div>
                                ))}
                              </div>
                            }
                            placement="top"
                          >
                            <div className="inline-block px-2 py-1 mx-1 my-1 text-sm rounded-2xl border border-blue-400">
                              <span
                                className="text-blue-400"
                                style={{ fontSize: column?.font_size }}
                              >
                                {file.tags.length - 3} +
                              </span>
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAddTagDialogOpen(true);
                      }}
                      className="ml-[0.25rem] w-[24px] h-[24px] flex items-center text-2xl justify-center border border-[#D5D5D5]  bg-white  text-[#007EEF] rounded-full"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div
                      key={index}
                      style={{
                        fontSize: column?.font_size,
                      }}
                      className="inline-block px-2 py-1 mx-1 my-1 text-sm rounded-lg cursor-pointer"
                    >
                      No Tag
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAddTagDialogOpen(true);
                      }}
                      className="ml-[0.25rem] w-[24px] h-[24px] flex items-center text-2xl justify-center border border-[#D5D5D5]  bg-white  text-[#007EEF] rounded-full"
                    >
                      +
                    </button>
                  </div>
                )}
              </TableCell>
            );
          }

          if (column?.field === "number_of_page" && column?.visible) {
            return (
              <TableCell
                className="table-cell align-top"
                key={column?.name}
                style={{
                  fontSize: column?.font_size,
                  width: column.width,
                }}
              >
                {file.pages || (file?.number_of_page as any)}
              </TableCell>
            );
          }

          if (column?.field === "size" && column?.visible) {
            return (
              <TableCell
                className="table-cell align-top"
                key={column?.name}
                style={{
                  fontSize: column?.font_size,
                  width: column.width,
                }}
              >
                {bytesToMB(file.size) + "MB"}
              </TableCell>
            );
          }

          if (column?.field === "last_update" && column?.visible) {
            return (
              <TableCell
                className="table-cell align-top"
                key={column?.name}
                style={{
                  fontSize: column?.font_size,
                  width: column.width,
                }}
              >
                <span className={`${column?.truncate && "line-clamp-1"} `}>
                  {moment(file.dateProcessed).format("YYYY-MM-DD HH:mm:ss")}
                </span>
              </TableCell>
            );
          }
          if (column?.field === "upload_user_email" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.name}>
                <div
                  className="flex gap-1 items-center"
                  style={{ width: column.width }}
                >
                  <div className="p-1 rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>

                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild className="">
                        <span
                          style={{
                            width: column.width,
                            fontSize: column?.font_size,
                          }}
                          className={`${
                            column?.truncate && "truncate"
                          } text-[13px] font-normal text-left block max-w-[150px] truncate`}
                        >
                          {user?.email || "name@mail.com"}
                        </span>
                      </TooltipTrigger>

                      <TooltipContent className="border border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                        <span
                          style={{
                            width: column.width,
                            fontSize: column?.font_size,
                          }}
                          className={`${
                            column?.truncate && "truncate"
                          } break-all`}
                        >
                          {user?.email || "name@mail.com"}
                        </span>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            );
          }
          if (column?.field === "ai_status" && column?.visible) {
            return (
              <TableCell
                className="hidden w-[fit-content] sm:table-cell align-top"
                key={column?.name}
                style={{
                  fontSize: column?.font_size,
                  width: column.width,
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontSize: column?.font_size,
                    }}
                    className={`flex items-center text-nowrap w-max  gap-[6px] px-[10px] py-[7px] rounded-[7px] text-xs ${
                      file.ai_status === "processing" ||
                      file.ai_status === "Pending Upload"
                        ? "bg-yellow-200 text-yellow-600"
                        : file.ai_status === "completed"
                        ? "bg-green-200 text-green-600"
                        : "bg-red-200 text-red-600"
                    }`}
                  >
                    {file.ai_status === "processing" ? (
                      <Image
                        src={
                          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//clockIcon.svg`
                        }
                        alt="clock"
                        width={16}
                        height={16}
                      />
                    ) : file.ai_status === "completed" ? (
                      <CircleCheckBig width={16} height={16} />
                    ) : file.ai_status === "Pending Upload" ? (
                      <PendingLoader width={16} height={16} />
                    ) : (
                      <Ban width={16} height={16} />
                    )}
                    {file.ai_status === "processing"
                      ? "Processing"
                      : file.ai_status === "completed"
                      ? "Completed"
                      : file.ai_status === "Pending Upload"
                      ? "Pending Upload"
                      : "Failed"}
                  </span>
                  {progressBar?.map((progress, index) => {
                    if (progress.fileName === file.fileName) {
                      return (
                        <span
                          className="flex items-center gap-1 font-size-small text-lightGray"
                          key={index}
                        >
                          {totalProgressPercentage}%
                          <svg width="32" height="32" className="relative">
                            <circle
                              cx="16"
                              cy="16"
                              r={10}
                              stroke="#e5e5e5"
                              strokeWidth="4"
                              fill="transparent"
                            />
                            <circle
                              cx="16"
                              cy="16"
                              r={10}
                              strokeWidth="4"
                              stroke="#2D9CBF"
                              fill="transparent"
                              strokeDasharray={circumference}
                              strokeDashoffset={offset}
                              style={{
                                transition:
                                  "stroke-dashoffset 0.5s ease-in-out",
                                transform: "rotate(-90deg)",
                                transformOrigin: "50% 50%",
                              }}
                            />
                          </svg>
                        </span>
                      );
                    }
                    return null;
                  })}
                  {file.ai_status === "processing" &&
                    filePercentage !== undefined &&
                    (filePercentage >= 0 ? (
                      <span
                        className="flex items-center gap-1 font-size-small text-lightGray"
                        key={index}
                      >
                        {filePercentage?.toString()}%
                        <svg width="32" height="32" className="relative">
                          <circle
                            cx="16"
                            cy="16"
                            r={10}
                            stroke="#e5e5e5"
                            strokeWidth="4"
                            fill="transparent"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r={10}
                            strokeWidth="4"
                            stroke="#2D9CBF"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * radius}
                            strokeDashoffset={
                              2 * Math.PI * radius -
                              (2 * Math.PI * radius * filePercentage) / 100
                            }
                            style={{
                              transition: "stroke-dashoffset 0.5s ease-in-out",
                              transform: "rotate(-90deg)",
                              transformOrigin: "50% 50%",
                            }}
                          />
                        </svg>
                      </span>
                    ) : null)}
                </div>
              </TableCell>
            );
          }
          if (column?.field === "citations" && column?.visible) {
            return (
              <TableCell key={column?.CitationCount} className="align-top" >
                <div
                  className=""
                  style={{
                    fontSize: column?.font_size,
                    width: column.width,
                  }}
                >
                  {file?.CitationCount}
                </div>
              </TableCell>
            );
          }
          if (column?.field === "authors" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.authors}>
                <div
                  className={`${column?.truncate && "line-clamp-1"}`}
                  style={{
                    fontSize: column?.font_size,
                    width: `${column.width}px`,
                  }}
                >
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                          {file?.authors ||
                            file?.pdf_metadata?.Authors ||
                            file?.pdf_search_data?.Authors}
                        </span>
                      </TooltipTrigger>

                      <TooltipContent className="border border-tableBorder text-left w-full max-h-[150px] overflow-y-auto max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                        <span className="text-[13px] font-normal text-left">
                          {file?.authors ||
                            file?.pdf_metadata?.Authors ||
                            file?.pdf_search_data?.Authors}
                        </span>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            );
          }
          if (column?.field === "publication_year" && column?.visible) {
            return (
              <TableCell
                className="align-top"
                key={column?.pdf_metadata?.PublicationYear}
              >
                <div
                  style={{
                    fontSize: column?.font_size,
                    width: column.width,
                  }}
                >
                  {file?.pdf_metadata?.PublicationYear}
                </div>
              </TableCell>
            );
          }
          if (column?.field === "publication_date" && column?.visible) {
            return (
              <TableCell
                className="align-top"
                key={column?.pdf_search_data?.PublicationDate}
              >
                <div
                  style={{
                    fontSize: column?.font_size,
                    width: column.width,
                  }}
                  className={`'ps-[1.3rem]' ${
                    column?.truncate && "line-clamp-1"
                  }`}
                >
                  {file?.pdf_search_data?.PublicationDate}
                </div>
              </TableCell>
            );
          }

          if (column?.field === "publication_detail" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.publication_year}>
                <ul
                  style={{
                    width: column.width,
                    fontSize: column?.font_size,
                  }}
                >
                  {file?.pdf_category_data?.PublicationDetails?.JournalName && (
                    <li className="flex">
                      <span className="pe-2 whitespace-nowrap col-span-2">
                        Journal Name :{" "}
                      </span>
                      <TooltipProvider>
                        <UiTooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                              {file?.pdf_category_data?.PublicationDetails
                                ?.JournalName || ""}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="border border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                            <span className="text-[13px] font-normal text-left">
                              {file?.pdf_category_data?.PublicationDetails
                                ?.JournalName || ""}
                            </span>
                          </TooltipContent>
                        </UiTooltip>
                      </TooltipProvider>
                    </li>
                  )}

                  {file?.pdf_category_data?.PublicationDetails
                    ?.PublicationYear && (
                    <li className="flex">
                      <span className="pe-2 col-span-2">
                        Publication Year :{" "}
                      </span>

                      <div>
                        {
                          file?.pdf_category_data?.PublicationDetails
                            ?.PublicationYear
                        }
                      </div>
                    </li>
                  )}
                </ul>
              </TableCell>
            );
          }
          if (column?.field === "summary" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.publication_year}>
                <ul
                  style={{
                    fontSize: column?.font_size,
                    width: column.width,
                  }}
                  className={`ps-[1.3rem] ${
                    column?.truncate && "line-clamp-1"
                  }`}
                >
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        <li
                          className="list-disc"
                          style={{ fontSize: column?.font_size }}
                        >
                          <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                            {file?.pdf_search_data?.Summary}
                          </span>
                        </li>
                      </TooltipTrigger>

                      <TooltipContent className="border border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                        <li
                          className="list-disc"
                          style={{ fontSize: column?.font_size }}
                        >
                          <span className="text-[13px] font-normal text-left">
                            {file?.pdf_search_data?.Summary}
                          </span>
                        </li>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </ul>
              </TableCell>
            );
          }

          if (column?.field === "keyword" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.publication_year}>
                <ul
                  style={{
                    width: column.width,
                    fontSize: column?.font_size,
                  }}
                  className={`ps-[1.3rem] ${
                    column?.truncate && "line-clamp-1"
                  }`}
                >
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        {file?.pdf_metadata?.Keywords?.length > 0 && (
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                              {file?.pdf_metadata?.Keywords[0]}
                              {file?.pdf_metadata?.Keywords.length > 1 &&
                                " (+ more)"}
                            </span>
                          </li>
                        )}
                      </TooltipTrigger>

                      <TooltipContent className="border border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                        <ul className="pl-5">
                          {file?.pdf_metadata?.Keywords?.map(
                            (item: string, i: number) => (
                              <li className="list-disc" key={i}>
                                <span className="text-[13px] font-normal text-left">
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </ul>
              </TableCell>
            );
          }
          if (column?.field === "research_methods" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.publication_year}>
                <ul
                  style={{
                    width: column.width,
                    fontSize: column?.font_size,
                  }}
                  className={`ps-[1.3rem] ${
                    column?.truncate && "line-clamp-1"
                  }`}
                >
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        <li className="list-disc">
                          <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                            {file?.pdf_metadata?.ResearchMethods}
                          </span>
                        </li>
                      </TooltipTrigger>

                      <TooltipContent className="border border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                        <ul className="pl-5">
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left">
                              {file?.pdf_metadata?.ResearchMethods}
                            </span>
                          </li>
                        </ul>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </ul>
              </TableCell>
            );
          }
          if (column?.field === "weakness_strength" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.publication_year}>
                <ul
                  style={{
                    width: column.width,
                    fontSize: column?.font_size,
                  }}
                  className={`ps-[1.3rem] ${
                    column?.truncate && "line-clamp-1"
                  }`}
                >
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        {Array.isArray(
                          file?.pdf_search_data?.OverallStrengthsAndWeaknesses
                        ) &&
                        file?.pdf_search_data?.OverallStrengthsAndWeaknesses
                          .length > 0 ? (
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                              {
                                file?.pdf_search_data
                                  ?.OverallStrengthsAndWeaknesses[0]
                              }
                              {file?.pdf_search_data
                                ?.OverallStrengthsAndWeaknesses.length > 1 &&
                                " (+ more)"}
                            </span>
                          </li>
                        ) : typeof file?.pdf_search_data
                            ?.OverallStrengthsAndWeaknesses === "string" ? (
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                              {
                                file?.pdf_search_data
                                  ?.OverallStrengthsAndWeaknesses
                              }
                            </span>
                          </li>
                        ) : null}
                      </TooltipTrigger>

                      <TooltipContent className="border border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                        <ul className="pl-5">
                          {Array.isArray(
                            file?.pdf_search_data?.OverallStrengthsAndWeaknesses
                          ) ? (
                            file?.pdf_search_data?.OverallStrengthsAndWeaknesses.map(
                              (value, idx) => (
                                <li className="list-disc" key={idx}>
                                  <span className="text-[13px] font-normal text-left">
                                    {value}
                                  </span>
                                </li>
                              )
                            )
                          ) : typeof file?.pdf_search_data
                              ?.OverallStrengthsAndWeaknesses === "string" ? (
                            <li className="list-disc">
                              <span className="text-[13px] font-normal text-left">
                                {
                                  file?.pdf_search_data
                                    ?.OverallStrengthsAndWeaknesses
                                }
                              </span>
                            </li>
                          ) : null}
                        </ul>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </ul>
              </TableCell>
            );
          }
          if (column?.field === "future_directions" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.publication_year}>
                <ul
                  style={{
                    width: column.width,
                    fontSize: column?.font_size,
                  }}
                  className={`ps-[1.3rem] ${
                    column?.truncate && "line-clamp-1"
                  }`}
                >
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        {Array.isArray(
                          file?.pdf_search_data
                            ?.FutureDirectionsforFurtherResearch
                        ) &&
                        file?.pdf_search_data
                          ?.FutureDirectionsforFurtherResearch.length > 0 ? (
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                              {
                                file?.pdf_search_data
                                  ?.FutureDirectionsforFurtherResearch[0]
                              }
                              {file?.pdf_search_data
                                ?.FutureDirectionsforFurtherResearch.length >
                                1 && " (+ more)"}
                            </span>
                          </li>
                        ) : typeof file?.pdf_search_data
                            ?.FutureDirectionsforFurtherResearch ===
                          "string" ? (
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                              {
                                file?.pdf_search_data
                                  ?.FutureDirectionsforFurtherResearch
                              }
                            </span>
                          </li>
                        ) : null}
                      </TooltipTrigger>

                      <TooltipContent className="border border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                        <ul className="pl-5">
                          {Array.isArray(
                            file?.pdf_search_data
                              ?.FutureDirectionsforFurtherResearch
                          ) ? (
                            file?.pdf_search_data?.FutureDirectionsforFurtherResearch.map(
                              (value, idx) => (
                                <li className="list-disc" key={idx}>
                                  <span className="text-[13px] font-normal text-left">
                                    {value}
                                  </span>
                                </li>
                              )
                            )
                          ) : typeof file?.pdf_search_data
                              ?.FutureDirectionsforFurtherResearch ===
                            "string" ? (
                            <li className="list-disc">
                              <span className="text-[13px] font-normal text-left">
                                {
                                  file?.pdf_search_data
                                    ?.FutureDirectionsforFurtherResearch
                                }
                              </span>
                            </li>
                          ) : null}
                        </ul>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </ul>
              </TableCell>
            );
          }
          if (column?.field === "limitations" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.publication_year}>
                <ul
                  style={{
                    width: column.width,
                    fontSize: column?.font_size,
                  }}
                  className={`ps-[1.3rem] ${
                    column?.truncate && "line-clamp-1"
                  }`}
                >
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        {Array.isArray(
                          file?.pdf_search_data?.LimitationsSharedByTheAuthor
                        ) &&
                        file?.pdf_search_data?.LimitationsSharedByTheAuthor
                          .length > 0 ? (
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                              {
                                file?.pdf_search_data
                                  ?.LimitationsSharedByTheAuthor[0]
                              }
                              {file?.pdf_search_data
                                ?.LimitationsSharedByTheAuthor.length > 1 &&
                                " (+ more)"}
                            </span>
                          </li>
                        ) : typeof file?.pdf_search_data
                            ?.LimitationsSharedByTheAuthor === "string" ? (
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                              {
                                file?.pdf_search_data
                                  ?.LimitationsSharedByTheAuthor
                              }
                            </span>
                          </li>
                        ) : null}
                      </TooltipTrigger>

                      <TooltipContent className="border border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                        <ul className="pl-5">
                          {Array.isArray(
                            file?.pdf_search_data?.LimitationsSharedByTheAuthor
                          ) ? (
                            file?.pdf_search_data?.LimitationsSharedByTheAuthor.map(
                              (value, idx) => (
                                <li className="list-disc" key={idx}>
                                  <span className="text-[13px] font-normal text-left">
                                    {value}
                                  </span>
                                </li>
                              )
                            )
                          ) : typeof file?.pdf_search_data
                              ?.LimitationsSharedByTheAuthor === "string" ? (
                            <li className="list-disc">
                              <span className="text-[13px] font-normal text-left">
                                {
                                  file?.pdf_search_data
                                    ?.LimitationsSharedByTheAuthor
                                }
                              </span>
                            </li>
                          ) : null}
                        </ul>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </ul>
              </TableCell>
            );
          }
          if (column?.field === "research_approach" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.pdf_search_data}>
                <ul
                  className={`ps-[1.3rem] ${
                    column?.truncate && "line-clamp-1"
                  }`}
                  style={{
                    width: column.width,
                    fontSize: column?.font_size,
                  }}
                >
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        {Array.isArray(
                          file?.pdf_search_data?.ResearchApproach
                        ) &&
                        file?.pdf_search_data?.ResearchApproach.length > 0 ? (
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                              {file?.pdf_search_data?.ResearchApproach[0]}
                              {file?.pdf_search_data?.ResearchApproach.length >
                                1 && " (+ more)"}
                            </span>
                          </li>
                        ) : typeof file?.pdf_search_data?.ResearchApproach ===
                          "string" ? (
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                              {file?.pdf_search_data?.ResearchApproach}
                            </span>
                          </li>
                        ) : null}
                      </TooltipTrigger>

                      <TooltipContent className="border border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                        <ul className="pl-5">
                          {Array.isArray(
                            file?.pdf_search_data?.ResearchApproach
                          ) ? (
                            file?.pdf_search_data?.ResearchApproach.map(
                              (value, idx) => (
                                <li className="list-disc" key={idx}>
                                  <span className="text-[13px] font-normal text-left">
                                    {value}
                                  </span>
                                </li>
                              )
                            )
                          ) : typeof file?.pdf_search_data?.ResearchApproach ===
                            "string" ? (
                            <li className="list-disc">
                              <span className="text-[13px] font-normal text-left">
                                {file?.pdf_search_data?.ResearchApproach}
                              </span>
                            </li>
                          ) : null}
                        </ul>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </ul>
              </TableCell>
            );
          }
          if (column?.field === "author_affiliation" && column?.visible) {
            return (
              <TableCell className="align-top" key={column?.pdf_category_data}>
                <ul
                  className={`ps-[1.3rem] ${
                    column?.truncate && "line-clamp-1"
                  }`}
                  style={{
                    width: column.width,
                    fontSize: column?.font_size,
                  }}
                >
                  <TooltipProvider>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        <li className="list-disc">
                          <span className="text-[13px] font-normal text-left block max-w-[150px] truncate">
                            {
                              file.pdf_category_data?.PublicationDetails
                                ?.AuthorAffiliations
                            }
                          </span>
                        </li>
                      </TooltipTrigger>

                      <TooltipContent className="border border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                        <ul className="pl-5">
                          <li className="list-disc">
                            <span className="text-[13px] font-normal text-left">
                              {
                                file.pdf_category_data?.PublicationDetails
                                  ?.AuthorAffiliations
                              }
                            </span>
                          </li>
                        </ul>
                      </TooltipContent>
                    </UiTooltip>
                  </TooltipProvider>
                </ul>
              </TableCell>
            );
          }
        })}
        {file.ai_status !== "Pending Upload" && (
          <TableCell className="text-left z-10">
            <ExplorerDropdownItem
              itemId={file?.id}
              itemName={file?.fileName}
              itemType={file?.itemType}
              fetchFolders={fetchFolders}
              data={data}
              handleChangeHistory={handleChangeHistory}
              authorName={
                file?.pdf_search_data?.Authors ||
                file?.pdf_metadata?.Authors ||
                null
              }
              handlePrivacyChange={handlePrivacyChange}
              itemIsPrivate={file?.private}
            />
          </TableCell>
        )}
        <ActivityTimeLineDialog
          isHistoryDialogOpen={isHistoryDialogOpen}
          setIsHistoryDialogOpen={setIsHistoryDialogOpen}
          history={history}
          isLoading={isLoading}
        />
        <AddTagsButton
          fetchFolders={fetchFolders}
          itemId={file?.id}
          isOpen={isAddTagDialogOpen}
          onOpenChange={setIsAddTagDialogOpen}
        />
      </TableRow>
    );
  }
);

TableFileItem.displayName = "TableFileItem";

export default TableFileItem;
