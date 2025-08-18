import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RootState } from "@/reducer/store";
import { useSelector } from "react-redux";
import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { AddBookmarkCommentsDialogProps } from "../utils/types";
import { v4 as uuidv4 } from "uuid";
import {  getAllBookmark, updateBookmarks,  } from "@/apis/notes-bookmarks";

const AddBookmarkCommentsDialog: React.FC<AddBookmarkCommentsDialogProps> = ({
  show,
  setShow,
  commentsData,
}) => {
  const params = useParams();
  const { slug } = params;
  const id = slug?.[slug.length - 1];
  const supabase: SupabaseClient = createClient();
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const userInfo = useSelector((state: RootState) => state.user.user?.user);

  const handleSubmit = async () => {
    setLoading(true);
    

    const commentsBody = {
      ...commentsData,
      comments: [
        {
          id: uuidv4(),
          comment,
          first_name: userInfo?.first_name,
          last_name: userInfo?.last_name,
        },
      ],
    };

    
      const response = await getAllBookmark(id);
      const existingData = response?.data;
    if (response?.isSuccess == false) {
      console.error("Error fetching existing record:", response?.message);
      return;
    }

    if (existingData && existingData?.[0]?.comments?.length > 0) {
      const existingComments = existingData[0].comments || [];
      const updatedComments = [...existingComments, commentsBody];

      
        const response = await updateBookmarks(id, {comments:updatedComments});

      if (response?.isSuccess == false) {
        console.error("Error updating comments:", response?.message);
        return;
      }
    } else {
      
        const response = await updateBookmarks(id, {comments: [commentsBody]});

      if (response?.isSuccess == false) {
        console.error("Error updating the record:", response?.message);
        return;
      }
    }
    setLoading(false);
    setShow(false);
  };

  return (
    <Dialog open={Boolean(show)} onOpenChange={() => setShow(false)}>
      <DialogContent>
        <div>
          <DialogHeader className="mb-3">Add comment</DialogHeader>
          <Input
            placeholder="comments add.."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <DialogFooter className="mt-6">
            <div className="flex gap-2 justify-end items-center">
              <Button
                onClick={() => setShow(false)}
                className=" text-[#0E70FF] rounded-[26px] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="rounded-[26px] btn text-white h-9 w-20"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <>
                    <span className="text-nowrap">Save</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookmarkCommentsDialog;
