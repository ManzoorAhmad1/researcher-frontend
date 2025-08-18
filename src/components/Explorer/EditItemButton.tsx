import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import { refreshData } from "@/redux/services/folderSlice";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { Loader } from "rizzui";

import { useToast } from "@/components/ui/use-toast";
import toast from "react-hot-toast";
import { editItem } from "@/apis/explore";
import { RootState } from "@/reducer/store";

interface EditDialogProps {
  itemId: string;
  itemName: string;
  fetchFolders?: () => void;
  itemType: "file" | "folder";
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const EditItemButton: React.FC<EditDialogProps> = ({
  itemId,
  itemName,
  fetchFolders,
  itemType,
  isOpen,
  onOpenChange,
}) => {
  const dispatch = useDispatch();
  const [newName, setNewName] = useState(itemName);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentProject = useSelector((state: any) => state?.project );
  const handleDialogContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleEdit = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setIsLoading(true);

    try {
      const projectId: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");
      const result = await editItem(itemId, itemType, newName, projectId);
       console.log("result",result);
      if (result?.isSuccess) {
        toast.success(`${itemType} "${newName}" renamed successfully.`);
        if (fetchFolders) fetchFolders();
        dispatch(refreshData());
        onOpenChange(false);
      }else{
        toast.error(result?.message || "Failed to rename item. Please try again.");
      }
    } catch (error: any) {
      console.log("error",error);
      toast.error(error?.response?.data?.message || "Failed to rename item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent onClick={handleDialogContentClick}>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <Input
            placeholder="Enter new name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChange(false);
            }}
            className="rounded-[26px]"
          >
            Cancel
          </Button>
          <Button onClick={handleEdit} disabled={isLoading} className="rounded-[26px]  btn text-white">
            {isLoading ? <Loader variant="threeDot" size="lg" /> : "Edit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
