/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader } from "rizzui";
import RecursiveDropdown from "./RecursiveDropdown";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { createPaperPdf } from "@/apis/explore";
import { getFoldersByProjectId } from "@/apis/files";
import { getProjectByWorkspace } from "@/apis/projects";
import { axiosInstancePrivate } from "@/utils/request";
import toast from "react-hot-toast";

interface AddToPaperDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paperData: {
    paperId: string;
    title: string;
    url: string;
    citationCount: number;
  } | null;
  onPaperAdded?: (paperId: string) => void;
  setSelectedPaperData: (data: any) => void;
}

const AddToPaperDialog: React.FC<AddToPaperDialogProps> = ({
  isOpen,
  onClose,
  paperData,
  onPaperAdded,
  setSelectedPaperData
}) => {
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingFolders, setFetchingFolders] = useState(false);
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const [activeFolder, setActiveFolder] = useState({
    name: "Root",
    id: "0",
    project_id: "",
    project_name: "",
  });
  const [projectName, setProjectName] = useState("");
  const [paperFoldersList, setPaperFoldersList] = useState<any>([]);
  const userInfo = useSelector((state: RootState) => state.user.user?.user);
  const currentProject = useSelector((state: any) => state?.project);

  const handleSubmit = async () => {
    if (!paperData) return;

    try {
      setLoading(true);

      // Determine the correct project_id and folder_id
      let project_id: string;
      let folder_id: string | number = 0;

      if (activeFolder.project_id && activeFolder.project_id !== activeFolder.id) {
        // If a folder is selected, use its project_id and folder_id
        project_id = activeFolder.project_id;
        folder_id = activeFolder.id;
      } else {
        project_id = activeFolder.id;
        folder_id = 0;
      }

      // Step 1: Save the paper using createPaperPdf
      const paperBody = {
        title: paperData.title,
        url: paperData.url,
        project_id: project_id,
        citationCount: paperData.citationCount,
        parent_folder_id: folder_id,
      };

      const response = await createPaperPdf(paperBody);

      if (response?.status === 200) {
        // Step 2: If a folder is selected, move the paper to that folder
        if (folder_id !== 0 && response?.data?.paper_id) {
          try {
            const moveResponse = await axiosInstancePrivate.put(
              `/files/${response.data.paper_id}/move`,
              null,
              {
                params: { toFolderId: folder_id }
              }
            );
          } catch (moveError) {
            console.error("Error moving paper to folder:", moveError);
            toast.error("Paper saved but couldn't be moved to selected folder");
          }
        }

        // Success - paper saved (and moved if folder selected)
        setLoading(false);
        onClose();
        if (paperData?.paperId) {
          onPaperAdded?.(paperData.paperId);
        }
        
        const locationText = folder_id === 0 
          ? `"${activeFolder.name}" project` 
          : `"${activeFolder.name}" folder in "${projectName}" project`;
          
        toast.success(`Paper "${paperData.title}" has been added successfully to ${locationText}.`);
      } else {
        throw new Error("Failed to create paper");
      }
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(error?.response?.data?.message || "An error occurred");
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchPaperFolders() {
      try {
        setFetchingFolders(true);
        const workspaceId = workspace?.id || localStorage.getItem("currentWorkspace");
        
        if (workspaceId) {
          // Get all projects in the current workspace (same as MainSidebar)
          const response = await getProjectByWorkspace({ workspaceId });
          
          if (response?.data?.success === false) {
            toast.error(response?.data?.message);
            return;
          }
          
          if (response?.data?.projects) {
            const allProjects = response.data.projects;
            
            // For each project, get its folders
            const projectsWithFolders = await Promise.all(
              allProjects.map(async (project: any) => {
                try {
                  const foldersResponse = await getFoldersByProjectId(project.id);
                  let folders: any[] = [];
                  
                  if (foldersResponse?.data?.data) {
                    // The folders come as a flat array, we need to organize them into a hierarchy
                    const flatFolders = foldersResponse.data.data;
                    
                    // Create a map of folders by ID for easy lookup
                    const folderMap = new Map();
                    flatFolders.forEach((folder: any) => {
                      folderMap.set(folder.id, {
                        id: folder.id,
                        folder_name: folder.folder_name,
                        name: "", // No name means it's a folder, not a project
                        project_id: project.id,
                        submenu: []
                      });
                    });
                    
                    // Organize folders into hierarchy
                    flatFolders.forEach((folder: any) => {
                      const folderItem = folderMap.get(folder.id);
                      
                      if (folder.parent_id === null || folder.parent_id === undefined) {
                        // This is a root folder
                        folders.push(folderItem);
                      } else {
                        // This is a subfolder, add it to its parent
                        const parentFolder = folderMap.get(folder.parent_id);
                        if (parentFolder) {
                          parentFolder.submenu.push(folderItem);
                        }
                      }
                    });
                  }
                  
                  return {
                    id: project.id,
                    folder_name: "",
                    name: project.name,
                    project_id: project.id,
                    submenu: folders
                  };
                } catch (error) {
                  console.error(`Error fetching folders for project ${project.id}:`, error);
                  // Return project without folders if there's an error
                  return {
                    id: project.id,
                    folder_name: "",
                    name: project.name,
                    project_id: project.id,
                    submenu: []
                  };
                }
              })
            );
            
            // Sort projects to put current project first (same as MainSidebar)
            const currentProjectId = currentProject?.project?.id;
            const sortedProjects = projectsWithFolders.sort((a, b) => {
              if (a.id === currentProjectId) return -1;
              if (b.id === currentProjectId) return 1;
              return 0;
            });
            
            setPaperFoldersList(sortedProjects);
          } else {
            setPaperFoldersList([]);
          }
        } else {
          setPaperFoldersList([]);
        }
      } catch (error: any) {
        console.error("Error fetching paper folders:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
        setPaperFoldersList([]);
      } finally {
        setFetchingFolders(false);
      }
    }
    
    if (isOpen) {
      fetchPaperFolders();
    }
  }, [isOpen, workspace?.id, currentProject?.project?.id]);

  // Set initial active folder when folders are loaded
  useEffect(() => {
    if (paperFoldersList?.length > 0) {
      // Find the current project in the list
      const currentProjectId = currentProject?.project?.id;
      const currentProjectItem = paperFoldersList.find(
        (item: any) => item.id === currentProjectId
      );
      
      if (currentProjectItem) {
        // Set current project as active
        setActiveFolder({
          name: currentProjectItem.name,
          id: currentProjectItem.id,
          project_id: currentProjectItem.id,
          project_name: currentProjectItem.name,
        });
      } else {
        // Fallback to first project
        const firstProject = paperFoldersList[0];
        setActiveFolder({
          name: firstProject.name,
          id: firstProject.id,
          project_id: firstProject.id,
          project_name: firstProject.name,
        });
      }
    }
  }, [paperFoldersList, currentProject?.project?.id]);

  useEffect(() => {
    if (activeFolder?.id && paperFoldersList?.length) {
      if (activeFolder.project_id && activeFolder.project_id !== activeFolder.id) {
        // This is a folder, find its project name
        const project = paperFoldersList?.find(
          (item: any) => item?.id === activeFolder?.project_id
        );
        setProjectName(project?.name || "Unknown Project");
      } else {
        // This is a project
        setProjectName(activeFolder.name);
      }
    }
  }, [activeFolder?.id, activeFolder?.project_id, paperFoldersList]);

  // Prevent text selection when modal opens (without interfering with typing)
  useEffect(() => {
    if (isOpen && paperData?.title) {
      // Small delay to ensure the input is rendered
      const timer = setTimeout(() => {
        const input = document.getElementById('name') as HTMLInputElement;
        if (input) {
          // Place cursor at end without selecting text
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]); // Only run when modal opens, not on every title change

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] max-h-full overflow-y-auto">
        <div>
          <DialogHeader className="mb-3">Select folder</DialogHeader>
          <div>
            {fetchingFolders ? (
              <div className="flex items-center justify-center py-8">
                <Loader variant="threeDot" size="lg" className="mr-2" />
                <span className="text-sm text-muted-foreground">Loading projects and folders...</span>
              </div>
            ) : (
              <RecursiveDropdown
                activeFolder={activeFolder}
                setActiveFolder={setActiveFolder}
                menuData={paperFoldersList}
              />
            )}
            <div className="flex flex-col mt-3">
              <label htmlFor="title" className="text-[14px] text-foreground">
                Title
              </label>
              <input
                value={paperData?.title || ""}
                id="name"
                name="name"
                placeholder="Enter a title"
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSelectedPaperData?.({...paperData, title: newValue});
                }}
                className="mb-4 mt-1 p-2 text-foreground font-size-normal font-normal rounded-lg h-[32px] w-full bg-background border border-input shadow-sm focus:border-ring focus:outline-none transition duration-200 ease-in-out placeholder:text-muted-foreground"
                required
                autoFocus={false}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-3 !justify-between">
            <div className="text-[14px] w-[60%] text-muted-foreground">
              <span>
                This paper will be stored under the{" "}
                <span className="text-primary font-bold underline">
                  {activeFolder?.name}
                </span>{" "}
                {typeof activeFolder?.id === "string" ? "project" : "folder"}
                {` in the 'Papers' screen`}
              </span>
            </div>
            <div className="flex gap-2 justify-end knowledge-bankitems-center">
              <Button
                onClick={onClose}
                className="rounded-[26px] text-primary border-primary h-9 dark:bg-transparent hover:bg-transparent hover:text-primary"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="rounded-[26px] btn text-white h-9 w-20"
                disabled={loading || fetchingFolders}
              >
                {loading ? (
                  <Loader variant="threeDot" size="sm" className="mx-auto" />
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

export default AddToPaperDialog; 