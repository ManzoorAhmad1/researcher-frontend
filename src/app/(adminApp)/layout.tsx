"use client";
import { useEffect, useState } from "react";
import "./layout.css";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/AdminSidebar/AdminSidebar";
import AdminHeader from "@/components/AdminHeader/AdminHeader";
import { useSelector } from "react-redux";

function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [expand, setExpand] = useState(true);
  const { user } = useSelector((state: any) => state.adminUser) || {};
  const userData = useSelector((state: any) => state.user?.user) || {};
  const router = useRouter();

  useEffect(() => {
    const userToken =
      localStorage.getItem("admin_token") ||
      sessionStorage.getItem("admin_token");
    if (!userToken) {
      navigateSignIn();
    }
  }, [user]);
  useEffect(() => {
    if (userData?.first_name && userData?.last_name) {
      router.push("/dashboard");
    }
  }, [userData]);
  useEffect(() => {
    const userToken =
      localStorage.getItem("admin_token") ||
      sessionStorage.getItem("admin_token");
    if (!userToken) {
      navigateSignIn();
    }
  }, []);

  const navigateSignIn = () => {
    router.push("/admin-login");
  };
  return (
    <>
      <div className="h-full w-full flex ">
        <Sidebar />
        <div className={expand ? "layout-page" : "expand-layout-page"}>
          <AdminHeader />
          <div className="flex main-contain ">
            <div
              className={`relative ${" ml-0 w-full"}`}
              style={{ backgroundColor: "#f6f6f6", height: "max-content" }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default RootLayout;
