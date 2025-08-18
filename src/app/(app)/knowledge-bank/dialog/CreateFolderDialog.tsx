import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRefetchNotesBookmarkAllData } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { AppDispatch, RootState } from "@/reducer/store";
import { useDispatch, useSelector } from "react-redux";
import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { createFolder } from "@/apis/notes-bookmarks";
import { CreateFolderDialogProps } from "../utils/types";
import toast from "react-hot-toast";

const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  createFolderShow,
  setCreateFolderShow,
}) => {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { slug } = params;
  const slugId = slug?.[slug?.length - 1];
  const [folderName, setFolderName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { workspace } = useSelector((state: RootState) => state.workspace );
  const { project } = useSelector((state: any) => state?.project );

  const handleSubmit = async () => {
    setLoading(true);

    const folderBody = {
      folder_name: folderName,
      workspace_id: workspace?.id,
      project_id: project?.id,
    };
    try {
      const data:any = await createFolder(slug?.length > 0 ? slugId : 0, folderBody);
    if (data?.success) {

      const body = { workspace_id: workspace?.id,project_id: project?.id, };
      dispatch(
        getRefetchNotesBookmarkAllData({
          id: slug?.length > 0 ? slug[slug.length - 1] : 0,
          currentPage: 1,
          perPageLimit: 10,
          body,
        })
      );
      setLoading(false);
      setCreateFolderShow(false);
      setFolderName("");
    }else{
      toast.error(data?.message);
      setLoading(false);
      setCreateFolderShow(false);
      setFolderName("");
    }
    } catch (error:any) {
      console.log(error, "error");
     
    }
  };

  return (
    <Dialog
      open={createFolderShow}
      onOpenChange={() => setCreateFolderShow(false)}
    >
      <DialogContent>
        <div>
          <DialogHeader className="mb-3">Create Folder</DialogHeader>
          <Input
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Folder Name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
          <DialogFooter className="mt-6">
            <div className="flex gap-2 justify-end items-center">
              <Button
                onClick={() => setCreateFolderShow(false)}
                className="rounded-[20px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="rounded-[26px] btn text-white h-9 w-20"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <>
                    <span className="text-nowrap">Save</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;
