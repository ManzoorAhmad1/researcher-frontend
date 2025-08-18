"use client";

import { User } from "@supabase/supabase-js";
import { useGetUserQuery } from "@/redux/services/authApi";

import Dashboard from "@/components/Account/Dashboard";

type UserType = User | null;

export default function Profile() {
  return (
    <main className="mr-4  h-full w-full">
      <div>
        <Dashboard />
      </div>
    </main>
  );
}
