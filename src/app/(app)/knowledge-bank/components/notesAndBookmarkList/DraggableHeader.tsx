import TableHeaderItem from "@/components/coman/TableHeaderItem";
import { TableHead } from "@/components/ui/table";
import { useDrag, useDrop } from "react-dnd";

const DraggableHeader = ({ column, index, moveColumn, handleSort }: any) => {
  const [, ref] = useDrag({
    type: "column",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "column",
    drop(item: any) {
      if (item.index !== index) {
        moveColumn(item.index, index);
        item.index = index;
      }
    },
  });
  if (column?.field === "title") {
    return (
      <TableHead ref={(node: any) => ref(drop(node)) as any}>
        <TableHeaderItem
          columnName="TITLE"
          fieldName="title"
          handelSorting={handleSort}
        />
      </TableHead>
    );
  }

  if (column?.field === "description") {
    return (
      <TableHead ref={(node: any) => ref(drop(node)) as any}>
        <TableHeaderItem
          columnName="DESCRIPTION"
          fieldName="description"
          handelSorting={handleSort}
        />
      </TableHead>
    );
  }
  if (column?.field === "tags") {
    return (
      <TableHead
        className="table-cell font-semibold text-[11px]"
        ref={(node: any) => ref(drop(node)) as any}
      >
        <TableHeaderItem columnName="TAGS" fieldName="tags" />
      </TableHead>
    );
  }
  if (column?.field === "links") {
    return (
      <TableHead
        className="table-cell"
        ref={(node: any) => ref(drop(node)) as any}
      >
        <TableHeaderItem
          columnName="LINKS"
          fieldName="links"
          handelSorting={handleSort}
        />
      </TableHead>
    );
  }
};

export default DraggableHeader;
