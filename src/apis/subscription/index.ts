import { axiosInstancePublic } from "@/utils/request";
import { axiosInstancePrivate } from "@/utils/request";

export const createCheckoutSession = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/stipe/create-checkout-session",
    data
  );
  return response;
};

export const subcriptionPlan = async (data: any) => {
  const response = await axiosInstancePrivate.patch(
    "/users/updateSubscriptionPlan",
    data
  );
  return response;
};

export const extendSubcriptionPlan = async () => {
  const response = await axiosInstancePrivate.patch(
    "/users/extendSubscriptionPlan"
  );
  return response;
};

export const stipeApi = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/stipe/create-checkout-session",
    data
  );
  return response.data;
};

export const createSubscription = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/stipe/create-subscription",
    data
  );
  return response;
};


export const getSubscription = async () => {
  const response = await axiosInstancePrivate.get(
    "/stipe/recent-subscription"
  );
  return response;
};

export const cancelStripeSubscription = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/stipe/cancel-stripe-subscription",
    data
  );
  return response;
};
export const redeemAiCredits = async (referred_user_id: any) => {
  const response = await axiosInstancePrivate.post("/stipe/claim-ai-credits", {
    referred_user_id,
  });
  return response;
};

export const trackDailyVisit = async () => {
  const response = await axiosInstancePrivate.post("/stipe/track-daily-visit");
  return response;
};

export const getUserSubscription = async () => {
  const response = await axiosInstancePrivate.get(`/stipe/user/subscription`);
  return response;
};


export const createUserSubscriptionHistory = async (data: any) => {
  const response = await axiosInstancePrivate.post(`/users/create-user-credit-history`, data);
  return response;
};

export const updateUserSubscription = async (data: any, id: string) => {
  const response = await axiosInstancePrivate.patch(`/stipe/update-subscription/${id}`, data);
  return response;
};