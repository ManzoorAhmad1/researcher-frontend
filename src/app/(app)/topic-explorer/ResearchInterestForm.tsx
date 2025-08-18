"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-dropdown-select";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WORKSPACE_BADGES } from "@/constant";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateUser } from "@/apis/user";
import { updateUserPlan } from "@/reducer/auth/authSlice";
import "./index.css";

interface ResearchInterestFormProps {
  fullwidth?: boolean;
}

interface FormData {
  selectedBadges: any[];
  details: string;
}

const ResearchInterestForm: React.FC<ResearchInterestFormProps> = ({
  fullwidth,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [badges, setWorkspaceBadges] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const user = useSelector((state: any) => state.user?.user?.user );
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      selectedBadges:
        user?.research_interests?.map((interest: string) => ({
          label: interest,
          value: interest,
        })) || [],
      details: user?.research_interest_detail || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response :any= await updateUser({
        research_interests: data?.selectedBadges?.map(
          (interest) => interest?.value
        ),
        research_interest_detail: data?.details,
      });
      if (response) {
        toast.success(response?.data?.message);
        dispatch(updateUserPlan(response?.data?.user));
        localStorage.setItem("user", JSON.stringify(response?.data?.user));
        if (pathname !== "/topic-explorer") {
          router.push("/dashboard");
        }
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
    <div>
      <Card
        className="sm:col-span-2 flex flex-col justify-between h-full bg-blueTh"
        x-chunk="dashboard-05-chunk-0"
      >
        <CardHeader className="pb-4">
          <CardTitle> Select Your Research Interests</CardTitle>
        </CardHeader>
        <CardContent
          className={`${fullwidth ? "max-w-[100%]" : "max-w-[60%]"}`}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="pt-2">
              <Controller
                name="selectedBadges"
                control={control}
                rules={{ required: "Please select at least one interest" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    color="#772dedfc"
                    multi={true}
                    createNewLabel="Add {search}"
                    searchable={true}
                    create
                    values={field.value}
                    options={[...WORKSPACE_BADGES, ...badges]}
                    onChange={(values) => field.onChange(values)}
                    onCreateNew={(newItem) => {
                      setWorkspaceBadges([
                        { label: newItem.label, value: newItem.value },
                      ]);
                    }}
                    className="w-full py-2 rounded-md bg-white border-none outline-none"
                  />
                )}
              />
              {errors.selectedBadges && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.selectedBadges.message}
                </p>
              )}
            </div>
            <div className="mt-8 mb-4">
              <Textarea
                className="placeholder:text-xs placeholder:text-black pt-3 w-full outline-none border-none"
                placeholder="Add more details about your research interests..."
                {...register("details", { required: "Details are required" })}
              />
              {errors.details && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.details.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="h-8 flex ml-auto"
              disabled={isLoading}
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResearchInterestForm;
