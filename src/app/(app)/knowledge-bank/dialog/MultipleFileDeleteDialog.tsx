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
interface MultipleFileDeleteDialogOpenProps {
    show: boolean;
    setShow: (item: any) => void;
    selectedItems: number
    deleteFunction: () => void;
}

const MultipleFileDeleteDialog: React.FC<MultipleFileDeleteDialogOpenProps> = ({
    show,
    setShow,
    selectedItems,
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
            open={show}
            onOpenChange={() =>
                setShow(false)
            }
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete</DialogTitle>
                </DialogHeader>
                <div className="mt-2">
                    <p>
                        Are you sure you want to delete this{" "}
                        <b className="text-red-500">{selectedItems} Selected Files </b>? This
                        action cannot be undone.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={(e) => {
                            setShow(false);
                        }}
                        className="rounded-[26px]"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="w-[83px] rounded-[26px] text-white"
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

export default MultipleFileDeleteDialog;
