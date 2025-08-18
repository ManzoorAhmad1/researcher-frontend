"use client";

import { useState } from "react";
import { forgotPasswordApi } from "@/apis/user";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { MdOutlineEmail } from "react-icons/md";
import LayoutBar from "@/components/LayoutBar/LayoutBar";
import ThemeInput from "@/components/ui/ThemeInput";
import RoundButton from "@/components/ui/RoundButton";
import { useForm } from "react-hook-form";

interface FormValues {
  email: string;
}

export default function ForgotPassword({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    setValue,
    watch,
    trigger,
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const email = watch("email");

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const response = await forgotPasswordApi({ email: data.email });

      if (response?.data?.isSuccess) {
        toast.success(response?.data?.message);
        setIsLoading(false);
        router.push(
          "/confirm?message=Password Reset link has been sent to your email address"
        );
      } else {
        toast.error("Could not send reset email");
        setIsLoading(false);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <LayoutBar>
      <div className="rounded-bl-[12px] sm:rounded-bl-[0px]  bg-[#39393933] backdrop-blur-[12px] flex sm:px-[76px] px-[16px] py-[44.5px] rounded-tr-[12px] md:rounded-tr-[12px] md:rounded-br-[12px] sm:rounded-tr-[0px] rounded-br-[12px] sm:rounded-br-[0px] h-full">
        <div className="min-w-full">
          <div className="px-[23.5px]">
            <h1 className="font-poppins text-[28px] font-medium leading-[42px] text-left mb-8 text-[#E5E5E5]">
              Enter your email
            </h1>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-5">
                <ThemeInput
                  placeholder="m@example.com"
                  register={{
                    ...register("email", {
                      required: "Email is required.",
                      pattern: {
                        value: emailRegex,
                        message: "Please enter a valid email address.",
                      },
                    }),
                  }}
                  onChange={(e) => {
                    const cleanedValue = e.target.value.replace(/\s/g, "");
                    setValue("email", cleanedValue, { shouldValidate: true });
                  }}
                  StartAdornment={() => (
                    <MdOutlineEmail
                      color="white"
                      style={{ height: "22px", width: "22px" }}
                    />
                  )}
                />
                {isSubmitted && errors.email && (
                  <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="mt-10 mb-10">
                <RoundButton
                  label={"Send"}
                  type="submit"
                  isLoading={isLoading}
                  onClick={() => {
                    trigger();
                  }}
                />
              </div>
            </form>
          </div>
          <div>
            <Label className="text-[#E5E5E5] font-poppins text-[13px] font-normal leading-[19.5px] text-left tracking-[1px]">
              Remember your password?
              <span className="font-poppins text-[13px] font-semibold leading-[19.5px] text-left cursor-pointer">
                &nbsp; <Link href="/login"> Sign in here</Link>
              </span>
            </Label>
          </div>
        </div>
      </div>
    </LayoutBar>
  );
}
