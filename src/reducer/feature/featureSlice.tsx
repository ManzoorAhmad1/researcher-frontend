import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  betaMode: false,
  confirmBetaMode: false,
};

const featureSlice = createSlice({
  name: 'feature',
  initialState,
  reducers: {    
    setBetaMode: (state, action) => {
      state.betaMode = action.payload;
    },
    setBetaModeConfirm: (state, action) => {
      state.confirmBetaMode = action.payload;
    },
  },
});

export const { setBetaMode,setBetaModeConfirm } = featureSlice.actions;
export default featureSlice.reducer;
