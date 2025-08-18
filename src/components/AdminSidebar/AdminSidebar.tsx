"use client";
import { useEffect, useState } from "react";
import { sideMenuScreen } from "@/constant/index";
import { RiMenu2Fill, RiMenuLine } from "react-icons/ri";
import { useRouter, usePathname } from "next/navigation";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

const Sidebar = () => {
  const [isActiveTab, setActiveTab] = useState("Dashboard");
  const [expand, setExpand] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = (name: string) =>
    isActiveTab == name ? "#508de9" : "#495360d6";

  const selectTab = (value: any) => {
    setActiveTab(value.name);
    router.push(value.path);
  };
  const setScreen = () => {
    const getCurrentScreen = sideMenuScreen.find((value) => {
      return value.path == pathname;
    }) || { name: "", path: "", Icon: null };

    setActiveTab(getCurrentScreen.name);
  };

  useEffect(() => {
    setScreen();
  }, []);

  return (
    <div
      className={`h-screen bg-white z-20 shadow-[3px_3px_5px_6px_#cccccc45] transition-all duration-300 ${
        expand ? "w-[300px]" : "w-20"
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <OptimizedImage
            width={28}
            height={ImageSizes.icon.md.height}
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//researchcollab-logo.svg`}
            alt="logo"
            className="min-w-[28px] h-[24px]"
          />
          {expand && (
            <span className="font-bold text-[#0e70ff]">ResearchCollab</span>
          )}
        </div>
        <button
          onClick={() => setExpand((prev) => !prev)}
          className="text-[#0E70FF] hover:bg-blue-50 p-1 rounded-md"
        >
          {expand ? (
            <RiMenu2Fill className="text-2xl" />
          ) : (
            <RiMenuLine className="text-2xl" />
          )}
        </button>
      </div>
      <div className="p-4 flex flex-row flex-wrap gap-2">
        {sideMenuScreen.map((value, index) => {
          const { name, Icon } = value;
          return (
            <div
              style={{ color: currentTab(value.name) }}
              className={`p-3 flex rounded-md cursor-pointer items-center hover:bg-[#eff6fe] transition-colors ${
                isActiveTab === name ? "bg-[#eff6fe]" : ""
              }`}
              key={index}
              onClick={() => selectTab(value)}
            >
              <Icon className="text-xl flex-shrink-0" />
              {expand && (
                <span className="pl-3 font-semibold whitespace-nowrap">{name}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
