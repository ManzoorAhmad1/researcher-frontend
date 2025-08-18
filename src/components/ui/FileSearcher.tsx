"use client";
import { useEffect, useState } from "react";
import { Command, SlidersHorizontal } from "lucide-react";
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

export function FileSearcher() {
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
  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "flex justify-between w-full appearance-none bg-background pl-4 shadow-none"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search files...</span>
        <span className="inline-flex lg:hidden">Search...</span>

        <div className="flex items-center gap-4">
          <SlidersHorizontal className="h-4 w-4" />
          <div className="flex gap-1 items-center bg-muted-foreground/10 p-1 rounded">
            <Command className="h-4 w-4" /> <span className="text-xs">j</span>
          </div>
        </div>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Tags</CommandItem>
            <CommandItem>Folders</CommandItem>
            <CommandItem>Files</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
