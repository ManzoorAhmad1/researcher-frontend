import React, { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FileText, Pencil, Tag, Trash, ChevronDown } from "lucide-react";

import { ExplorerDropdownItem } from "./ExplorerDropdownItem";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
} from "../ui/review-stage-select ";
import { Text } from "rizzui";
import { useRouter } from "next/navigation";
import { updateFileStatus } from "@/apis/explore";
import toast from "react-hot-toast";
import { Loader } from "rizzui";

const TEMPLATE_STATUS = [
  { label: "unread", value: "unread" },
  { label: "supporting", value: "supporting" },
  { label: "disregarded", value: "disregarded" },
  { label: "abstract", value: "abstract" },
  { label: "full", value: "full" },
  { label: "key", value: "key" },
  { label: "cited", value: "cited" },
  { label: "controversial", value: "controversial" },
  { label: "pioneering", value: "pioneering" },
];

interface FileItemProps {
  info: any;
  fetchFolders?: any;
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

const FileItem: React.ForwardRefRenderFunction<
  HTMLDivElement,
  FileItemProps
> = ({ info, fetchFolders }, ref) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFileStatusLoading, setIsFileStatusLoading] = useState(false);
  const [fileStatus, setFileStatus] = useState(info.status);

  const handleFileStatus = async (status: string, id: number) => {
    setIsFileStatusLoading(true);

    try {
      const currentProjectString =
        localStorage.getItem("currentProject") || "{}";
      let currentProject;
      try {
        currentProject = JSON.parse(currentProjectString);
      } catch (parseError) {
        console.error("Error parsing current project JSON:", parseError);
        currentProject = {};
      }
      const projectId: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");
      const response = await updateFileStatus(
        { data: { status }, projectId },
        id
      );

      if (response) {
        setFileStatus(status);
        fetchFolders?.(true).then(() => {
          toast.success(response?.data?.message);
        });
      }
    } catch (error: any) {
      console.error("Error updating file status:", error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsFileStatusLoading(false);
    }
  };

  const handleFileClick = (e: React.MouseEvent) => {
    // Check if the click is on a dialog, dropdown, or interactive element
    const target = e.target as HTMLElement;
    
    // Check if clicking on the main file item content (not on interactive elements)
    const isMainContent = target.closest('.aspect-square') && 
                         !target.closest('button') &&
                         !target.closest('input') &&
                         !target.closest('select') &&
                         !target.closest('a') &&
                         !target.closest('[role="button"]') &&
                         !target.closest('[role="listbox"]') &&
                         !target.closest('[role="menu"]') &&
                         !target.closest('[role="dialog"]') &&
                         !target.closest('[data-radix-popper-content-wrapper]') &&
                         !target.closest('[data-radix-select-content]') &&
                         !target.closest('[data-radix-select-trigger]') &&
                         !target.closest('[data-radix-context-menu-content]');
    
    // Check if any sidebar or modal is open by looking for common patterns
    const hasOpenSidebar = document.querySelector('[class*="sidebar"]') !== null ||
                          document.querySelector('[class*="Sidebar"]') !== null ||
                          document.querySelector('[class*="modal"]') !== null ||
                          document.querySelector('[class*="overlay"]') !== null ||
                          document.querySelector('[class*="drawer"]') !== null ||
                          document.querySelector('[style*="z-index"]') !== null ||
                          document.querySelector('[style*="position: fixed"]') !== null ||
                          document.querySelector('[style*="position:fixed"]') !== null ||
                          document.querySelector('[class*="p-sidebar"]') !== null ||
                          document.querySelector('[class*="p-component"]') !== null;
    
    // Only navigate if clicking on the main file item content AND no sidebar is open
    if (isMainContent && !hasOpenSidebar) {
      router.push(`/info/${info.id}`);
    } else {
      e.stopPropagation();
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={ref}
          onClick={handleFileClick}
          className="relative border rounded-md bg-muted mt-2 aspect-square "
        >
          <div className="absolute inset-0 flex flex-col justify-between pt-2 pl-3 pr-1">
            <div className="flex justify-between items-center">
              <div onClick={(e) => e.stopPropagation()}>
                <Select
                  disabled={loading || isFileStatusLoading}
                  value={fileStatus}
                  onValueChange={(status: string) => {
                    handleFileStatus(status, info.id);
                  }}
                >
                  <SelectTrigger>
                    {isFileStatusLoading ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <Loader variant="threeDot" size="sm" />
                      </div>
                    ) : (
                      fileStatus && (
                        <div className="flex items-center gap-6 border px-[10px] py-[6px]  rounded-[7px] border-[#CCCCCC]">
                          <div className="flex items-center gap-[6px]">
                            <div
                              className={`w-[7px] h-[7px] ${handleReviewStageColor(
                                fileStatus
                              )} rounded-full`}
                            />
                            <p
                              className="text-xs font-normal"
                              style={{ fontSize: info?.font_size }}
                            >
                              {fileStatus}
                            </p>
                          </div>
                          <ChevronDown size={"12px"} color="#999999" />
                        </div>
                      )
                    )}
                  </SelectTrigger>
                  {!isFileStatusLoading && (
                    <SelectContent className="bg-inputBackground text-darkGray">
                      {TEMPLATE_STATUS.map((item, index) => {
                        return (
                          <SelectItem key={index} value={item?.value}>
                            {item?.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  )}
                </Select>
              </div>
              <ExplorerDropdownItem
                itemId={info.id}
                itemName={info.fileName}
                itemType={info?.itemType}
                fetchFolders={fetchFolders}
                authorName={info?.authors || info?.author_name || info?.authorName || null}
              />
            </div>
            <div className="flex justify-center items-center flex-grow">
              <FileText className="h-16 w-16 text-gray-400 hover:cursor-pointer" />
            </div>
            <Text className="truncate overflow-hidden pb-3">
              {info.fileName}
            </Text>{" "}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset>
          Add tag
          <ContextMenuShortcut>
            <Tag className="h-4 w-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset>
          Rename
          <ContextMenuShortcut>
            <Pencil className="h-4 w-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset>
          Delete
          <ContextMenuShortcut>
            <Trash className="h-4 w-4" />
          </ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default React.forwardRef(FileItem);
