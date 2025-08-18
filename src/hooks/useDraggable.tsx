import { useMoveFileMutation } from "@/redux/services/fileApi";
import { useMoveFolderMutation } from "@/redux/services/folderApi";
import { refreshData } from "@/redux/services/folderSlice";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useDispatch } from "react-redux";

export const ItemTypes = {
  FOLDER: "folder",
  FILE: "file",
};

interface DraggableItem {
  type: string;
  id: string;
}

export const useDraggable = (item: DraggableItem) => {
  const ref = useRef<HTMLDivElement>(null);
  const [moveFile] = useMoveFileMutation();
  const [moveFolder] = useMoveFolderMutation();
  const dispatch = useDispatch();

  const [, drag] = useDrag({
    type: item.type,
    item: { id: item.id, type: item.type },
    end: (draggedItem, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        console.log(
          `Dropped ${draggedItem.type} with id ${draggedItem.id} into ${draggedItem.id}`
        );
      }
    },
  });

  const [, drop] = useDrop({
    accept: [ItemTypes.FOLDER, ItemTypes.FILE],
    drop: async (droppedItem: DraggableItem, monitor) => {
      if (monitor.didDrop()) return;

      try {
        if (droppedItem.type === ItemTypes.FILE) {
          await moveFile({
            fileId: droppedItem.id,
            toFolderId: item.id,
          }).unwrap();
        } else if (droppedItem.type === ItemTypes.FOLDER) {
          await moveFolder({
            folderId: droppedItem.id,
            toParentId: item.id,
          }).unwrap();
        
        }
        dispatch(refreshData());
      } catch (error) {
        console.error(
          `Failed to move ${droppedItem.type} ${droppedItem.id}:`,
          error
        );
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(ref));

  return ref;
};
