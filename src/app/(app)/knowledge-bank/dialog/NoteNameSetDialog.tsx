import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { NoteNameSetDialogProps } from "../utils/types";
import { updateNote } from "@/apis/notes-bookmarks";

type FormValues = {
  documentName: string;
};

const NoteNameSetDialog: React.FC<NoteNameSetDialogProps> = ({
  setShow,
  showNameDialog,
  setShowNameDialog,
  setNoteTitle,
}) => {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      documentName: "Untitled Document",
    },
  });
  const supabase: SupabaseClient = createClient();
  const title = watch("documentName");
  const params = useParams();
  const { slug } = params;
  const id = slug?.[slug.length - 1];

  const addInSupabase = async () => {
    const body = { title };
   
      await updateNote(id, body );
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    addInSupabase();
    setNoteTitle(data.documentName);
    setShowNameDialog(false);
    setShow(true);
  };

  const handleClose = () => {
    addInSupabase();
    setShowNameDialog(false);
    setShow(true);
    setNoteTitle(getValues("documentName"));
  };

  return (
    <Dialog open={showNameDialog} onOpenChange={handleClose}>
      <DialogContent
        onPointerDownOutside={() => setShow(true)}
        className="w-96"
      >
        <div>
          <DialogHeader className="mb-3 text-xl font-semibold">
            Name before sharing
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-2">{`Give your untitled document a name before it's shared:`}</div>
          <input
            type="text"
            {...register("documentName")}
            placeholder="Enter document name"
            className="border py-3 rounded-md px-2 w-full border-gray-400 mt-1 dark:bg-[#1A2A2E] outline-none bg-transparent"
          />

          <div className="flex gap-2 justify-end items-center mt-6">
            <Button
              className="rounded-[26px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
              variant="outline"
              type="button"
              onClick={handleClose}
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

export default NoteNameSetDialog;
