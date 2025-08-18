'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader } from 'rizzui';
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { toast } from 'react-hot-toast';
import { useSelector } from "react-redux";
import { deleteItem } from '@/apis/explore';

interface DeleteDialogProps {
    isOpen: boolean
    onOpenChange: (item: boolean) => void
    pdfInfo: { id: string, title: string }
    fetchData: Function
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ isOpen, onOpenChange, pdfInfo, fetchData }) => {
    const supabase: SupabaseClient = createClient();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const currentProject = useSelector((state: any) => state?.project);
    const handleDeleteFolder = async () => {
        setIsLoading(true)
        const projectId: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");
        const response = await deleteItem(
            pdfInfo?.id,
            'file',
            [],
            projectId
          );

        if (response.data.isSuccess) {
            toast.success(response.data.message)
            fetchData()
            setIsLoading(false)
            onOpenChange(false)
        } else {
            setIsLoading(false)
            toast.error(response.data.message)
        }

       
    }

    const handleDialogContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
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
                            {pdfInfo?.title}
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
                        className="rounded-[26px] text-white"
                        onClick={handleDeleteFolder}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader variant="threeDot" size="lg" /> : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteDialog