"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import LayoutBar from "@/components/LayoutBar/LayoutBar";
import {
  createSubscription,
  stipeApi,
  subcriptionPlan,
  extendSubcriptionPlan,
} from "@/apis/subscription";
import Messages from "@/constant/Messages";
import { updateUserPlan } from "@/reducer/auth/authSlice";
import { logout } from "@/reducer/auth/authSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlanCard from "@/components/ui/plancard";
import localStorageService from "@/utils/localStorage";
import RoundButton from "@/components/ui/RoundButton";

const Subscription: React.FC = () => {
  const user = useSelector((state: any) => state.user?.user?.user);

  const Plan = useSelector(
    (state: any) => state.user?.user?.user?.subscription?.has_used_free_plan
  );

  const has_extended = useSelector(
    (state: any) => state.user?.user?.user?.subscription?.has_extended
  );
  const [SelectedPlan, setSelectedPlan] = useState("");
  const SelectedPlanType = useSelector(
    (state: any) => state.user?.user?.user?.subscription?.subscription_plan
  );

  const accountType = useSelector(
    (state: any) => state.user?.user?.user?.account_type
  );

  const [planExpire, setPlanExpire] = useState<boolean>(false);
  const subsciptionTime = useSelector(
    (state: any) => state.user?.user?.user?.subscription?.billingCycleEndDate
  );

  if (SelectedPlan === "free") {
    let currentDate = new Date();
    if (new Date(subsciptionTime) < currentDate) {
      setPlanExpire(true);
    }
  }

  const [monthlyPlan, setMonthlyPlan] = useState<boolean>(false);
  const [yearlyPlan, setYearlyPlan] = useState<boolean>(false);
  const [isLogout, SetIsLogout] = useState<boolean>(false);
  const [isLogoutLoader, SetIsLogoutLoader] = useState<boolean>(false);

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (SelectedPlanType) {
      setSelectedPlan(SelectedPlanType);
    } else {
      setSelectedPlan("null");
    }
    if (accountType === "member") {
      router.push("dashboard");
    }
    if (SelectedPlan === "null") {
      SetIsLogout(true);
    }
    if (
      SelectedPlan === "pro-plan-stripe" ||
      SelectedPlan === "pro-plan-discount"
    ) {
      setMonthlyPlan(true);
    } else if (
      SelectedPlan === "plus-plan-stripe" ||
      SelectedPlan === "plus-plan-stripe"
    ) {
      setYearlyPlan(true);
    }
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      router.push("/login");
    }
  }, [Plan, SelectedPlan, accountType, subsciptionTime, router]);
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;

    hasRun.current = true;
    setIsLoading(false);
    const tokenString =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const query = new URLSearchParams(window.location.search);
    const callPortalStripe = async () => {
      try {
        const data = await createSubscription({
          sessionId: query?.get("session_id"),
        });
        setIsLoading(true);
        const updateduser = data?.data?.updatedUser;

        if (query.get("success")) {
          toast.success(Messages.STRIPE_SUCCESSFULL_PAYMENT);
          setIsLoading(false);
          dispatch(updateUserPlan(updateduser));
          router.push("/dashboard");
        }
        if (query.get("canceled")) {
          toast.error(Messages.STRIPE_UNSUCCESSFULL_PAYMENT);
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    if (query && query?.get("session_id")) {
      setIsLoading(true);
      callPortalStripe();
    }
  }, []);

  const extendPlan = async () => {
    try {
      setIsLoading(true);
      const response = await extendSubcriptionPlan();
      if (response) {
        const updatedUser = response?.data?.updatedUser;
        dispatch(updateUserPlan(updatedUser));
        toast.success(response?.data?.message);
        setIsLoading(false);
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
      setIsLoading(false);
    }
  };

  const handleSelect = async (plan: string) => {
    sessionStorage.clear();
    setLoadingPlan(plan);
    try {
      if (plan === "free") {
        const response = await subcriptionPlan({
          subscriptionPlan: plan,
          userId: user?.userId,
        });
        if (response) {
          const updatedUser = response?.data?.updatedUser;

          dispatch(updateUserPlan(updatedUser));

          toast.success(response?.data?.message);
          router.push("/dashboard");
        }
      } else {
        if (
          (SelectedPlan.includes("yearly") && plan.includes("yearly")) ||
          (SelectedPlan.includes("monthly") && plan.includes("monthly"))
        ) {
          toast.error(Messages.ALREADY_SUBCRIBED);
        } else if (
          (SelectedPlan === "plus-plan-stripe" ||
            SelectedPlan === "plus-plan-stripe") &&
          (plan === "pro-plan-discount" || plan === "pro-plan-stripe")
        ) {
          toast.error(Messages.DOWMGRADE);
        } else {
          try {
            const response = await stipeApi({ lookupKey: plan });

            if (!response?.sessionURL) {
              throw new Error(response?.message);
            }

            const windowObj = window.open("about:blank", "blank");

            if (windowObj) {
              windowObj.location.href = response?.sessionURL;
            }
          } catch (error: any) {
            toast.error(error?.response?.data?.message);
          }
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      setLoadingPlan(null);
    }
  };

  const goDashboard = () => {
    if (user?.is_user_plan_active) {
      router.push("/dashboard");
    }
  };

  const handleLogout = async () => {
    SetIsLogoutLoader(true);

    localStorageService.clear();
    setTimeout(() => {
      dispatch(logout());
      SetIsLogoutLoader(false);
      router.push("/login");
    }, 100);
  };

  return (
    <>
      <LayoutBar>
        <div className="rounded-bl-[12px] sm:rounded-bl-[0px] bg-[#39393933] backdrop-blur-[12px] flex sm:px-[76px] px-[16px] py-[44.5px] rounded-tr-[12px] md:rounded-tr-[12px] md:rounded-br-[12px] sm:rounded-tr-[0px]  rounded-br-[12px] sm:rounded-br-[0px] h-full">
          <Card className="mx-auto w-11/12 lg:w-4/4 bg-[#6a6a6a69]">
            <CardHeader>
              <CardTitle className="font-poppins text-[28px] font-medium leading-[42px] text-left mb-8 text-[#E5E5E5] font-poppins text-2xl font-medium leading-[42px] text-left">
                Select Subscription Pack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {SelectedPlan === "free" && !has_extended && (
                  <PlanCard
                    planName="Extend free plan"
                    planPrice="Extend free plan by 7 days"
                    off=""
                    selected={false}
                    onSelect={() => extendPlan()}
                  />
                )}

                <PlanCard
                  planName="Standard Monthly"
                  planPrice={
                    SelectedPlan === "free" && !planExpire
                      ? "$7.99 per month"
                      : "$9.99 per month"
                  }
                  off={SelectedPlan === "free" && !planExpire && "(20% off)"}
                  selected={monthlyPlan}
                  onSelect={() =>
                    handleSelect(
                      SelectedPlan === "free" && !planExpire
                        ? "pro-plan-discount"
                        : "pro-plan-stripe"
                    )
                  }
                  isLoading={loadingPlan === "pro-plan-stripe"}
                />
                <PlanCard
                  planName="Standard Yearly"
                  planPrice={
                    SelectedPlan === "free" && !planExpire
                      ? "$6.49 per month"
                      : "$7.99 per month"
                  }
                  off={SelectedPlan === "free" && !planExpire && "(20% off)"}
                  selected={yearlyPlan}
                  onSelect={() =>
                    handleSelect(
                      SelectedPlan === "free" && !planExpire
                        ? "plus-plan-stripe"
                        : "plus-plan-stripe"
                    )
                  }
                  isLoading={loadingPlan === "plus-plan-stripe"}
                />
              </div>
              <div className="mt-10 mb-10">
                <RoundButton
                  type="submit"
                  onClick={() => {
                    goDashboard();
                  }}
                  label={"Continue"}
                  isLoading={isLoading}
                />
              </div>
              {isLogout && (
                <div className="mt-10 mb-10">
                  <RoundButton
                    type="submit"
                    onClick={() => {
                      handleLogout();
                    }}
                    label={"Logout"}
                    isLoading={isLogoutLoader}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </LayoutBar>
    </>
  );
};

export default Subscription;
