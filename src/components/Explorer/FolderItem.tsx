"use client";
import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FolderWithFiles } from "@/types/types";
import { Folder, Pencil, Tag, Trash } from "lucide-react";
import Link from "next/link";
import { ExplorerDropdownItem } from "./ExplorerDropdownItem";
import convertIntoDiv from "./exploreProcessingString";
import { usePathname } from "next/navigation";

interface FolderItemProps {
  info: any;
  fetchFolders?: () => void;
}

const FolderItem: React.ForwardRefRenderFunction<
  HTMLDivElement,
  FolderItemProps
> = ({ info, fetchFolders }, ref) => {
  const newBasePath = `/explorer`;
  const pathname = usePathname();
  const currentPath = pathname.split("/").slice(2).join("/");
  

  
  // Show subfolder count in badge (or total items if available)
  const badgeCount =  info?.totalFiles || 0;
  console.log("infooooo",info)
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={ref}
          className="flex flex-col h-[97%] justify-between border rounded-md bg-muted mt-2 pl-3 pt-2 pr-1"
        >
          <div className="flex justify-between items-center">
            <span className="me-2 bg-black text-white h-[22px] w-[22px] rounded-full flex justify-center items-center text-sm dark:bg-[#1A4170]">
              {badgeCount}
            </span>
            <ExplorerDropdownItem
              itemId={info.id}
              itemName={info.folder_name}
              itemType={info.itemType}
              fetchFolders={fetchFolders}
              authorName={info?.authors || info?.author_name || info?.authorName || null}
            />
          </div>
          <Link
            key={info.id}
            href={`${newBasePath}/${currentPath}/${info.id}`}
            className="flex items-center h-full gap-2 border-none justify-center"
          >
            <Folder className="h-16 w-16 text-[#9ca3af]" />
          </Link>
          <span className="pb-3 truncate overflow-hidden">{info.name}</span>
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

export default React.forwardRef(FolderItem);
