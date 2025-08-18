import { createSlice } from "@reduxjs/toolkit";

interface TopicExplorerState {
  topicExploreSetInfo: {};
  outlineGeneratorInfo: {};
  topicAnalysisInfo: {};
}

const initialState: TopicExplorerState = {
  topicExploreSetInfo: {},
  outlineGeneratorInfo: {},
  topicAnalysisInfo: {},
};

export const topicExploreSlice = createSlice({
  name: "topic-explore",
  initialState,
  reducers: {
    topicExploreDetails: (state, action) => {
      state.topicExploreSetInfo = action.payload;
    },

    outlineGeneratorDetails: (state, action) => {
      state.outlineGeneratorInfo = action.payload;
    },
  },
});
export const { topicExploreDetails, outlineGeneratorDetails } =
  topicExploreSlice.actions;
export const useTopicExplore = topicExploreSlice.reducer;
