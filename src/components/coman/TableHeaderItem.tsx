import { ChevronsUpDown } from "lucide-react";
import React from "react";

interface TableHeaderItemsProps {
  columnName: String;
  handelSorting?: any;
  fieldName: String;
  column?: any;
  width?: string;
}

const TableHeaderItem: React.FC<TableHeaderItemsProps> = ({
  columnName,
  handelSorting,
  fieldName,
  column,
}) => {
  return (
    <div
      className="flex items-center gap-2 h-[100%]"
      style={{ width: `${column?.width}` }}
    >
      <p
        className=" font-semibold text-[11px] whitespace-nowrap"
        style={{ fontSize: column?.font_size }}
      >
        {columnName}
      </p>
      {handelSorting && (
        <div className=" ">
          <ChevronsUpDown
            size={"15px"}
            onClick={() => handelSorting(fieldName)}
            className=" cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

export default TableHeaderItem;
