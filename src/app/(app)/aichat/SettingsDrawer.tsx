import { Settings } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ModelSelect from "@/components/ui/ModelSelect";
import { FileSearcher } from "@/components/ui/FileSearcher";

const SettingsDrawer: React.FC = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Settings className="size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Configuration</DrawerTitle>
          <DrawerDescription>
            Configure the settings for the model and messages.
          </DrawerDescription>
        </DrawerHeader>
        <form className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
          <fieldset className="grid gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>
            <ModelSelect />
          </fieldset>
          <fieldset className="grid gap-6 rounded-lg border p-4">
            <legend className="-ml-1 px-1 text-sm font-medium">Messages</legend>
            <FileSearcher />
            <div className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" placeholder="You are a..." />
            </div>
          </fieldset>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default SettingsDrawer;
