import { createSlice } from "@reduxjs/toolkit";
import { signInApi } from "@/apis/user";

interface PeojectState {
  project: any;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: PeojectState = {
  project: null,
  status: "idle",
};

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    currentProjectLoading: (state) => {
      state.status = "loading";
    },
    addCurrentProject: (state, action) => {
      state.status = "succeeded";
      state.project = action.payload;
    },
  },
});

export const { addCurrentProject, currentProjectLoading } =
  projectSlice.actions;

export const projectReducer = projectSlice.reducer;
