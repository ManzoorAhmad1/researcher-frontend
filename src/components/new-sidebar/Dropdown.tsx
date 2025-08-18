"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { usePathname } from "next/navigation";
import { DropdownItem } from "../Sidebar/const";
import { useRouter } from "next-nprogress-bar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Text } from "rizzui";
interface DropdownProps {
  label: string;
  isDisable: any;
  dropDownItems: DropdownItem[];
  toggle: boolean;
  setToggle: () => void;
  icon: React.ReactNode;
  notification: boolean;
  onClick?: any;
  totalPapers?: number;
  tooltip?: boolean;
  handleLinkClick?: any;
  expand:boolean
  isSubscriptionExpired?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  dropDownItems,
  isDisable,
  toggle,
  setToggle,
  label,
  icon,
  notification,
  onClick,
  totalPapers,
  tooltip,
  handleLinkClick,
  expand,
  isSubscriptionExpired,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLUListElement>(null);

  return (
    <li
      className={`list-none flex-col !gap-0 !py-0 drop-down ${
        toggle && "bg-[#F9F9F9] dark:bg-[#1E3341]"
      } ${expand && " !px-[1rem]"}`}
    >
      <button
        onClick={() => {
          setToggle();
          onClick();
        }}
        type="button"
        className={`flex items-center border rounded-lg transition-all w-full border-transparent ${
          dropDownItems.some((item) => item.href === pathname) &&
          "active-dropdown"
        } ${!expand&&"px-2 py-[10px]"}` }
        aria-controls="dropdown"
      >
        <div className={`w-full flex gap-2 relative group  ${expand?"p-2 justify-start":"justify-center"}`}>
          {icon}
          {tooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex-1 text-sm text-left max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap gap-3">
                    {label}
                  </span>
                </TooltipTrigger>

                <TooltipContent className="border border-tableBorder text-left w-full max-w-[220px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray opacity-0 transition-opacity duration-200 group-hover:opacity-100 ">
                  <span className="break-words whitespace-normal">{label}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="flex-1 text-sm text-left max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap gap-3">
              {label}
            </span>
          )}
        </div>

        <IoIosArrowDown className={`nav-arrow text-[14px] transition-transform duration-200 ${toggle ? "rotate-0" : "-rotate-90"}`} />
      </button>

      {/* Dropdown Menu */}
      {toggle && (
        <ul
          ref={dropdownRef}
          id="dropdown"
          className={`space-y-2 transition-all duration-500 ease-in-out overflow-hidden w-full ${expand&&"dropdwon-padding"}`}
          style={{
            transition: "height 0.5s ease-in-out",
          }}
        >
          {dropDownItems?.map((item, i) => (
            <div key={i} className="!m-0 relative">
              <li
                onClick={() => (!isSubscriptionExpired && isDisable ? router.push(item?.href) : "")}
                key={i}
                className={`flex justify-between mx-0 border-l-2 ${
                  i === 0 ? "mt-3 !m-0" : "!m-0 "
                } ${item.href === pathname && "active-dropdwon"}`}
              >
                <Text
                  onClick={() => handleLinkClick(item?.href)}
                  className="flex items-center gap-3 rounded-lg transition-all"
                >
                  {item.href === pathname ? item?.active_icon : item?.icon}
                <span>{item?.name}</span>
                </Text>
                {notification && item?.name === "Papers" && totalPapers && (
                  <>
                    <div
                      className={`sidebar-notification pt-[1px] h-5 w-5 flex justify-center items-center rounded-full font-medium  ${
                        item.href === pathname
                          ? "text-[#666666] bg-[#0E70FF38] dark:text-white"
                          : "bg-[#D9D9D9] dark:text-black"
                      }`}
                    >
                      {totalPapers ? totalPapers : 0}
                    </div>
                  </>
                )}
              </li>
              {expand&&<div
                className={`absolute w-[1.5px] bg-[#E5E5E5] left-[-10px] top-0 ${
                  item.href === pathname &&
                  "!w-[4px] left-[-11px] bg-[#CCCCCC] rounded-full"
                } ${dropDownItems?.length === i + 1 ? "h-full" : "h-full"}`}
              ></div>}
            </div>
          ))}
        </ul>
      )}
    </li>
  );
};

export default Dropdown;
