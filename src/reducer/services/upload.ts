import { createSlice } from '@reduxjs/toolkit';
import { signInApi } from '@/apis/user';

interface UploadState {
    uploaded:boolean
}

const initialState: UploadState = {
  uploaded: false,

};

export const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    
    upload: (state, action) => {
      
      state.uploaded = action.payload; 
    },
   
  },
});



export const { upload } = uploadSlice.actions;

export const uploadReducer = uploadSlice.reducer;
