import { createSlice } from "@reduxjs/toolkit";
import { signInApi } from "@/apis/user";

interface WorkspaceState {
  workspace: any;
  status: "idle" | "loading" | "succeeded" | "failed";
  allWorkspaces: any;
}

const initialState: WorkspaceState = {
  workspace: null,
  allWorkspaces: [],
  status: "idle",
};

export const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    currentWorkSpaceLoading: (state: any) => {
      state.status = "loading";
    },
    addCurrentWorkSpace: (state: any, action: any) => {
      state.workspace = action.payload;
      state.status = "succeeded";
    },
    addAllWorkspaces: (state: any, action: any) => {
      state.allWorkspaces = action.payload;
      state.status = "succeeded";
    },
  },
});

export const {
  addCurrentWorkSpace,
  currentWorkSpaceLoading,
  addAllWorkspaces,
} = workspaceSlice.actions;

export const workspaceReducer = workspaceSlice.reducer;
