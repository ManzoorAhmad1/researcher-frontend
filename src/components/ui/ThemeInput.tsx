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
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <StartAdornment className="text-xl" />
        </div>
      )}

      <input
        {...rest}
        {...register}
        value={value}
        autoComplete="off"
        onKeyDown={onKeyDown && onKeyDown}
        disabled={disabled}
        style={{
          paddingRight: EndAdornment ? "40px" : undefined,
          borderRadius: "8px",
          borderColor: "black",
          paddingTop: "10px",
          paddingBottom: "10px",
          ...style,
        }}
        onChange={onChange}
        type={type}
        className={`${className ? className + ' ' : ''}custom-placeholder focus:border-black bg-white border border-black text-black text-sm rounded-lg block w-full pl-12 pr-3 p-2.5 placeholder-gray-400 focus:outline-none disabled:opacity-50`}
        placeholder={placeholder}
      />
      {EndAdornment && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <EndAdornment className="text-xl" />
        </div>
      )}
    </div>
  );
};

export default ThemeInput;
