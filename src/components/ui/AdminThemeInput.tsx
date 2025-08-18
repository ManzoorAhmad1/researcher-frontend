import React from "react";
import { UseFormRegister } from "react-hook-form";
import "./ui.css";

interface SearchInputProps {
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  StartAdornment?: React.ElementType;
  EndAdornment?: React.ElementType;
  value?: string | number;
  type?: string;
  className?: string;
  onKeyDown?:any;
  register?: UseFormRegister<any> | any;
}

const AdminThemeInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  onChange,
  StartAdornment,
  EndAdornment,
  value,
  type,
  className,
  register,
  onKeyDown,
  ...rest
}) => {
  return (
    <div className="relative w-full">
      {StartAdornment && (
        <div className="absolute inset-y-0 start-0 flex items-center ps-4">
          <StartAdornment className="text-xl" />
        </div>
      )}

      <input
        {...rest}
        {...register}
        value={value}
        autoComplete="off"
        onKeyDown={onKeyDown&&onKeyDown}
        style={{
          paddingRight: EndAdornment ? "28px" : undefined,
          borderRadius: "6px",
          borderColor: "#e9ebed",
          paddingTop: "10px",
          paddingBottom: "10px",
          backgroundColor: "white",
        }}
        onChange={onChange}
        type={type}
        className={`${className}admin-custom-placeholder focus:border-[#e9ebed] bg-transparent backdrop-blur-lg border border-[#e9ebed]  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-4 p-2.5 placeholder-[black] focus:outline-none`}
        placeholder={placeholder}
      />
      {EndAdornment && (
        <div className="absolute inset-y-0 end-0 flex items-center ps-3 pe-2">
          <EndAdornment className="text-xl" />
        </div>
      )}
    </div>
  );
};

export default AdminThemeInput;
