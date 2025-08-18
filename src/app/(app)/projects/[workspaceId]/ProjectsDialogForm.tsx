import React, { useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { CustomInput } from "@/components/ui/customInput";
import { Loader } from "rizzui";

import { createProject, updateProject } from "@/apis/projects";
import { getWorkspacesByUser } from "@/apis/workspaces";
import { addAllWorkspaces } from "@/reducer/services/workspaceSlice";
import { AppDispatch } from "@/reducer/store";
import { useDispatch } from "react-redux";

interface FormData {
  name: string;
}
interface ProjectsDialogFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: any;
  refetch: (restrictRefresh: boolean) => void;
}
const ProjectsDialogForm = ({
  isOpen,
  onOpenChange,
  project,
  refetch,
}: ProjectsDialogFormProps) => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const methods = useForm<FormData>({
    defaultValues: {
      name: project?.name,
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = methods;

  const handleEditSubmit: SubmitHandler<FormData> = async (data: any) => {
    setLoading(true);
    try {
      const response = await updateProject({
        data: { name: data?.name },
        id: project.id,
      });
      if (response) {
        let workspaceResponse = await getWorkspacesByUser();

        // const workspacesWithProjects =
        //   workspaceResponse?.data?.data?.workspaces?.filter(
        //     (workspace: any) =>
        //       workspace?.workspaces?.user_projects &&
        //       workspace?.workspaces?.user_projects?.length > 0
        //   );
        dispatch(addAllWorkspaces(workspaceResponse?.data?.data?.workspaces));
        toast.success(response?.data?.message);
        refetch(true);
        onOpenChange(false);
        reset();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    try {
      const response: any = await createProject({
        name: data?.name,
        workspace_id: params?.workspaceId as string,
      });
      if (response?.success === false) {
        toast.error(response?.message);
      }
      onOpenChange(false);
      reset();
      if (response) {
        let workspaceResponse = await getWorkspacesByUser();
        // const workspacesWithProjects =
        //   workspaceResponse?.data?.data?.workspaces?.filter(
        //     (workspace: any) =>
        //       workspace?.workspaces?.user_projects &&
        //       workspace?.workspaces?.user_projects?.length > 0
        //   );
        dispatch(addAllWorkspaces(workspaceResponse?.data?.data?.workspaces));
        toast.success(response?.data?.message);
        refetch(true);
        reset();
      }
    } catch (error: any) {
      console.log(error, "error");
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  let newsLetterWatch: any = watch("name");
  return (
    <TooltipProvider>
      <FormProvider {...methods}>
        <div className="flex justify-end">
          <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
              <DialogTitle>
                {project?.name ? "Update project" : "Create project"}
              </DialogTitle>
              <DialogDescription>
                Enter the details below to{" "}
                {project?.name ? "Edit project" : "Create a new project"}
              </DialogDescription>
              <form
                onSubmit={
                  project?.name
                    ? handleSubmit(handleEditSubmit)
                    : handleSubmit(onSubmit)
                }
                className="grid gap-4"
              >
                <div className="grid gap-2 relative">
                  <Label htmlFor="name">Enter project name</Label>

                  <CustomInput
                    id="name"
                    type="text"
                    placeholder="Enter project name"
                    {...register("name", {
                      required: "Project name is required",
                      maxLength: {
                        value: 130,
                        message: "Name cannot exceed 130 characters",
                      },
                    })}
                  />

                  {errors.name && (
                    <p className="text-primaryRed font-normal font-size-normal mt-1.5">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-between gap-2">
                  <Button
                    type="submit"
                    className="mt-4 rounded-[26px] btn text-white"
                    disabled={
                      newsLetterWatch ===
                      methods?.formState?.defaultValues?.name
                    }
                  >
                    {loading ? (
                      <Loader variant="threeDot" size="sm" />
                    ) : (
                      <>{project?.name ? "Update project" : "Create project"}</>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </FormProvider>
    </TooltipProvider>
  );
};

export default ProjectsDialogForm;
