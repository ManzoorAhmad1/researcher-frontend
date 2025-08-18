import { getResearchKeywords, setNewResearchKeywords } from '@/apis/workspaces';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';

type KeywordsState = {
  keywords: string[];
  loading: boolean;
  error: string | null;
};

const initialState: KeywordsState = {
  keywords: [],
  loading: false,
  error: null,
};

export const loadKeywords = createAsyncThunk(
  'keywords/loadKeywords',
  async (userId: string, thunkAPI) => {
    try {
      const data = await getResearchKeywords(userId);
      return data?.data || [];
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addKeywords = createAsyncThunk(
  'keywords/addKeywords',
  async ({ userId, newWords }: { userId: string; newWords: string[] }, thunkAPI) => {
    try {
      const updated = await setNewResearchKeywords(userId, newWords, "add");
      return updated?.data || [];
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const removeKeywords = createAsyncThunk(
  'keywords/removeKeywords',
  async ({ userId, newWords }: { userId: string; newWords: string[] }, thunkAPI) => {
    try {
      const updated = await setNewResearchKeywords(userId, newWords, "remove");
      return updated?.data || [];
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const researchKeywordsSlice = createSlice({
  name: 'keywords',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadKeywords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadKeywords.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.loading = false;
        state.keywords = action.payload;
      })
      .addCase(loadKeywords.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addKeywords.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.keywords = action.payload;
      })
      .addCase(addKeywords.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      })

      .addCase(removeKeywords.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.keywords = action.payload;
      })
      .addCase(removeKeywords.rejected, (state, action: PayloadAction<any>) => {
        state.error = action.payload;
      });
  }
});

// export const { addKeywordLocally } = researchKeywordsSlice.actions;
export default researchKeywordsSlice.reducer;