import React, { useState ,useEffect} from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { CalendarIcon, MoreVertical, Move, Pencil, Star, Tag, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip } from "rizzui";
import Image from "next/image";
import { BookmarkBodyProps, Tags } from "../../../utils/types";
import logo from "@/images/researchcollab-logo.svg";
import { useDrag } from "react-dnd";
import { FavoriteIcon } from "../../../icons";
import { NotFavoriteIcon } from "@/app/(app)/creative-thinking/icons/icons";
import toast from "react-hot-toast";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/reducer/store";
import { fileAddToFavorite } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getAllBookmark, updateBookmarks } from "@/apis/notes-bookmarks";
import { removeReminder, getRemindersByUserTypeAndItem } from "@/apis/reminder";
import ReminderDialog from "@/components/coman/ReminderDailog";
const BookmarkBody: React.FC<BookmarkBodyProps> = ({
  item,
  setTageId,
  tableColumns,
  handleEdite,
  selectedItems,
  setDeleteDialogInfo,
  setSelectedItems,
  handleMove,
  setBookmarkInfo,
}) => {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const supabase: SupabaseClient = createClient();
  const colors = [
    { color: "#E9222229", borderColor: "#E92222" },
    { color: "#F59B1429", borderColor: "#F59B14" },
    { color: "#F5DE1429", borderColor: "#F5AC14" },
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

  const [{ isDragging }, drag] = useDrag({
    type: "noteBookmarks",
    item:
      selectedItems?.length > 0
        ? selectedItems
        : [{ id: item.id, type: "file" }],
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleCheckboxChange = (id: string, type: string) => {
    setSelectedItems((prev: { id: string; type: string }[]) =>
      prev.some((item) => item.id === id)
        ? prev.filter((item) => item.id !== id)
        : [...prev, { id, type }]
    );
  };

  const addToFavorite = async (id: number) => {
    try {
      const response = await getAllBookmark(id.toString());
      const currentData = response?.data[0];
      if (response?.isSuccess == false) {
        console.error(
          "Error fetching current favorite status:",
          response?.message
        );
        return;
      }

      const isCurrentlyFavorite = currentData?.favorite;

      const newFavoriteState = !isCurrentlyFavorite;
      if (newFavoriteState) {
        toast.success("Add to favorite successfully");
      }

      const data = await updateBookmarks(id.toString(), {
        favorite: newFavoriteState,
      });

      if (data?.isSuccess == false) {
        console.error("Error toggling favorite status:", data?.message);
        return;
      }

      dispatch(fileAddToFavorite(id));
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState<boolean>(false);
 
  const userId = useSelector((state: any) => state.user?.user?.user?.id);

  

  return (
    <TableRow
      ref={drag as any}
      className={`relative group !cursor-move ${
        isDragging && selectedItems.includes(String(item?.id))
          ? "bg-blue-100"
          : ""
      }`}
      style={{
        opacity:
          isDragging && selectedItems.includes(String(item?.id)) ? 0.8 : 1,
        cursor: selectedItems.includes(String(item?.id)) ? "move" : "pointer",
      }}
    >
      <TableCell
        className="max-w-[20px] checkbox-column"
        style={{ width: "0px", paddingRight: "0px" }}
      >
        <Checkbox
          checked={selectedItems.some(
            (selected: any) => selected.id === item?.id
          )}
          onClick={() => handleCheckboxChange(item?.id, "file")}
        />
      </TableCell>

      {tableColumns?.map((column:any) => {
        if (column?.field === "title" && column?.visible)
          return (
            <TableCell key={column?.name} className="cursor-pointer">
              <div className="flex items-center gap-2 font-medium w-80">
                <span className="ml-1 w-[50px] rounded-md overflow-hidden">
                  {item?.image_url ? (
                    <OptimizedImage
                      src={item?.image_url}
                      alt=""
                      width={50}
                      height={50}
                      className="h-[50px] object-cover"
                    />
                  ) : (
                    <OptimizedImage
                      src={
                        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//researchcollab-logo.svg`
                      }
                      alt=""
                      width={38}
                      height={38}
                    />
                  )}
                </span>
                {/* <Link
                  href={`${pathname}/bookmark/${item?.id}`}
                  className="text-xs font-normal line-clamp-2"
                >
                  {item?.title}
                </Link> */}
                <div
                  onClick={() => setBookmarkInfo({ show: true, id : item?.id })}
                  className="text-xs font-normal line-clamp-2"
                >
                  {item?.title?.length > 60 ? item?.title?.slice(0, 40) + "..." : item?.title}
                </div>
              </div>
            </TableCell>
          );
        if (column?.field === "description" && column?.visible)
          return (
            <TableCell key={column?.name}>
              <span
                className="line-clamp-2"
                dangerouslySetInnerHTML={{ __html: item?.description }}
              />
            </TableCell>
          );
        if (column?.field === "tags" && column?.visible) {
          return (
            <TableCell className="table-cell w-60" key={column?.name}>
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
                              {item.tags
                                .slice(3)
                                .map((t: Tags, index: number) => (
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
                <span className="text-muted-foreground">No Tag</span>
              )}
            </TableCell>
          );
        }
        if (column?.field === "links" && column?.visible) {
          return (
            <TableCell className="table-cell text-[#0E70FF]" key={column?.name}>
              <a href={item?.link} target="_blank" rel="noopener noreferrer">
                {item?.link}
              </a>
            </TableCell>
          );
        }
      })}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 border-none bg-transparent"
            >
              <MoreVertical className="h-6 w-6" />
              <span className="sr-only">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="p-2 bg-inputBackground border border-borderColor text-lightGray cursor-pointer"
          >
            <DropdownMenuItem
              className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
              onClick={() =>
                setDeleteDialogInfo({
                  id: item?.id,
                  show: true,
                  name: item?.title,
                  type: "bookmark",
                })
              }
            >
              <Trash className="h-[18px] w-[18px]" color="#CCCCCC" /> Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setTageId(item?.id)}
              className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
            >
              <Tag className="h-[18px] w-[18px] " color="#CCCCCC" /> Manage tag
            </DropdownMenuItem>
            <DropdownMenuItem
            onSelect={() => setIsReminderDialogOpen(true)}
            className="gap-3 font-size-normal font-normal text-lightGray"
          >
            <CalendarIcon className="h-[18px] w-[18px] " color="#CCCCCC" /> Manage Reminders
          </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => handleEdite(item, "bookmark")}
              className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
            >
              <Pencil className="h-[18px] w-[18px]" color="#CCCCCC" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                handleMove({
                  itemType: item?.type,
                  itemId: item?.id,
                  itemName: item?.title,
                })
              }
              className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
            >
              <Move className="h-[18px] w-[18px]" color="#CCCCCC" /> Move
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 font-size-normal font-normal text-lightGray cursor-pointer"
              onClick={() => addToFavorite(item?.id)}
            >
              {item.favorite ? (
                <FavoriteIcon />
              ) : (
                <Star className="h-[18px] w-[18px]" color="#CCCCCC" />
              )}
              <span className="ps-[.18rem]">Add to favorites</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
      {isReminderDialogOpen &&<ReminderDialog 
        isOpen={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
        paperTitle={item?.title}
        itemType={item?.type}
        itemId={item?.id}
        userId={userId}
        type= "bookmark"
      />}
    </TableRow>
  );
};

export default BookmarkBody;
