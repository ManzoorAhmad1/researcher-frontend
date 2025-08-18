import { createFolder } from "@/apis/explore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useGetFolderWithFilesQuery } from "@/redux/services/folderApi";
import { refreshData } from "@/redux/services/folderSlice";
import { FolderPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "rizzui";

interface CreateFolderButtonProps {
  slugId: any;
  fetchFolders: any;
  isDropdown?: boolean;
}

export const CreateFolderButton: React.FC<CreateFolderButtonProps> = ({
  fetchFolders,
  slugId,
  isDropdown,
}: any) => {
  const pathname = usePathname();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  const dispatch = useDispatch();
  const userId = useSelector((state: any) => state.user?.user?.user?.id);
  const currentProject = useSelector((state: any) => state?.project);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: rootFolder, refetch } = useGetFolderWithFilesQuery({
    folderId: undefined,
    user: { user: { id: userId } },
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleCreateFolder = async () => {
    let parentId = pathname.split("/").pop();

    if (pathname === "/explorer" && rootFolder) {
      parentId = rootFolder.id;
    }
    try {
      if (userId) {
        const parsentDate = new Date();
        setIsLoading(true);

        const result: any = await createFolder({
          folder_name: folderName,
          parent_id: slugId,
          user_id: userId,
          created_at: parsentDate,
          is_root: true,
          project_id: currentProject?.project?.id,
        });
        if (result?.data?.isSuccess) {
          toast.success(
            `Folder "${folderName}" has been created successfully.`
          );
          fetchFolders();
          setIsDialogOpen(false);
          setFolderName("");
          dispatch(refreshData());
        } else {
          toast.error(
            result?.response?.data?.message ||
              result?.message ||
              "An error occurred."
          );
        }
      } else {
        toast.error("User not authenticated. Please log in.");
      }
    } catch (error: any) {
      console.log("errr", error);
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsDialogOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isDropdown && (
        <Button
          size="sm"
          className="h-8 gap-1 btn rounded-[26px]"
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
        >
          <FolderPlus color="white" width={18} height={18} />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap font-size-normal text-white ">
            Add Folder
          </span>
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <Input
              placeholder="Folder Name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              className="rounded-[26px]"

              onClick={() => {
                setIsDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={isLoading} className="rounded-[26px] btn text-white">
              {isLoading ? <Loader variant="threeDot" size="lg" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
