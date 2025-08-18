"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePostHog } from "posthog-js/react";
import { Mail, LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signUp } from "@/reducer/auth/authSlice";
import LayoutBar from "@/components/LayoutBar/LayoutBar";
import RoundButton from "@/components/ui/RoundButton";
import {
  resendVerification,
  verifyEmailUser,
  verifyEmailMember,
  acceptOrgInvitation,
} from "@/apis/user";
import SearchParamsWrapper from "@/components/wrapper/SearchParamsWrapper";
import localStorageService from "@/utils/localStorage";

const VerifyEmailForm: React.FC = () => {
  const posthog = usePostHog();
  const router: any = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isEmailVerified, setEmailVerified] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const state = useSelector((state: any) => state?.user?.user);

  const token = searchParams.get("token");
  const type = searchParams.get("type");
  let email = searchParams.get("email");
  const org_id = searchParams.get("orgId");
  React.useEffect(() => {
    if (state) {
    } else {
      if ((email && org_id) || (token && type)) {
        const fullPath = `${pathname}?${searchParams.toString()}`;
        router.push(`/login/?redirect=${encodeURIComponent(fullPath)}`);
      }
    }
  }, [state]);

  if (email) {
    email = email.replace(/ /g, "+");
  }

  const hasRun = React.useRef(false);

  React.useEffect(() => {
    if (hasRun.current) return;
    let referralCode = localStorage.getItem("referral_code");
    if (token) {
      if (type) {
        if (state && state !== null) {
          verifyEmail(token, type, referralCode);
        }
      } else {
        verifyEmail(token, type, referralCode);
      }
    } else {
      if (state && state !== null) {
        if (email && org_id) {
          acceptOrgInvite(email, org_id);
        }
      }
      setLoading(false);
    }

    hasRun.current = true;
  }, [searchParams]);

  const verifyEmail = async (
    token: string,
    type: string | null,
    referralCode?: any
  ) => {
    try {
      setLoading(true);

      let response;
      if (type) {
        response = await verifyEmailMember(token, type, {});
      } else {
        response = await verifyEmailUser(token, referralCode);
      }

      const data = response.data;
      if (data.isSuccess) {
        localStorage.setItem("token", data?.data?.token);
        localStorageService.setItem("user", data?.user);

        posthog?.capture("email-verified", {
          email: data?.user?.email,
        });

        localStorage.setItem("refreshToken", data?.data?.refreshToken);
        dispatch(
          signUp({
            user: data?.user,
            token: data?.data?.token,
            refreshToken: data?.data?.refreshToken,
          })
        );

        if (data.user?.subscription_plan === "free") {
          if (
            !data.user?.research_interests ||
            data.user?.research_interests === null ||
            data.user?.research_interests?.length === 0
          ) {
            if (type) {
              router.push(`/main-topic-explorer?team_name=${data?.team?.name}`);
            } else {
              router.push("/main-topic-explorer");
            }
          } else {
            if (type) {
              router.push(`/dashboard?team_name=${data?.team?.name}`);
            } else {
              router.push("/dashboard");
            }
          }
        } else {
          setEmailVerified(true);
        }

        setLoading(false);
      } else {
        setLoading(false);

        setError(data.message || "Email verification failed");
      }
    } catch (err) {
      setLoading(false);
      setError("Email verification failed");
    } finally {
      setLoading(false);
    }
  };

  const acceptOrgInvite = async (email: string, org_id: string) => {
    try {
      setLoading(true);
      let response;
      response = await acceptOrgInvitation({ email, org_id });
      const data = response.data;

      if (data.isSuccess) {
        posthog?.capture("org-invite-accepted", {
          email: email,
          org_id: org_id,
        });

        const orgName = data?.org?.name;
        router.push(`/dashboard?org_name=${orgName}`);
        setLoading(false);
      } else {
        setLoading(false);

        setError(data.message || "Email verification failed");
      }
    } catch (err) {
      setLoading(false);
      setError("Email verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendVerifyEmail = async () => {
    setIsLoading(true);
    try {
      const result = await resendVerification({ email: email });
      if (result?.data?.isSuccess) {
        toast.success(result?.data?.message);
      } else {
        toast.error(result?.data?.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mx-auto w-11/12 lg:w-3/4 bg-[#39393933] backdrop-blur-[12px]">
        <CardHeader>
          <CardTitle className="font-poppins text-[28px] font-medium leading-[42px] text-left mb-8 text-[#E5E5E5] font-poppins text-2xl font-medium leading-[42px] text-center">
            {type
              ? "Team Invitation"
              : org_id
              ? "Organization Invitation"
              : "Email Verification"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-center">
            <div className="flex justify-center">
              <Mail size={48} />
            </div>
            <p className="text-[#E5E5E5]">
              {type
                ? "Processing your team invitation..."
                : org_id
                ? "Processing your organization invitation..."
                : "Verifying your email..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto w-11/12 lg:w-3/4 bg-[#39393933] backdrop-blur-[12px]">
        <CardHeader>
          <CardTitle className="font-poppins text-[28px] font-medium leading-[42px] text-left mb-8 text-[#E5E5E5] font-poppins text-2xl font-medium leading-[42px] text-center">
            {type
              ? "Team Invitation"
              : org_id
              ? "Organization Invitation"
              : "Email Verification"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-center">
            <div className="flex justify-center">
              <Mail size={48} />
            </div>
            <p className="text-red-600">
              {type
                ? "Failed to process team invitation"
                : org_id
                ? "Failed to process organization invitation"
                : state
                ? "Your email is already verified"
                : error}
            </p>
            {!org_id && (
              <Button
                type="button"
                className={`mt-4 w-full ${
                  state ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={state}
                onClick={() => resendVerifyEmail()}
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <LayoutBar>
      <div className="rounded-bl-[12px] sm:rounded-bl-[0px] bg-[#39393933] backdrop-blur-[12px] flex sm:px-[76px] px-[16px] py-[44.5px] rounded-tr-[12px] md:rounded-tr-[12px] md:rounded-br-[12px] sm:rounded-tr-[0px]  rounded-br-[12px] sm:rounded-br-[0px] h-full">
        <Card className="mx-auto w-11/12 lg:w-4/4 bg-[#39393933] backdrop-blur-[12px]">
          <CardHeader>
            <CardTitle className="font-poppins text-[28px] font-medium leading-[42px] mb-8 text-[#E5E5E5] font-poppins text-2xl font-medium leading-[42px] text-center">
              {type
                ? "Team Invitation"
                : org_id
                ? "Organization Invitation"
                : "Email Verification"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-center">
              <div className="flex justify-center">
                <Mail size={48} color="white" />
              </div>
              {!isEmailVerified ? (
                <>
                  <p className="text-[#ffffff]">
                    {type
                      ? "We're processing your team invitation. Please wait while we set up your access."
                      : org_id
                      ? "We're processing your organization invitation. Please wait while we set up your access."
                      : "We have sent a verification link to your email address. Please check your inbox and follow the instructions to verify your email."}
                  </p>
                  {!org_id && (
                    <p className="text-[#ffffff]">
                      If you did not receive the email, make sure to check your
                      spam folder or{" "}
                      <a
                        onClick={() => resendVerifyEmail()}
                        className="text-blue-500 cursor-pointer"
                      >
                        click here
                      </a>{" "}
                      to resend.
                    </p>
                  )}
                  {isLoading && (
                    <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                  )}
                </>
              ) : (
                <>
                  <p className="text-[#ffffff]">
                    {type
                      ? "You have successfully joined the team! You can now proceed to the dashboard."
                      : org_id
                      ? "You have successfully joined the organization! You can now proceed to the dashboard."
                      : "Thank you for verifying your email! You can now proceed to select your subscription plan."}
                  </p>
                  <div className="mt-4 w-full">
                    <RoundButton
                      type="button"
                      label={"Continue"}
                      isLoading={isLoading}
                      onClick={() =>
                        router.push(
                          org_id || type ? "/dashboard" : "/subscription-plan"
                        )
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutBar>
  );
};

const VerifyEmailPage: React.FC = () => {
  return (
    <SearchParamsWrapper>
      <VerifyEmailForm />
    </SearchParamsWrapper>
  );
};

export default VerifyEmailPage;
