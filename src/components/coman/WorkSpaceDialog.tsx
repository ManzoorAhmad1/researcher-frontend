import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose,
  Dialog,
} from "@/components/ui/dialog";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import toast from "react-hot-toast";
import { createWorkSpace, updateWorkspaces } from "@/apis/workspaces";

interface workspaceDialog {
  open: boolean;
  setOpen: any;
  handleGetWorkSpaces: (value?: boolean) => void;
  isLoading?: boolean;
  workspace?: any;
  setIsLoading: (value: boolean) => void;
}

const WorkSpaceDialog: React.FC<workspaceDialog> = ({
  open,
  setOpen,
  handleGetWorkSpaces,
  isLoading,
  workspace,
  setIsLoading,
}) => {
  const methods = useForm({
    values: {
      name: workspace?.name ? workspace?.name : "",
    },
  });
  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = methods;
  let newsLetterWatch: any = watch("name");
  const handelCreateWorkSpace = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await createWorkSpace(data);

      if (response) {
        toast.success(response?.data?.message);
        handleGetWorkSpaces(true);
        reset();
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handelUpdate = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await updateWorkspaces({
        data: { name: data?.name },
        id: workspace?.id,
      });
      if (response) {
        toast.success(response?.data?.message);
        handleGetWorkSpaces(true);
        reset();
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Workspace</DialogTitle>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(
              workspace?.name ? handelUpdate : handelCreateWorkSpace
            )}
            className="grid gap-4"
          >
            <div className="grid gap-2 relative py-2">
              <Label htmlFor="name">Workspace Name</Label>

              <Input
                type="text"
                className="outline-none mt-1 active:border-none border-none "
                placeholder="Enter Workspace Name"
                {...register("name", {
                  required: "Workspace Name name is required",
                })}
              />
              {errors.name && (
                <div className=" text-[12px] text-red-400">
                  {errors?.name?.message as string}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-2">
              <DialogClose asChild>
                <Button variant="secondary" className="rounded-[26px]">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  newsLetterWatch === methods?.formState?.defaultValues?.name
                }
                className="rounded-[26px] btn text-white"
              >
                {workspace?.name ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default WorkSpaceDialog;
