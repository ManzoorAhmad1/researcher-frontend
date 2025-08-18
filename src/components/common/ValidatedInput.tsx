import React from "react";
import { IoIosWarning } from "react-icons/io";

interface ValidatedInputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  showErrorIcon?: boolean;
  errorClassName?: string;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  error,
  disabled = false,
  className = "",
  showErrorIcon = true,
  errorClassName = ""
}) => {
  const baseInputClassName = `outline-none w-full bg-transparent ${
    error ? 'border-b-2 border-red-500' : ''
  }`;

  // Create handler that handles onChange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="w-full">
      <input
        type={type}
        placeholder={placeholder}
        className={`${baseInputClassName} ${className}`}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      
      {/* Error message */}
      {error && (
        <div className={`mt-2 px-2 ${errorClassName}`}>
          <p className="text-red-500 text-xs flex items-center gap-1">
            {showErrorIcon && <IoIosWarning className="text-sm" />}
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

interface ValidatedQueryInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  className?: string;
  showErrorIcon?: boolean;
}

export const ValidatedQueryInput: React.FC<ValidatedQueryInputProps> = ({
  placeholder = "Search by Title or Author",
  value,
  onChange,
  onBlur,
  error,
  className = "",
  showErrorIcon = true
}) => {
  const baseClassName = `flex-1 px-3 py-2 border rounded-md bg-white dark:bg-[#2C3A3F] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    error 
      ? 'border-red-500 dark:border-red-400' 
      : 'border-gray-300 dark:border-gray-600'
  }`;

  // Create handler that clears error as user types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        className={`${baseClassName} ${className}`}
      />
      
      {/* Error message below the input */}
      {error && (
        <div className="mt-1">
          <p className="text-red-500 text-xs flex items-center gap-1">
            {showErrorIcon && <IoIosWarning className="text-sm text-red-500" />}
            {error}
          </p>
        </div>
      )}
    </div>
  );
};
