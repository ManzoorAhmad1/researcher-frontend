"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePostHog } from "posthog-js/react";
import { Mail, LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import RoundButton from "@/components/ui/RoundButton";
import { signUp } from "@/reducer/auth/authSlice";
import LayoutBar from "@/components/LayoutBar/LayoutBar";
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
      <div className="flex items-center justify-center h-full w-full px-4 py-8">
        <div className="w-full max-w-md bg-white space-y-6 p-6 rounded">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <img src="/websiteLogo.png" alt="AIScholarix Logo" className="h-20 w-auto" />
              <span className="text-4xl font-bold text-black">AIScholarix</span>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-600 font-medium">{type ? "Team Invitation" : org_id ? "Organization Invitation" : "Email Verification"}</p>
            </div>
          </div>

          <div className="grid gap-4 text-center">
            <div className="flex justify-center">
              <Mail size={48} />
            </div>
            <p className="text-gray-700">
              {type
                ? "Processing your team invitation... Please wait while we confirm your details and grant you access to the team."
                : org_id
                  ? "Processing your organization invitation... We're setting up your account and linking it with the organization."
                  : "Verifying your email... This may take a few moments while we confirm your email address."}
            </p>

          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full px-4 py-8">
        <div className="w-full max-w-md bg-white space-y-6 p-6 rounded">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <img src="/websiteLogo.png" alt="AIScholarix Logo" className="h-20 w-auto" />
              <span className="text-4xl font-bold text-black">AIScholarix</span>
            </div>
            {/* <div className="text-center space-y-1">
              <p className="text-sm text-gray-600 font-medium">{type ? "Team Invitation" : org_id ? "Organization Invitation" : "Email Verification"}</p>
            </div> */}
          </div>

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
              <button
                type="button"
                className={`mt-4 w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition ${state ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={state}
                onClick={() => resendVerifyEmail()}
              >
                {isLoading ? <LoaderCircle className="animate-spin h-5 w-5 mx-auto" /> : "Resend Verification Email"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <LayoutBar>
      <div className="flex items-center justify-center h-full w-full px-4 py-8">
        <div className="w-full max-w-md bg-white space-y-6 p-6 rounded">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <img src="/websiteLogo.png" alt="AIScholarix Logo" className="h-20 w-auto" />
              <span className="text-4xl font-bold text-black">AIScholarix</span>
            </div>
              <div className="flex justify-center">
              <Mail size={48} />
            </div>
            {/* <div className="text-center space-y-1">
              <p className="text-sm text-gray-600 font-medium text-lg">{type ? "Team Invitation" : org_id ? "Organization Invitation" : "Email Verification"}</p>
            </div> */}
          </div>

          <div className="grid gap-4 text-center">
            {!isEmailVerified ? (
              <>
                <p className="text-gray-700 max-w-lg">
                  {type
                    ? "We've sent you a team invitation. Please check your inbox."
                    : org_id
                      ? "We've sent you an organization invitation. Please check your inbox."
                      : "We’ve sent a verification link to your email. Please check your inbox and follow the instructions."}
                </p>
                {!org_id && (
                  <p className="text-gray-700">
                    Didn’t get it?{" "}
                    <span
                      onClick={() => resendVerifyEmail()}
                      className="text-blue-500 cursor-pointer"
                    >
                      Resend email
                    </span>
                  </p>
                )}
                {isLoading && (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                )}
              </>
            ) : (
              <>
                <p className="text-gray-700">
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
                    onClick={() => router.push(org_id || type ? '/dashboard' : '/subscription-plan')}
                  />
                </div>
              </>
            )}
          </div>
        </div>
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
