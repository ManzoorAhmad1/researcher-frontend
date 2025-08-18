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
  disabled?: boolean;
  style?: React.CSSProperties;
}

const ThemeInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  onChange,
  StartAdornment,
  EndAdornment,
  value,
  type,
  className,
  register,
  onKeyDown,
  style,
  disabled,
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
        disabled={disabled}
        style={{
          paddingRight: EndAdornment ? "28px" : undefined,
          borderRadius: "6px",
          borderColor: "#CCCCCC14",
          paddingTop: "10px",
          paddingBottom: "10px",
          ...style
        }}
        onChange={onChange}
        type={type}
        className={`${className}custom-placeholder focus:border-white bg-transparent backdrop-blur-lg border border-gray-300 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-12 p-2.5 placeholder-gray-400 focus:outline-none disabled:opacity-50`}
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

export default ThemeInput;
