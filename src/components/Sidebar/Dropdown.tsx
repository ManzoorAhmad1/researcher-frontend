"use client";

import React, { useRef } from "react";
import Link from "next/link";
import clsx from "clsx";
import { IoIosArrowDown } from "react-icons/io";
import { usePathname } from "next/navigation";

interface DropDownItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  label: string;
  dropDownItems: DropDownItem[];
  toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const Dropdown: React.FC<DropdownProps> = ({
  dropDownItems,
  toggle,
  setToggle,
  label,
}) => {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLUListElement>(null);

  const dropdownHeight = toggle ? dropdownRef.current?.scrollHeight : 0;
  return (
    <li className="list-none">
      <button
        onClick={() => setToggle((prev) => !prev)}
        type="button"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full ${
          !toggle && ["/web-search", "/creative-thinking"]?.includes(pathname)
            ? "bg-blueTh text-primary"
            : "text-white hover:text-white/70"
        }`}
        aria-controls="dropdown-pages"
      >
        <span className="flex-1 text-left whitespace-nowrap">{label}</span>
        <IoIosArrowDown />
      </button>

      <ul
        ref={dropdownRef}
        id="dropdown-pages"
        className="ms-5 space-y-2 transition-all duration-500 ease-in-out overflow-hidden mt-1"
        style={{
          height: dropdownHeight,
          transition: "height 0.5s ease-in-out",
        }}
      >
        {dropDownItems?.map((item, i) => (
          <li key={i}>
            <Link
              href={item?.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                pathname.startsWith(item?.href)
                  ? "bg-blueTh text-primary"
                  : "text-white hover:text-white/70"
              )}
            >
              {item?.icon}
              {item?.name}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
};

export default Dropdown;
