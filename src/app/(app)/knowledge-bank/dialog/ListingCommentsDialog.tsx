import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { LoaderCircle } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { Comments, ListingCommentsDialogProps } from "../utils/types";
import { useParams } from "next/navigation";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { getNoteByDocId, updateNote } from "@/apis/notes-bookmarks";

const ListingCommentsDialog: React.FC<ListingCommentsDialogProps> = ({
  quill,
  myMemberInfo,
  show,
  setShow,
}) => {
  const supabase: SupabaseClient = createClient();
  const params = useParams();
  const { slug } = params;
  const doc_id = slug?.[slug.length - 1];
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState("");
  const [commentList, setCommentList] = useState<Comments[]>([]);
  const [commentReplyId, setCommentReplyId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyLoader, setReplyLoader] = useState(false);
  const userInfo = useSelector((state: RootState) => state.user.user?.user);
  const fetchCommentList = async () => {
    setLoading(true);
   
      const data = await getNoteByDocId(doc_id);

    if (data?.isSuccess == false) {
      console.error("Error fetching CommentList:", data?.message);
    } else {
      setCommentList(data?.data?.comments || []);
    }
    setLoading(false);
  };

  const handleCommentClick = (id: string) => {
    const comment = commentList.find((c) => c.id === id);
    if (comment) {
      const range = comment.range;
      if (range) {
        quill.setSelection(range.index, range.length);
        setShow(false);
      }
    }
  };

  const handleDeleteComment = async (id: string) => {
    setDeleteLoading(id);

    const updatedComments = commentList.filter((comment) => comment.id !== id);
    setCommentList(updatedComments);

    const response = await updateNote(doc_id, {comments:updatedComments});

    if (response?.isSuccess == false) {
      console.error("Error deleting comment:", response?.message);
      setCommentList(commentList);
    } else {
      console.log("Comment deleted successfully");
    }
  };

  const addReply = async (id: string) => {
    setReplyLoader(true);

    const updatedComments = commentList?.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          comments: [
            ...item.comments,
            {
              comment: replyText,
              id: new Date().getTime(),
              first_name: userInfo?.first_name,
              last_name: userInfo?.last_name,
            },
          ],
        };
      }
      return item;
    });

    const response = await updateNote(doc_id, {comments:updatedComments});

    if (response?.isSuccess == false) {
      console.error("Error deleting comment:", response?.message);
      setCommentList(commentList);
    } else {
      console.log("Comment deleted successfully");
    }
    if (response?.data && response?.data?.length > 0) {
      setCommentList(response?.data[0]?.comments);
      setReplyLoader(false);
      setCommentReplyId("");
      setReplyText("");
    }
  };

  useEffect(() => {
    if (show) {
      fetchCommentList();
    }
  }, [show]);

  return (
    <Dialog open={show} onOpenChange={() => setShow(false)}>
      <DialogContent className="max-w-[800px]">
        <div>
          <DialogHeader className="mb-3">Comments</DialogHeader>
          {loading ? (
            <LoaderCircle className="animate-spin h-5 w-5 mx-auto text-red" />
          ) : (
            <ul>
              {commentList?.length > 0 ? (
                commentList.map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => setCommentReplyId(item?.id)}
                    >
                      <div className="border rounded-lg p-4 border-gray-400 mb-3">
                        <div className="flex">
                          <div
                            className="text-[14px] text-blue-500 cursor-pointer w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCommentClick(item.id);
                            }}
                          >
                            {item.selectedText}
                          </div>
                          <div className="text-[12px] text-gray-500 flex justify-center items-center gap-2">
                            {myMemberInfo?.role === "Owner" && (
                              <span>
                                {deleteLoading ? (
                                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                                ) : (
                                  <span
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteComment(item.id);
                                    }}
                                  >
                                    <RiDeleteBin6Line color="red" size={20} />
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <hr className="my-2" />
                        {item?.comments?.map((comment, i) => (
                          <div
                            key={comment?.id}
                            className="flex text-[15px] justify-between mt-3"
                          >
                            <span className="w-full">{comment?.comment}</span>
                            <span className="whitespace-nowrap text-stone-400">
                              {comment?.first_name} {comment?.last_name}
                            </span>
                          </div>
                        ))}
                        {commentReplyId === item.id && (
                          <>
                            <input
                              type="text"
                              name=""
                              id=""
                              placeholder="Reply"
                              value={replyText}
                              onChange={(e) => setReplyText(e?.target.value)}
                              className="bg-transparent mt-3 w-full rounded-md py-1 border border-gray-400 px-2 text-[13px] focus:outline-none"
                            />
                            {replyText && (
                              <div className="flex justify-end gap-3 mt-3">
                                <button
                                  className="rounded-[26px] button-outline"
                                  onClick={() => setReplyText("")}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="rounded-[26px] button-full w-[100px]"
                                  onClick={() => addReply(item.id)}
                                  type="submit"
                                >
                                  {replyLoader ? (
                                    <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                                  ) : (
                                    "Reply"
                                  )}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 pt-6">
                  No comment found
                </div>
              )}
            </ul>
          )}
          <DialogFooter className="mt-6"></DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListingCommentsDialog;
