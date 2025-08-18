import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import { Loader } from "rizzui";
import { DeleteDialogInfo } from "../utils/types";

interface DeleteDialogOpenProps {
  deleteDialogInfo: DeleteDialogInfo;
  setDeleteDialogInfo: (item: DeleteDialogInfo) => void;
  deleteFunction: () => void;
}

const DeleteDialog: React.FC<DeleteDialogOpenProps> = ({
  deleteDialogInfo,
  setDeleteDialogInfo,
  deleteFunction,
}) => {
  const [deleteLoading, SetDeleteLoading] = useState(false);

  const handleDelete = async () => {
    SetDeleteLoading(true);
    await deleteFunction();
    SetDeleteLoading(false);
  };

  return (
    <Dialog
      open={deleteDialogInfo?.show}
      onOpenChange={() =>
        setDeleteDialogInfo({ id: "", name: "", show: false, type: "" })
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <p>
            Are you sure you want to delete this{" "}
            <b className="text-red-500">{deleteDialogInfo?.name}</b>? This
            action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button
            className="rounded-[26px]"
            variant="secondary"
            onClick={(e) => {
              setDeleteDialogInfo({ id: "", name: "", type: "", show: false });
            }}
          >
            Cancel
          </Button>
          <Button
            className="w-[82px] rounded-[26px] text-white"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Loader variant="threeDot" size="lg" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
