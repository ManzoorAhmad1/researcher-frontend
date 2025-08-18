"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useRef, useState } from "react";
import { sideBarMenuItems } from "./account/sideBarMenu";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next-nprogress-bar";
import { GrUpgrade } from "react-icons/gr";
import { Text } from "rizzui";

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [componentSize, setComponentSize] = useState({ width: 0, height: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userStatusFlag = localStorage.getItem("userPlanStatusFlag");
  useEffect(() => {
    const scriptId = "chat-init";
    const scriptUrl =
      "https://cloud.board.support/account/js/init.js?id=969665972";

    const isCurrentLayout = pathname.startsWith("/account");
    const existingScript = document.getElementById(scriptId);

    if (isCurrentLayout && !existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      const script = document.getElementById(scriptId);
      if (script) {
        script.remove();
      }
      const cloudStyles = Array.from(
        document.querySelectorAll('link[href*="cloud.board.support"]')
      );
      cloudStyles.forEach((style) => style.remove());

      const duplicateScripts = Array.from(
        document.querySelectorAll('script[src*="cloud.board.support"]')
      );
      duplicateScripts.forEach((duplicate) => duplicate.remove());

      const elements = document.getElementsByClassName("sb-main");
      if (elements) {
        Array.from(elements).forEach((element) => element.remove());
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (!dashboardRef.current) return;

    const updateSize = () => {
      if (dashboardRef.current) {
        const { width, height } = dashboardRef.current.getBoundingClientRect();
        setComponentSize({ width, height });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);

    resizeObserver.observe(dashboardRef.current);

    window.addEventListener("resize", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [pathname]);

  const handleUpgradeClick = () => {
    setIsModalOpen(false);
    router.push("/account/subscriptions");
  };
  const handleLinkClick = (path: string) => {
    if (userStatusFlag === "false") {
      router.push(path);
    } else {
      setIsModalOpen(true);
      router.push("/account/subscriptions");
    }
  };
  const showUpgradePlanMode = userStatusFlag === "true" && isModalOpen;

  return (
    <div key={pathname} className="px-[24px] py-[33px] mb-12" ref={dashboardRef}>
      <div className="h-full w-full flex rounded-[8px] border shadow-md box-border">
        <div className="bg-secondaryBackground grid grid-cols-[20%,80%] md:grid-cols-[20%,80%] lg:grid-cols-[20%,80%] xl:grid-cols-[20%,80%] 2xl:grid-cols-[15%,85%]  w-full overflow-hidden">
          <Tabs
            defaultValue="Dashboard"
            className="py-4 w-full min-w-0 overflow-hidden"
          >
            <div className="flex h-full overflow-hidden">
              <TabsList
                className="flex flex-col h-full pr-2 md:pr-4 border-borderColor rounded-none border-r-[1px] w-full min-w-0 overflow-hidden"
                customStyle
              >
                <div className="flex w-full ml-4 items-center pl-2 md:justify-between py-2 border-l-4 border-transparent">
                  <p className="text-base text-lightGray font-medium leading-6 font-size-large hidden md:block text-[#333333] truncate max-w-[150px]">
                    My Account
                  </p>
                </div>
                <hr className="ml-6 w-full border border-borderColor hidden md:block" />
                {sideBarMenuItems?.length > 0 &&
                  sideBarMenuItems.map((item: any) => (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      onClick={() => {
                        handleLinkClick(
                          pathname === "/account" && item.value === "Dashboard"
                            ? "/account"
                            : item.value === "Dashboard"
                            ? `/account`
                            : `/account${item.path}`
                        );
                      }}
                      className={`ml-3 w-full flex items-center justify-start border-l-4 border-transparent my-1 pr-[0.15rem] ${
                        (pathname === "/account" &&
                          item.value === "Dashboard") ||
                        pathname?.replace("/account", "")?.includes(item.path)
                          ? "rounded-none border-[#0f6fff] text-darkBlue"
                          : ""
                      }`}
                      customStyle
                    >
                      <div className="font-size-small w-full flex items-center gap-3 relative">
                        <span className="min-w-[21px]">
                          {React.createElement(item.icon, {
                            className: item.path === "/reminder" ? "w-5 h-5 w-[20px]" : "w-5 h-5",
                            activeTab:
                              (pathname === "/account" &&
                                item.value === "Dashboard") ||
                              pathname
                                ?.replace("/account", "")
                                ?.includes(item.path),
                          })}
                        </span>
                        <p
                          className={`font-size-normal font-normal hidden md:block  truncate max-w-[150px] ${
                            (pathname === "/account" &&
                              item.value === "Dashboard") ||
                            pathname
                              ?.replace("/account", "")
                              ?.includes(item.path)
                              ? " text-[#0f6fff]"
                              : "text-darkGray"
                          }`}
                        >
                          {item.label}
                        </p>

                        <p className="absolute -top-1 ml-12 left-1/2 transform -translate-x-1/2 bg-transparent border border-darkGray  bg-opacity-70 text-lightGray text-xs p-1 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-200 md:hidden">
                          {item.label}
                        </p>
                      </div>
                    </TabsTrigger>
                  ))}
              </TabsList>
            </div>
          </Tabs>
          <div className="w-full py-4 min-w-0 overflow-hidden">
            {showUpgradePlanMode && (
              <div className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
                <div className="bg-white p-10 rounded-lg shadow-xl text-center space-y-6 max-w-lg w-full">
                  <div className="flex justify-center">
                    <GrUpgrade className="text-red-500 w-48 h-32" />
                  </div>

                  <p className="text-2xl font-semibold text-gray-800">
                    Your subscription has expired.
                  </p>
                  <p className="text-lg text-gray-500">
                    To continue enjoying all features, please upgrade your plan.
                  </p>

                  <button
                    className="bg-red-600 text-white py-3 px-8 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 transition-all duration-300"
                    onClick={handleUpgradeClick}
                  >
                    Upgrade Plan
                  </button>

                  <p className="text-sm text-gray-500">
                    Need help?{" "}
                    <Text
                      onClick={() => {
                        window.open(
                          "https://chat.cloud.board.support/969665972?ticket",
                          "_blank"
                        );
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Contact Support
                    </Text>
                  </p>
                </div>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
