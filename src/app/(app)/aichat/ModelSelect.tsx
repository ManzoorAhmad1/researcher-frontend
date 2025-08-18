"use client"
import React, { useEffect, useState, memo } from "react";
import { BotMessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModelList } from '@/types/types'
import { fetchApi } from '@/utils/fetchApi'

interface ModelSelectProps {
  selectedModel: any; 
  setSelectedModel: (model: any) => void;
}

const ModelSelect: React.FC<ModelSelectProps|any> = ({ selectedModel, setSelectedModel }) => {
    const [promptModel, setPromptModel] = useState<ModelList>([]);
  

    useEffect(()=>{
      getAIModel()
    },[])

    const getAIModel = async () => {
      try {
        const response = await fetchApi(`${process.env.NEXT_PUBLIC_STRAICO_API}/v0/models`, {
          method: 'GET',
        });
        setPromptModel(response)
  
        if (!response.success) {
          throw new Error(`HTTP error! status: ${response.success}`);
        }
        const pdfMetaData: ModelList = response.data;
        setPromptModel(pdfMetaData);
      } catch (error) {
        console.error('Failed to fetch AI models:', error);
      }
    }


  return (
    <div className="grid gap-3">
      <Label htmlFor="model">Model</Label>
      <Select onValueChange={setSelectedModel} defaultValue={selectedModel}>
        <SelectTrigger
          id="model"
          className="items-start [&_[data-description]]:hidden"
        >
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {promptModel?.map((value, index) => {
            return (
              <SelectItem value={value.model} key={index}>
                <div className="flex items-start gap-3 text-muted-foreground">
                  <BotMessageSquare className="size-5" />
                  <div className="grid gap-0.5">
                    <p>
                      Chat{" "}
                      <span className="font-medium text-foreground">{value.name}</span>
                    </p>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default memo(ModelSelect);
