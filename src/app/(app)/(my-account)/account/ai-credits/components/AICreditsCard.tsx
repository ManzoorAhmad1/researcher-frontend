import React from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface AICreditsCardProps {
  name: string;
  number: number;
}

const AICreditsCard: React.FC<AICreditsCardProps> = ({ name, number }) => {
  return (
    <div
      className={`h-[120px] rounded-md flex p-6 gap-3 items-center ${
        name === "REMAINING BALANCE" ? "bg-[#079E2833]" : "bg-[#F59B1436]"
      }`}
    >
      <OptimizedImage
        src={
          name === "REMAINING BALANCE"
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//current-balance.png`
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//use-this-month.png`
        }
        alt={
          name === "REMAINING BALANCE"
            ? "Balance icon"
            : "Usage this month icon"
        }
        width={55}
        height={55}
      />
      <div className="flex justify-between flex-col">
        <div className="text-[12px] font-semibold text-[#666666] dark:text-[#999999]">
          {name}
        </div>
        <div className="flex items-end mt-2 items-baseline  flex-wrap ">
          <h5 className="text-2xl font-medium dark:text-[#CCCCCC]">{number}</h5>
          <span className="text-[#666666] dark:text-[#999999] ps-1">
            credits
          </span>
        </div>
      </div>
    </div>
  );
};

export default AICreditsCard;
