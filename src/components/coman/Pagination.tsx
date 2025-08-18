import React from "react";
import RcPagination from "@/utils/components/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  handlePagination: (page: number) => void;
  currentPage: number;
  perPageLimit: number;
  setPerPageLimit?: (limit: number) => void;
  handlePerPageChange?: (limit: number) => void;
}
const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  handlePagination,
  currentPage,
  perPageLimit,
  setPerPageLimit,
  handlePerPageChange,
}) => {
  return (
    <div className="pt-8 mb-3 flex justify-between w-full px-4 pb-3">
      {perPageLimit && (
        <div className="flex items-center gap-[16px] ">
          <div className="flex  max-w-fit">
            <Select
              defaultValue={perPageLimit?.toString()}
              onValueChange={(selectedLimit: string) => {
                setPerPageLimit?.(+selectedLimit);
                handlePerPageChange?.(+selectedLimit);
              }}
            >
              <SelectTrigger className="flex gap-4 bg-inputBackground">
                {perPageLimit}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"10"} className="text-xs">
                  10
                </SelectItem>
                <SelectItem value={"20"} className="text-xs">
                  20
                </SelectItem>
                <SelectItem value={"50"} className="text-xs">
                  50
                </SelectItem>
                <SelectItem value={"100"} className="text-xs">
                  100
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <h5 className="font-size-md">Row per page</h5>
        </div>
      )}
      <RcPagination
        nextIconClassName="border border-[#CCCCCC] p-[5px]"
        prevIconClassName="border border-[#CCCCCC] p-[5px]"
        prevIcon={
          <ChevronLeft
            size={18}
            color={currentPage === 1 ? "#999999" : "#0E70FF"}
          />
        }
        nextIcon={
          <ChevronRight
            size={18}
            color={
              currentPage * (perPageLimit ? perPageLimit : 0) > totalPages
                ? "#999999"
                : "#0E70FF"
            }
          />
        }
        total={totalPages}
        pageSize={perPageLimit}
        current={currentPage}
        onChange={handlePagination}
      />
    </div>
  );
};

export default Pagination;
