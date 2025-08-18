import { createSlice } from "@reduxjs/toolkit";
import {
  signInApi,
  verify2FAApi,
  updateUserfeatures,
  updateUserData,
} from "@/apis/user";

interface AuthState {
  user: any;
  status: "idle" | "loading" | "succeeded" | "failed";
  loggedInUser: string;
  currentModel:any;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  loggedInUser: "",
  currentModel:null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      return initialState;
    },
    signUp: (state, action) => {
      state.user = action.payload;
    },
    updateUserPlan: (state, action) => {
      state.user.user = action.payload;
    },

    signInFacebook: (state, action) => {
      state.user = action.payload;
    },
    signInGoogle: (state, action) => {
      state.user = action.payload;
    },
    currentModelData: (state, action) => {
      state.currentModel = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInApi.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signInApi.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.loggedInUser = "true";
      })
      .addCase(signInApi.rejected, (state, action) => {
        state.status = "failed";
      });

    builder
      .addCase(verify2FAApi.pending, (state) => {
        state.status = "loading";
      })
      .addCase(verify2FAApi.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.loggedInUser = "true";
      })
      .addCase(verify2FAApi.rejected, (state, action) => {
        state.status = "failed";
      });

    builder
      .addCase(updateUserfeatures.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUserfeatures.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(updateUserfeatures.rejected, (state, action) => {
        state.status = "failed";
      });

    builder
      .addCase(updateUserData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.status = "failed";
      });
  },
});

export const { logout, signUp, currentModelData, updateUserPlan, signInFacebook, signInGoogle } =
  authSlice.actions;

export const userReducer = authSlice.reducer;
