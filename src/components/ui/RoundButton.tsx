import React from 'react';
import { LoaderCircle } from 'lucide-react';
import "./ui.css"

interface RoundButtonProps {
   label: string;
   onClick?: () => void;
   type?:string;
   isLoading?:boolean;
}
type ButtonType = "button" | "submit" | "reset";
const RoundButton: React.FC<RoundButtonProps> = ({
   label = "Search...",
   onClick,
   type='button',
   isLoading=false,
}) => {
   return (
      <button 
         type={type as ButtonType}
         className="rounded-[30px] bg-gradient-to-r from-[#0D4DA9] to-[#0E70FF] backdrop-blur-[32px] pt-[10px] pb-[10px] shadow-[0px_2px_1px_rgba(0,0,0,0.09),0px_4px_2px_rgba(0,0,0,0.09),0px_8px_4px_rgba(0,0,0,0.09),0px_16px_8px_rgba(0,0,0,0.09),0px_32px_16px_rgba(0,0,0,0.09)]"
         onClick={() => {!isLoading && onClick?.()}}
         style={{ background: 'black',width: '100%' }}
      >
         <div className='font-poppins text-[13px] font-semibold leading-[19.5px] text-left text-white' style={{ letterSpacing: '1px', textAlign: 'center' }}>
            {isLoading ? <LoaderCircle className='animate-spin h-5 w-5 mx-auto' /> : label}
         </div>
      </button>
   );
};

export default RoundButton;
