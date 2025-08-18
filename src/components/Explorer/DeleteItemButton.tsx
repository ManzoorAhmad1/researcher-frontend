import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useDispatch, useSelector } from "react-redux";
import { refreshData } from "@/redux/services/folderSlice";
import { Button } from "../ui/button";
import { Loader } from "rizzui";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteItem, deleteMultipleItems } from "@/apis/explore";

interface DeleteDialogProps {
  itemId: string;
  itemName: string;
  fetchFolders?: any;
  itemType: "file" | "folder";
  isOpen: boolean;
  selectedItems?: any;
  onOpenChange: (isOpen: boolean) => void;
  data?: any;
  setSelectedItems?: any;
  isMultiTypeDelete?: boolean;
}

export const DeleteItemButton: React.FC<DeleteDialogProps> = ({
  itemId,
  itemName,
  fetchFolders,
  itemType,
  isOpen,
  onOpenChange,
  selectedItems,
  setSelectedItems,
  isMultiTypeDelete,
  data,
}) => {
  const dispatch = useDispatch();
  const handleDialogContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentProject = useSelector((state: any) => state?.project);

  const getAllSubFolders = (folder: any): number[] => {
    let subFolderIds: number[] = [];

    if (folder.subFolderMove && Array.isArray(folder.subFolderMove)) {
      folder.subFolderMove.forEach((subFolder: any) => {
        subFolderIds.push(subFolder.id);
        subFolderIds = [...subFolderIds, ...getAllSubFolders(subFolder)];
      });
    }

    return subFolderIds;
  };
  const handleDeleteFolder = async () => {
    setIsLoading(true);
    const projectId: any =
      currentProject?.project?.id && currentProject?.project?.id !== null
        ? currentProject?.project?.id
        : localStorage.getItem("currentProject");
    try {
      let result: any;
      if (isMultiTypeDelete) {
        const filesToBeDeleted = data?.files
          ?.filter((file: any) => itemId.includes(file.id.toString()))
          ?.map((file: any) => ({id:String(file.id),file:file.fileName}));
        const foldersToBeDeleted = data?.subFolder
          ?.filter((folder: any) => itemId.includes(folder.id.toString()))
          ?.map((folder: any) => String(folder.id));

        let deletedSubFolders: number[] = [];
        if (foldersToBeDeleted && foldersToBeDeleted.length > 0) {
          const foldersInMove = data?.subFolderMove?.filter((folder: any) =>
            foldersToBeDeleted.includes(String(folder.id))
          );

          foldersInMove?.forEach((folder: any) => {
            deletedSubFolders = [
              ...deletedSubFolders,
              ...getAllSubFolders(folder),
            ];
          });
        }

        result = await deleteMultipleItems(
          filesToBeDeleted,
          foldersToBeDeleted,
          deletedSubFolders,
          projectId
        );
      } else {
        let deletedSubFolders: number[] = [];
        if (itemType === "folder" && itemType) {
          const foldersInMove = data?.subFolderMove?.filter(
            (folder: any) => +itemId === +folder.id
          );

          foldersInMove?.forEach((folder: any) => {
            deletedSubFolders = [
              ...deletedSubFolders,
              ...getAllSubFolders(folder),
            ];
          });
        }
        result = await deleteItem(
          itemId,
          itemType,
          deletedSubFolders,
          projectId
        );
      }

      if (result?.data?.isSuccess) {
        toast.success(result?.data?.message);
        if (setSelectedItems) {
          setSelectedItems([]);
        }

        fetchFolders();
        onOpenChange(false);
        dispatch(refreshData());
      } else {
        toast.error(
          result?.response?.data?.message ||
            result?.message ||
            "An error occurred."
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onClick={handleDialogContentClick}>
        <DialogHeader>
          <DialogTitle>Delete</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <p>
            Are you sure you want to delete{" "}
            <b className="text-red-500 break-all">
              {" "}
              {selectedItems} {isMultiTypeDelete ? "Item" : itemName}
            </b>
            ? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            className="rounded-[26px]"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            className="rounded-[26px]"
            onClick={handleDeleteFolder}
            disabled={isLoading}
          >
            {isLoading ? <Loader variant="threeDot" size="lg" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
