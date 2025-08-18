import { getUserSubscription } from "@/apis/user";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import moment from "moment";

const supabase: SupabaseClient = createClient();
export const showWarningToast = (message: string | any) => {
  toast(message, {
    icon: "⚠️",
    style: {
      background: "#fff",
      color: "#363636",
      borderRadius: "8px",
      padding: "8px 10px",
      maxWidth: "600px",
    },
    duration: 6000,
  });
};
export const verifyCreditApi = async (user_id?: number) => {
  const checkDateStatus = (dateString: string) => {
    const givenDate = new Date(dateString);
    const oneMonthLater = new Date(givenDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const currentDate = new Date();

    if (currentDate >= oneMonthLater) {
      return true;
    } else {
      return false;
    }
  };

   const checkLastDateStatus = (dateString: string) => {
    const givenDate = new Date(dateString);
    const oneMonthLater = new Date(givenDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const currentDate = new Date();

    if (currentDate >= givenDate) {
      return true;
    } else {
      return false;
    }
  };
  
  const checkNearDateStatus = (dateString: string) => {
    const givenDate = new Date(dateString);
    const oneMonthLater = new Date(givenDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    const currentDate = new Date();
    const timeDifference = oneMonthLater.getTime() - currentDate.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysRemaining;
  };

  const checkNearLastDateStatus = (dateString: string) => {
    const givenDate = new Date(dateString);
    const currentDate = new Date();
    const timeDifference = givenDate.getTime() - currentDate.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    return daysRemaining;
  };

  const formatDatePlusOne = (dateString: string) => {
     // const date = new Date(dateString);
  // date.setDate(date.getDate() + 1);
  // return date.toLocaleDateString('en-US', {
  //   year: 'numeric',
  //   month: 'long',
  //   day: 'numeric',
  // });
    return moment(dateString).format("DD-MM-YYYY")
  };

  try {

      const response = await getUserSubscription(user_id)

    if (response?.data?.isSuccess ===false) {
      console.error("Error fetching current credits:", response?.data?.message);
      throw response?.data?.message;
    }

      const totalCredits = response?.data?.data?.credit_limit + response?.data?.data?.bonusCredits+response?.data?.data?.refferal_credits + response?.data?.data?.addOnCredits;

    // currentData.billingCycleEndDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    // currentData.billingCycleEndDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    
    const daysRemaining = checkNearLastDateStatus(response?.data?.data?.billingCycleEndDate);
    const checkDate = checkLastDateStatus(response?.data?.data?.billingCycleEndDate);
    let currentDate = new Date();
    const formatted = formatDatePlusOne(response?.data?.data?.billingCycleEndDate);
  //  if (new Date(currentData?.billingCycleEndDate) < currentDate) {
  //     const message =
  //       "Your subscription plan has expired. Select a new plan to continue accessing our services.";
  //     toast.error(message);
  //     return { forward: false, message: message, mode: "error" };
  //   } else

     if (checkDate) {
      const message =
        "You have exceeded your AI credit limit for the month. Your AI functionality will be paused until the next billing cycle unless you recharge your credits. Please recharge to resume your services.\n Thank you for using ResearchCollab.";
      toast.error(message);
      return { forward: false, message: message, mode: "error" };
    } else if (daysRemaining <= 3 && daysRemaining > 0) {
      const message =`Your AI credit renewal is approaching on ${formatted}. To ensure uninterrupted access to ResearchCollab, please update your subscription in My Account before the due date.\n Thank you for using ResearchCollab.`
      showWarningToast(message);
      return { forward: true, message: message, mode: "warning" };
    } else if (
      response?.data?.data?.credit - response?.data?.data?.credit_limit === 0 ||
      response?.data?.data?.credit > response?.data?.data?.credit_limit
    ) {
      const message =
        "You have consumed all your credits. To continue using our services, please recharge your credits.\nThank you for using ResearchCollab!";
      toast.error(message);
      return { forward: false, message: message, mode: "error" };
    } else if (response?.data?.data?.credit + 10 >= response?.data?.data?.credit_limit) {
      const message = `You are nearing your AI credit limit. Approximately ${Math.max(
        0,
        response?.data?.data?.credit_limit - response?.data?.data?.credit
      )} remaining credits left. Please consider recharging to continue enjoying uninterrupted services.\nThank you for using ResearchCollab!`;
      toast.error(message);
      return { forward: false, message: message, mode: "error" };
    } else if (response?.data?.data?.credit + 100 >= response?.data?.data?.credit_limit) {
      const message = `You are nearing your AI credit limit. Approximately ${Math.max(
        0,
        response?.data?.data?.credit_limit - response?.data?.data?.credit
      )} remaining credits left. Please consider recharging to continue enjoying uninterrupted services.\nThank you for using ResearchCollab!`;
      showWarningToast(message);
      return { forward: true, message: message, mode: "warning" };
    } else if (response?.data?.data?.credit + 500 >= response?.data?.data?.credit_limit) {
      const message = `You are nearing your AI credit limit. Approximately  ${Math.max(
        0,
        response?.data?.data?.credit_limit - response?.data?.data?.credit
      )} remaining credits left. Please consider recharging to continue enjoying uninterrupted services.\nThank you for using ResearchCollab!`;
      showWarningToast(message);
      return { forward: true, message: message, mode: "warning" };
    } else if (response?.data?.data?.credit + 1000 >= response?.data?.data?.credit_limit) {
      const message =
        "Your credits are nearing depletion. Please recharge soon.";
      showWarningToast(message);
      return { forward: true, message: message, mode: "warning" };
    } else {
      return { forward: true, message: "", mode: "none" };
    }
  } catch (err: any) {
    console.log(err.message || "Unexpected error occurred");
    return {
      forward: true,
      message: "An unexpected error occurred.",
      mode: "error",
    };
  }
};
