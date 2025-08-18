import React from "react";
import { UseFormRegister } from "react-hook-form";
import "./ui.css";

interface AdminButtonProps {
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

const AdminButton: React.FC<AdminButtonProps> = ({
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
      
    </div>
  );
};

export default AdminButton;
