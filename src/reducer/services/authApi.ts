import { createClient } from "@/utils/supabase/client";
import { BaseQueryFn, createApi } from "@reduxjs/toolkit/query/react";
import { SupabaseClient, User } from "@supabase/supabase-js";

const supabase: SupabaseClient = createClient();

const fetchUser = async (userData: any) => {
  const { data, error } = userData;
  if (error) {
    throw new Error(error.message);
  }
  return data.user;
};

const customBaseQuery: BaseQueryFn<
  { userData: any },
  User | null,
  unknown
> = async ({ userData }) => {
  try {
    const user = await fetchUser(userData);
    return { data: user };
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
        const userData = {};
        return { userData };
      },
    }),
  }),
});

export const { useGetUserQuery } = userApi;
