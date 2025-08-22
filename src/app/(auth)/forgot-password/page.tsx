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

export default function ForgotPassword({ searchParams }: { searchParams: { message: string } }) {
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
  } = useForm<FormValues>({ defaultValues: { email: "" }, mode: "onChange" });

  const email = watch("email");

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const response = await forgotPasswordApi({ email: data.email });

      if (response?.data?.isSuccess) {
        toast.success(response?.data?.message);
        setIsLoading(false);
        router.push("/confirm?message=Password Reset link has been sent to your email address");
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
      <div className="flex items-center justify-center h-full w-full px-4 py-8">
        <div className="w-full max-w-md bg-white space-y-6 p-6 rounded">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <img src="/websiteLogo.png" alt="AIScholarix Logo" className="h-20 w-auto" />
              <span className="text-4xl font-bold text-black">AIScholarix</span>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-600 font-medium">Enter your email to receive a password reset link</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <MdOutlineEmail size={20} />
              </span>
              <input
                type="email"
                placeholder="m@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: emailRegex, message: "Please enter a valid email address" },
                })}
                onChange={(e) => {
                  const cleanedValue = e.target.value.replace(/\s/g, "");
                  setValue("email", cleanedValue, { shouldValidate: true });
                }}
              />
              {isSubmitted && errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <button type="submit" className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition" onClick={() => trigger()}>
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>

          <div>
            <Label className="text-gray-700 font-poppins text-[13px] font-normal leading-[19.5px] text-left tracking-[1px]">
              Remember your password?
              <span className="font-poppins text-[13px] font-semibold leading-[19.5px] text-left cursor-pointer">&nbsp; <Link href="/login"> Sign in here</Link></span>
            </Label>
          </div>
        </div>
      </div>
    </LayoutBar>
  );
}
