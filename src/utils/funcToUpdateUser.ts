import { updateUserPlan } from "@/reducer/auth/authSlice";
import { fetchSubscription } from "@/reducer/services/subscriptionApi";

const fetchSubscriptionData = async (dispatch: any, userData: any) => {
  try {
    if (!userData?.id) {
      throw new Error("User ID is required");
    }

    const response = await dispatch(fetchSubscription(userData.id)).unwrap();
    if (response) {
      dispatch(
        updateUserPlan({
          ...userData,
          subscription: {
            ...userData.subscription,
            credit: response.credit,
            credit_limit: response.credit_limit,
            // add more fields as needed
          },
        })
      );
    }
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    throw error;
  }
};

export default fetchSubscriptionData;