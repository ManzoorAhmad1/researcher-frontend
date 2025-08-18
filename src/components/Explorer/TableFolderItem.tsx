/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from "react";
import { useDrop } from "react-dnd";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "../ui/checkbox";
import Link from "next/link";
import moment from "moment";
import { usePathname } from "next/navigation";
import convertIntoDiv from "./exploreProcessingString";
import ActionButtons from "./ActionButtons";
import { File, Folder, User } from "lucide-react";
import { ExplorerDropdownItem } from "./ExplorerDropdownItem";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { Folder as FolderType } from "@/types/types";
import toast from "react-hot-toast";
import { moveFilesToFolder } from "@/apis/files";
import { folderAiChatDialog } from "@/reducer/services/folderSlice";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { Loader } from "rizzui";
import { Skeleton } from "../ui/skeleton";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
} from "../ui/tooltip";
import { OptimizedImage } from "../ui/optimized-image";
import Expfolder from "@/images/Expfolder.svg";

interface TableFolderItemProps {
  folder: any;
  selectedItems: string[];
  toggleSelectItem: (id: string) => void;
  fetchFolders?: any;
  data: FolderType | any;
  setSelectedItems: (value: any) => void;
  tableColumns: any;
  moveData?: any;
  loading?: string;
  isLoading?: boolean;
}

