import React, { useEffect, useState } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
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
import { createOrganization } from "@/apis/team";
import { Loader } from "rizzui";
import { CustomInput } from "@/components/ui/customInput";

interface FormData {
  name: string;
  description: string;
  email: string;
  phone: string;
}

const OrganizationDetail: any = ({
  getTeam,
  updatedFormData,
}: {
  getTeam: () => void;
  updatedFormData: Object;
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

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

  useEffect(() => {
    if (updatedFormData && Object.values(updatedFormData).length) {
      setFormData(updatedFormData);
      reset(updatedFormData as FormData);
    }
  }, [updatedFormData, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    try {
      const response: any = await createOrganization(data);
      if (response?.success === false) {
        toast.error(response?.message);
      }
      getTeam();
      setIsDeleteDialogOpen(false);
      document.getElementById("close-dialog")?.click();
      reset();
      if (response) {
        toast.success(response?.data?.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <FormProvider {...methods}>
        <div className="flex justify-end">
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="mt-4  btn text-white rounded-[26px]"
              >
                + Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Create Organization</DialogTitle>
              <DialogDescription>
                Enter the details below to create a new Organization
              </DialogDescription>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid gap-2 relative">
                  <Label htmlFor="name">Enter Organization name</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CustomInput
                        id="name"
                        type="text"
                        placeholder="Enter Organization name"
                        {...register("name", {
                          required: "Organization name is required",
                        })}
                      />
                    </TooltipTrigger>
                    {errors.name && (
                      <TooltipContent>{errors.name.message}</TooltipContent>
                    )}
                  </Tooltip>
                </div>
                <div className="grid gap-2 relative">
                  <Label htmlFor="email">Organization Email</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CustomInput
                        id="email"
                        type="text"
                        placeholder="Enter Organization email"
                        {...register("email", {
                          required: "Organization email is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email address",
                          },
                        })}
                      />
                    </TooltipTrigger>
                    {errors.email && (
                      <TooltipContent>{errors.email.message}</TooltipContent>
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
                <div className="flex justify-end gap-2">
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
                        "Create Organization"
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="mt-4 btn rounded-[26px] text-white "
                      disabled={
                        loading || description.length > maxDescriptionLength
                      }
                    >
                      {loading ? (
                        <Loader variant="threeDot" size="sm" />
                      ) : (
                        "Update Organization"
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

export default OrganizationDetail;
