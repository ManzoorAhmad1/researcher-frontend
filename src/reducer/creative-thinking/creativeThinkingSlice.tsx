import { scamperData } from "@/app/(app)/creative-thinking/utils/const";
import { scamperDataType } from "@/app/(app)/creative-thinking/utils/types";
import { createSlice } from "@reduxjs/toolkit";


interface creativeThinkingState {
    isScamperData: scamperDataType[];
}

const initialState: creativeThinkingState = {
    isScamperData: scamperData,
};

export const creativeThinkingSlice = createSlice({
    name: "creative-thinking",
    initialState,
    reducers: {
        setIsScamperData: (state, action) => {
            state.isScamperData = action.payload
        }
    },



});

export const { setIsScamperData } = creativeThinkingSlice.actions;
export const creativeThinking = creativeThinkingSlice.reducer;