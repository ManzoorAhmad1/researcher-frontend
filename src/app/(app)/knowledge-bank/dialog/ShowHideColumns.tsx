import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import SearchIcon from "@/images/search.svg";
import { Checkbox } from "@/components/ui/checkbox";
import Frame from "@/images/Frame.svg";
import { Button } from "@/components/ui/button";
import { moveColumn } from "@/reducer/notes-bookmarks/noteBookmarksTabelColumn";
import { useDrag, useDrop } from "react-dnd";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface DraggableColumnProps {
  column: any;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  moveLabel: any;
  handleTableColumnVisiblitity: (column: any) => void;
  setTableField: (field: string) => void;
}
const ItemType = "NOTECOLUMN";

interface DragItem {
  index: number;
  type: string;
}

const DraggableColumn = ({
  column,
  index,
  moveColumn,
  moveLabel,
  handleTableColumnVisiblitity,
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

  const hideBorder = [0];

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div
        className={`py-2 border-b-2 dark:border-[#4D575A] ${
          hideBorder?.includes(index) && " pt-0"
        }`}
      >
        <div className="cursor-move px-2 py-1 flex justify-between">
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
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

interface ShowHideColumnsProps {
  selectedColumn: any;
  setSelectedColumn: (columns: any) => void;
  isHideShowOpen: boolean;
  setIsHideShowOpen: (open: boolean) => void;
}

const ShowHideColumns = ({
  selectedColumn,
  setSelectedColumn,
  isHideShowOpen,
  setIsHideShowOpen,
}: ShowHideColumnsProps) => {
  const dispatch = useDispatch();
  const [columnData, setColumnData] = useState<any>([]);
  const [columnInitialData, setColumnInitialData] = useState<any>([]);
  const [searchData, setSearchData] = useState("");
  const [tableField, setTableField] = useState<any>({});
  const { tableColumnsData } = useSelector(
    (state: RootState) => state.notesbookmarksColumn
  );

  const handleColumnSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e?.target?.value?.toLowerCase() || "";
    setSearchData(searchValue);

    if (!searchValue) {
      setColumnData(columnInitialData);
    } else {
      const filtered = columnData.filter((column: any) =>
        column?.name?.toLowerCase()?.includes(searchValue)
      );
      setColumnData(filtered);
    }
  };

  const handleTableColumnVisiblitity = (columnName: string) => {
    const updatedColumns = columnInitialData?.map((column: any) => {
      return {
        ...column,
        visible: column.field === columnName ? !column.visible : column.visible,
      };
    });

    setColumnInitialData(updatedColumns);

    const filtered = searchData
      ? updatedColumns?.filter((column: any) =>
          column.name.toLowerCase().includes(searchData)
        )
      : updatedColumns;

    setColumnData(filtered);
  };

  const handleHideShowColumn = () => {
    setIsHideShowOpen(false);
    setSearchData("")
    dispatch(moveColumn(columnInitialData));
  };

  const moveColumnFuntion = (dragIndex: number, hoverIndex: number) => {
    const updatedColumns = [...columnData];
    const [movedItem] = updatedColumns.splice(dragIndex, 1);
    updatedColumns.splice(hoverIndex, 0, movedItem);
    setColumnData(updatedColumns);
  };

  // useEffect(() => {
  //   setColumnInitialData(selectedColumn);
  //   setColumnData(selectedColumn);
  // }, [selectedColumn, isHideShowOpen]);
  useEffect(() => {
    setColumnInitialData(tableColumnsData);
    setColumnData(tableColumnsData);
  }, [tableColumnsData, isHideShowOpen]);

  return (
    <DropdownMenu open={isHideShowOpen} onOpenChange={setIsHideShowOpen}>
      <DropdownMenuTrigger className="dropdownMenuTrigger border rounded-full p-1.5">
        <OptimizedImage
          className="select-none"
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//visibility.svg`}
          alt="visibility icon"
          width={ImageSizes.icon.xs.width}
          height={ImageSizes.icon.xs.height}
        />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          onPointerDownOutside={() => setIsHideShowOpen(false)}
          className="dropdownMenu p-4 bg-inputBackground w-60"
          side="bottom"
          align="end"
        >
          <div>
            <h2 className="text-sm font-medium">Show or Hide Columns</h2>
            <p className="text-[12px] font-normal text-foreground">
              Drag to reorder
            </p>
          </div>
          <div className="relative flex items-center pt-[14px]">
            <input
              value={searchData}
              type="text"
              id="simple-search"
              autoComplete="off"
              className="bg-transparent border outline-none border-gray-300 text-gray-900 text-[13px] font-normal rounded-full block w-full pl-3 p-1.5 dark:text-white"
              placeholder="Search Column..."
              onChange={handleColumnSearch}
              onClick={(e) => e.stopPropagation()}
            />
            <span className="absolute right-3 text-gray-500">
              <OptimizedImage
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//search.svg`}
                alt="search icon"
                width={ImageSizes.icon.xs.width}
                height={ImageSizes.icon.xs.height}
              />
            </span>
          </div>
          <hr className="pb-[10px] mt-[14px] border-tableBorder" />
          {columnData?.map((column: any, i: number) => (
            <DraggableColumn
              key={column.field}
              index={i}
              column={column}
              moveColumn={moveColumnFuntion}
              moveLabel={columnData}
              handleTableColumnVisiblitity={handleTableColumnVisiblitity}
              setTableField={setTableField}
            />
          ))}

          <div className="flex justify-end mt-4">
            <Button
              className="h-8 btn text-[13px] rounded-[26px] text-white hover:text-white"
              variant="outline"
              onClick={handleHideShowColumn}
            >
              Apply Change
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};

export default ShowHideColumns;
