import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { LoaderCircle } from "lucide-react";

interface RenameNoteTitleDialogOpenProps {
  renameNoteTitleDialogShow: boolean;
  setRenameNoteTitleDialogShow: (item: boolean) => void;
  renameTitle: (item: { title: string }, type: string) => void;
  noteTitle?: string | null;
}

interface FormInputs {
  title: string;
}

const RenameNoteTitleDialog: React.FC<RenameNoteTitleDialogOpenProps> = ({
  renameNoteTitleDialogShow,
  setRenameNoteTitleDialogShow,
  renameTitle,
  noteTitle,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({ defaultValues: { title: noteTitle || "" } });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    await renameTitle?.(data, "note");
    setRenameNoteTitleDialogShow(false);
  };

  useEffect(() => {
    if (noteTitle) {
      setValue("title", noteTitle);
    }
  }, [noteTitle, setValue]);
  return (
    <Dialog
      open={renameNoteTitleDialogShow}
      onOpenChange={() => setRenameNoteTitleDialogShow(false)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              {...register("title", { required: "Required*" })}
              className={`mt-1 flex h-10 w-full rounded-md border border-input bg-greyTh px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              className="rounded-[26px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
              variant="outline"
              type="button"
              onClick={() => setRenameNoteTitleDialogShow(false)}
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameNoteTitleDialog;
