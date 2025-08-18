// CollaborateRoom.tsx

import React, { useState, useRef } from "react";
import { RiEyeCloseLine } from "react-icons/ri";
import { FaRegStar } from "react-icons/fa6";
import { CgNotes } from "react-icons/cg";
import Image, { ImageProps } from "next/image";
import { Input } from "@/components/ui/input";
import { Button as CustomButton } from "@/components/ui/button";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Separator } from "@/components/ui/separator";
import ai_chat_boat from "@/images/aiChat/ai_chat_boat.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface CollaborateRoomProps {
  notes: any[];
  note: any;
  setNewCommentHandler: (noteId: number, newComment: string) => void;
  addComment: (noteId: number) => void;
  jumpToHighlightArea: any;
  setIsCommentDialog: (noteId: number) => void;
  setDeleteHighlightId: (noteId: number) => void;
  setIsDeleteHighlightOpen: (note: boolean) => void;
  noteIndex: number;
  tag: string;
}

const CollaborateRoom: React.FC<CollaborateRoomProps> = ({
  notes,
  note,
  noteIndex,
  setNewCommentHandler,
  setIsDeleteHighlightOpen,
  setDeleteHighlightId,
  setIsCommentDialog,
  jumpToHighlightArea,
  addComment,
  tag,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    return () => {
      noteEles.clear();
    };
  }, []);
  const noteEles: Map<number, HTMLElement> = new Map();

  const handleAddComment = (noteId: number) => {
    addComment(noteId);
  };

  const renderMessages = (note: any) =>
    note.isCommentDialogOpen && (
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
        {note.comments.map((comment: any, idx: number) => (
          <>
            <div
              key={idx}
              className="bg-gray-200 pl-2 mb-2 rounded dark:bg-[#223238]"
            >
              <span className="text-xs text-gray-500 dark:text-[#9a9898]">
                {comment.user}
              </span>
              <div className="flex flex-wrap w-full break-words dark:text-[#CCCCCC] max-h-[300px] overflow-auto">
                {comment.comment}
              </div>
            </div>
          </>
        ))}
        <Input
          className="dark:text-[#CCCCCC]"
          placeholder="Add a comment"
          onChange={(e) => setNewCommentHandler(note.id, e.target.value)}
          value={note.newComment}
        />
        <div className="mt-2 flex justify-end w-full">
          <CustomButton
            variant="secondary"
            onClick={() => handleAddComment(note.id)}
            disabled={note.newComment.trim() === ""}
            style={{ maxWidth: "113px" }}
          >
            Add Comment
          </CustomButton>
        </div>
      </div>
    );

  return (
    <>
      <span
        onClick={() => jumpToHighlightArea(note.highlightAreas[0])}
        ref={(ref): void => {
          noteEles.set(note.id, ref as HTMLElement);
        }}
        className="w-full"
      >
        <div className="cursor-pointer py-2 w-[250px] flex justify-between gap-[10px] break-all w-full">
          <div className="flex gap-[10px]">
            <Image src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//useIcon.jpg`} alt="useIcon"
              width={28}
              height={28}
              className="w-[28px] h-[28px] rounded-[20px] border border-[rgba(14,112,255,1)]"
            />
            <Label className="break-words dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal leading-[19.5px] flex items-center">
              {note?.userName || "Wade Warren"}
            </Label>
          </div>

          <div className="w-max">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="rounded-[25px] bg-[#f2f2f2] cursor-pointer bg-white p-[3px] hover:bg-[#6666661f] dark:bg-[#fff0] dark:hover:bg-[#ffffff1f]">
                  <HiOutlineDotsVertical
                    strokeWidth={2}
                    color="rgba(102, 102, 102, 1)"
                    className="w-[25px] h-[25px] cursor-pointer"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="px-4 py-2 dark:bg-[#374950]">
                <DropdownMenuItem className="text-[13px] font-[400] leading-[19.5px]">
                  <RiEyeCloseLine
                    color="#666666"
                    className="me-4 w-[18px] h-[18px]"
                  />
                  <span className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal leading-[19.5px]">
                    Hide comments
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[13px] font-[400] leading-[19.5px]">
                  <CgNotes color="#666666" className="me-4 w-[18px] h-[18px]" />
                  <span className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal leading-[19.5px]">
                    Add to Notes
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[13px] font-[400] leading-[19.5px]">
                  <FaRegStar
                    color="#666666"
                    className="me-4 w-[18px] h-[18px]"
                  />
                  <span className="dark:text-[#CCCCCC] text-[#333333] text-[13px] font-normal leading-[19.5px]">
                    Add to Favorites
                  </span>
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuLabel>
                  <div className="flex text-[#0E70FF] border border-[#0E70FF] rounded-[26px] cursor-pointer py-1 px-4">
                    <OptimizedImage
                      width={ImageSizes.icon.sm.width}
                      height={ImageSizes.icon.sm.height}
                      src={
                        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//ai_chat_boat%20(1).svg`
                      }
                      className="max-h-[20px] max-w-[20px] h-[20px] w-[55px]"
                      alt="ai_chat_boat"
                    />
                    &nbsp;&nbsp;Explain text
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <h1
          style={{ backgroundColor: tag, borderRadius: "0px 10px 10px 10px" }}
          className="flex flex-wrap break-words max-h-[300px] overflow-auto overflow-y-auto py-2 px-3  dark:text-[#CCCCCC] text-[#666666]  text-[13px] font-normal leading-[19.5px]"
        >
          {note.content}
        </h1>
      </span>
      <div className="mt-2 flex justify-between w-full">
        <div className="flex">
          <Label
            onClick={() => setIsCommentDialog(note.id)}
            className="text-[#0E70FF] cursor-pointer"
          >
            Reply
          </Label>
          <div className="bg-[#E5E5E5] p-[1px] m-[3px_8px]"></div>
          <Label
            onClick={() => {
              setDeleteHighlightId(note.id);
              setIsDeleteHighlightOpen(true);
            }}
            className="text-[#0E70FF] cursor-pointer"
          >
            Delete
          </Label>
        </div>
        <Label className="text-[#999999] text-[13px] font-normal leading-[19.5px]">
          yesterday
        </Label>
      </div>
      {renderMessages(note)}
    </>
  );
};

export default CollaborateRoom;
