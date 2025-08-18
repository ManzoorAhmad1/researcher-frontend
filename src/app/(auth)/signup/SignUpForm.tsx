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
    <LayoutBar>
      <ReferralModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        referrerName={refferedName}
      />
      <div className="rounded-bl-[12px] sm:rounded-bl-[0px] bg-[#39393933] backdrop-blur-[12px] flex sm:px-[76px] px-[16px] py-[25.5px] sm:py-[44.5px]  rounded-tr-[12px] md:rounded-tr-[12px] md:rounded-br-[12px] sm:rounded-tr-[0px]  rounded-br-[12px] sm:rounded-br-[0px] min-h-fit">
        <div className="min-w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-[23.5px]">
              <h1 className="font-poppins text-[28px] font-medium leading-[42px] text-left mb-3 text-[#E5E5E5]">
                Create an account
              </h1>
              <div className="mb-3">
                <ThemeInput
                  placeholder="First Name"
                  register={{
                    ...register("firstName", {
                      required: "First Name is required.",
                      pattern: {
                        value: nameRegex,
                        message:
                          "First Name can only contain letters and spaces.",
                      },
                      minLength: {
                        value: 1,
                        message:
                          "First Name must be at least 1 character long.",
                      },
                      maxLength: {
                        value: 50,
                        message: "First Name cannot exceed 50 characters.",
                      },
                    }),
                  }}
                  onChange={(e) => {
                    const cleanedValue = e.target.value.replace(
                      /[^A-Za-z\s]/g,
                      ""
                    );
                    const sanitizedValue = sanitizeInput(cleanedValue);
                    setValue("firstName", sanitizedValue, {
                      shouldValidate: true,
                    });
                  }}
                  StartAdornment={() => (
                    <IoIosMan
                      color="white"
                      style={{ height: "22px", width: "22px" }}
                    />
                  )}
                />
                {isSubmitted && errors.firstName && (
                  <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="mb-3">
                <ThemeInput
                  placeholder="Last Name"
                  register={{
                    ...register("lastName", {
                      required: "Last Name is required.",
                      pattern: {
                        value: nameRegex,
                        message:
                          "Last Name can only contain letters and spaces.",
                      },
                      minLength: {
                        value: 1,
                        message: "Last Name must be at least 1 character long.",
                      },
                      maxLength: {
                        value: 50,
                        message: "Last Name cannot exceed 50 characters.",
                      },
                    }),
                  }}
                  onChange={(e) => {
                    const cleanedValue = e.target.value.replace(
                      /[^A-Za-z\s]/g,
                      ""
                    );
                    const sanitizedValue = sanitizeInput(cleanedValue);
                    setValue("lastName", sanitizedValue, {
                      shouldValidate: true,
                    });
                  }}
                  StartAdornment={() => (
                    <MdOutlineMan4
                      color="white"
                      style={{ height: "22px", width: "22px" }}
                    />
                  )}
                />
                {isSubmitted && errors.lastName && (
                  <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="mb-3">
                <ThemeInput
                  placeholder="Email"
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
                    const sanitizedValue = sanitizeInput(cleanedValue);
                    setValue("email", sanitizedValue, { shouldValidate: true });
                  }}
                  StartAdornment={() => (
                    <MdOutlineEmail
                      color={inviteEmail ? "white" : "white"}
                      style={{
                        height: "22px",
                        width: "22px",
                        opacity: inviteEmail ? "1" : "1",
                      }}
                    />
                  )}
                  disabled={!!inviteEmail}
                  style={{
                    backgroundColor: !!inviteEmail
                      ? "#202e33"
                      : "rgba(255, 255, 255, 0.08)",
                    cursor: !!inviteEmail ? "not-allowed" : "auto",
                  }}
                />
                {isSubmitted && errors.email && (
                  <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="mb-3">
                <ThemeInput
                  placeholder="Password"
                  register={{
                    ...register("password", {
                      required: "Password is required.",
                      pattern: {
                        value: passwordRegex,
                        message:
                          "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
                      },
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters long.",
                      },
                    }),
                  }}
                  onChange={(e) => {
                    const cleanedValue = e.target.value.replace(/\s/g, "");
                    setValue("password", cleanedValue, {
                      shouldValidate: true,
                    });
                  }}
                  type={showPassword ? "text" : "password"}
                  StartAdornment={() => (
                    <FiLock
                      color="white"
                      style={{ height: "22px", width: "22px" }}
                    />
                  )}
                  EndAdornment={() => {
                    return showPassword ? (
                      <FiEye
                        color="#CCCCCC"
                        style={{
                          height: "22px",
                          width: "22px",
                          cursor: "pointer",
                        }}
                        onClick={manageViewPassword}
                      />
                    ) : (
                      <FiEyeOff
                        color="#CCCCCC"
                        style={{
                          height: "22px",
                          width: "22px",
                          cursor: "pointer",
                        }}
                        onClick={manageViewPassword}
                      />
                    );
                  }}
                />
                {isSubmitted && errors.password && (
                  <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="mb-3">
                <ThemeInput
                  placeholder="Confirm Password"
                  type={"password"}
                  register={{
                    ...register("confirmPassword", {
                      required: "Confirm Password is required.",
                      validate: (value) =>
                        value === getValues("password") ||
                        "Passwords do not match.",
                    }),
                  }}
                  onChange={(e) => {
                    const cleanedValue = e.target.value.replace(/\s/g, "");
                    setValue("confirmPassword", cleanedValue, {
                      shouldValidate: true,
                    });
                  }}
                  StartAdornment={() => (
                    <FiLock
                      color="white"
                      style={{ height: "22px", width: "22px" }}
                    />
                  )}
                />
                {isSubmitted && errors.confirmPassword && (
                  <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="mt-5 mb-5">
                {isLoading ? (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <RoundButton
                    label={"Sign Up"}
                    type="submit"
                    onClick={() => {
                      trigger();
                    }}
                  />
                )}
              </div>
            </div>
          </form>
          <div>
            <Label className="text-[#E5E5E5] font-poppins text-[13px] font-normal leading-[19.5px] text-left">
              Continue using social media
            </Label>
            <div className="mt-3 mb-3 flex justify-center gap-4">
              <OAuthForm />
            </div>
            <label>
              <Label className="text-[#E5E5E5] font-poppins text-[13px] font-normal leading-[19.5px] text-left tracking-[1px]">
                Already have account?
                <span className="font-poppins text-[13px] font-semibold leading-[19.5px] text-left cursor-pointer">
                  &nbsp; <Link href="/login">Login here</Link>
                </span>
              </Label>
            </label>
          </div>
        </div>
      </div>
    </LayoutBar>
  );
}
