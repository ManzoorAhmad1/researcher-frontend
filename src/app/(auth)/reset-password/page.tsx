"use client"

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { reserPasswordApi } from "@/apis/user";
import { FiEyeOff, FiLock, FiEye } from "react-icons/fi";

interface FormValues {
  password: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const Params = useSearchParams();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
    getValues,
  } = useForm<FormValues>({
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    const token: any = Params.get("token");
    if (!token) {
      toast.error("Invalid reset link");
      setIsLoading(false);
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await reserPasswordApi(token, {
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (response.status === 200) {
        toast.success("Your password has been reset successfully. Sign in.");
        router.push("/login");
      } else {
        toast.error("Unable to reset password. Try again!");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const manageViewPassword = () => setShowPassword(!showPassword);

  return (
    <div className="flex items-center justify-center h-full w-full px-4 py-8">
      <div className="w-full max-w-md bg-white space-y-6 p-6 rounded">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <img src="/websiteLogo.png" alt="AIScholarix Logo" className="h-20 w-auto" />
            <span className="text-4xl font-bold text-black">AIScholarix</span>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600 font-medium">Set a new password to secure your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <FiLock size={20} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value: passwordRegex,
                  message:
                    "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
                },
                minLength: { value: 8, message: "Password must be at least 8 characters long" },
              })}
              onChange={(e) => {
                const cleanedValue = e.target.value.replace(/\s/g, "");
                setValue("password", cleanedValue, { shouldValidate: true });
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" onClick={manageViewPassword}>
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
            {isSubmitted && errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <FiLock size={20} />
            </span>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              {...register("confirmPassword", {
                required: "Confirm Password is required",
                validate: (value) => value === getValues("password") || "Passwords do not match",
              })}
              onChange={(e) => {
                const cleanedValue = e.target.value.replace(/\s/g, "");
                setValue("confirmPassword", cleanedValue, { shouldValidate: true });
              }}
            />
            {isSubmitted && errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition">
            {isLoading ? "Generating..." : "Generate Password"}
          </button>
        </form>
      </div>
    </div>
  );
}