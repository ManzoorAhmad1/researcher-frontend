// 'use client'
import React from "react";
import dynamic from "next/dynamic";

const SignUpForm = dynamic(() => import("./SignUpForm"), { ssr: false });

export const metadata = {
  title: "Sign Up | Research Collab",
  description:
    "Join Research Collab to collaborate with researchers and access exclusive tools.",
};

async function Signup() {
  return <SignUpForm />;
}
export default Signup;
