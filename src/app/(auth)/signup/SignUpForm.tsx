"use client";

import { MdOutlineEmail } from "react-icons/md";
import { FiEyeOff } from "react-icons/fi";
import { FiLock } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import Link from "next/link";
import { IoIosMan } from "react-icons/io";
import { MdOutlineMan4 } from "react-icons/md";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import OAuthForm from "./OAuthForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { findByRefferCode, reffralStats, signUpApi } from "@/apis/user/index";
import { usePostHog } from "posthog-js/react";
import LayoutBar from "@/components/LayoutBar/LayoutBar";
import ThemeInput from "@/components/ui/ThemeInput";
import RoundButton from "@/components/ui/RoundButton";
import localStorageService from "@/utils/localStorage";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { signUp, updateUserPlan } from "@/reducer/auth/authSlice";
import dynamic from "next/dynamic";

const ReferralModal = dynamic(() => import("./RefferedModal"), {
  ssr: false,
});
interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, "");
};

const trimAndSanitize = (value: string): string => {
  const trimmed = value.trim();

  return sanitizeInput(trimmed);
};

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const posthog = usePostHog();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
    getValues,
    watch,
    trigger,
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });
  const [showDiv, setShowDiv] = useState(false);
  const [refferedName, setRefferedName] = useState("");
  const [showModal, setShowModal] = useState(false);

  const searchParams = useSearchParams();
  const referral_code = searchParams.get("referral_code") as string;

  useEffect(() => {
    const fetchReferralData = async () => {
      if (referral_code) {
        const response = await findByRefferCode(referral_code);
        if (response?.data?.data?.first_name) {
          setRefferedName(response?.data?.data?.first_name);
          setShowDiv(true);
          setShowModal(true);
        }
        sessionStorage.setItem("referral_code", referral_code);
      }
    };

    fetchReferralData();
  }, [referral_code]);

  const inviteEmail = searchParams.get("email")
    ? decodeURIComponent(searchParams.get("email")!.replace(/\+/g, "%2B"))
    : null;
  const org_id = searchParams.get("orgId");
  const org_name = searchParams.get("orgName");

  useEffect(() => {
    if (inviteEmail) {
      setValue("email", inviteEmail);
    }
  }, [inviteEmail]);

  useEffect(() => {
    if (referral_code) {
      localStorage.setItem("referral_code", referral_code);
    }
  }, [referral_code]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const sanitizedData = {
        ...data,
        email: trimAndSanitize(data.email),
        firstName: trimAndSanitize(data.firstName),
        lastName: trimAndSanitize(data.lastName),
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      const payload = org_id
        ? { ...sanitizedData, org_id, org_member_status: "active" }
        : sanitizedData;
      const result = await signUpApi(payload, referral_code);
      setIsLoading(false);
      if (result) {
        posthog.capture("user-signup");

        toast.success(result.data.message || "Verificaiton email is sent");
        if (org_id) {
          const token = result?.data?.data?.token;
          const user = result?.data?.user;
          const refreshToken = result?.data?.data?.refreshToken;
          try {
            if (user && Object.keys(user).length > 0) {
              dispatch(signUp(user));
            }
          } catch (dispatchError) {
            console.error("Error dispatching user plan:", dispatchError);
          }

          localStorageService.setItem("token", token);
          localStorageService.setItem("refreshToken", refreshToken);
          localStorageService.setItem("user", user);
          Cookies.remove("username");
          Cookies.remove("password");
          if (user.is_user_plan_active === true) {
            if (
              !user?.research_interests ||
              user?.research_interests === null ||
              user?.research_interests?.length === 0
            ) {
              router.push(`/main-topic-explorer?org_name=${org_name}`);
            } else {
              router.push(`/dashboard?org_name=${org_name}`);
            }
          } else {
            router.push(`/account/subscriptions?org_name=${org_name}`);
          }
        } else {
          const url = `/verify-email?email=${data.email}`;
          router.push(url);
        }
      }
    } catch (error: any) {
      setIsLoading(false);
      toast.error(
        error?.response?.data?.message || "An unexpected error occurred"
      );
    }
  };
  const manageViewPassword = () => {
    setShowPassword(!showPassword);
  };

  const nameRegex = /^[A-Za-z\s]{1,50}$/;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const firstName = watch("firstName");
  const lastName = watch("lastName");

  useEffect(() => {
    if (isSubmitted && errors.email && email) {
      trigger("email");
    }
  }, [email, errors, trigger]);

  useEffect(() => {
    if (isSubmitted && errors.password && password) {
      trigger("password");
    }
  }, [password, errors, trigger]);

  useEffect(() => {
    if (isSubmitted && errors.confirmPassword && confirmPassword) {
      trigger("confirmPassword");
    }
  }, [confirmPassword, errors, trigger]);

  useEffect(() => {
    if (isSubmitted && errors.firstName && firstName) {
      trigger("firstName");
    }
  }, [firstName, errors, trigger]);

  useEffect(() => {
    if (isSubmitted && errors.lastName && lastName) {
      trigger("lastName");
    }
  }, [lastName, errors, trigger]);

  return (
    <>
      <ReferralModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        referrerName={refferedName}
      />

      <div className="flex items-center justify-center h-full w-full px-4">
        <div className="w-full max-w-md bg-white rounded">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <img src="/websiteLogo.png" alt="AIScholarix Logo" className="h-20 w-auto" />
              <span className="text-4xl font-bold text-black">AIScholarix</span>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-600 font-medium">Create an account to start your research journey</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <IoIosMan size={20} />
              </span>
              <input
                placeholder="First Name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                {...register("firstName")}
                onChange={(e) => {
                  const cleanedValue = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  const sanitizedValue = sanitizeInput(cleanedValue);
                  setValue("firstName", sanitizedValue, { shouldValidate: true });
                }}
              />
              {isSubmitted && errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <MdOutlineMan4 size={20} />
              </span>
              <input
                placeholder="Last Name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                {...register("lastName")}
                onChange={(e) => {
                  const cleanedValue = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  const sanitizedValue = sanitizeInput(cleanedValue);
                  setValue("lastName", sanitizedValue, { shouldValidate: true });
                }}
              />
              {isSubmitted && errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <MdOutlineEmail size={20} />
              </span>
              <input
                placeholder="Email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                {...register("email")}
                disabled={!!inviteEmail}
                onChange={(e) => {
                  const cleanedValue = e.target.value.replace(/\s/g, "");
                  const sanitizedValue = sanitizeInput(cleanedValue);
                  setValue("email", sanitizedValue, { shouldValidate: true });
                }}
              />
              {isSubmitted && errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FiLock size={20} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                {...register("password")}
                onChange={(e) => {
                  const cleanedValue = e.target.value.replace(/\s/g, "");
                  setValue("password", cleanedValue, { shouldValidate: true });
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer" onClick={manageViewPassword}>
                {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </span>
              {isSubmitted && errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FiLock size={20} />
              </span>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                {...register("confirmPassword")}
                onChange={(e) => {
                  const cleanedValue = e.target.value.replace(/\s/g, "");
                  setValue("confirmPassword", cleanedValue, { shouldValidate: true });
                }}
              />
              {isSubmitted && errors.confirmPassword && <p className="text-red-500 text-sm mt-1 text-center">{errors.confirmPassword.message}</p>}
            </div>

            <div className="mt-5 mb-5">
              {isLoading ? (
                <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                <button type="submit" className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition" onClick={() => { trigger(); }}>
                  Sign Up
                </button>
              )}
            </div>
          </form>

          <div className="mt-2">
            <div className="flex justify-center w-full">
              <Label className="text-gray-700 text-[13px] font-normal leading-[19.5px] text-center">
                Continue using social media
              </Label>
            </div>            <div className="mt-1 mb-3 flex justify-center gap-4">
              <OAuthForm />
            </div>
            <label className="flex justify-center w-full items-center">
              <Label className="text-gray-700 text-[13px] font-normal leading-[19.5px] text-left tracking-[1px]">
                Already have account?
                <span className="font-poppins text-[13px] font-semibold leading-[19.5px] text-left cursor-pointer">&nbsp; <Link href="/login">Login here</Link></span>
              </Label>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
