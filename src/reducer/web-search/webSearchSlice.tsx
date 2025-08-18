import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchToAi } from "@/apis/topic-explorer";
import { createExploreResearchArray, exploreResearchTopicsData, openAImodelKey } from "@/app/(app)/web-search/utils/const";

interface WebSearchState {
    suggestionLoading: boolean;
    suggestion: any[];
    suggestionError: { success: boolean; message: string };
}

const initialState: WebSearchState = {
    suggestion: [],
    suggestionLoading: true,
    suggestionError: { success: true, message: "" },
};

export const webSearchSuggestion = createAsyncThunk<
    any,
    { id: number; body: { prompt: string } },
    { rejectValue: { message: string; success: boolean } }
>(
    "web-search-suggestion",
    async ({ id, body }, { rejectWithValue }) => {
        try {
            const response = await fetchToAi(body);
            return response.data;
        } catch (error: any) {
            return rejectWithValue({ success: false, message: error?.message || "Something went wrong" });
        }
    }
);

export const webSearchSlice = createSlice({
    name: "notes-bookmarks",
    initialState,
    reducers: {
        suggestionLoader: (state, action) => {
            state.suggestionLoading = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(webSearchSuggestion.pending, (state) => {
                state.suggestionLoading = true;
            })

            .addCase(webSearchSuggestion.fulfilled, (state, action) => {
                state.suggestionLoading = false;
                if (
                    action.payload?.completions?.[openAImodelKey]?.completion?.choices?.length > 0
                ) {
                    const aiRes = createExploreResearchArray(
                        action.payload.completions?.[openAImodelKey].completion.choices[0]
                            ?.message?.content
                    );

                    state.suggestion = exploreResearchTopicsData?.map((item: any, i: number) => {
                        const descriptionEntry = aiRes?.[i]?.data;
                        return {
                            ...item,
                            aiTopic: descriptionEntry,
                        };
                    });
                } else {
                    state.suggestion = [];
                }
            })

            .addCase(webSearchSuggestion.rejected, (state, action) => {
                state.suggestionError = action.payload ?? { success: false, message: "Unknown error occurred" };
                state.suggestionLoading = false;
            });
    },
});
export const { suggestionLoader } = webSearchSlice.actions;
export const useWebSearch = webSearchSlice.reducer;
