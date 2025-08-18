'use client'
import React, { useState, useRef, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = useState(0);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      const count = value.length;

      event.target.style.height = 'auto';
      event.target.style.height = `${event.target.scrollHeight}px`;
      
      if (maxLength && count > maxLength) {
        event.preventDefault();
        return;
      }
      setCharCount(count);
      onChange?.(event);
    };

    return (
      <>
        <textarea
         style={{ outline: 'none', boxShadow: 'none' }}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {maxLength && (
          <span className="text-xs text-gray-500">
            {charCount}/{maxLength}
          </span>
        )}
      </>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
