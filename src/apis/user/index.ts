"use client";
import toast from "react-hot-toast";
import { createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { axiosInstancePublic, axiosInstancePrivate } from "@/utils/request";
import localStorageService from "@/utils/localStorage";
import sessionStorageService from "@/utils/sessionStorage";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { Option } from "@/types/types";

export interface StripeSesssionType {
  data: {
    sessionURL: string;
    isSuccess: boolean;
    message: string;
  };
}
export interface signInInterface {
  email: string;
  password: String;
}
export interface signUpInterface {
  firstName: string;
  lastName: string;
  email: string;
  password: number;
}
export interface stripCompanySubscription {
  sessionURL: string;
  isSuccess: boolean;
  message: string;
}

export interface googleInterface {
  provider: string;
  token: String;
}

interface StripePortalType {
  customerId: string;
}

interface ChangePasswordParams {
  password: string;
  newPassword: string;
}

export const signUpApi = async (data: any, referral_code: any) => {
  const response = await axiosInstancePublic.post("/users/signup", {
    ...data,
    referral_code,
  });

  return response;
};

export const signInApiFacebook = async (data: any) => {
  const response = await axiosInstancePrivate.post("/users/social_login", data);
  const token = response?.data?.token;
  const user = response?.data?.user;
  if (token) {
    localStorageService.setItem("token", token);
    localStorageService.setItem("user", user);
  }
  return response;
};

export const signInApiGoogle = async (data: any) => {
  const response = await axiosInstancePrivate.post("/users/social_login", data);
  const token = response?.data?.token;
  const refreshToken = response?.data?.refreshToken;
  const user = response?.data?.user;
  if (token) {
    localStorageService.setItem("token", token);
    localStorageService.setItem("refreshToken", refreshToken);
    localStorageService.setItem("user", user);
  }
  return response;
};

export const updateSubscriptionPlan = async (data: any) => {
  const response = await axiosInstancePublic.patch("/users", data);
  return response;
};

export const emailVerifyApi = async (data: string, type?: String | null) => {
  const response = await axiosInstancePublic.post(
    `/users/verify-email/${data}${type ? "?type=team" : ""} `
  );
  return response;
};

const supabase: SupabaseClient = createClient();

export const updateUserfeatures = createAsyncThunk(
  "auth/updateUserfeatures",
  async (
    payload: {
      id?: string;
      model_use?: boolean;
      selected_model: Option[] | [];
    },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as any;
    try {

      const user = await updateUser({
        use_multiple_models: payload?.model_use,
        selected_models: payload?.selected_model, user_id: payload?.id || state.user.user.user.id
      });

      if (user?.data?.isSuccess === false) {
        toast.error(user?.data?.message);
        return rejectWithValue(user?.data?.message);
      }

      toast.success(
        payload?.model_use
          ? "Multi-Model usage updated successfully"
          : "Multi-Model usage has been disabled successfully"
      );
      return { user: { ...user?.data?.user } };
    } catch (err: any) {
      return rejectWithValue(err.message || "Unexpected error occurred");
    }
  }
);

export const updateUserChatPdfFeatures = createAsyncThunk(
  "auth/updateUserChatPdfFeatures",
  async (
    payload: {
      use_multiple_models: boolean;
      selected_models: Option[] | [];
      check_response_length: boolean;
      select_range: number;
      response_type: string;
      userId: number;
    },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as any;
    try {
      const response = await axiosInstancePrivate.post(
        "/users/customization-options",
        payload
      );

      if (!response || !response.data) {
        toast.error("Failed to update features");
        return rejectWithValue("No response data");
      }

      toast.success("Customization Options updated successfully");
    } catch (err: any) {
      return rejectWithValue(err.message || "Unexpected error occurred");
    }
  }
);
export const updateUserPDFData = createAsyncThunk(
  "auth/updateUserData",
  async (payload, { getState, rejectWithValue }) => {
    const state = getState() as any;
    try {


      const userInfo = await findById(state.user.user.user.id);
      const user = userInfo?.data?.data;


      if (userInfo?.data?.isSuccess === false) {
        toast.error(userInfo?.data?.message);
        return rejectWithValue(userInfo?.data?.message);
      }


      const subscriptionInfo = await getUserSubscription(state.user.user.user.id)
      const currentData = subscriptionInfo?.data?.data

      if (subscriptionInfo?.data?.isSuccess === false) {
        toast.error(subscriptionInfo?.data?.message);
        return rejectWithValue(subscriptionInfo?.data?.message);
      }
      return { user: { ...user, subscription: currentData } };
    } catch (err: any) {
      return rejectWithValue(err.message || "Unexpected error occurred");
    }
  }
);

export const updateUserData = createAsyncThunk(
  "auth/updateUserData",
  async (payload, { getState, rejectWithValue }) => {
    const state = getState() as any;
    try {
      const userInfo = await findById(state.user.user.user.id);
      const user = userInfo?.data?.data;

  console.log("userInfo", userInfo);
      if (userInfo?.data?.isSuccess === false) {
        toast.error(userInfo?.data?.message);
        return rejectWithValue(userInfo?.data?.message);
      }

      const subscriptionInfo = await getUserSubscription(state.user.user.user.id)
      const currentData = subscriptionInfo?.data?.data

      if (subscriptionInfo?.data?.isSuccess === false) {
        toast.error(subscriptionInfo?.data?.message);
        return rejectWithValue(subscriptionInfo?.data?.message);
      }
      return { user: { ...user, subscription: currentData } };
    } catch (err: any) {
      return rejectWithValue(err.message || "Unexpected error occurred");
    }
  }
);

export const encryptPassword = (decryptedPassword: string) => {
  const secret_key = process.env.NEXT_PUBLIC_CRYPTOJS_SECRET_KEY;
  if (!secret_key) {
    const errorMsg = "Secret key is not defined in environment variables";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const bytes = CryptoJS.AES.decrypt(decryptedPassword, secret_key);
    const newDecryptedPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (!newDecryptedPassword) {
      throw new Error("Failed to decrypt password: Decrypted value is empty");
    }

    return newDecryptedPassword;
  } catch (error) {
    console.error("Error during decryption:", error);
    throw new Error("Decryption failed");
  }
};

export const decryptPassword = (decryptedPassword: string) => {
  const secret_key = process.env.NEXT_PUBLIC_CRYPTOJS_SECRET_KEY;

  if (!secret_key) {
    const errorMsg = "Secret key is not defined in environment variables";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const encryptedPassword = CryptoJS.AES.encrypt(
      decryptedPassword,
      secret_key
    ).toString();
    return encryptedPassword;
  } catch (error) {
    console.error("Error during encryption:", error);
    throw new Error("Encryption failed");
  }
};
export const signInApi = createAsyncThunk(
  "auth/signin",
  async (
    { data, checkReminder }: { data: signInInterface; checkReminder: boolean },
    thunkAPI
  ) => {
    try {
      const res = await axiosInstancePublic.post("/users/signin", data);

      const token = res?.data?.data.token;
      const refreshToken = res?.data?.data.refreshToken;

      const user = res?.data?.data.user;

      if (
        user?.is_two_factor_enabled &&
        (!user?.socialInfo || user?.socialInfo === null)
      ) {
        return {
          step: "2FA_REQUIRED",
          message: "2FA verification required",
          user,
        };
      } else {
        if (token) {
          if (checkReminder) {
            sessionStorageService.setItem("token", token);
            sessionStorageService.setItem("refreshToken", refreshToken);
            sessionStorageService.setItem("user", user);
            if (data.password) {
              try {
                const decryptData = decryptPassword(data.password as string);
                Cookies.set("password", decryptData as string, { expires: 30 });
                Cookies.set("username", data.email as string, { expires: 30 });
              } catch (error) {
                console.error("Error decrypting password:", error);
              }
            }
          } else {
            localStorageService.setItem("token", token);
            localStorageService.setItem("refreshToken", refreshToken);
            localStorageService.setItem("user", user);
            Cookies.remove("username");
            Cookies.remove("password");
          }
          return { ...res?.data?.data, token, refreshToken };
        }
      }
      return thunkAPI.rejectWithValue("Token not found");
    } catch (error: any) {
      const serializedError = {
        message:
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred",
        code: error?.code || "UNKNOWN_ERROR",
      };

      return thunkAPI.rejectWithValue(serializedError);
    }
  }
);

export const signInGoogleApi = createAsyncThunk(
  "auth/signin",
  async (data: googleInterface, thunkAPI) => {
    try {
      const res = await axiosInstancePublic.post("/users/social_login", data);

      const token = res?.data?.token;
      const user = res?.data?.user;
      if (token) {
        localStorageService.setItem("token", token);
        localStorageService.setItem("user", user);
        return { ...res?.data?.data, token, user };
      }

      return thunkAPI.rejectWithValue("Token not found");
    } catch (error: any) {
      const serializedError = {
        message: error?.response?.data?.message || "An error occurred",
        code: error?.code || "UNKNOWN_ERROR",
      };

      return thunkAPI.rejectWithValue(serializedError);
    }
  }
);

export const signInFacebookApi = createAsyncThunk(
  "auth/signinFacebook",
  async (data: googleInterface, thunkAPI) => {
    try {
      const res = await axiosInstancePublic.post("/users/social_login", data);
      const {
        jwtToken: token,
        user,
        isSuccess,
        refreshToken,
        message,
      } = res.data;

      if (token) {
        localStorageService.setItem("token", token);
        localStorageService.setItem("user", user);
        return res.data;
      }

      return thunkAPI.rejectWithValue("Token not found");
    } catch (error: any) {
      const serializedError = {
        message: error?.response?.data?.message || "An error occurred",
        code: error?.code || "UNKNOWN_ERROR",
      };

      return thunkAPI.rejectWithValue(serializedError);
    }
  }
);

export const forgotPasswordApi = async (data: any) => {
  const response = await axiosInstancePublic.post(
    "/users/forgot-password",
    data
  );
  return response;
};

export const fetchAccessData = async (code: any, token: any) => {
  const response = await axiosInstancePrivate.post(
    "/users/mendeley-access-token",
    { code, token }
  );

  return response;
};

export const disconnectMendeley = async (accessToken: string) => {
  const response = await axiosInstancePrivate.post(
    "/users/disconnect-mendeley",
    { accessToken }
  );

  return response;
};
export const fetchFolderData = async (
  accessToken: string,
  folderId: string
) => {
  const response = await axiosInstancePrivate.post("/users/mendeley-folders", {
    accessToken,
    folderId,
  });

  return response;
};

export const connectZotero = async (apiKey: string) => {
  const response = await axiosInstancePrivate.post("/users/connect-zotero", {
    apiKey,
  });

  return response;
};

export const tourGuide = async (referral_code:any) => {
  const response = await axiosInstancePrivate.get(`/users/tour-guide?referral_code=${referral_code}`);
  return response;
};
export const reserPasswordApi = async (token: string, data: any) => {
  const response = await axiosInstancePublic.post(
    `/users/reset-password/${token}`,
    data
  );
  return response;
};

export const resendVerification = async (data: any) => {
  const response: any = await axiosInstancePrivate.post(
    "/users/resend-verify-email",
    data
  );
  return response;
};

export const findById = async (userId: any) => {
  const response = await axiosInstancePrivate.post("/users/get-user", {
    userId: userId,
  });
  return response;
};

export const updateTopicExplorerDialog = async () => {
  const response = await axiosInstancePrivate.patch(
    "/users/topic-explorer-dialog"
  );
  return response;
};

export const findByRefferCode = async (referral_code: any) => {
  const response = await axiosInstancePublic.post(
    "/users/get-user-refferCode",
    {
      referral_code,
    }
  );
  return response;
};

export const redeemAwards = async (awardType: any) => {
  const response = await axiosInstancePrivate.post("/users/redeem-awards", {
    awardType,
  });
  return response;
};

export const reffralStats = async (referralCode: any) => {
  const response = await axiosInstancePrivate.post("/users/track-reffral", {
    referralCode,
  });
  return response;
};

export const getUserSubscription = async (userId: any) => {
  const response = await axiosInstancePrivate.post(
    "/users/get-user-subscription",
    {
      userId: userId,
    }
  );
  return response;
};
export const verifyEmailMember = async (
  token: string,
  type: string,
  data: any
) => {
  const response: any = await axiosInstancePrivate.get(
    `/team/invitations/verify/${token}?type=${type}`,
    data
  );
  return response;
};

export const acceptOrgInvitation = async (data: any) => {
  const response: any = await axiosInstancePrivate.post(
    `/organization/invitations/accept`,
    data
  );
  return response;
};

export const verifyEmailUser = async (token: string, referralCode: any) => {
  const response: any = await axiosInstancePrivate.post(
    `/users/verify-email/${token}`,
    { referralCode }
  );

  return response;
};

export const changePasswordApi = async (data: ChangePasswordParams) => {
  try {
    const response = await axiosInstancePrivate.post(
      "/users/change-password",
      data
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

export const searchAutoComplete = async (searchQuery: any, type: String) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/users/search/autocomplete?query=${searchQuery}&type=${type}`
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

export const fetchDataByTitle = async (
  title: string, 
  type: String, 
  dateRange?: {
    startYear: string;
    endYear: string;
    enabled: boolean;
  }
) => {
  try {
    let url = `/users/paper/search/match?query=${encodeURIComponent(title)}&type=${type}`;
    
    // Add date range parameters if enabled and provided
    if (dateRange?.enabled) {
      if (dateRange.startYear && dateRange.startYear.trim() !== '') {
        url += `&startYear=${dateRange.startYear}`;
      }
      if (dateRange.endYear && dateRange.endYear.trim() !== '') {
        url += `&endYear=${dateRange.endYear}`;
      }
    }

    console.log('API Request URL:', url);
    console.log('Date Range Data:', {
      enabled: dateRange?.enabled,
      startYear: dateRange?.startYear,
      endYear: dateRange?.endYear
    });
    
    const response = await axiosInstancePrivate.get(url);
    return response.data;
  } catch (error: any) {
    console.error('fetchDataByTitle error:', error);
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};

export const fetchDataByAuthor = async (title: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/users/author/search?query=${title}`
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "An error occurred",
    };
  }
};
export const updateUser = async (data: any) => {
  const response = await axiosInstancePrivate.patch("/users/update-user", data);
  return response;
};
export const getUserReferral=async()=>{
  const response = await axiosInstancePrivate.get("/users//get-user_referral");
  return response;
}
export const updateUserProfile = async (data: any) => {
  const response = await axiosInstancePrivate.patch(
    "/users/update-user-profile",
    data
  );
  return response;
};

export const verify2FAApi = createAsyncThunk(
  "auth/verify2fa",
  async (
    {
      email,
      otp,
      checkReminder,
    }: { email: string; otp: string; checkReminder: boolean },
    thunkAPI
  ) => {
    try {
      const res = await axiosInstancePublic.post("/users/verify-2fa", {
        email,
        otp,
      });

      const token = res?.data?.data.token;
      const refreshToken = res?.data?.data.refreshToken;
      const user = res?.data?.data.user;

      if (token) {
        if (checkReminder) {
          sessionStorageService.setItem("token", token);
          sessionStorageService.setItem("refreshToken", refreshToken);
          sessionStorageService.setItem("user", user);
        } else {
          localStorageService.setItem("token", token);
          localStorageService.setItem("refreshToken", refreshToken);
          localStorageService.setItem("user", user);
        }
        return { ...res?.data?.data, token, refreshToken };
      }

      return thunkAPI.rejectWithValue("Token not found");
    } catch (error: any) {
      const serializedError = {
        message: error?.response?.data?.message || "An error occurred",
        code: error?.code || "UNKNOWN_ERROR",
      };

      return thunkAPI.rejectWithValue(serializedError);
    }
  }
);


export const fetchCreditHistory = async () => {
  const response = await axiosInstancePrivate.get("/users/get-user-credit-history");
  return response;
};


export const fetchCreditHistoryByDate = async (data: any, countOnly?: boolean) => {
  const response = await axiosInstancePrivate.get(`/users/get-user-credit-history-by-date-range?countOnly=${countOnly ? true : ""}&startDate=${data?.startDate ? data?.startDate : ""}&endDate=${data?.endDate ? data?.endDate : ""}&offset=${data?.offset ? data?.offset : ""}&perPageLimit=${data?.perPageLimit ? data?.perPageLimit : ""}`);
  return response;
};
export const getAllUserList = async () => {
  const response = await axiosInstancePrivate.get("/users/get-user-info");
  return response;
};

export const addSearchPaperHistory = async (body: object) => {
  const response = await axiosInstancePrivate.post("/files/user/search-history", body);
  return response;
};