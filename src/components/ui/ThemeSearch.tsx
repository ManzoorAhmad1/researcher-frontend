import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import "./ui.css"

interface SearchInputProps {
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  StartAdornment?: React.ElementType; 
  EndAdornment?: React.ElementType;
  value?:string|number;
  type?: string;
  className?: string;
  register?: UseFormRegister<any>|any;
}

const ThemeSearch: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  onChange,
  StartAdornment,
  EndAdornment,
  value,
  type,
  className,
  register,

}) => {
  return (
    <div className="relative w-full">
      {StartAdornment && (
        <div className="absolute inset-y-0 start-0 flex items-center ps-4">
          <StartAdornment className="text-xl" />
        </div>
      )}

      <input
        {...register}
        value={value}
        autoComplete="off"
        style={{ paddingRight: EndAdornment ? '28px' : undefined, borderRadius: '6px',  paddingTop: '10px', paddingBottom: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
        onChange={onChange}
        type={type}
        className={`custom-placeholder-light focus:border-white  border focus:border-[#cccccc] dark:border-[#cccccc2e] dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-12 p-2.5 placeholder-gray-400 focus:outline-none ${className}`}
        placeholder={placeholder}
        required
      />
      {EndAdornment && (
        <div className="absolute inset-y-0 end-0 flex items-center ps-3 pe-2">
          <EndAdornment className="text-xl" />
        </div>
      )}
    </div>
  );
};

export default ThemeSearch;
