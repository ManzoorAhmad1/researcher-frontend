"use client";
import React, { useState } from "react";
import { navbar } from "../../(my-account)/account/ai-credits/utils/const";
import { useRouter } from "next/navigation";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState<String>("dashboard");
  const router = useRouter();

  const handleNavClick = (item: string) => {
    setActiveItem(item);
    router.push(`/myaccount/${item}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center ps-4 pe-8">
        <span className="text-[#333333] dark:text-[white] font-medium">
          My Account
        </span>
        <OptimizedImage
          src={
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//search.png`
          }
          alt="search-icon"
          color="#999999"
          width={ImageSizes.icon.xs.width}
          height={ImageSizes.icon.xs.height}
        />
      </div>
      <hr className="my-3 ms-4 me-8 border border-tableBorder" />
      <hr className="my-3 border border-tableBorder" />
      <ul>
        {navbar?.map((item, i) => (
          <>
            <li
              className={`px-4 flex cursor-pointer ${
                activeItem === item?.path ? "active" : ""
              }`}
              key={i}
              onClick={() => handleNavClick(item?.path)}
            >
              {item.icon}
              <span>{item?.name}</span>
              {activeItem === item?.path && <div className="divider" />}
            </li>
          </>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
