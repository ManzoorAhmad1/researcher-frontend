import { createSlice } from '@reduxjs/toolkit';

interface UploadState {
  lightMode: boolean;
}

const initialState: UploadState = {
  lightMode: true,

};

export const userUtilsSlice = createSlice({
  name: 'userUtils',
  initialState,
  reducers: {
    changeMode: (state, action) => {
      state.lightMode = action.payload;
    },

  },
});

export const { changeMode } = userUtilsSlice.actions;

export const userUtilsReducer = userUtilsSlice.reducer;
