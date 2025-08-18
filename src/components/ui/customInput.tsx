import React from "react";
import { useFormContext, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue"> {
  name?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, name, ...props }, ref) => {
    const { register } = useFormContext<FieldValues>();

    return (
      <input
        {...(name && register ? register(name) : {})}
        className={cn(
          "flex h-10 no-spinner w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#CCCCCC14]",
          className
        )}
        ref={ref}
        {...props}
        style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#020817' : '#ffffff'}}
      />
    );
  }
);

CustomInput.displayName = "Input";

export { CustomInput };
