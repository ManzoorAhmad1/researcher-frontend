import React from "react";

interface TemplateSimpalButtonProps {
  onClick?: any;
  className?: string;
  id?: string;
  btnName?: string;
}

const TemplateSimpalButton: React.FC<TemplateSimpalButtonProps> = ({
  onClick,
  className,
  id,
  btnName,
}) => {
  return (
    <div
      className={`font-medium text-white font-sans px-2 p-1 my-1 bg-[#6887a9] w-full rounded cursor-pointer flex justify-center ${className}`}
      onClick={onClick}
      id={id}
    >
      {btnName}
    </div>
  );
};
export default TemplateSimpalButton;
