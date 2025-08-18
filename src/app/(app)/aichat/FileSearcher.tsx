"use client";
import { Command, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FileSearcherType } from '@/types/types'

export function FileSearcher({ selectKey, setCurrentState, main, currentState ,currentTemp}: FileSearcherType) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {

      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const newChange = () => {
    setCurrentState(main)
    setOpen(!open)
  }

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "flex justify-between w-full appearance-none bg-background pl-4 shadow-none"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search {currentTemp}...</span>
        <span className="inline-flex lg:hidden">Search {currentTemp}...</span>

        <div className="flex items-center gap-4">
          <SlidersHorizontal className="h-4 w-4" />
          <div className="flex gap-1 items-center bg-muted-foreground/10 p-1 rounded">
            <Command className="h-4 w-4" /> <span className="text-xs">j</span>
          </div>
        </div>
      </Button>
      <CommandDialog open={open} onOpenChange={newChange}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {currentState.map((value: { name?: string } , index: number) => {
              return typeof value == 'string' ? (
                <span key={index} onClick={() => selectKey(value)}>
                  <CommandItem>{value}</CommandItem>
                </span>
              ) : (<span key={index} onClick={() => {selectKey(value)
                newChange()
              }}>
                <CommandItem>{index +1 + ". " + value.name}</CommandItem>
              </span>);
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
