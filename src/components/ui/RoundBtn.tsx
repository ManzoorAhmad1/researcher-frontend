import React from 'react';
import "./ui.css"

interface RoundBtnProps {
   label: string|any;
   onClick?: () => void;
   type?:string;
   style?:object;
   className?:string;
   disabled?:boolean;
}
type ButtonType = "button" | "submit" | "reset";
const RoundBtn: React.FC<RoundBtnProps> = ({
   label = "Search...",
   onClick,
   type='button',
   style,
   className,
   disabled = false,
}) => {
   return (
      <button 
         disabled={disabled}
         type={type as ButtonType}
         className={`rounded-[30px] bg-gradient-to-r from-[#0D4DA9] to-[#0E70FF] backdrop-blur-[32px] pt-[10px] pb-[10px] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
         onClick={onClick}
         style={{ background: 'linear-gradient(0deg, #0F55BA -32.81%, #0E70FF 107.89%)',width: '100%',padding:'6px 20px',border :'2px solid #3686FC',...style }}
      >
         <div className='font-poppins text-[13px] font-semibold leading-[19.5px] text-left text-white' style={{ letterSpacing: '1px', textAlign: 'center' }}>
            {label}
         </div>
      </button>
   );
};

export default RoundBtn;
