import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstancePublic, axiosInstancePrivate } from "@/utils/request";
import sessionStorageService from "@/utils/sessionStorage";
import localStorageService from "@/utils/localStorage";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

export interface signInInterface {
  email: string;
  password: String;
}

export const adminSignInApi = createAsyncThunk(
  "auth/signin",
  async (
    { data, checkReminder }: { data: signInInterface; checkReminder: boolean },
    thunkAPI
  ) => {
    try {
      const res = await axiosInstancePublic.post("/admin/admin-signin", data);
      const token = res?.data?.data.token;
      const refreshToken = res?.data?.data.refreshToken;

      const user = res?.data?.data.user;

      if (token) {
        if (checkReminder) {
          sessionStorageService.setItem("admin_token", token);
          sessionStorageService.setItem("admin_refreshToken", refreshToken);
          sessionStorageService.setItem("admin_user", user);
          if (data.password) {
            try {
              const decryptData = decryptPassword(data.password as string);

              Cookies.set("admin_password", decryptData as string, {
                expires: 30,
              });
              Cookies.set("admin_username", data.email as string, {
                expires: 30,
              });
            } catch (error) {
              console.error("Error decrypting password:", error);
            }
          }
        } else {
          localStorageService.setItem("admin_token", token);
          localStorageService.setItem("admin_refreshToken", refreshToken);
          localStorageService.setItem("admin_user", user);
          Cookies.remove("admin_username");
          Cookies.remove("admin_password");
        }

        return { ...res?.data?.data, token, refreshToken };
      }
      //  }
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
export const decryptPassword = (decryptedPassword: string) => {
  const secret_key = process.env.NEXT_PUBLIC_CRYPTOJS_SECRET_KEY;

  if (!secret_key) {
    const errorMsg = "Secret key is not defined in environment variables";

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
export const adminDashboardApi = createAsyncThunk(
  "auth/signin",
  async ({}, thunkAPI) => {
    try {
      console.log("/admin/admin-dashboard");
      const res = await axiosInstancePublic.get("/admin/admin-dashboard");
      const token = res?.data?.data.token;
      const refreshToken = res?.data?.data.refreshToken;

      const user = res?.data?.data.user;

      if (res?.data?.data) {
        return { ...res?.data?.data, token, refreshToken };
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
