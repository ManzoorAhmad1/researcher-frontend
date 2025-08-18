import React from "react";
import { Card } from "../ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LoaderCircle, X } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

interface CustomFilterProps {
  filters: Filter[];
  handleClearFilter: (filtername?: string) => void;
  handleFilterSubmit: () => void;
  handleFilter: (
    filtername: string,
    filteritem: string,
    value: boolean
  ) => void;
  isBorder?: boolean
  filterSubmit?: string
}
type Filter = {
  name: string;
  filters: { label: string; value: string }[];
  selectedFilters: string[] | [];
};
const CustomFilter: React.FC<CustomFilterProps> = ({
  filters,
  filterSubmit,
  handleFilter,
  handleClearFilter,
  handleFilterSubmit,
  isBorder
}) => {
  return (
    <Card className={`${!isBorder && "border-none"} ${!isBorder && " shadow-none"}  bg-secondaryBackground py-[13px] px-4 my-4`}>
      <h2 className=" text-xs font-semibold">FILTER</h2>
      <div className="flex justify-between items-center">
        <div className="flex gap-[12px] flex-wrap ">
          {filters?.map(
            (filter: any, index: number) =>
              filter?.filters &&
              filter?.filters?.length > 0 && (
                <div
                  className={`mt-2 py-[6px] px-3 rounded-[6px] border w-[fit-content] border-[#CCCCCC] flex items-center gap-2 ${filter?.order}`}
                  key={index}
                >
                  <p className=" text-xs font-normal text-[#666666]">
                    {filter?.name}
                  </p>
                  <div className="w-[18px] h-[18px] rounded-full flex justify-center text-[11px] text-[#666666]  items-center bg-[#0E70FF38]">
                    {filter?.selectedFilters?.length}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="dropdownMenuTrigger flex justify-between  gap-2 items-center ">
                      <p className="text-xs font-normal ">Selected</p>
                      <ChevronDown size={"12px"} color="#0E70FF" />
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuContent
                        className="dropdownMenu p-2 bg-inputBackground "
                        align="start"
                      >
                        {filter?.filters?.map(
                          (filterItem: { label: string; value: string }) => (
                            <DropdownMenuItem
                              className="cursor-pointer px-2 py-1 flex gap-2"
                              key={filterItem?.value}
                            >
                              <Checkbox
                                checked={filter?.selectedFilters?.includes(
                                  filterItem?.value
                                )}
                                onCheckedChange={(val: boolean) => {
                                  handleFilter(
                                    filter?.name,
                                    filterItem?.value,
                                    val
                                  );
                                }}
                                aria-label="Select all"
                                style={{ width: "16px", height: "16px" }}
                              />
                              {filterItem?.label}
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  </DropdownMenu>

                  <X
                    width={13}
                    height={13}
                    onClick={() => handleClearFilter(filter?.name)}
                  />
                </div>
              )
          )}
        </div>
        <div className="flex gap-[12px]">
          <Button
            type="button"
            variant={"outline"}
            className="h-9 rounded-full text-[13px] border-[#0E70FF] text-[#0E70FF] px-[12px] py-[6px] font-normal w-20"
            onClick={() => handleClearFilter()}
            disabled={Boolean(filterSubmit)}
          >
            {filterSubmit === "Clear" ? (
              <LoaderCircle className="animate-spin h-5 w-5 mx-auto dark:text-white" />
            ) : (
              "Clear All"
            )}

          </Button>
          <Button
            type="button"
            variant={"default"}
            disabled={Boolean(filterSubmit)}
            className="h-9 rounded-full text-[13px] btn px-[12px] py-[6px] font-normal w-20 text-white"
            onClick={handleFilterSubmit}
          >
            {filterSubmit === "Apply" ? (
              <LoaderCircle className="animate-spin h-5 w-5 mx-auto dark:text-white" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CustomFilter;
