import React from 'react';
import "./ui.css"


const LightButton = ({children,style,className,onClick}: Readonly<{
   children: React.ReactNode;
   style?:object;
   className?: string;
   onClick?:React.MouseEventHandler<HTMLDivElement>;
 }>) => {
   return (
      <div className={`relative inline-block rounded-[26px] p-[2px] bg-[linear-gradient(180deg,#FAFAFA_0%,#D7D7D7_100%)] dark:bg-[linear-gradient(360deg,#2C4048_-4.17%,#334C56_106.94%)] inline-block ${className}`}
      onClick={onClick}>
      <div
      className='flex rounded-[24px] bg-[linear-gradient(178.94deg,#E5E5E5_3.06%,#FFFFFF_101.28%)] dark:bg-[linear-gradient(178.94deg,#1C282D_3.06%,#2B3A40_101.28%)] p-[10px_13px]'
        style={{
          ...style
        }}
      >
        {children}
      </div>
    </div>
   );
};

export default LightButton;
