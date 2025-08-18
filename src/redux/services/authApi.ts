import { createClient } from "@/utils/supabase/client";
import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";
import { SupabaseClient } from "@supabase/supabase-js";
import { User } from "@/types/types";

const supabase: SupabaseClient = createClient();

const fetchUser = () => {
  const userDataString = localStorage.getItem("user");

  if (!userDataString) {
    throw new Error("No user data found in localStorage");
  }

  const userData = JSON.parse(userDataString);
  return { userData };
};

// Custom base query function
const customBaseQuery: BaseQueryFn<void, User | null, unknown> = async () => {
  try {
    const { userData } = fetchUser();
    return { data: userData };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getUser: builder.query<User | null, void>({
      query: () => {
        return fetchUser();
      },
    }),
  }),
});

export const { useGetUserQuery } = userApi;
