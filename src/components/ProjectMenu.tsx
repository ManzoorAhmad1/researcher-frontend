"use client";
import { ArrowLeft, File, Router } from "lucide-react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { Key, useEffect, useState, useRef } from "react";
import { IdeaBank } from "./new-sidebar/icons/icons";
import Uploader from "@/components/Uploader/FileUpload";
import { RootState } from "@/reducer/store";
import { useSelector } from "react-redux";
import { getFolders } from "@/apis/explore";
import Subfolder from "./Subfolder";
import { Loader } from "rizzui";
import { usePathname } from "next/navigation";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { getFoldersAndBookmarksByProjectId } from "@/apis/projects";
import { useRouter } from "next-nprogress-bar";
import { OptimizedImage } from "./ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import { toast } from "react-hot-toast";

interface ProjectMenuProps {
  projectMenuOpen: boolean;
  expand: boolean;
  onLinkClick: () => void;
  setProjectMenuOpen: any;
  sidebarWidth: number;
  setSidebarWidth: (width: any) => void;
  isProjectSelected: boolean;
  setIsProjectSelected: any;
  setProjectSubMenu: any;
  projectSubMenu: any;
}

const ProjectMenu: React.FC<ProjectMenuProps> = ({
  projectMenuOpen,
  expand,
  onLinkClick,
  setProjectMenuOpen,
  setSidebarWidth,
  sidebarWidth,
  isProjectSelected,
  setIsProjectSelected,
  setProjectSubMenu,
  projectSubMenu,
}) => {
  const [toggle, setToggle] = useState(isProjectSelected || projectMenuOpen);
  const [bookmarkToggle, setBookmarkToggle] = useState(!isProjectSelected);
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const [activeBookmarkFolder, setActiveBookmarkFolder] = useState<
    number | null
  >(null);
  const user = useSelector((state: RootState) => state.user?.user?.user);

  const [loading, setLoading] = useState(false);
  const [projectFolder, setProjectFolder] = useState<any>([]);

  const isResizingRef = useRef(false);
  const resizableRef = useRef<HTMLDivElement>(null);
  const currentProject = useSelector((state: any) => state?.project);
  const router = useRouter();
  const pathname = usePathname();
  const { socket } = useSocket();
  const state: any = useSelector(
    (state: { rolesGoalsData: { currentPage: number } }) =>
      state?.rolesGoalsData
  );

  const fetchFolders = async (restrictRefresh?: boolean) => {
    if (!restrictRefresh) {
      setLoading(true);
    }
    const project_id: any =
      currentProject?.project?.id && currentProject?.project?.id !== null
        ? currentProject?.project?.id
        : localStorage.getItem("currentProject");
    try {
      const response: any = await getFoldersAndBookmarksByProjectId({
        projectId: project_id,
      });
      if (response?.data) {
        setProjectFolder(response?.data?.folders);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Failed to fetch folders", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFolders(false);
  }, [currentProject]);

  useEffect(() => {
    const project_id: any =
      currentProject?.project?.id && currentProject?.project?.id !== null
        ? currentProject?.project?.id
        : localStorage.getItem("currentProject");

    if (socket === null) {
      return;
    }

    if (socket) {
      const handleFileProcessing = () => {
        fetchFolders(true);
      };

      const handleFileDeleted = (fileDeleted: any) => {
        if (fileDeleted.projectId === project_id) {
          fetchFolders(true);
        }
      };

      const handleFolderCreated = (folderCreated: any) => {
        if (folderCreated.projectId === project_id) {
          fetchFolders(true);
        }
      };

      const handleFileMoved = (fileMoved: any) => {
        if (fileMoved.projectId === project_id) {
          fetchFolders(true);
        }
      };

      const handleNoteCreated = (noteCreated: any) => {
        if (noteCreated.projectId === project_id) {
          fetchFolders(true);
        }
      };

      const handleBookmarkFolderCreated = (bookmarkFolderCreated: any) => {
        if (bookmarkFolderCreated.projectId === project_id) {
          fetchFolders(true);
        }
      };

      socket.on("fileProcessing", handleFileProcessing);
      socket.on("fileDeleted", handleFileDeleted);
      socket.on("folderCreated", handleFolderCreated);
      socket.on("fileMoved", handleFileMoved);
      socket.on("noteCreated", handleNoteCreated);
      socket.on("bookmarkFolderCreated", handleBookmarkFolderCreated);
      socket.on("bookmarkCreated", handleFileProcessing);
      socket.on("noteDeleted", handleFileProcessing);
      socket.on("folderDeleted", handleFileProcessing);
      socket.on("bookmarkDeleted", handleFileProcessing);
      socket.on("bookmarkFolderUpdated", handleFileProcessing);

      return () => {
        socket.off("fileProcessing", handleFileProcessing);
        socket.off("fileDeleted", handleFileDeleted);
        socket.off("folderCreated", handleFolderCreated);
        socket.off("fileMoved", handleFileMoved);
        socket.off("noteCreated", handleNoteCreated);
        socket.off("bookmarkFolderCreated", handleBookmarkFolderCreated);
        socket.off("bookmarkCreated", handleFileProcessing);
        socket.off("noteDeleted", handleFileProcessing);
        socket.off("folderDeleted", handleFileProcessing);
        socket.off("bookmarkDeleted", handleFileProcessing);
        socket.off("bookmarkFolderUpdated", handleFileProcessing);
      };
    }
  }, [socket, currentProject]);

  const handleLinkClick = (path: string) => {
    if (state.formCompleted === false && !user?.research_interests) {
      return;
    }
    onLinkClick();

    router.push(path);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizingRef.current || !resizableRef.current) return;

    const rect = resizableRef.current.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    if (newWidth >= 220) {
      setSidebarWidth(newWidth);
    }
  };

  const handleResizeEnd = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, []);

  return (
    <div
      className={` ${
        projectMenuOpen ? "expand-menu-vertical  " : "menu-vertical"
      }  h-full pb-2 fixed top-0 ${
        expand && "left-[260px]"
      } z-20 flex flex-col  bg-white `}
      ref={resizableRef}
      style={{ width: `${sidebarWidth}px` }}
    >
      <div
        className="resize-handle w-2 h-full cursor-ew-resize absolute right-0 top-0 z-10"
        onMouseDown={handleResizeStart}
      />

      <div className="flex items-center gap-[6px] bg-[#FAFAFA] dark:bg-[#202e33] py-[14px] px-[13px]">
        <ArrowLeft
          className=" cursor-pointer"
          width={18}
          height={18}
          color="#666666"
          onClick={() => {
            setProjectMenuOpen(false);
            setIsProjectSelected(false);
          }}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-1 text-sm text-left max-w-[&{sidebarWidth}] overflow-hidden text-ellipsis whitespace-nowrap gap-3 cursor-pointer">
                {currentProject?.project?.name}
              </span>
            </TooltipTrigger>

            <TooltipContent className="border border-tableBorder text-left w-full max-w-[200px] font-size-small z-10  rounded-sm bg-headerBackground px-2 py-2 text-darkGray  transition-opacity duration-200 group-hover:opacity-100 ">
              <span className="break-words whitespace-normal">
                {currentProject?.project?.name}
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ul className="menu-inner  cursor-pointer mt-3">
        <li
          className={`flex gap-2  ${
            pathname === "/project-overview" && "active "
          } `}
          onClick={() => handleLinkClick("/project-overview")}
        >
          <OptimizedImage
            src={
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//paperIcon.svg`
            }
            alt="ProjectIcon"
            width={ImageSizes.icon.xs.width}
            height={ImageSizes.icon.xs.height}
          />
          <span className="text-[13px] font-normal text-[#666666] dark:text-[#CCCCCC] text-left">
            Projects Overview
          </span>
        </li>

        <li
          className={`list-none flex-col  !gap-0 !py-2 drop-down  ${
            pathname.includes("/info") || pathname.includes("/explorer")
              ? "bg-[#0E70FF0F]"
              : ""
          } !mb-0`}
        >
          <button
            onClick={() => {
              setToggle(!toggle);
            }}
            type="button"
            className="flex items-center gap-3 pb-2 border rounded-lg transition-all w-full  border-transparent"
          >
            <div
              className="w-full flex gap-2 items-center"
              onClick={() => {
                setProjectSubMenu("papers");
                handleLinkClick("/explorer");
              }}
            >
              <OptimizedImage
                src={
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//projectIcon.svg`
                }
                alt="ProjectIcon"
                width={ImageSizes.icon.xs.width}
                height={ImageSizes.icon.xs.height}
              />
              <span className="text-[13px] font-normal">Papers</span>
            </div>

            {loading ? (
              <Loader variant="threeDot" size="lg" />
            ) : toggle && projectSubMenu === "papers" ? (
              <IoIosArrowUp className="nav-arrow" width={18} height={18} />
            ) : (
              <IoIosArrowDown className="nav-arrow" width={18} height={18} />
            )}
          </button>

          {toggle && !loading && (
            <div
              className="w-[100%] space-y-4 mt-3 transition-all duration-500 ease-in-out  h-[100%] max-h-[330px] overflow-y-auto SideBarScrollbar"
              style={{
                transition: "height 0.5s ease-in-out",
              }}
            >
              <div
                className="ml-2"
                onClick={() => {
                  setProjectSubMenu("papers");
                }}
              >
                {projectFolder?.folders?.length > 0 ? (
                  projectFolder?.folders?.map((folder: any, index: number) => (
                    <Subfolder
                      key={folder.id}
                      folder={folder}
                      sidebarWidth={sidebarWidth}
                      handleLinkClick={handleLinkClick}
                      activeFolder={activeFolder}
                      setActiveFolder={setActiveFolder}
                    />
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">No folders found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </li>

        <li
          className={`list-none flex-col  !gap-0 !py-2 drop-down ${
            pathname.includes("/knowledge-bank") ? "bg-[#0E70FF0F]" : ""
          }`}
        >
          <button
            onClick={() => {
              setBookmarkToggle(!bookmarkToggle);
            }}
            type="button"
            className="flex items-center gap-3 pb-2 border rounded-lg transition-all w-full  border-transparent"
          >
            <div
              className="w-full flex gap-2 items-center"
              onClick={() => {
                setProjectSubMenu("knowledge-bank");
                handleLinkClick("/knowledge-bank");
              }}
            >
              <IdeaBank />
              <span className="text-[13px] font-normal">Knowledge Bank</span>
            </div>

            {loading ? (
              <Loader variant="threeDot" size="lg" />
            ) : bookmarkToggle && projectSubMenu === "knowledge-bank" ? (
              <IoIosArrowUp className="nav-arrow" width={18} height={18} />
            ) : (
              <IoIosArrowDown className="nav-arrow" width={18} height={18} />
            )}
          </button>

          {bookmarkToggle && !loading && (
            <div
              className="w-[100%] space-y-4 mt-3 transition-all duration-500 ease-in-out  h-[100%] max-h-[330px] overflow-y-auto SideBarScrollbar"
              style={{
                transition: "height 0.5s ease-in-out",
              }}
            >
              <div
                className="ml-2"
                onClick={() => {
                  setProjectSubMenu("knowledge-bank");
                }}
              >
                {projectFolder?.bookmarks?.length > 0 ? (
                  projectFolder?.bookmarks?.map(
                    (folder: any, index: number) => (
                      <Subfolder
                        key={folder.id}
                        folder={folder}
                        sidebarWidth={sidebarWidth}
                        handleLinkClick={handleLinkClick}
                        activeFolder={activeBookmarkFolder}
                        isBookmark={true}
                        setActiveFolder={setActiveBookmarkFolder}
                      />
                    )
                  )
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">No folders found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </li>
      </ul>
      <div className="mt-auto pb-[5rem]">
        <Uploader expand={expand} />
      </div>
    </div>
  );
};

export default ProjectMenu;
