import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BotMessageSquare } from "lucide-react";
import React from "react";

const ModelSelect: React.FC = () => {
  return (
    <div className="grid gap-3">
      <Label htmlFor="model">Model</Label>
      <Select>
        <SelectTrigger
          id="model"
          className="items-start [&_[data-description]]:hidden"
        >
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="genesis">
            <div className="flex items-start gap-3 text-muted-foreground">
              <BotMessageSquare className="size-5" />
              <div className="grid gap-0.5">
                <p>
                  Chat{" "}
                  <span className="font-medium text-foreground">GPT-4o</span>
                </p>
                <p className="text-xs" data-description>
                  Our fastest model for general use cases.
                </p>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="explorer">
            <div className="flex items-start gap-3 text-muted-foreground">
              <BotMessageSquare className="size-5" />
              <div className="grid gap-0.5">
                <p>
                  Chat{" "}
                  <span className="font-medium text-foreground">Gemini</span>
                </p>
                <p className="text-xs" data-description>
                  Performance and speed for efficiency.
                </p>
              </div>
            </div>
          </SelectItem>
          <SelectItem value="quantum">
            <div className="flex items-start gap-3 text-muted-foreground">
              <BotMessageSquare className="size-5" />
              <div className="grid gap-0.5">
                <p>
                  Chat{" "}
                  <span className="font-medium text-foreground">GPT-3.5</span>
                </p>
                <p className="text-xs" data-description>
                  The most powerful model for complex computations.
                </p>
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelect;
