import React from "react";
import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("./LoginForm"), { ssr: false });

const page = () => {
  return (
      <LoginForm />
  );
};
export default page;
