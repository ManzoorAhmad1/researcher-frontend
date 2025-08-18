import React, { useEffect, useRef } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";

// Define types for props
interface Option {
  label: string;
  value: string;
}

interface DropDownsProps {
  toggleDropdown: () => void;
  isOpen: boolean;
  options: Option[];
  selectedValue?: string;
  onSelect?: (value: string) => void;
  labelName?: string;
}

const DropDowns: React.FC<DropDownsProps> = ({
  toggleDropdown,
  isOpen,
  options,
  selectedValue,
  onSelect,
  labelName,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) toggleDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleDropdown]);

  return (
    <div ref={dropdownRef} className="w-full cursor-pointer select-none">
      <div
        className="relative flex justify-between items-center"
        onClick={toggleDropdown}
      >
        <div>
          <label
            className="text-[11px] text-[#666666] dark:text-[#999999]"
            htmlFor={labelName}
          >
            {labelName}
          </label>
          <div
            className={`text-[13px] ${
              labelName === "Generate Topics or Questions?"
                ? "text-[#666666] dark:text-[#999999]"
                : "dark:text-[#CCCCCC]"
            } `}
          >
            {selectedValue ? selectedValue : "Select"}
          </div>
        </div>
        <IoIosArrowDown className="nav-arrow text-[14px] text-3xl text-[#666666] dark:text-[#999999]" />
        {/* <RiArrowDropDownLine className="text-3xl text-[#666666] dark:text-[#999999]" /> */}
        {isOpen && (
          <div
            id="dropdown"
            className={`z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-full max-w-[415.58px] dark:bg-gray-700 absolute left-[-5px] ${
              labelName ? "top-14" : "top-8"
            }`}
          >
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownDefaultButton"
            >
              {options.map((option, index) => (
                <li key={index}>
                  <a
                    onClick={() => onSelect && onSelect(option.value)}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    {option.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropDowns;