const TableFolderItem: React.FC<TableFolderItemProps> = React.memo(
  ({
    folder,
    selectedItems,
    toggleSelectItem,
    fetchFolders,
    data,
    setSelectedItems,
    tableColumns,
    moveData,
    loading: ai_loading,
  }) => {
    const { socket } = useSocket();
    const dispatch = useDispatch();
    const pathname = usePathname();
    const currentProject = useSelector((state: any) => state?.project);
    const newBasePath = "/explorer";
    const currentPath = pathname.split("/").slice(2).join("/");
    const [moveLoading, setMoveLoading] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [movingFilesCount, setMovingFilesCount] = useState(0);
    const [moveProgress, setMoveProgress] = useState(0);
    const [question, setQuestion] = useState(false);
    const user = useSelector((state: RootState) => state.user?.user?.user);
    const [{ isOver }, drop] = useDrop({
      accept: "file",
      drop: async (item: any) => {
        const filteredNumbers = item?.files?.filter(
          (item: any) => !isNaN(item)
        );
        setMovingFilesCount(filteredNumbers.length);
        setMoveLoading(true);
        setIsCompleting(false);
        setMoveProgress(0);

        // Create smoother animation using smaller increments
        const startTime = Date.now();
        const animationDuration = 8000; // Increased from 6000 to 8000ms
        let lastUpdateTime = startTime;

        const progressInterval = setInterval(() => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const timeDelta = currentTime - lastUpdateTime;
          lastUpdateTime = currentTime;

          // Create a variable speed progress - even slower overall
          const targetProgress = Math.min(
            (elapsed / animationDuration) * 45, // Reduced from 55 to 45
            45
          );

          // Apply easing to make progress smoother using a custom easing function
          setMoveProgress((prev) => {
            // Calculate how much to move toward the target based on current position
            let increment;

            if (prev < 10) {
              // Extremely slow start
              increment = Math.min(targetProgress - prev, timeDelta * 0.007);
            } else if (prev < 25) {
              // Very slow early phase
              increment = Math.min(targetProgress - prev, timeDelta * 0.009);
            } else if (prev > 40) {
              // Very slow approach to mid-point
              increment = Math.min(targetProgress - prev, timeDelta * 0.01);
            } else {
              // Moderate middle speed
              increment = Math.min(targetProgress - prev, timeDelta * 0.012);
            }

            return Math.min(prev + increment, targetProgress);
          });

          if (elapsed >= animationDuration) {
            clearInterval(progressInterval);
          }
        }, 40); // Slower update rate (from 30 to 40)

        try {
          const projectId: any =
            currentProject?.project?.id && currentProject?.project?.id !== null
              ? currentProject?.project?.id
              : localStorage.getItem("currentProject");
          const response: any = await moveFilesToFolder(
            { files: filteredNumbers, projectId },
            folder.id
          );

          // Then update the completion sequence with more gradual steps
          clearInterval(progressInterval);

          // Smoothly complete the progress with more natural steps and longer delays
          setMoveProgress(60); // Start from lower point
          setTimeout(() => setMoveProgress(68), 800);
          setTimeout(() => setMoveProgress(75), 1600);
          setTimeout(() => setMoveProgress(82), 2400);
          setTimeout(() => setMoveProgress(88), 3200);
          setTimeout(() => setMoveProgress(94), 4000);
          setTimeout(() => {
            setMoveProgress(100);
            setIsCompleting(true);
          }, 5000);

          // Increase final feedback delay
          // setTimeout(() => {
          if (response?.success === false) {
            toast.error(response?.message);
            // For errors, hide loader after a delay
            setTimeout(() => {
              setMoveLoading(false);
              setMoveProgress(0);
            }, 1000);
          } else if (response) {
            // Only hide loader AFTER data is fetched
            fetchFolders?.(true)
              .then(() => {
                setSelectedItems([]);
                toast.success(response?.data?.message);

                // Hide loader after data is fetched and a small delay for visual feedback
                setTimeout(() => {
                  setMoveLoading(false);
                  setMoveProgress(0);
                }, 600);
              })
              .catch((error: any) => {
                toast.error("Error refreshing folders");
                // Hide loader after error
                setTimeout(() => {
                  setMoveLoading(false);
                  setMoveProgress(0);
                }, 600);
              });
          } else {
            // Fallback case - hide loader
            setTimeout(() => {
              setMoveLoading(false);
              setMoveProgress(0);
            }, 1000);
          }
          // }, 6000); // from 3000 to 6000
        } catch (error: any) {
          // Clear the interval if it's still running
          clearInterval(progressInterval);

          // Complete the progress for error state, with a more gradual finish
          setMoveProgress(75);
          setTimeout(() => setMoveProgress(85), 300);
          setTimeout(() => setMoveProgress(92), 600);
          setTimeout(() => {
            setMoveProgress(100);
            setIsCompleting(true);
          }, 900);

          setTimeout(() => {
            toast.error(error?.response?.data?.message);
            setTimeout(() => {
              setMoveLoading(false);
              setMoveProgress(0);
            }, 1000);
          }, 1800);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });
    React.useEffect(() => {
      if (socket === null) {
        return;
      }
      if (socket) {
        socket.on("ai-folder-chat", (res: any) => {
          if (user?.id === parseInt(res?.userId)) {
            setQuestion(res.question);
          }
        });
        return () => {
          socket.off("ai-folder-chat");
        };
      }
    }, [socket]);

    const handleToggleSelect = useCallback(() => {
      toggleSelectItem(String(folder.id));
    }, [folder.id, toggleSelectItem]);

    const handleAiChatClick = useCallback(() => {
      dispatch(
        folderAiChatDialog(
          ai_loading === ""
            ? { show: true, id: folder?.id }
            : { show: true, id: folder?.id, question }
        )
      );
    }, [folder.id, ai_loading, question, dispatch]);

    return (
      <TableRow
        key={folder.name}
        className={`relative group transition-all duration-300 w-full !mr-0 rounded-[6px] overflow-hidden border border-transparent ${isOver ? "border-blue-500 bg-blue-50" : ""
          }`}
        id={folder.id}
        ref={drop as any}
      >
        <div className="flex items-center px-[13px] py-[11px] justify-between w-full bg-white dark:bg-[#202D32]  rounded-[6px] shadow  border border-gray-100    ">

          {tableColumns?.map((column: any) => {
            if (column?.field === "file_name" && column?.visible)
              return (
                <TableCell key={column?.name} className="!p-0 flex items-center justify-between w-full">
                  <div className="!p-0 flex items-center gap-[7px]">
                    <div className="mt-1">

                      <Checkbox
                        checked={selectedItems?.includes(String(folder.id))}
                        onCheckedChange={handleToggleSelect}
                        aria-label={`Select ${folder.id}`}
                      />
                    </div>
                    <Link href={`${newBasePath}/${currentPath}/${folder.id}`}>
                      <span className="relative flex items-center flex-col justify-center w-[26px] h-[26px] p-[6px] bg-[rgb(245_222_20_0.23)] rounded-[6px]  folder-col">
                        <OptimizedImage
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/Expfolder.svg`}
                          alt="folder icon"
                          className="text-black"
                          width={15}
                          height={15}
                        />

                      </span>
                    </Link>
                    <Link href={`${newBasePath}/${currentPath}/${folder.id}`}>
                      <div className="flex flex-col min-w-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`w-full ${folder?.totalFiles > 0 ? 'max-w-[120px]' : 'max-w-[160px]'}  text-[12px] font-normal text-[#333333] dark:text-white truncate`}>
                                {folder?.name}
                              </span>
                            </TooltipTrigger>

                            <TooltipContent className="border notification-break border-tableBorder text-left max-h-[150px] overflow-y-auto !w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                              <span className="text-[12px] font-normal text-[#333333] dark:text-white truncate">
                                {folder?.name}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </Link>
                  </div>


                  <div className="flex items-center gap-2  ">
                    {folder?.totalFiles > 0 && (
                      <button
                        onClick={handleAiChatClick}
                        className=" rounded hover:bg-blue-100 transition w-[20px] h-[20px] mb-[9px]"
                      >
                        <AiIcon status={ai_loading} width={20} height={20} />
                      </button>
                    )}
                    <div className="ml-[7px]">
                      <span className=" flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[10px] font-medium rounded-full shadow-lg border-2 border-white transition-all duration-200">
                        {folder?.totalFiles}
                      </span>
                    </div>
                    <ExplorerDropdownItem
                      folder={folder}
                      itemId={folder.id}
                      itemName={folder.name}
                      itemType={folder.itemType}
                      fetchFolders={fetchFolders}
                      data={data}
                      authorName={folder?.authors || folder?.author_name || folder?.authorName || null}
                    />
                  </div>
                </TableCell>
              );
          })}

          {/* // if (column?.field === "privacy" && column?.visible)
        // return <TableCell className=" table-cell" key={column?.name} />;
        // if (column?.field === "status" && column?.visible)
        // return <TableCell className=" table-cell" key={column?.name} />;
        // if (column?.field === "tags" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "number_of_page" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "size" && column?.visible)
        // return <TableCell className=" table-cell" key={column?.name} />;
        // if (column?.field === "last_update" && column?.visible)
        // return <TableCell className=" table-cell" key={column?.name} />;

        // if (column?.field === "upload_user_email" && column?.visible)
        // return <TableCell className=" table-cell" key={column?.name} />;

        // if (column?.field === "ai_status" && column?.visible) { */}
          {/* //       return (
        // <>
        //   {folder?.totalFiles > 0 ? ( */}
          {/* //     <TableCell */}
          {/* //       className="cursor-pointer"
        //       key={column?.name}
        //       onClick={handleAiChatClick}
        //     >
        //       <AiIcon status={ai_loading} />
        //     </TableCell>
        //   ) : (
        //     <TableCell />
        //   )}
        // </> */}
          {/* // );
        //     }
        // if (column?.field === "citations" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "authors" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "publication_year" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "publication_date" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "publication_detail" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "summary" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "keyword" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "research_methods" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "weakness_strength" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "future_directions" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "limitations" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "research_approach" && column?.visible)
        // return <TableCell key={column?.name} />;
        // if (column?.field === "author_affiliation" && column?.visible)
        // return <TableCell key={column?.name} />;
        //   })}
        // <TableCell className="text-center align-middle">
        //   {folder?.totalFiles > 0 && ( */}
          {/* //     <span onClick={handleAiChatClick} className="inline-block cursor-pointer">
        //       <AiIcon status={ai_loading} />
        //     </span>
        //   )}
        // </TableCell>
        {/* <TableCell className="text-right align-middle">
            <ExplorerDropdownItem
             folder={folder}
              itemId={folder.id}
              itemName={folder.name}
              itemType={folder.itemType}
              fetchFolders={fetchFolders}
              data={data}
            />
          </TableCell> */}
          {moveLoading && (
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-800 ${isCompleting
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                  : "bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.3)]"
                  }`}
                style={{
                  width: `${moveProgress}%`,
                  transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)", // More natural easing
                  transition: "width 800ms, background-color 600ms", // Longer transition
                }}
              />
            </div>
          )}
        </div>
      </TableRow>
    );
  }
);

TableFolderItem.displayName = "TableFolderItem";

export default TableFolderItem;

const AiIcon = ({ status }: any) => (
  <svg
    className={`${status === "true" && "blink"}`}
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      width="30"
      height="30"
      rx="15"
      fill={
        status === "true"
          ? "#FFE5A4"
          : status === "unread"
            ? "#C1FFCF"
            : "#DFECFF"
      }
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M15.375 9.54933C15.8234 9.28997 16.125 8.80521 16.125 8.25C16.125 7.42157 15.4535 6.75 14.625 6.75C13.7966 6.75 13.125 7.42157 13.125 8.25C13.125 8.80521 13.4267 9.28997 13.875 9.54933V10.5H12.3755C9.88241 10.5 7.875 12.5126 7.875 14.9953V16.5047C7.875 18.9789 9.88994 21 12.3755 21H17.25L22.125 23.2498V14.9953C22.125 12.5211 20.1101 10.5 17.6245 10.5H15.375V9.54933ZM20.625 20.7168V14.9953C20.625 13.3465 19.2787 12 17.6245 12H12.3755C10.7134 12 9.375 13.3384 9.375 14.9953V16.5047C9.375 18.1535 10.7213 19.5 12.3755 19.5H18L20.625 20.7168ZM16.125 15H17.625V16.5H16.125V15ZM12.375 15H13.875V16.5H12.375V15Z"
      fill={
        status === "true"
          ? "#F59B14"
          : status === "unread"
            ? "#079E28"
            : "#0E70FF"
      }
    />
  </svg>
);
