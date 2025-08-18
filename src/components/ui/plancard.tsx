"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

interface PlanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  planName: string;
  planPrice: string;
  selected: boolean;
  off: any;
  onSelect: () => void;
  isLoading?: boolean;
}

const PlanCard = React.forwardRef<HTMLDivElement, PlanCardProps>(
  (
    { planName, planPrice, selected, off, onSelect, isLoading, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex justify-between items-center p-4 border rounded-lg w-full shadow-sm hover:cursor-pointer relative",
          selected ? "border-black border-2" : "hover:border-gray-400",
          selected ? "bg-gray-200" : "bg-white",
          props.className
        )}
        onClick={onSelect}
        {...props}
      >
        <div>
          <h4 className="text-lg font-semibold">{planName}</h4>
          <p className="text-sm text-muted-foreground">
            {planPrice} <span className="text-xs text-red-600">{off}</span>
          </p>
        </div>
        {isLoading && (
          <div className="absolute right-4">
            <LoaderCircle className="animate-spin h-6 w-6" />
          </div>
        )}
      </div>
    );
  }
);

PlanCard.displayName = "PlanCard";
export default PlanCard;
