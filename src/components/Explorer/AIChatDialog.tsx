import { Dialog, DialogContent } from "@/components/ui/dialog";

import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { PDFData as PDFDataType } from "@/types/types";
import FolderChatAI from "./FolderChatAI";

interface EditDialogProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  folderAIData?: any[];
  fetchFolders?: any;
}

export const AIChatDialog: React.FC<EditDialogProps> = ({
  isOpen,
  onOpenChange,
  folderAIData,
  fetchFolders,
}) => {
  const handleDialogContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[800px] FolderChatAI max-h-full overflow-y-auto"
        onClick={handleDialogContentClick}
      >
        <div className="mt-4">
          <FolderChatAI fetchFolders={fetchFolders} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
