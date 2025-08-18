"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../reducer/store";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "./supabaseClient";
import { signInApiFacebook, signInApiGoogle } from "@/apis/user";
import { signInFacebook, signInGoogle } from "@/reducer/auth/authSlice";
import { LoaderCircle } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import Image from "next/image";
import Cookies from "js-cookie";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;

export default function OAuthForm() {
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useSearchParams();
  const user = useSelector((state: any) => state?.user?.user);
  const hasRun = useRef(false);
  const provider = params.get("provider");

  useEffect(() => {
    if (user) {
      const userToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (userToken) {
        if (user?.user?.is_user_plan_active === true) {
          router.push("/dashboard");
        } else {
          // router.push("/subscription-plan");
        }
      } else {
        localStorage.clear();
        sessionStorage.clear();
        Cookies.remove("lastApiCall");
        router.push("/login");
      }
    }
  }, [user]);

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
        provider,
        token: providerToken,
        refferralCode,
      };

      const signInFunc = async () => {
        try {
          let response;
          if (provider === "facebook") {
            setFbLoading(true);
            response = await signInApiFacebook(data);
            dispatch(
              signInFacebook({
                token: response?.data?.token,
                refreshToken: response?.data?.refreshToken,
                user: response?.data?.user,
              })
            );
          } else if (provider === "google") {
            setIsLoading(true);
            response = await signInApiGoogle(data);
            dispatch(
              signInGoogle({
                token: response?.data?.token,
                refreshToken: response?.data?.refreshToken,
                user: response?.data?.user,
              })
            );
          }

          if (response?.data?.token) {
            setIsLoading(false);
            setFbLoading(false);
            toast.success(response?.data?.message);
            const user = response?.data?.user;
            if (user.is_user_plan_active) {
              router.push("/dashboard");
            } else {
              router.push("/account/subscriptions");
            }
          } else {
            setIsLoading(false);
            setFbLoading(false);
          }
        } catch (error: any) {
          console.error("Login failed:", error);
          setIsLoading(false);
          setFbLoading(false);
          toast.error(
            error?.respnse?.data?.message ||
              error?.message ||
              "Something went wrong"
          );
        }
      };
      // New Change
      signInFunc();
    }
  }, [provider]);

  // const handleFacebookLogin = async () => {
  //   setFbLoading(true);
  //   const { error } = await supabase.auth.signInWithOAuth({
  //     provider: "facebook",
  //     options: {
  //       redirectTo: `${frontendUrl}/login?provider=facebook`,
  //       queryParams: {
  //         prompt: "select_account",
  //       },
  //     },
  //   });
  //   if (error) console.error("Error logging in with Facebook:", error.message);
  //   posthog.capture("user-signup");
  //   setFbLoading(false);
  // };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${frontendUrl}/login?provider=google`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    if (error) console.error("Error logging in with Google:", error.message);
    posthog.capture("user-signup");
    setIsLoading(false);
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center w-10 h-10 mx-auto">
          <div className="w-8 h-8 border-4 border-t-transparent border-b-transparent border-l-transparent border-r-blue-500 animate-spin rounded-full">
            <div className="absolute inset-0 w-full h-full border-4 border-t-transparent border-b-transparent border-l-transparent border-r-green-500 animate-spin rounded-full"></div>
            <div className="absolute inset-0 w-full h-full border-4 border-t-transparent border-b-transparent border-l-transparent border-r-yellow-500 animate-spin rounded-full"></div>
          </div>
        </div>
      ) : (
        <OptimizedImage
          src={
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//googleLogo.svg`
          }
          style={{ cursor: "pointer" }}
          onClick={handleGoogleLogin}
          alt="googleLogo"
          height={ImageSizes.social.height}
          width={ImageSizes.social.width}
          layout="intrinsic"
        />
      )}

      {/* {fbLoading ? (
      <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
    ) : (
      <Image src={facebookLogo} style={{ cursor: 'pointer' }} alt="facebookLogo" onClick={handleFacebookLogin} height={48} width={48} layout="intrinsic" />
    )} */}

      {/* <Image src={linkedinLogo} style={{ cursor: 'pointer' }} alt="linkedinLogo" height={48} width={48} layout="intrinsic" />
    <Image src={microsoftLogo} style={{ cursor: 'pointer' }} alt="microsoftLogo" height={48} width={48} layout="intrinsic" />
    <Image src={appleLogo} style={{ cursor: 'pointer' }} alt="appleLogo" height={48} width={48} layout="intrinsic" />
    <Image src={xLogo} style={{ cursor: 'pointer' }} alt="xLogo" height={48} width={48} layout="intrinsic" /> */}
      {/* <div className="w-full max-w-xs mx-auto"> */}
      {isLoading ||
        (fbLoading && (
          <p className="text-center mb-4 text-base text-balance text-muted-foreground">
            Please wait a Moment ...
          </p>
        ))}

      {/* <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleFacebookLogin}
          disabled={isLoading}
          className="hover:bg-blue-200"
        >
          {fbLoading ? (
            <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
          ) : (
            <FaFacebook size="18" className="text-blue-600" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="hover:bg-blue-200"
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
          ) : (
            <FaGoogle size="18" className="text-red-600" />
          )}
        </Button>
      </div>
    </div> */}
    </>
  );
}
