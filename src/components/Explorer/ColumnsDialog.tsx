/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Checkbox } from "../ui/checkbox";
import { IoMdSettings } from "react-icons/io";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { tableColumnPositionChange } from "@/reducer/services/explorerTableSlice";
import { TableDialog } from "./TableDialog";
import { filterOptions } from "./const";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import { X } from "lucide-react";

interface DraggableColumnProps {
  column: any;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  moveLabel: any;
  handleTableColumnVisiblitity: (column: any) => void;
  setTableField: (field: string) => void;
  isReportGenerate?: boolean;
  setIsHideShowOpen?: (open: boolean) => void;
}

interface DragItem {
  index: number;
  type: string;
}

const ItemType = "COLUMN";

const DraggableColumn = ({
  column,
  index,
  moveColumn,
  moveLabel,
  handleTableColumnVisiblitity,
  setTableField,
  isReportGenerate,
  setIsHideShowOpen,
}: DraggableColumnProps) => {
  const ref = React.useRef<HTMLDivElement | null>(null);

  const [, drop] = useDrop<DragItem>({
    accept: ItemType,
    hover: (item, monitor) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const hideBorder = [0, 1];

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`${index % 2 === 0 && "border-r-2 dark:border-[#4D575A]"}`}
    >
      <div
        className={`mx-2 py-2 ${
          !hideBorder?.includes(index) && "border-t-2 dark:border-[#4D575A]"
        }`}
      >
        <div className="cursor-move px-2 py-1 flex justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                moveLabel?.find(
                  (selectedColumn: any) =>
                    selectedColumn.field === column?.field
                )?.visible
              }
              onCheckedChange={() => {
                handleTableColumnVisiblitity(column?.field);
              }}
              aria-label="Select all"
              className="cursor-pointer"
            />
            <p className="text-xs font-normal capitalize">{column?.name}</p>
          </div>
          <div className="flex items-center gap-1">
            {!isReportGenerate && (
              <IoMdSettings
                onClick={() => {
                  setTableField(column);
                  setIsHideShowOpen && setIsHideShowOpen(false);
                }}
                className="cursor-pointer"
              />
            )}
            <OptimizedImage
              src={
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//Frame.svg`
              }
              alt="frame icon"
              width={ImageSizes.icon.md.width}
              height={ImageSizes.icon.md.height}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface Column {
  field: string;
  label: string;
}
interface AllColumnProps {
  id: string;
  name: string;
  field: string;
  visible: boolean;
  width: string;
  font_size: string;
  truncate: boolean;
}

interface ColumnsDialogProps {
  selectedSearchColumn: AllColumnProps[];
  selectedColumn: Column[];
  setSelectedSearchColumn: (columns: AllColumnProps[]) => void;
  setSelectedColumn: (columns: Column[]) => void;
  isReportGenerate?: boolean;
}

