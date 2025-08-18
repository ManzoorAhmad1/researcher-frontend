import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { getUserSubscription } from '@/apis/user';
import { createUserSubscriptionHistory, updateUserSubscription } from '@/apis/subscription';

interface UploadState {
  subscriptionData: {
    data: Object
  };
  loading: boolean;
  error: string | null;
}

const initialState: UploadState = {
  subscriptionData: {
    data: {}
  },
  loading: false,
  error: null,
};
const supabase: SupabaseClient = createClient();

export const fetchSubscription = createAsyncThunk(
  'subscriptionPrompt/fetchSubscription',
  async (payload: { id?: string }, { getState, rejectWithValue }) => {
    const state = getState() as any;
    try {

      const subscriptionInfo = await getUserSubscription(payload?.id || state.user.user.user.id)
      const currentData = subscriptionInfo?.data?.data

      if (subscriptionInfo?.data?.isSuccess === false) {
        console.error('Error fetching data:', subscriptionInfo?.data?.message);
        return rejectWithValue(subscriptionInfo?.data?.message);
      }
      return Array.isArray(currentData) ? currentData[0] : currentData || {};
    } catch (err: any) {
      return rejectWithValue(err.message || 'Unexpected error occurred');
    }
  }
);

export const updateCredits = createAsyncThunk(
  'subscriptionPrompt/updateCredits',
  async (
    payload: { credits: number; user_id?: number, activity?: string, credit_type?: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as any;
    const userId = payload?.user_id || state.user.user.user.id;
    try {
      if (payload.activity && payload.credit_type) {
        const body = {
          activity: payload?.activity,
          credit_usage: Math.ceil(payload?.credits),
          user_id: userId,
          credit_type: payload.credit_type
        };
       

        const subscriptionData = await createUserSubscriptionHistory(body)
        if (subscriptionData?.data?.isSuccess === false) {
          console.error("Error fetching current credits:", subscriptionData?.data?.message);
          throw subscriptionData?.data?.message;
        }
      }

      const subscriptionInfo = await getUserSubscription(userId)
      const currentData = subscriptionInfo?.data?.data

      if (subscriptionInfo?.data?.isSuccess===false) {
        console.error("Error fetching current credits:", subscriptionInfo?.data?.message);
        throw subscriptionInfo?.data?.message;
      }

      const subscriptionData = await updateUserSubscription({ credit: Math.ceil(currentData.credit + payload.credits) }, userId)

      if (subscriptionData?.data?.isSuccess === false) {
        console.error('Error updating credits:', subscriptionData?.data?.message);
        return rejectWithValue(subscriptionData?.data?.message);
      }
      return subscriptionData?.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Unexpected error occurred');
    }
  }
);

export const subscriptionApi = createSlice({
  name: 'subscriptionPrompt',
  initialState,
  reducers: {
    updateSubscription: (state, action) => {
      state.subscriptionData.data = action.payload;
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.subscriptionData.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCredits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCredits.fulfilled, (state, action) => {
        state.subscriptionData.data = action.payload;
        state.loading = false;
      })
      .addCase(updateCredits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateSubscription } = subscriptionApi.actions;

export const subscriptionReducer = subscriptionApi.reducer;
