import React, { useState } from "react";
import { CopyIcon, Dotes, FavoriteIcon } from "../../../icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaBookmark } from "react-icons/fa";
import { CgExport } from "react-icons/cg";
import { Share2, Trash, CalendarIcon } from "lucide-react";
import { IoDocumentTextOutline } from "react-icons/io5";
import { Tags } from "../../../utils/types";
import { Tooltip } from "rizzui";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/reducer/store";
import { fileAddToFavorite } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { NotFavoriteIcon } from "@/app/(app)/creative-thinking/icons/icons";
import toast from "react-hot-toast";
import { useRouter } from "next-nprogress-bar";
import { usePathname } from "next/navigation";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getAllBookmark, updateBookmarks } from "@/apis/notes-bookmarks";
import ReminderDialog from "@/components/coman/ReminderDailog";

const NoteView = ({
  i,
  item,
  setTageId,
  setVisible,
  setShareId,
  openDropdownId,
  setShareVisible,
  setOpenDropdownId,
  handleDropdownToggle,
  setDeleteDialogInfo,
}: any) => {
  const router = useRouter();
  const pathName = usePathname();
  const supabase: SupabaseClient = createClient();
  const dispatch = useDispatch<AppDispatch>();
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState<boolean>(false);
  const userId = useSelector((state: any) => state.user?.user?.user?.id);

  const colors = [
    { color: "#E9222229", borderColor: "#E92222" },
    { color: "#F59B1429", borderColor: "#F59B14" },
    { color: "#F5DE1429", borderColor: "#F5DE14" },
    { color: "#079E2829", borderColor: "#079E28" },
    { color: "#D4157E29", borderColor: "#D4157E" },
    { color: "#0E70FF29", borderColor: "#0E70FF" },
    { color: "#8D17B529", borderColor: "#8D17B5" },
  ];

  const compareColor = (color: string) => {
    const matchedColor = colors.find((c) => c.color === color);
    if (matchedColor) {
      return matchedColor?.borderColor;
    } else {
      return color.slice(0, -2);
    }
  };

  const addToFavorite = async (id: number) => {
    try {
          
      const response = await getAllBookmark(id.toString());
      const currentData = response?.data[0];
    if (response?.isSuccess == false) {
      console.error("Error fetching current favorite status:", response?.message);
      return;
    }

    const isCurrentlyFavorite = currentData?.favorite;

    const newFavoriteState = !isCurrentlyFavorite;

    if (newFavoriteState) {
      toast.success("Add to favorite successfully");
    }

    const data = await updateBookmarks(id.toString(), { favorite: newFavoriteState });

    if (data?.isSuccess == false) {
      console.error("Error toggling favorite status:", data?.message);
      return;
    }
      dispatch(fileAddToFavorite(id));
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const handleNoteClick = (e: React.MouseEvent) => {
    // Check if the click is on a dialog, dropdown, or interactive element
    const target = e.target as HTMLElement;
    
    // Check if clicking on the main note item content (not on interactive elements)
    const isMainContent = target.closest('.col-span-1') && 
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
    
    // Only navigate if clicking on the main note item content AND no sidebar is open
    if (isMainContent && !hasOpenSidebar) {
      router.push(`${pathName}/note/${item.document_id}`);
    } else {
      e.stopPropagation();
    }
  };

  return (
    <div
      key={i}
      onClick={handleNoteClick}
      className="col-span-1 border p-5 dark:bg-[#202D32] cursor-pointer"
      style={{ borderRadius: "40px 10px 40px 10px" }}
    >
      <h4 className="font-medium">{item?.title}</h4>

      <div className="h-[150px] rounded-xl mb-2 flex items-center justify-center my-2">
        <IoDocumentTextOutline className="text-[150px]" color="#0F69EE" />
      </div>
      <div className="flex items-center gap-3 justify-end mt-3 mb-2">
        <div
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            addToFavorite(item?.id);
          }}
        >
          {item.favorite ? <FavoriteIcon /> : <NotFavoriteIcon />}
        </div>
        <CopyToClipboard
          text={`${window.location.origin}$/notes-bookmarks/notes/${item?.document_id}`}
        >
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toast.success("Copy to clipboard!");
            }}
          >
            <CopyIcon />
          </div>
        </CopyToClipboard>

        <DropdownMenu open={openDropdownId === i}>
          <DropdownMenuTrigger className="dropdownMenuTrigger">
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleDropdownToggle(i);
              }}
            >
              <Dotes />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent
              onPointerDownOutside={(e) => {
                e.stopPropagation();
                setOpenDropdownId(null);
              }}
              className="dropdownMenu p-2 bg-inputBackground"
              side="right"
              align="start"
            >
              <DropdownMenuItem
                className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setTageId(item?.id);
                  setOpenDropdownId(false);
                }}
              >
                <FaBookmark className="h-[18px] w-[18px] dark:text-[#CCCCCC]" />
                Add Manage Tags
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReminderDialogOpen(true);
                  setOpenDropdownId(false);
                }}
              >
                <CalendarIcon className="h-[18px] w-[18px] dark:text-[#CCCCCC]" />
                Manage Reminders
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-3  font-size-normal font-normal text-lightGray cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setVisible(true);
                  setShareId(item.document_id);
                  setOpenDropdownId(false);
                }}
              >
                <CgExport className="h-[18px] w-[18px] rotate dark:text-[#CCCCCC]" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShareVisible(true);
                  setShareId(item.document_id);
                  setOpenDropdownId(false);
                }}
              >
                <Share2 className="h-[18px] w-[18px] dark:text-[#CCCCCC]" />
                Share
              </DropdownMenuItem>

              <DropdownMenuItem
                className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDropdownToggle(i);
                  setDeleteDialogInfo({
                    id: item?.document_id,
                    show: true,
                    name: item?.title,
                    type: "note",
                  });
                }}
              >
                <Trash className="h-[18px] w-[18px]" color="#E92222" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>
      <p className="text-[13px]">
        <span
          className="line-clamp-2"
          dangerouslySetInnerHTML={{ __html: item?.description }}
        />
      </p>

      <div className="text-[10px] mt-3 mb-3">Tags</div>
      {item.tags && item.tags.length > 0 ? (
        <div>
          <div className="flex">
            {item.tags.slice(0, 2).map((tag: Tags, index: number) => (
              <div
                key={index}
                style={{
                  backgroundColor: tag.color && tag.color,
                  color: compareColor(tag.color),
                }}
                className="inline-block px-2 py-1 me-1 my-1 whitespace-nowrap text-sm rounded-lg cursor-pointer"
              >
                {tag.name}
              </div>
            ))}
          </div>

          {item.tags.length > 2 && (
            <div className="flex mt-1">
              <div
                style={{
                  backgroundColor: item.tags[2].color,
                  color: compareColor(item.tags[2].color),
                }}
                className="inline-block px-2 py-1 me-1 my-1 whitespace-nowrap text-sm rounded-lg cursor-pointer"
              >
                {item.tags[2].name}
              </div>

              {item.tags.length > 3 && (
                <Tooltip
                  color="invert"
                  content={
                    <div className="flex space-x-2 ">
                      {item.tags.slice(3).map((t: Tags, index: number) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: t.color,
                            color: compareColor(t.color),
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
                    <span className="text-blue-400">
                      {item.tags.length - 3} +
                    </span>
                  </div>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground bg-slate-200 px-2 py-1 mt- text-sm rounded-lg ">
          No Tag
        </span>
      )}
      {isReminderDialogOpen && (
        <ReminderDialog 
          isOpen={isReminderDialogOpen}
          onOpenChange={setIsReminderDialogOpen}
          paperTitle={item?.title}
          itemType={item?.type}
          itemId={item?.id}
          userId={userId}
          type="note"
        />
      )}
    </div>
  );
};

export default NoteView;
