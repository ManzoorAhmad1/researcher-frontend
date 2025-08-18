import React from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

interface SelectDropdownProps {
  selectedOption: any;
  handleChange: (option: any) => void;
  options: any[];
  placeholder?: string;
  isDisabled?: boolean;
}

const DropSelect: React.FC<SelectDropdownProps> = ({
  selectedOption,
  handleChange,
  options,
  placeholder = "Select an option",
  isDisabled = false,
}) => {
  return (
    <Select
      closeMenuOnSelect={true}
      components={animatedComponents}
      isClearable
      onChange={handleChange}
      value={selectedOption}
      options={options.filter((val) => val.value !== selectedOption?.value)}
      placeholder={placeholder}
      isSearchable={false}
      getOptionLabel={(e: any) => e.label}
      isDisabled={isDisabled}
      formatOptionLabel={(e: any) => <div title={e.label}>{e.label}</div>}
      className="mt-3"
      classNames={{
        control: ({ isDisabled }) =>
          `border dark:bg-[#15252a] rounded ${
            isDisabled ? "dark:bg-[#15252a]" : "dark:bg-[#15252a]"
          }`,
        menu: () =>
          "dark:bg-[#15252a] border border-gray-300 dark:border-[#15252a] rounded-md shadow-lg",
        menuList: () => "overflow-y-auto",
        option: ({ isFocused, isSelected }) =>
          `cursor-pointer ${
            isSelected
              ? "bg-blue-500 text-white"
              : isFocused
              ? "bg-gray-200 dark:bg-[#15252a]"
              : "bg-white dark:bg-[#15252a]"
          }`,
        singleValue: () => "text-gray-900 dark:text-white",
        placeholder: () => "text-gray-400 dark:text-gray-500",
      }}
      styles={{
        container: (provided) => ({
          ...provided,
          width: "100%",
        }),
        control: (provided) => ({
          ...provided,
          width: "100%",
          minWidth: "200px",
        }),
        menu: (provided) => ({
          ...provided,
          maxHeight: "200px",
          overflowY: "auto",
        }),
        menuList: (provided) => ({
          ...provided,
          maxHeight: "153px",
          overflowY: "auto",
        }),
      }}
    />
  );
};

export default DropSelect;
