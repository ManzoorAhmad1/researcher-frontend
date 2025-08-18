"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstancePublic, axiosInstancePrivate } from "@/utils/request";
import localStorageService from "@/utils/localStorage";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = createClient();

  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      errorMessage: error.message,
    };
  }

  if (authData?.user) {
    const { id, created_at } = authData.user;
    await supabase.from("users").insert({
      id,
      email,
      created_at,
      is_active: true,
      user_id: id,
    });
  }

  return {
    success: true,
  };
}

export async function signUp(formData: FormData) {
  const origin = headers().get("origin");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const supabase = createClient();

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match" };
  }

  const { error, data: authData } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, message: "Could not authenticate user" };
  }

  if (authData?.user) {
    const { id, created_at } = authData.user;
    await supabase.from("users").insert({
      id,
      email,
      created_at,
      is_active: true,
      user_id: id,
    });
  }

  return {
    success: true,
    message: `Check email (${email}) to continue sign in process`,
  };
}

export async function logout() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    redirect("/error");
  }

  redirect("/login");
}