const ColumnsDialog: React.FC<ColumnsDialogProps> = ({
  setSelectedSearchColumn,
  selectedSearchColumn,
  isReportGenerate,
  setSelectedColumn,
  selectedColumn,
}) => {
  const dispatch = useDispatch();
  const tableColumnsOptions = useSelector(
    (state: any) => state?.ExporerOptionalFilterData?.filterOptions
  );

  const [moveLabel, setMoveLabel] = useState(
    isReportGenerate ? selectedColumn : tableColumnsOptions
  );
  const [isHideShowOpen, setIsHideShowOpen] = useState(false);
  const [tableField, setTableField] = useState<any>({});
  const drawerRef = useRef<HTMLDivElement>(null);

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const updatedColumns = [...moveLabel];
    const [movedItem] = updatedColumns.splice(dragIndex, 1);
    updatedColumns.splice(hoverIndex, 0, movedItem);
    setMoveLabel(updatedColumns);
    dispatch(tableColumnPositionChange(updatedColumns));
  };

  const handleSHowHideSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event?.target?.value?.toLowerCase() || "";
    const filteredColumns = tableColumnsOptions?.filter((column: any) =>
      column?.name?.toLowerCase()?.includes(searchValue)
    );

    setMoveLabel(filteredColumns);
  };

  const handleHideShowColumn = () => {
    setIsHideShowOpen(false);

    const data = filterOptions?.map((item) => {
      const matchedItem = moveLabel?.find(
        (item2: any) => item2?.field === item?.field
      );

      return matchedItem || item;
    });
    setSelectedSearchColumn(data);
    dispatch(tableColumnPositionChange(data));
  };

  const handleTableColumnVisiblitity = (columnName: string) => {
    const updatedColumns = moveLabel?.map((column: any) => {
      if (column.field === columnName) {
      }
      return {
        ...column,
        visible: column.field === columnName ? !column.visible : column.visible,
      };
    });
    setMoveLabel(updatedColumns);
    if (isReportGenerate) {
      setSelectedColumn(updatedColumns);
    }
  };

  const handleCloseModel = () => {
    setIsHideShowOpen(false);
  };

  useEffect(() => {
    if (tableColumnsOptions?.length > 0 && !isReportGenerate) {
      setMoveLabel(
        [...tableColumnsOptions]?.sort((a: any, b: any) => {
          if (a.visible === b.visible) {
            return 0;
          }
          return a.visible ? -1 : 1;
        })
      );
    }
  }, [tableColumnsOptions, isReportGenerate]);

  return (
    <>
      {!isReportGenerate && (
        <div
          className="flex  items-center gap-2 px-4 py-2 rounded-xl border-1 border-borderColor bg-[#d8e8ff] dark:bg-[#183450]  cursor-pointer  hover:bg-[#d0eafd]"
          onClick={() => setIsHideShowOpen(!isHideShowOpen)}
        >
          <OptimizedImage
            src={
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//visibility.svg`
            }
            alt="visibility icon"
            width={ImageSizes.icon.xs.width}
            height={ImageSizes.icon.xs.height}
            className=""
            color="#0F63DD"
          />
          <span className="text-sm text-[#4b4b4b] dark:text-[#fff]">
            Customize
          </span>
        </div>
      )}

      {isHideShowOpen && (
        <div
          className={`${
            !isReportGenerate
              ? "bg-inputBackground dropdownMenu absolute right-[2px] w-[510px] top-10 z-10 dropDown rounded-[6px] border border-tableBorder p-4"
              : "w-[100%] bg-transparent"
          }`}
          ref={!isReportGenerate ? drawerRef : null}
        >
          <div>
            <div className="flex justify-between">
              <div>
                <h2 className="text-sm font-medium">Show or Hide Columns</h2>
                <p className="text-[12px] font-normal text-foreground">
                  Drag to reorder
                </p>
              </div>
              <div onClick={handleCloseModel} className="opacity-70 hover:opacity-100 cursor-pointer" >
                <span><X className="" /></span>
              </div>
            </div>
            <div className="w-full mt-3 relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <OptimizedImage
                  src={
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//search.svg`
                  }
                  alt="search icon"
                  width={14}
                  height={14}
                />
              </span>
              <input
                onChange={handleSHowHideSearch}
                type="text"
                placeholder="Search Columns"
                className="border bg-transparent dark:bg-darkInputFieldBack rounded-[3px] py-1 pl-8 pr-2 w-full h-8 text-xs placeholder:text-xs"
              />
            </div>
            <div className="bg-inputFieldBackground dark:bg-darkInputFieldBack mt-2 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 border-2 dark:border-[#4D575A]">
                {moveLabel?.map((column: any, index: number) => (
                  <DraggableColumn
                    key={column.field}
                    column={column}
                    index={index}
                    moveColumn={moveColumn}
                    moveLabel={moveLabel}
                    handleTableColumnVisiblitity={handleTableColumnVisiblitity}
                    setTableField={setTableField}
                    isReportGenerate={isReportGenerate}
                    setIsHideShowOpen={setIsHideShowOpen}
                  />
                ))}
              </div>
            </div>

            {!isReportGenerate && (
              <div className="mt-3 flex gap-4">
                <Button
                  onClick={handleHideShowColumn}
                  className="btn !h-[32px] bg-transparent border border-primary hover:bg-transparent text-white"
                >
                  Apply Change
                </Button>
                <Button
                  onClick={handleCloseModel}
                  className="closectabtn !h-[32px] bg-transparent border border-primary hover:bg-transparent text-white"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {tableField?.id && (
        <TableDialog
          isOpen={tableField?.id}
          onOpenChange={() => setTableField("")}
        />
      )}
    </>
  );
};

export default ColumnsDialog;
