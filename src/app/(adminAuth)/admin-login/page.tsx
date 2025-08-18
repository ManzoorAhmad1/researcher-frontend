"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/overviewTabs";
import AdminThemeInput from "@/components/ui/AdminThemeInput";
import { MdOutlineEmail } from "react-icons/md";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import RoundButton from "@/components/ui/RoundButton";
import layoutLogo from "@/images/researchcollab-logo.svg";
import { encryptPassword } from "@/apis/user";
import Image from "next/image";
import { ImCheckboxChecked } from "react-icons/im";
import { ImCheckboxUnchecked } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { FaGoogle } from "react-icons/fa";
import { FaMicrosoft } from "react-icons/fa";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { AppDispatch } from "../../../reducer/store";
import { adminSignInApi } from "@/apis/admin-user";
import toast from "react-hot-toast";
import MESSAGES from "@/constant/Messages";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface FormValues {
  email: string;
  password: string;
  two_factor_otp: string;
}
const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isActiveTab, setActiveTab] = React.useState("sign in");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [checkReminder, setCheckReminder] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const dispatche: AppDispatch = useDispatch();
  const user = useSelector((state: any) => state.adminUser);
  const userData=useSelector((state: any) => state.user?.user?.user) || {};
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const storedUsername: string | undefined = Cookies.get("admin_username");
  const storedPassword: string | undefined = Cookies.get("admin_password");

  if (storedUsername && storedPassword) {
    const finalPassword: string = encryptPassword(storedPassword as string);
    setValue("email", storedUsername);
    setValue("password", finalPassword);
  }
  useEffect(()=>{
    if(userData?.first_name && userData?.last_name){
      router.push("/dashboard");
    }
  },[userData])
  useEffect(() => {
    const userToken =
      localStorage.getItem("admin_token") ||
      sessionStorage.getItem("admin_token");

    if (userToken) {
      navigateSignIn();
    }
  }, [user?.user, user?.user?.id]);

  const selectTab = (value: string) => {
    setActiveTab(value);
  };
  const removeSpaces = (value: string): string => value.replace(/\s+/g, " ");
  const manageViewPassword = () => {
    setShowPassword(!showPassword);
  };
  const manageReminder = () => {
    setCheckReminder(!checkReminder);
  };
  const navigateSignIn = () => {
    router.push("/admin-dashboard");
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const result = await dispatch(
        adminSignInApi({ data: data, checkReminder })
      );
      if (result?.payload.user) {
        toast.success(MESSAGES.SUCCESSFULL_LOGIN);
      } else {
        toast.error(
          result.payload.message || "Login failed. Please try again."
        );
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const SignInComponent = () => {
    return (
      <>
        {" "}
        <div className="flex items-center justify-center h-screen">
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="lg:w-[500px] md:w-[500px] sm:md:w-[400px] w-[350px] py-3">
                <h4 className="text-[#636a76]" style={{ lineHeight: "3rem" }}>
                  Email Address
                </h4>
                <AdminThemeInput
                  placeholder="Enter your email"
                  register={{
                    ...register("email", {
                      required: "Email is required.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    }),
                  }}
                  onChange={(e) => {
                    const cleanedValue = removeSpaces(e.target.value);
                  }}
                />
                {errors.email && (
                  <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="lg:w-[500px] md:w-[500px] sm:md:w-[400px] w-[350px] py-3">
                <h4 className="text-[#636a76]" style={{ lineHeight: "3rem" }}>
                  Password
                </h4>
                <AdminThemeInput
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  EndAdornment={() => {
                    return showPassword ? (
                      <FiEye
                        style={{
                          color: "#CCCCCC",
                          height: "22px",
                          width: "22px",
                          cursor: "pointer",
                        }}
                        onClick={manageViewPassword}
                      />
                    ) : (
                      <FiEyeOff
                        style={{
                          color: "#CCCCCC",
                          height: "22px",
                          width: "22px",
                          cursor: "pointer",
                        }}
                        onClick={manageViewPassword}
                      />
                    );
                  }}
                  register={{
                    ...register("password", {
                      required: "Password is required.",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long.",
                      },
                    }),
                  }}
                  onChange={(e) => {
                    const cleanedValue = removeSpaces(e.target.value);
                  }}
                />
                {errors.password && (
                  <p className="text-red-500 text-left mt-1 text-sm font-black text-[#d64242]">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
                className="py-[1rem]"
              >
                <Label className="font-poppins text-sm font-normal leading-[19.5px] text-left items-center text-center flex text-[#888]">
                  {checkReminder ? (
                    <ImCheckboxChecked
                      color="#999999"
                      onClick={manageReminder}
                      className="cursor-pointer h-4 w-4 mr-2"
                    />
                  ) : (
                    <ImCheckboxUnchecked
                      color="#999999"
                      onClick={manageReminder}
                      className="cursor-pointer h-4 w-4 mr-2"
                    />
                  )}
                  Remember me
                </Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm"
                >
                  <label className="font-poppins text-sm font-semibold leading-[19.5px] text-[#6e6be2] text-left cursor-pointer">
                    {/* Forgot password? */}
                  </label>
                </Link>
              </div>
              <div className="mt-12">
                <RoundButton
                  type="submit"
                  label={"Login"}
                  isLoading={isLoading}
                />
              </div>
            </form>
          </div>
        </div>
      </>
    );
  };
  return (
    <div className="flex flex-wrap h-screen">
      <div
        className="w-full lg:w-1/2 p-[1rem] lg:h-screen h-max"
        style={{
          backgroundColor: "#D0D0D0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <OptimizedImage
              src={
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//researchcollab-logo.svg`
              }
              alt="Logo"
              height={150}
              width={150}
              layout="intrinsic"
            />
          </div>
          <h1
            className="text-[#333333] font-[700] lg:text-[3rem] text-[2rem] pb-4 lg:pb-4 text-center lg:text-start"
            style={{ textAlign: "center" }}
          >
            Welcome to Admin Panel of ResearchCollab
          </h1>
          <h4
            className="text-[#333333] font-[400] lg:text-[1.4rem] text-[0.8rem] text-center lg:text-start"
            style={{ textAlign: "center" }}
          >
            Smart Research, Simplified. Find papers, share ideas, stay organized
            - all in one place
          </h4>
        </div>
      </div>
      <div
        className="w-full lg:w-1/2 lg:px-[7em] lg:py-[0em] h-screen px-[1.4em] py-[1em]"
        style={{
          backgroundColor: "#f9fafb",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className="">
          <SignInComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
