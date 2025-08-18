import React, { useEffect, useState } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTeamApi } from "@/apis/team";
import { Loader } from "rizzui";
import { CustomInput } from "@/components/ui/customInput";
import { useDispatch } from "react-redux";
import { updateUserPlan } from "@/reducer/auth/authSlice";

interface FormData {
  name: string;
  description: string;
}

const TeamDetail: any = ({
  getTeam,
  updatedFormData,
}: {
  getTeam: () => void;
  updatedFormData: Object;
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const params = useSearchParams();
  const dispatch = useDispatch();
  const methods = useForm<FormData>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = methods;

  const description = watch("description") || "";

  const maxDescriptionLength = 250;
  const organizationId = params.get("id");

  useEffect(() => {
    if (updatedFormData && Object.values(updatedFormData).length) {
      setFormData(updatedFormData);
    }
  }, [updatedFormData]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    try {
      let response:any = await createTeamApi({ organizationId, ...data });
      if(response?.success===false){
        toast.error(response?.message)
      }
      getTeam();
      setIsDeleteDialogOpen(false);
      document.getElementById("close-dialog")?.click();
      reset();
      if (response) {
        toast.success(response?.data?.message);
        if (response?.data?.user && response?.data?.user!==null) {
          dispatch(updateUserPlan(response?.data?.user));
          localStorage.setItem("user", JSON.stringify(response?.data?.user));
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const organizationName = params.get("name");

  return (
    <TooltipProvider>
      <FormProvider {...methods}>
        <div className="flex justify-between">
          <p className="mt-6 text-lg font-semibold">{organizationName}</p>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="mt-4 btn text-sm px-2  rounded-[26px] btn text-white"
              >
                + Create Team
              </button>
            </DialogTrigger>

            <DialogContent>
              <DialogTitle>Create Team</DialogTitle>
              <DialogDescription>
                Enter the details below to create a new team
              </DialogDescription>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid gap-2 relative">
                  <Label htmlFor="name">Team Name</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CustomInput
                        id="name"
                        type="text"
                        placeholder="Enter team name"
                        {...register("name", {
                          required: "Team name is required",
                        })}
                      />
                    </TooltipTrigger>
                    {errors.name && (
                      <TooltipContent>{errors.name.message}</TooltipContent>
                    )}
                  </Tooltip>
                </div>
                <div className="grid gap-2 relative">
                  <Label htmlFor="description">Description</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Textarea
                        id="description"
                        placeholder="Enter team description"
                        {...register("description", {
                          required: "Description is required",
                        })}
                      />
                    </TooltipTrigger>
                    {errors.description && (
                      <TooltipContent>
                        {errors.description.message}
                      </TooltipContent>
                    )}
                    <span className="text-xs text-gray-500">
                      {description.length}/{maxDescriptionLength}
                    </span>
                  </Tooltip>
                </div>
                <div className="flex justify-between gap-2">
                  {!formData ? (
                    <Button
                      type="submit"
                      className="mt-4 btn rounded-[26px] text-white"
                      disabled={
                        loading || description.length > maxDescriptionLength
                      }
                    >
                      {loading ? (
                        <Loader variant="threeDot" size="sm" />
                      ) : (
                        "Create team"
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="mt-4 btn rounded-[26px] text-white"
                      disabled={
                        loading || description.length > maxDescriptionLength
                      }
                    >
                      {loading ? (
                        <Loader variant="threeDot" size="sm" />
                      ) : (
                        "Update team"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </FormProvider>
    </TooltipProvider>
  );
};

export default TeamDetail;
