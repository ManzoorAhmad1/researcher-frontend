import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { RootState } from "@/reducer/store";
import { useSelector } from "react-redux";
import { FormValues, RequestToEditorDialogProps } from "../utils/types";
import { getNoteByDocId, updateNote } from "@/apis/notes-bookmarks";

interface Member {
  id: string | number;
  [key: string]: any;
}

const RequestToEditorDialog: React.FC<RequestToEditorDialogProps> = ({
  showRequestDialog,
  setShowRequestDialog,
}) => {
  const params = useParams();
  const { slug } = params;
  const id = slug?.[slug?.length - 1];
  const supabase: SupabaseClient = createClient();
  const userInfo = useSelector(
    (state: RootState) => state.user.user?.user 
  );
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      message: "",
    },
  });


  const onSubmit: SubmitHandler<FormValues> = async (data) => {
 
    const notesInfo = await getNoteByDocId(id);
    const existingData = notesInfo?.data;

    const currentRequest = existingData?.request || [];
    let updatedRequest;
    updatedRequest = [
      ...currentRequest,
      {
        email: userInfo?.email,
        id: userInfo?.id,
        message: data?.message,
        role: "Editor",
        first_name: userInfo?.first_name,
        last_name: userInfo?.last_name,
      },
    ];

    updatedRequest = updatedRequest.reduce<Member[]>((unique, member) => {
      const existingMemberIndex = unique.findIndex(
        (item) => item.id === member.id
      );

      if (existingMemberIndex !== -1) {
        unique[existingMemberIndex].role = member.role;
      } else {
        unique.push(member);
      }

      return unique;
    }, []);

    
      const response = await updateNote(id, { request: updatedRequest });

    if (response?.isSuccess == false) {
      console.error("Error updating data:", response?.message);
    }
    setShowRequestDialog(false);
  };

  return (
    <Dialog
      open={showRequestDialog}
      onOpenChange={() => setShowRequestDialog(false)}
    >
      <DialogContent className="w-[28rem]">
        <div>
          <DialogHeader className="mb-3 text-lg font-semibold">
            <span className="font-light">Ask owner to be an editor</span>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <textarea
            cols={45}
            rows={3}
            className="border rounded-lg border-[#ccc] p-2 mt-3 bg-transparent"
            {...register("message")}
            placeholder="Enter message"
          />

          <div className="flex gap-2 justify-end items-center mt-6">
            <Button
              className="rounded-[26px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
              variant="outline"
              type="button"
              onClick={() => setShowRequestDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-[26px] btn text-white h-9 w-20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestToEditorDialog;
