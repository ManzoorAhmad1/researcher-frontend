import React, { useEffect, useRef, useState } from "react";
import SubscriptionCard from "./SubscriptionCard";
import {
  cancelStripeSubscription,
  extendSubcriptionPlan,
  getSubscription,
  stipeApi,
} from "@/apis/subscription";
import { updateUserPlan } from "@/reducer/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstancePrivate } from "@/utils/request";
import toast from "react-hot-toast";
import Messages from "@/constant/Messages";
import { useRouter } from "next/navigation";
import moment from "moment";
import confetti from "canvas-confetti";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AiOutlineLoading } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import SubscriptionPriceTable from "./SubscriptionPriceTable";
import { updateSubscription } from "@/reducer/services/subscriptionApi";



export const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const runConfetti = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0.05, y: 0.5 },
        colors: ["#f44336", "#2196f3", "#ffeb3b", "#4caf50", "#9c27b0"],
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 0.95, y: 0.5 },
        colors: ["#f44336", "#2196f3", "#ffeb3b", "#4caf50", "#9c27b0"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(runConfetti);
      }
    };

    runConfetti();
  };
const Subscription = ({ isDarkMode }: { isDarkMode?: any }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<any>("");
  const [planExpire, setPlanExpire] = useState<boolean>(false);
  const [isSubscriptionValid, setIsSubscriptionValid] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [subscribedPlan, setSubscribedPlan] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const subscription = useSelector(
    (state: any) => state.user?.user?.user?.subscription
  );

  const subscriptionId = useSelector(
    (state: any) => state.user?.user?.user?.subscription?.id
  );
  const userData = useSelector((state: any) => state?.user?.user?.user);
  useEffect(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    if (new Date(subscription?.billingCycleStartDate) > nextWeek) {
      setIsSubscriptionValid(true);
    }
  }, [isSubscriptionValid]);

  if (selectedPlan === "free") {
    let currentDate = new Date();
    if (new Date(subscription?.billingCycleEndDate) < currentDate) {
      setPlanExpire(true);
    }
  }
  const hasRun = useRef(false);

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
  }, [userData?.id]);

  

  const query = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const callPortalStripe = async () => {
      try {
        const currentQuery = new URLSearchParams(window.location.search);
        const isSuccess = currentQuery.get("success") === "true";
        const isCanceled = currentQuery.get("canceled") === "true";
        if (isSuccess) {
          toast.success(Messages.STRIPE_SUCCESSFULL_PAYMENT);
          localStorage.setItem("userStatusFlag", "true");

          const data = await getSubscription();
          if (data?.data?.updatedUser) {
            const user = data?.data?.updatedUser;
            localStorage.setItem("user", JSON.stringify(user));
            dispatch(updateUserPlan(data?.data?.updatedUser));
            dispatch(updateSubscription(data?.data?.updatedUser?.subscription)); //check this

            const planType =
              data?.data?.updatedUser?.subscription?.subscription_plan;
            if (planType.includes("pro")) {
              setSubscribedPlan("Pro");
            } else if (planType.includes("plus")) {
              setSubscribedPlan("Plus");
            }

            setShowSuccessModal(true);
            setTimeout(triggerConfetti, 300);
          }

          await createPaperPdf();
        }

        if (isCanceled) {
          toast.error(Messages.STRIPE_UNSUCCESSFULL_PAYMENT);
        }
      } catch (error) {
        console.error("Error processing subscription:", error);
      }
    };

    callPortalStripe();
  }, []);

  const extendPlan = async () => {
    try {
      setLoadingPlan(true);
      const response = await extendSubcriptionPlan();
      if (response) {
        const updatedUser = response?.data?.updatedUser;
        localStorage.setItem("userStatusFlag", "true");
        dispatch(updateUserPlan(updatedUser));
        toast.success(response?.data?.message);

        setLoadingPlan(false);
        router.push("/dashboard");
      }
    } catch (error: any) {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query?.get("extendPlan")) {
      extendPlan();
    }
  }, []);

  const createPaperPdf = async () => {
    try {
      const response = await axiosInstancePrivate.post(
        "/stipe/user-buy-subscription",
        { id: userData.id, email: userData.email }
      );
      return response;
    } catch (error) {
      console.error("Error semantic-scholar:", error);
      throw null;
    }
  };

  const selectedPlanHandler = async (plan: any, discountPlan: any) => {
    setSelectedPlan(plan);

    localStorage.setItem("userStatusFlag", "true");
    try {
      if (
        (userData && userData?.subscription_plan === plan) ||
        userData?.subscription_plan === discountPlan
      ) {
        setLoadingPlan(false);
        setIsDialogOpen(true);
      } else if (
        !(userData && userData?.subscription_plan === plan) &&
        plan === "pro-plan-stripe"
      ) {
        setLoadingPlan(true);
        const response = await stipeApi({
          lookupKey:
            userData && !userData.is_discount_plan_used
              ? "pro-plan-discount"
              : "pro-plan-stripe",
        });

        setLoadingPlan(false);

        if (!response?.sessionURL) {
          throw new Error(response?.message);
        }

        const windowObj = window.open("about:blank", "blank");

        if (windowObj) {
          windowObj.location.href = response?.sessionURL;
        }
        setSelectedPlan(plan);
      } else if (
        !(userData && userData?.subscription_plan === plan) &&
        plan === "plus-plan-stripe"
      ) {
        setLoadingPlan(true);
        const response = await stipeApi({
          lookupKey: !userData?.is_discount_plan_used
            ? "plus-plan-discount"
            : "plus-plan-stripe",
        });
        setLoadingPlan(false);

        if (!response?.sessionURL) {
          throw new Error(response?.message);
        }
        const windowObj = window.open("about:blank", "blank");

        if (windowObj) {
          windowObj.location.href = response?.sessionURL;
        }
        setSelectedPlan(plan);
      }
    } catch (error: any) {
      setLoadingPlan(false);
      toast.error(error?.response?.data?.message);
    }
  };

  const handleCancelSubscription = async () => {
    if (!cancellationReason.trim()) {
      setReasonError(true);
      return;
    }
    try {
      setLoadingPlan(selectedPlan);
      setLoadingPlan(true);
      const cancelStripeResponse = await cancelStripeSubscription({ 
        subscriptionId,
        cancellationReason: cancellationReason.trim() 
      });
      const updateduser = cancelStripeResponse?.data?.updatedUser;
      dispatch(updateUserPlan(updateduser));
      localStorage.setItem("user", JSON.stringify(updateduser));

      setLoadingPlan(false);
      setIsDialogOpen(false);
      setCancellationReason("");
      setReasonError(false);

      toast.success(cancelStripeResponse?.data?.message);
      router.push("/account/subscriptions");
    } catch (error: any) {
      console.log(error, 'error');
      toast.error(error?.response?.data?.message);
    }
  };
  return (
    <div className="w-full max-w-[calc(100%-32px)] mx-auto">
      {/* <div className="w-full p-4 mb-8 border border-borderColor rounded-lg md:ml-4 lg:ml-0 flex flex-wrap flex-col md:flex-row gap-4 items-center justify-between bg-bgGray">
        <div className="flex items-center gap:2 lg:gap-12 flex-col lg:flex-row flex-wrap lg:flex-nowrap">
          <div className="w-full flex flex-col md:flex-row gap-2 my-4 justify-between lg:justify-start items-center">
            <div className="w-10 h-10 md:mr-4 md:ml-0 flex items-center justify-center bg-orange rounded-full text-white OrangeBoxShadow">
              <SubscriptionIcon iconColor />
            </div>
            <div className="flex flex-col-reverse md:flex-col">
              <p className="font-size-md font-medium text-darkGray text-center whitespace-nowrap">
                My Current Plan
              </p>
              <p className="font-size-extra-large font-medium text-lightGray text-center md:text-start">
                {" "}
                            {
              userData?.subscription_plan === "free"
                ? "Free"
                : userData?.subscription_plan === "pro-plan-stripe" ||
                  userData?.subscription_plan === "pro-plan-discount"
                ? "PRO"
                : userData?.subscription_plan === "plus-plan-stripe" ||
                  userData?.subscription_plan === "plus-plan-discount"
                ? "PLUS"
                : "EXPIRED"
            }
                
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col-reverse md:flex-row justify-between gap-12 items-center">
            <div>
              <p className="font-size-md font-medium text-darkGray pb-3 text-center whitespace-nowrap">
                Next Billing Date
              </p>
              <p className="font-size-large font-medium text-lightGray text-center whitespace-nowrap">
                {moment(userData?.subscription?.billingCycleEndDate).format(
                  "DD-MM-YYYY"
                )}
              </p>
            </div>

            <div className="mr-2">
              <p className="font-size-md font-medium text-darkGray pb-3 text-center whitespace-nowrap">
                Monthly Cost
              </p>
              <p className="font-size-large font-medium text-lightGray text-center">
                {subscription?.price
                  ? `$${subscription.price}`
                  : userData.subscription_plan === "free"
                  ? `$0.00`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* <h2 className="font-size-large font-medium text-lightGray mb-6">
        Available Plans
      </h2> */}

      <SubscriptionPriceTable
        onSelectPlan={selectedPlanHandler}
        userData={userData}
        loadingPlan={loadingPlan}
        selectedPlan={selectedPlan}
        setIsDialogOpen={setIsDialogOpen}
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setCancellationReason("");
          setReasonError(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-size-large font-semibold text-lightGray">
              Cancel Subscription
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-size-normal font-normal text-lightGray">
              Please tell us why you want to cancel your subscription:
            </p>
            <div className="space-y-2">
              <textarea
                value={cancellationReason}
                onChange={(e) => {
                  setCancellationReason(e.target.value);
                  setReasonError(false);
                }}
                className={`w-full min-h-[100px] p-3 rounded-md border bg-inputBackground ${
                  reasonError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Your feedback helps us improve our service..."
              />
              {reasonError && (
                <p className="text-sm text-red-500">
                  Please provide a reason for cancellation
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDialogOpen(false);
                setLoadingPlan(false);
                setCancellationReason("");
                setReasonError(false);
              }}
              className="rounded-[26px]"
            >
              Cancel
            </Button>
            <Button onClick={handleCancelSubscription} className="btn rounded-[26px]">
              {loadingPlan ? (
                <AiOutlineLoading className="animate-spin" size={20} />
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Success Modal */}
      <Dialog
        open={showSuccessModal}
        onOpenChange={(open) => {
          setShowSuccessModal(open);
          if (!open) {
            router.push("/account/subscriptions");
          }
        }}
      >
        <DialogContent className="text-center max-w-md p-6 bg-gradient-to-b from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-xl rounded-xl">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center shadow-lg transform -translate-y-12 border-4 border-white dark:border-gray-800">
              <FaCheckCircle className="w-12 h-12 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-0">
              Congratulations!
            </DialogTitle>
            <div className="py-4">
              <p className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-3">
                Your{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {subscribedPlan}
                </span>{" "}
                plan is now active!
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                You&apos;ve unlocked all the premium features of our{" "}
                {subscribedPlan} plan. Enjoy enhanced research capabilities and
                make your work more productive than ever.
              </p>
            </div>
            <div className="w-full pt-2">
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/dashboard");
                }}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-[26px] text-lg shadow-md hover:shadow-lg"
              >
                Continue Your Research
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Your subscription will renew on{" "}
              {moment(userData?.subscription?.billingCycleEndDate).format(
                "MMMM DD, YYYY"
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscription;
