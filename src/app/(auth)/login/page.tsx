import React from "react";
import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("./LoginForm"), { ssr: false });

const page = () => {
  return (
    <div>
      <LoginForm />
    </div>
  );
};
export default page;
