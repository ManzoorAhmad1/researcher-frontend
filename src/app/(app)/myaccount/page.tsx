"use client";
import React, { Children, ReactNode } from "react";
import Sidebar from "./sidebar/Sidebar";

const Layout = ({ children }: any) => {
  return (
    <main className="h-full myaccount">
      <section className="dark:bg-[black] m-7 border border-[#E5E5E5] dark:border-[#E5E5E51A] rounded-md px-4 py-7">
        <div className="grid grid-cols-12">
          <div className="col-span-2">
            <Sidebar />
          </div>
          <div className="col-span-10 border-l-2 border-[#E5E5E5] dark:border-[#15252A] ps-8">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Layout;
