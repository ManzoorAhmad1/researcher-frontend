"use client"
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import { MoverModel } from "./Move-file-folder-tree";
import { convertDataToTree, convertTreeToData } from "./Move-file-folder-tree";
import { Loader } from "rizzui";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { getMoveData, moveItemAPI } from "@/apis/explore";
import { BsFillInfoCircleFill } from "react-icons/bs";
import toast from "react-hot-toast";

interface MoveDialogProps {
  itemId: string;
  moveData: any;
  itemName: string;
  fetchFolders?: () => void;
  itemType: "file" | "folder";
  isOpen: boolean;
  data: any;
  onOpenChange: (isOpen: boolean) => void;
  isMoveDataLoading: boolean;
}

interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
}

export const MoveItemButton: React.FC<MoveDialogProps> = ({
  itemId,
  itemName,
  moveData,
  fetchFolders,
  itemType,
  isOpen,
  data,
  isMoveDataLoading,
  onOpenChange,
}) => {
  const [gData, setGData] = useState<TreeNode[]>();
  const user = useSelector((state: RootState) => state.user?.user?.user);
  const currentProject = useSelector((state: any) => state?.project);
  const [loading, setLoading] = useState<boolean>(false);


  useEffect(() => {
    if(moveData && moveData !== null && moveData !== undefined){
      setGData(convertDataToTree([moveData]));
    }
  }, [moveData]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updatedData = convertTreeToData(gData as any);
      
      // Check if the structure has actually changed
      
      const projectId: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");

      await moveItemAPI({ data: updatedData[0], projectId }, user?.id);
      if (fetchFolders) {
        fetchFolders();
      }
      toast.success("Files moved successfully!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to move item. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div 
        role="dialog"
        aria-modal="true"
        className="dark:bg-tagBoxBg dark:text-white bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-hidden focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-within:outline-none focus-within:ring-0"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={{
          outline: 'none',
          boxShadow: 'none',
          borderColor: 'transparent'
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b focus:outline-none">
          <h2 className="dark:text-white text-xl font-semibold text-gray-800">
            Move {itemType === 'file' ? 'File' : 'Folder'}
          </h2>
        </div>
        {isMoveDataLoading ? (
          <div className="flex items-center justify-center h-full my-8">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="p-6 focus:outline-none">
              <div className="flex items-center text-sm mb-4">
                <BsFillInfoCircleFill className="mr-2 h-5 w-5 text-yellow-400" />
                <p><span className="font-medium">Tip:</span> To add a file to a folder, drag it slightly right of the folder icon until a line appears.</p>
              </div>
              
              <div className="overflow-hidden focus:outline-none">
                {gData && gData !== null && gData !== undefined && (
                  <MoverModel
                    id={itemId}
                    gData={gData}
                    setGData={setGData}
                    folderType={itemType}
                  />
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3 focus:outline-none">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="dark:hover:bg-black hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? <Loader variant="threeDot" size="lg" /> : "Move"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
