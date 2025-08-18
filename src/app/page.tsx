"use client";

import React from "react";
import dynamic from "next/dynamic";
import layoutBg from "@/images/layoutBg.svg";
import layoutLogo from "@/images/researchcollab-logo.svg";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signInApiGoogle } from "@/apis/user";
import { AppDispatch } from "@/reducer/store";
import { signInGoogle } from "@/reducer/auth/authSlice";
import { ImageSizes, priorityImageProps } from "@/utils/image-optimizations";
import { OptimizedImage } from "@/components/ui/optimized-image";
const LoginForm = dynamic(() => import("./(auth)/login/LoginForm"), {
  ssr: false,
});

const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const providerToken = urlParams.get("provider_token");

    const refferralCode =
      sessionStorage.getItem("referral_code") ||
      localStorage.getItem("referral_code");


    if (providerToken) {
      const data = {
        provider: "google",
        token: providerToken,
        refferralCode,
      };

      const signInFunc = async () => {
        try {
          const response = await signInApiGoogle(data);
          dispatch(
            signInGoogle({
              token: response?.data?.token,
              refreshToken: response?.data?.refreshToken,
              user: response?.data?.user,
            })
          );

          if (response?.data?.token) {
            toast.success(response?.data?.message);
            const user = response?.data?.user;

            if (user.is_user_plan_active) {
              router.push("/dashboard");
            } else {
            }
          }
        } catch (error: any) {
          console.error("Login failed:", error);
          toast.error(error?.message || "Something went wrong");
        }
      };

      signInFunc();
    }
  }, []);

  return (
    <>
      <div className="relative flex items-center justify-center h-screen w-full">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${layoutBg.src})`,
            filter: "brightness(54%) contrast(63%) saturate(107%)",
          }}
        />

        <div
          className="grid grid-cols-1 sm:grid-cols-1 lg:max-w-[1036px] lg:grid-cols-2 relative z-10 items-center justify-center  text-center sm:m-6 m-1 rounded-lg md:grid-cols-1"
          style={{
            boxShadow: "rgba(0, 0, 0, 0.6) 4px 58px 36px -23px",
            flexWrap: "wrap",
            borderRadius: "12px",
          }}
        >
          <div className="hidden sm:block bg-[#D0D0D0] md:px-[80px] px-[20px] md:py-[44.5px] py-[14.5px] rounded-tl-[12px] lg:rounded-bl-[12px] md:rounded-bl-[0px] min-h-full md:rounded-tr-[12px] lg:rounded-tr-[0px] rounded-tr-[12px] md:flex flex-col md:justify-center ">
            <div className="flex items-center mb-6 gap-4">
              <OptimizedImage
                src={
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//researchcollab-logo.svg`
                }
                alt="Logo"
                height={90}
                width={90}
                {...priorityImageProps}
              />
              <h1
                className="font-poppins text-[24px] font-semibold leading-[36px] text-[#333333]"
                style={{ overflowWrap: "break-word" }}
              >
                <Link href={"/"}>ResearchCollab </Link>
              </h1>
            </div>
            <p className="font-poppins text-[15px] text-left font-normal leading-[22.5px] text-[#333333] hidden md:block break-words">
              Smart Research, Simplified. Find papers, share ideas, stay
              organized - all in one place
            </p>
          </div>

          <div className="md:overflow-y-auto overflow-y-auto lg:max-h-[fit-content] md:max-h-[50vh] sm:max-h-full max-h-full">
            {" "}
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
};
export default Page;
