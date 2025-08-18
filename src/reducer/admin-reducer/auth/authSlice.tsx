import { createSlice } from "@reduxjs/toolkit";
import {
  adminSignInApi
} from "@/apis/admin-user";

interface AuthState {
  user: any;
  status: "idle" | "loading" | "succeeded" | "failed";
  loggedInUser: string;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  loggedInUser: "",
};

export const adminAuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      return initialState;
    },
    signUp: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminSignInApi.pending, (state) => {
        state.status = "loading";
      })
      .addCase(adminSignInApi.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.loggedInUser = "true";
      })
      .addCase(adminSignInApi.rejected, (state, action) => {
        state.status = "failed";
      });

  },
});

export const { logout, signUp } =
adminAuthSlice.actions;

export const adminUserReducer = adminAuthSlice.reducer;
