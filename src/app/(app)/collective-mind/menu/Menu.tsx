"use client";
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers2, Layers3, LayoutGrid, LayoutList } from "lucide-react";

const Menu = () => {
  return (
    <div className="flex items-center">
      <TabsList className="border border-[#E7E7E7] rounded-md p-1 h-full gap-2">
        <TabsTrigger
          value="network-chart"
          className="rounded-md p-1 data-[state=active]:text-[#FFFFFF] border-2 border-transparent data-[state=active]:border-[#FDAB2F]
             data-[state=active]:shadow-[0px_2px_4px_0px_#00000040]
             data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#F59B14] data-[state=active]:to-[#E68C07]"
        >
          <div className="flex items-center gap-2 justify-center">
            <Layers3 width={18} height={18} />
            <span className="text-[12px]">Network Chart</span>
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="FileCharts"
          className="rounded-md p-1 data-[state=active]:text-[#FFFFFF] border-2 border-transparent data-[state=active]:border-[#FDAB2F]
              data-[state=active]:shadow-[0px_2px_4px_0px_#00000040]
              data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#F59B14] data-[state=active]:to-[#E68C07]"
        >
          <div className="flex items-center gap-2 justify-center">
            <Layers2 width={18} height={18} />
            <span className="text-[12px]">Related Resources</span>
          </div>
        </TabsTrigger>

        <TabsTrigger
          value="list-view"
          className="rounded-md p-1 data-[state=active]:text-[#FFFFFF] border-l-2 border-2 border-transparent data-[state=active]:border-[#FDAB2F]
              data-[state=active]:shadow-[0px_2px_4px_0px_#00000040]
              data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#F59B14] data-[state=active]:to-[#E68C07]"
        >
          <div className="flex items-center gap-2 justify-center">
            <LayoutList width={18} height={18} />
            <span className="text-[12px]">List View</span>
          </div>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default Menu;
