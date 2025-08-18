import {
  collectiveMindNetWorkData,
  collectiveMindSwarmplotData,
} from "@/apis/collective-maind";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface collectiveMindState {
  netWorkloading: boolean;
  swarmplotloading: boolean;
  error: string;
  netWorkChartData: [];
  swarmplotChartDataInfo: {};
  swarmplotChartData: [];
  allSwarmplotChartData: [];
}

const initialState: collectiveMindState = {
  netWorkloading: false,
  swarmplotloading: false,
  swarmplotChartData: [],
  allSwarmplotChartData: [],
  swarmplotChartDataInfo: {},
  netWorkChartData: [],
  error: "",
};

export const collectiveMindSlice = createSlice({
  name: "collective-mind",
  initialState,
  reducers: {
    setChartData: (state, action) => {
      state.swarmplotloading = true;
      state.swarmplotChartData = action.payload;

      state.swarmplotloading = false;
    },

    celarChartData: (state) => {
      state.swarmplotloading = true;
      state.swarmplotChartData = state.allSwarmplotChartData;

      state.swarmplotloading = false;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(collectiveMindFetchChartData.pending, (state) => {
        state.netWorkloading = true;
      })
      .addCase(collectiveMindFetchChartData.fulfilled, (state, action) => {
        state.netWorkloading = false;
        state.netWorkChartData = action.payload;
      })
      .addCase(collectiveMindFetchChartData.rejected, (state, action) => {
        state.netWorkloading = false;
        state.error = action.payload as string;
      })

      .addCase(collectiveMindFetchSwarmplotData.pending, (state) => {
        state.swarmplotloading = true;
      })
      .addCase(collectiveMindFetchSwarmplotData.fulfilled, (state, action) => {
        state.swarmplotloading = false;
        state.swarmplotChartData = action.payload?.processedData;
        state.allSwarmplotChartData = action.payload?.processedData;
        state.swarmplotChartDataInfo = action.payload;
      })
      .addCase(collectiveMindFetchSwarmplotData.rejected, (state, action) => {
        state.swarmplotloading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setChartData, celarChartData } = collectiveMindSlice.actions;
export const useCollectiveMind = collectiveMindSlice.reducer;

export const collectiveMindFetchChartData = createAsyncThunk(
  "collectiveMind/fetchChartData",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await collectiveMindNetWorkData(id); // Replace with actual API URL
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

export const collectiveMindFetchSwarmplotData = createAsyncThunk(
  "collectiveMind/swarmplotData",
  async (body: { user_id: number; values: string }, { rejectWithValue }) => {
    try {
      const response = await collectiveMindSwarmplotData(
        body.user_id,
        body.values
      ); // Replace with actual API URL
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);
