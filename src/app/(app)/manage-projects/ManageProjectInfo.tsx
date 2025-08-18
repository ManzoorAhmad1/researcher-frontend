"use client";
import {
  Dot,
  LoaderCircle,
  Lock,
  Plus,
  Trash,
  X,
  Filter,
  File,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TbSwitch2 } from "react-icons/tb";
import { CiEdit } from "react-icons/ci";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { IoDocumentAttach } from "react-icons/io5";
import Link from "next/link";
import * as Switch from "@radix-ui/react-switch";
import {
  deleteProject,
  getProjectById,
  getProjectByUser,
  getProjectTeamMembers,
  updateProject,
  updateProjectTeamLead,
} from "@/apis/projects";
import { useDispatch, useSelector } from "react-redux";
import { timeSinceUpdated } from "@/utils/formatDate";
import { addCurrentProject } from "@/reducer/services/projectSlice";
import { AppDispatch } from "@/reducer/store";
import { Loader } from "rizzui";
import toast from "react-hot-toast";
import { addCurrentWorkSpace } from "@/reducer/services/workspaceSlice";
import useSocket from "../info/[...slug]/socket";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";

import {
  Dialog as TemplateDialog,
  DialogContent as TemplateDialogContent,
  DialogFooter as TemplateDialogFooter,
  DialogHeader as TemplateDialogHeader,
  DialogTitle as TemplateDialogTitle,
  DialogClose as TemplateDialogClose,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { getTemplates } from "@/apis/templates";
import ManageProjectDrawer from "../myprojects/ProjectDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateUser } from "@/apis/user";
import { updateUserPlan } from "@/reducer/auth/authSlice";
import dummyImg from "@/images/dummyImg.png";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

const ManageProjectInfo = () => {
  const dispatch: AppDispatch = useDispatch();
  const searchParams = useSearchParams();
  const currentWorkspace = useSelector((state: any) => state?.workspace);
  const currentProject = useSelector((state: any) => state?.project);
  const user = useSelector((state: any) => state.user?.user?.user);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [projects, setProjects] = useState<any>([]);
  const [filteredProjects, setFilteredProjects] = useState<any>([]);
  const [workspaces, setWorkspaces] = useState<any>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("all");
  const [templates, setTemplates] = useState([]);
  const [teamMembers, setTeamMembers] = useState<any>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [allActivity, setAllActivity] = useState<any>([]);
  const [resentActivityOpen, setResentActivityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeadSwitchOpen, setIsLeadSwitchOpen] = useState(false);
  const [templateProject, setIsTemplateProject] = useState<any>(null);
  const [updatedProject, setUpdatedProject] = useState<any>(null);
  const [updatedLead, setUpdatedLead] = useState<any>(null);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [isEditId, setIsEditId] = useState<any>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [toggledTemplates, setToggledTemplates] = useState<any>([]);
  const [moreInfo, setMoreInfo] = useState<any>([]);
  const { socket } = useSocket();
  const [isCreate, setIsCreate] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [deleteText, setDeleteText] = useState("");
  const [projectId, setProjectId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (currentWorkspace?.workspace?.id) {
      handleGetProjectsByWorkSpaceId();
      handleGetTemplates();
    }
  }, [currentWorkspace?.workspace?.id]);

  useEffect(() => {
    if (projects.length > 0) {
      if (selectedWorkspace && selectedWorkspace !== "all") {
        const filtered = projects.filter(
          (project: any) => project?.workspaces?.name === selectedWorkspace
        );
        setFilteredProjects(filtered);
      } else {
        setFilteredProjects(projects);
      }
    }
  }, [selectedWorkspace, projects]);

  useEffect(() => {
    if (projects.length > 0) {
      const uniqueWorkspaces = Array.from(
        new Set(
          projects
            .filter((project: any) => project?.workspaces?.name)
            .map((project: any) => project?.workspaces?.name)
        )
      );
      setWorkspaces(uniqueWorkspaces);
    }
  }, [projects]);

  const handleGetTemplates = async (restrictRefresh?: boolean) => {
    try {
      if (!restrictRefresh) {
        setTemplateLoading(true);
      }

      let response = await getTemplates({});
      setTemplates(
        response?.data?.templates?.data?.filter(
          (item: any) => item?.status === "live"
        )
      );
    } catch (error: any) {
      setTemplateLoading(false);

      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setTemplateLoading(false);
    }
  };

  useEffect(() => {
    if (socket === null) {
      return;
    }
    if (socket) {
      socket.on("collaboratorUpdated", (collaboratorUpdated: any) => {
        handleGetProjectsByWorkSpaceId(true);
      });
      socket.on("projectDeleted", (projectDeleted: any) => {
        const isDeletedProjectExists =
          currentWorkspace?.allWorkspaces?.find((workspace: any) =>
            workspace?.projects?.find(
              (project: any) => project.id === projectDeleted?.projectId
            )
          ) ||
          currentWorkspace?.allWorkspaces?.find(
            (workspace: any) => workspace?.id === projectDeleted?.workspaceId
          );
        const IsCollaboratorProjectUpdated = projects?.some(
          (item: any) => item?.id === projectDeleted?.projectId
        );
        if (isDeletedProjectExists || IsCollaboratorProjectUpdated) {
          handleGetProjectsByWorkSpaceId(true);
        }
      });

      socket.on("projectUpdated", (projectUpdated: any) => {
        const isUpdatedProjectExists = currentWorkspace?.allWorkspaces?.find(
          (workspace: any) =>
            workspace?.projects?.find(
              (project: any) => project.id === projectUpdated?.projectId
            )
        );

        const IsCollaboratorProjectUpdated = projects?.some(
          (item: any) => item?.id === projectUpdated?.projectId
        );
        if (
          (isUpdatedProjectExists || IsCollaboratorProjectUpdated) &&
          user.id !== isUpdatedProjectExists?.owner_user_id
        ) {
          handleGetProjectsByWorkSpaceId(true);
        }
      });
      return () => {
        socket.off("collaboratorUpdated");
        socket.off("projectDeleted");
        socket.off("projectUpdated");
      };
    }
  }, [socket, projects]);

  useEffect(() => {
    const workspace = searchParams.get("workspace");
    if (workspace && workspace !== null) {
      setIsDrawerOpen(true);
      setIsCreate(true);
    }
  }, [searchParams]);
  const handleGetProjectsByWorkSpaceId = async (restrictRefresh?: boolean) => {
    try {
      if (!restrictRefresh) {
        setLoading(true);
      }

      let response: any = await getProjectByUser({
        search: searchQuery,
        orderBy: "created_at",
      });
      if (response?.success === false) {
        toast.error(response?.message);
      }
      const updatedProjects = response?.data?.projects?.map((project: any) => ({
        ...project,
      }));

      // Only sort projects on initial load (when restrictRefresh is false)
      if (!restrictRefresh) {
        // Get the selected project ID from localStorage
        const selectedProjectId = localStorage.getItem("currentProject");

        const sortedProjects = [...updatedProjects].sort((a, b) => {
          // If we have a selected project ID, prioritize it
          if (selectedProjectId) {
            if (a.id === selectedProjectId) return -1;
            if (b.id === selectedProjectId) return 1;
          }
          // Fallback to current project state if no localStorage value
          if (a.id === currentProject?.project?.id) return -1;
          if (b.id === currentProject?.project?.id) return 1;
          return 0;
        });

        setSelectedWorkspace(currentWorkspace?.workspace?.name);

        setProjects(sortedProjects);
        setFilteredProjects(sortedProjects);
      } else {
        // Keep the current order when refreshing data
        setSelectedWorkspace(currentWorkspace?.workspace?.name);
        setProjects(updatedProjects);
        setFilteredProjects(updatedProjects);
      }
    } catch (error: any) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = async (project_id: string) => {
    try {
      // If clicking on already selected project or "Not Selected", do nothing
      if (project_id === currentProject?.project?.id || !project_id) {
        return;
      }

      let selectedProject;

      const projectInCurrentWorkspace =
        currentWorkspace?.workspace?.projects?.find(
          (project: any) => project?.id === project_id
        );

      if (projectInCurrentWorkspace) {
        selectedProject = projectInCurrentWorkspace;
      } else {
        const workspaceWithProject = currentWorkspace?.allWorkspaces?.find(
          (workspace: any) =>
            workspace?.projects?.find(
              (project: any) => project.id === project_id
            )
        );

        if (workspaceWithProject) {
          localStorage.setItem("currentWorkspace", workspaceWithProject.id);
          dispatch(addCurrentWorkSpace(workspaceWithProject));

          selectedProject = workspaceWithProject.projects.find(
            (project: any) => project.id === project_id
          );
        } else {
          const response: any = await getProjectById(project_id);
          if (!response?.data?.isSuccess) {
            throw new Error(
              response?.data?.message || "Failed to fetch project"
            );
          }

          selectedProject = response.data?.project?.data;

          if (selectedProject?.owner_user_id !== user?.id) {
            toast.success(
              "Switched to a Project where you are added as a collaborator"
            );
          }
        }
      }

      if (!selectedProject?.id) {
        throw new Error("Invalid project data");
      }

      // Update localStorage and state atomically
      localStorage.setItem("currentProject", selectedProject.id);
      dispatch(addCurrentProject(selectedProject));

      if (selectedProject?.id !== user?.current_project_id) {
        const userResponse = await updateUser({
          current_project_id: selectedProject.id,
        });

        if (userResponse?.data?.user) {
          dispatch(updateUserPlan(userResponse.data.user));
          localStorage.setItem("user", JSON.stringify(userResponse.data.user));
        }
      }

      // Only refresh the projects list if we actually switched projects
      if (selectedProject?.id !== currentProject?.project?.id) {
        await handleGetProjectsByWorkSpaceId(true);
      }
    } catch (error: any) {
      console.error("Project switch error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to switch project"
      );
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setProject(null);
    router.push("/manage-projects");
  };

  const handleViewAllRecentActivity = (allActivities: any) => {
    setAllActivity([...allActivities]);
    setResentActivityOpen(!resentActivityOpen);
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  const handleSearch = (e: any) => {
    e.preventDefault();
    handleGetProjectsByWorkSpaceId();
  };

  const handleMembers = async (e: any, project: any) => {
    e.preventDefault();
    setIsLeadSwitchOpen(true);
    setUpdatedProject(project);
    try {
      const projectTeamMembers = await getProjectTeamMembers(project?.id);
      setTeamMembers(projectTeamMembers?.data?.members);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
    }
  };

  const handleSwitchLead = async () => {
    const isCollaboratorExists =
      updatedProject?.lead_user_id === updatedLead?.id;
    const data = {
      project_id: updatedProject?.id,
      lead_id: updatedLead?.id,
      recent_activity_message: `Team lead Swtich from ${
        updatedProject?.lead?.first_name
      } ${updatedProject?.lead?.last_name.charAt(0).toUpperCase()}. to ${
        updatedLead?.first_name
      } ${updatedLead?.last_name.charAt(0).toUpperCase()}.`,
    };
    try {
      setIsSwitchLoading(true);

      let response: any = await updateProjectTeamLead(data);
      if (response?.success === false) {
        toast.error(response?.message);
      }
      if (response?.data?.isSuccess) {
        toast.success(response?.data?.message);
      } else {
        toast.success(response?.data?.message);
      }
      setIsLeadSwitchOpen(false);
      setUpdatedProject(null);
      setUpdatedLead(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsSwitchLoading(false);
    }
  };

  const handleCancel = (e: any) => {
    e.preventDefault();

    setIsLeadSwitchOpen(false);
    setUpdatedProject(null);
    setUpdatedLead(null);
  };

  const handleTeamLeadSwitch = (e: any) => {
    e.preventDefault();

    handleSwitchLead();
  };

  const handleEditCancel = () => {
    setIsEditId(null);
    setEditValue("");
    setError("");
  };
  const handleEdit = (id: string, name: string) => {
    setIsEditId(id);
    setEditValue(name);
  };
  const handleEditSave = async (currentName: string) => {
    try {
      setIsEditLoading(true);
      if (currentName !== editValue) {
        const response = await updateProject({
          data: { name: editValue },
          id: isEditId,
        });
        if (response) {
          setProjects(
            projects?.map((item: any) =>
              item?.id === isEditId ? { ...item, name: editValue } : item
            )
          );
          setIsEditId(null);
          setEditValue("");
          setError("");
          toast.success("The project name has been updated successfully.");
          await handleGetProjectsByWorkSpaceId(true);
        }
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditInput = (e: any) => {
    if (!e.target.value || e.target.value === "") {
      setEditValue(e.target.value);
      setError("Project name cannot be empty");
    } else if (e.target.value?.length > 130) {
      setError(
        "You have reached the maximum length supported for the project name (130 characters)"
      );
    } else {
      setError("");
      setEditValue(e.target.value);
    }
  };

  const handleTempaltesDialog = (project: any) => {
    const template = templates?.find(
      (temp: any) => temp?.id === project?.templates?.id
    );
    setSelectedTemplate(template);
    setIsTemplateProject(project);
  };

  const toggleTemplates = (id: string) => {
    setToggledTemplates((prev: any) => {
      if (prev.includes(id)) {
        return prev.filter((templateId: any) => templateId !== id); // Remove if exists
      } else {
        return [...prev, id];
      }
    });
  };

  const handleToggleStatus = async (value: boolean, project: any) => {
    try {
      setIsEditLoading(true);
      const response = await updateProject({
        data: { active: value },
        id: project?.id,
      });
      if (response) {
        setProjects(
          projects?.map((item: any) =>
            item?.id === project?.id ? { ...item, active: value } : item
          )
        );
        let message = `The "${response?.data?.project?.name}" has been successfully disabled.`;

        if (value) {
          message = `The "${response?.data?.project?.name}" has been successfully enabled.`;
        }
        toast.success(message);
        setIsEditLoading(false);
        await handleGetProjectsByWorkSpaceId(true);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsEditLoading(false);
    }
  };
  const handleTemplateSubmit = async () => {
    try {
      setIsEditLoading(true);
      const response = await updateProject({
        data: {
          template_id: selectedTemplate?.id ? selectedTemplate?.id : null,
        },
        old_template: templateProject?.templates?.id,
        id: templateProject?.id,
      });

      if (response) {
        setToggledTemplates([]);
        setSelectedTemplate(null);
        setIsEditLoading(false);
        if (selectedTemplate) {
          toast.success(
            `The Template "${selectedTemplate.template_name}" has been successfully attached!`
          );
        } else {
          toast.success(
            `The Template ${templateProject?.templates?.template_name} has been successfully detached!`
          );
        }
        setIsTemplateProject(null);
        handleGetProjectsByWorkSpaceId(true);
      }
    } catch (error: any) {
      setIsEditLoading(false);
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    }
  };

  const handleTemplateModalClose = () => {
    setSelectedTemplate(null);
    setIsTemplateProject(null);
    setToggledTemplates([]);
  };

  const handleDeleteProject = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
    setProjectId(project?.id);
  };

  const handleConfirmDelete = async () => {
    try {
      const result = await deleteProject(projectId);
      if (result) {
        toast.success(`Project deleted successfully. `);
        handleGetProjectsByWorkSpaceId();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setProjectId("");
    }
  };

  const clearWorkspaceFilter = () => {
    setSelectedWorkspace("all");
  };
  return (
    <div>
      <div className="relative top-[-40px] w-[100%] max-w-[85%] mx-auto flex gap-4 ">
        <div className="flex-1 bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] box-shadow py-4 rounded-lg px-8">
          <form className="flex divide-x dark:divide-[#CCCCCC33]">
            <div className="text-[13px] flex items-center flex-1">
              <input
                type="text"
                placeholder="Search for projects"
                className="outline-none w-full dark:bg-[#2C3A3F] bg-transparent"
                onChange={handleSearchChange}
                value={searchQuery}
              />
            </div>
            <div className="flex items-center gap-4 ps-6 justify-evenly">
              <button
                className="button-full w-[130px]"
                onClick={(e) => handleSearch(e)}
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <>
                    <span className="text-nowrap">Search</span>
                    {loading}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] box-shadow py-4 rounded-lg px-8">
          <button
            className="button-full w-[full] flex"
            onClick={() => {
              setIsDrawerOpen(true);
              setIsCreate(true);
            }}
          >
            <Plus size={18} />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {workspaces.length > 0 && filteredProjects.length > 0 && (
        <div className="relative max-w-[85%] mx-auto mb-6 flex justify-end items-center">
          <div className="flex items-center">
            <div className="relative flex items-center gap-2 bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] rounded-full px-3 py-1.5 shadow-sm">
              <Filter size={15} className="text-[#0E70FF]" />
              <Select
                value={selectedWorkspace}
                onValueChange={setSelectedWorkspace}
              >
                <SelectTrigger
                  className="border-0 min-w-[150px] h-6 text-[13px] font-medium bg-transparent shadow-none !ring-0 !ring-offset-0 !outline-none"
                  style={{
                    outline: "none",
                    boxShadow: "none",
                    border: "none",
                  }}
                >
                  <span className="truncate">
                    {selectedWorkspace === "all"
                      ? "All Workspaces"
                      : selectedWorkspace}
                  </span>
                </SelectTrigger>
                <SelectContent className="p-1 bg-white dark:bg-[#27343A] border border-[#CCCCCC] dark:border-[#CCCCCC33] rounded-md shadow-lg">
                  <SelectItem
                    value="all"
                    className="text-sm font-medium cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#374A52] rounded-md my-1"
                  >
                    All Workspaces
                  </SelectItem>
                  {workspaces.map((workspace: string) => (
                    <SelectItem
                      key={workspace}
                      value={workspace}
                      className="text-sm font-medium cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#374A52] rounded-md my-1"
                    >
                      {workspace}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedWorkspace !== "all" && (
                <button
                  onClick={clearWorkspaceFilter}
                  className="text-[#0E70FF] hover:text-[#0a5bc7]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {loading || !filteredProjects || filteredProjects?.length === 0 ? (
        loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="font-semibold text-lg text-center">
              {selectedWorkspace && selectedWorkspace !== "all"
                ? `No Projects Found in "${selectedWorkspace}" workspace`
                : "No Projects Found"}
            </p>
          </div>
        )
      ) : (
        <div className="flex max-w-[85%] mx-auto">
          <div className={`grid`}>
            <div
              className={`h-fit grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6`}
            >
              {filteredProjects?.map((item: any, index: number) => {
                return (
                  <div
                    key={index}
                    className={`border ${
                      currentProject?.project?.id === item?.id
                        ? "border-[#0E70FF] dark:border-white"
                        : "border-tableBorder "
                    } rounded-[24px] p-6  ${
                      currentProject?.project?.id === item?.id
                        ? "bg-projectCardBackground dark:bg-secondaryBackground"
                        : "bg-secondaryBackground "
                    }`}
                  >
                    {item?.workspaces?.name && (
                      <p className="text-darkGray font-size-medium font-normal mt-[-14px] pb-1 ">
                        {item?.workspaces?.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between pb-4">
                      <Button
                        className={`${
                          currentProject?.project?.id === item?.id &&
                          item?.active
                            ? "bg-[#F59B14]"
                            : "bg-[#999999] "
                        } h-[30px] rounded-[24px] font-size-md   w-fit`}
                        onClick={() =>
                          currentProject?.project?.id !== item?.id &&
                          item?.active
                            ? handleProjectChange(item?.id)
                            : null
                        }
                      >
                        {currentProject?.project?.id === item?.id &&
                        item?.active
                          ? "Selected"
                          : !item?.active
                          ? "Disabled"
                          : "Not Selected"}
                      </Button>
                      <div className="flex items-center gap-2">
                        <p className="font-size-small text-darkGray font-normal">
                          {timeSinceUpdated(item?.updated_at as string)}
                        </p>
                        {item?.is_default_project && (
                          <Lock size={16} color="#999999" />
                        )}
                        {item?.owner_user_id === user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
                                <MoreVertical size={18} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[200px] p-2 bg-inputBackground shadow-md"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer flex items-center justify-between py-2 relative"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <div className="flex items-center gap-2">
                                  <Label className="text-[12px] font-medium text-[#666666] dark:text-white">
                                    {item?.active ? "Active" : "Disabled"}
                                  </Label>
                                </div>
                                <Switch.Root
                                  className={`w-[42px] h-[25px] ${
                                    item?.active
                                      ? "bg-[#079E28]"
                                      : "bg-gray-200"
                                  } ${
                                    item?.is_default_project || isEditLoading
                                      ? "cursor-not-allowed"
                                      : "cursor-pointer"
                                  } rounded-full relative data-[state=checked]:bg-[#079E28] outline-none`}
                                  checked={item?.active}
                                  onCheckedChange={(value) => {
                                    handleToggleStatus(value, item);
                                  }}
                                  disabled={
                                    isEditLoading || item?.is_default_project
                                  }
                                >
                                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                                </Switch.Root>
                              </DropdownMenuItem>
                              {!item?.is_default_project && (
                                <DropdownMenuItem
                                  className=" cursor-pointer text-[12px] font-medium flex justify-between  items-center text-[#666666]  dark:text-white   "
                                  onClick={(e) => handleDeleteProject(e, item)}
                                >
                                  Delete
                                  <Trash
                                    size={18}
                                    className="mr-2"
                                    color="red"
                                  />
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-nowrap w-[100%] gap-1 items-center">
                      <div
                        className="relative group w-[100%]"
                        onDoubleClick={() => {
                          if (
                            item?.owner_user_id === user?.id ||
                            item?.lead_user_id === user?.id
                          ) {
                            handleEdit(item?.id, item?.name);
                          }
                        }}
                      >
                        {isEditId === item?.id ? (
                          <>
                            <div className="flex items-center gap-2 w-[100%]">
                              <div className="flex flex-col w-[100%]">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => handleEditInput(e)}
                                  className="bg-inputBackground border outline-none tableBorder text-foreground text-sm rounded-[16px] block w-[100%] p-2.5"
                                  autoFocus
                                  disabled={isEditLoading}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !error) {
                                      handleEditSave(item?.name);
                                    }
                                  }}
                                />
                              </div>
                              <div className="flex flex-nowrap">
                                {isEditLoading ? (
                                  <Loader variant="threeDot" size="lg" />
                                ) : (
                                  <>
                                    <button
                                      disabled={!!error}
                                      onClick={() => handleEditSave(item?.name)}
                                      className={`${
                                        error
                                          ? "text-gray-500 hover:bg-gray-100"
                                          : "text-green-500 hover:bg-green-100"
                                      }  rounded-full p-1`}
                                    >
                                      <FaCheck size={20} />
                                    </button>
                                    <button
                                      onClick={handleEditCancel}
                                      className="text-red-500 hover:bg-red-100 rounded-full p-1"
                                    >
                                      <RxCross2 size={20} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            {error && (
                              <p className="text-red-500 text-xs mt-1">
                                {error}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-start">
                              <span className="flex-grow cursor-pointer w-fit">
                                {item?.name}
                              </span>
                              {(item?.owner_user_id === user?.id ||
                                item?.lead_user_id === user?.id) && (
                                <button
                                  onClick={() =>
                                    handleEdit(item?.id, item?.name)
                                  }
                                  className="text-gray-500 hover:bg-gray-200 rounded-full p-1"
                                >
                                  <CiEdit size={20} color="#0E70FF" />
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {item?.type &&
                        item?.type !== "owner" &&
                        item?.owner_user_id !== user?.id && (
                          <p className="font-size-small text-darkGray font-normal whitespace-nowrap">
                            (Shared project)
                          </p>
                        )}
                    </div>
                    <p className="text-darkGray font-size-medium font-normal pt-1 ">
                      {item?.description}
                    </p>
                    <div className="flex justify-between items-center  pt-3">
                      <div className="flex gap-2 justify-between w-full">
                        <div className="flex gap-2 flex-wrap">
                        {currentProject?.project?.id !== item?.id &&
                        item?.papers?.length > 0 ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button className="text-[#1679AB] hover:text-[#1679AB] font-size-md bg-[#a2d9f5] hover:bg-[#a2d9f5] rounded-[24px] h-[30px]">
                                  {item?.total_papers} Papers
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="border border-tableBorder text-left w-full max-w-[300px] max-h-[205px] overflow-y-auto font-size-small z-10 rounded-sm bg-headerBackground pl-1 pr-2 py-2 text-darkGray duration-200">
                                <div className="flex flex-col">
                                  {item?.papers?.map(
                                    (paper: any, index: number) => (
                                      <span
                                        className="break-words whitespace-normal flex place-items-start"
                                        key={index}
                                      >
                                        <Dot className="w-[18px] h-[18px] text-primary flex-shrink-0" />
                                        <span className="break-words">
                                          {paper?.file_name}
                                        </span>
                                      </span>
                                    )
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Button
                            onClick={() => router.push(`/explorer`)}
                            className="text-[#1679AB] hover:text-[#1679AB] font-size-md bg-[#a2d9f5] hover:bg-[#a2d9f5] rounded-[24px] h-[30px]"
                          >
                            {item?.total_papers} Papers
                          </Button>
                        )}
                        <Button className="text-[#0E70FF] hover:text-[#0E70FF] font-size-md  border border-tableBorder bg-[#bfc5ca] hover:bg-[#bfc5ca]  rounded-[24px] h-[30px]">
                          {item?.notes_bookmarks?.count} Notes
                        </Button>
                        </div>
                        {(item?.owner_user_id === user?.id ||
                          item?.lead_user_id === user?.id) && (
                          <div
                            className="flex flex-nowrap items-center gap-1 text-[#1f4b8e] hover:text-[#1f4b8e] cursor-pointer font-size-md  border border-tableBorder bg-[#83aeef] hover:bg-[#83aeef] rounded-[24px] h-[30px] px-4 py-1"
                            onClick={() => handleTempaltesDialog(item)}
                          >
                            <p className="font-size-md">Template</p>
                            <IoDocumentAttach color="#1f4b8e" size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                    {!item?.is_default_project && (
                      <div className="flex justify-between items-center py-3">
                        <div className=" flex flex-col items-center gap-2">
                          <p className="text-darkGray font-size-medium font-normal">
                            Project Lead
                          </p>
                          <div className="relative">
                            <OptimizedImage
                              className={`w-[36px] h-[36px] border-2 border-[#fff]  rounded-full object-cover `}
                              src={
                                item?.lead?.profile_image ||
                                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//dummyImg.png`
                              }
                              alt={""}
                              width={36}
                              height={36}
                            />

                            {(item?.owner_user_id === user?.id ||
                              item?.lead_user_id === user?.id) && (
                              <div
                                className="absolute bottom-[-4px] right-[-4px] bg-[#83aeef] rounded-full border-2 border-tableBorder p-[2px] cursor-pointer"
                                onClick={(e) => handleMembers(e, item)}
                              >
                                <TbSwitch2 size={16} color="#333" />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className=" flex flex-col items-center gap-2">
                          <p className="text-darkGray text-center font-size-medium font-normal">
                            Teams &<br />
                            Collaborators
                          </p>
                          <div className="flex -space-x-4">
                            {item?.teams?.map((member: any, index: number) => {
                              return (
                                <div className=" " key={member?.teams?.id}>
                                  {member?.teams?.name ? (
                                    <span className="w-[36px] h-[36px] border-2 border-[#fff] rounded-full object-cover bg-[#F59B14] flex justify-center text-center items-center">
                                      {member?.teams?.name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  ) : (
                                    <OptimizedImage
                                      src={member?.users?.profile_image ||  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//dummyImg.png`}
                                      alt="team"
                                      width={36}
                                      height={36}
                                      className="rounded-full"
                                    />
                                  )}
                                </div>
                              );
                            })}
                            {(item?.lead_user_id === user?.id ||
                              item?.owner_user_id === user?.id) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProject(item);
                                  setIsDrawerOpen(true);
                                }}
                                className="w-[36px] h-[36px] z-10 flex items-center text-2xl justify-center border border-[#D5D5D5]  bg-white  text-[#007EEF] rounded-full"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div
                      className={`${item?.is_default_project ? "pt-3" : ""}`}
                    >
                      <h2 className="font-size-large font-medium text-darkGray ">
                        Project Activities
                      </h2>
                      {item?.recent_activities &&
                      item?.recent_activities?.length > 0 ? (
                        item?.recent_activities?.map(
                          (data: any, index: number) => {
                            console.log("dataaaaa",data)
                            return (
                              index < 2 && (
                                <div
                                  key={index}
                                  className={`rounded-[22px] py-4 px-6 my-2 flex justify-between items-center ${
                                    currentProject?.project?.id === item?.id
                                      ? "bg-[#FFFFFF] dark:bg-[#27343A]"
                                      : "bg-[#D8E8FF] dark:bg-[#27343A]"
                                  } ${
                                    (data.type === "Paper Uploaded" ||
                                      data.type === "Uploaded" ||
                                      data.type === "Paper Added Via Search" ||
                                      data?.type ===
                                        "Paper Uploaded Via Search" ||
                                      data.type === "User Upload") &&
                                    data?.file_id
                                      ? "cursor-pointer"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    (data.type === "Uploaded" ||
                                      data.type === "Paper Uploaded" ||
                                      data.type === "Paper Added Via Search" ||
                                      data?.type ===
                                        "Paper Uploaded Via Search" ||
                                      data.type === "User Upload") &&
                                    data?.file_id
                                      ? router.push(`/info/${data?.file_id}`)
                                      : null
                                  }
                                >
                                  <div className="flex gap-3 items-center">
                                    <div>
                                      <div className="border w-[32px] h-[32px] bg-secondaryBackground border-tableBorder rounded-full  flex items-center justify-center">
                                        {data.type ===
                                          "Paper Added Via Search" ||
                                        data?.type ===
                                          "Paper Uploaded Via Search" ? (
                                          <OptimizedImage
                                            src={
                                              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//blueSearch.svg`
                                            }
                                            alt="filter"
                                            height={20}
                                            width={20}
                                            className="cursor-pointer !max-w-[20px] "

                                            // onClick={() => setIsFilterOpen(!isFilterOpen)}
                                          />
                                        ) : data.type === "Paper Uploaded" ||
                                          data.type === "User Upload" ? (
                                          <File
                                            width={"18px"}
                                            height={"18px"}
                                            color="#1776ff"
                                          />
                                        ) : data.type === "Uploaded" ? (
                                          <OptimizedImage
                                            src={
                                              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//blueSearch.svg`
                                            }
                                            alt="filter"
                                            height={20}
                                            width={20}
                                            className="cursor-pointer !max-w-[20px] "
                                          />
                                        ) : (
                                          <OptimizedImage
                                            src={
                                              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//edit.svg`
                                            }
                                            alt="filter"
                                            height={20}
                                            width={20}
                                            className="cursor-pointer !max-w-[20px] "
                                          />
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <p
                                              className={`text-[13px] font-medium text-darkGray ${
                                                data.type === "Uploaded" ||
                                                data.type ===
                                                  "Paper Uploaded" ||
                                                data.type ===
                                                  "Paper Added Via Search" ||
                                                data?.type ===
                                                  "Paper Uploaded Via Search" ||
                                                data.type === "User Upload" || data.type === "Note Saved" 
                                                ||data.type === "Deleted"
                                                  ? `max-w-[200px] truncate ${
                                                      !data?.file_id  && data.type !== "Note Saved"
                                                        ? "line-through"
                                                        : ""
                                                    }`
                                                  : ""
                                              }`}
                                            >
                                              {data?.activity?.replace(/[^a-zA-Z0-9 \(\)\[\]\{\}\<\>\: ]/g, ' ')}
                                            </p>
                                          </TooltipTrigger>
                                          {(data.type === "Uploaded" ||
                                            data.type === "Paper Uploaded" ||
                                            data.type ===
                                              "Paper Added Via Search" ||
                                            data?.type ===
                                              "Paper Uploaded Via Search" ||
                                            data.type === "User Upload" || data.type === "Note Saved" || data.type === "Deleted") && (
                                            <TooltipContent className="border notification-break border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                                              <p
                                                className={`font-size-normal font-normal break-words ${
                                                  !data?.file_id  && data.type !== "Note Saved"
                                                    ? "line-through"
                                                    : ""
                                                }`}
                                              >
                                                {data?.activity?.replace(/[^a-zA-Z0-9 \(\)\[\]\{\}\<\>\: ]/g, ' ')}
                                              </p>
                                            </TooltipContent>
                                          )}
                                        </Tooltip>
                                      </TooltipProvider>
                                      <p className="font-size-small font-medium text-darkGray">
                                        {data?.type === "Deleted"
                                          ? "Deleted"
                                          : data?.type !== "Updated" ||
                                            data?.type !== "Status Updated"
                                          ? "Uploaded "
                                          : data?.type}{" "}
                                        by
                                        <span className="text-[#0E70FF]">
                                          {` ${data?.users?.first_name || ""} ${
                                            data?.users?.last_name || ""
                                          }`}
                                        </span>
                                      </p>
                                      <p className="font-size-small  text-darkGray font-normal">
                                        {" "}
                                        {timeSinceUpdated(data?.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            );
                          }
                        )
                      ) : (
                        <p className="font-size-small text-darkGray font-normal text-center py-3">
                          No project activities have been recorded yet.
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between pt-3">
                      <div>
                        {item?.templates?.template_name && (
                          <button
                            className="text-[#0E70FF] border-b text-sm font-medium border-[#0E70FF] "
                            onClick={() => {
                              setMoreInfo((prev: any) => {
                                if (prev.includes(item?.id)) {
                                  return prev.filter(
                                    (projectId: any) => projectId !== item?.id
                                  );
                                } else {
                                  return [...prev, item?.id];
                                }
                              });
                            }}
                          >
                            {moreInfo?.includes(item?.id)
                              ? "Show less"
                              : "Show more"}
                          </button>
                        )}
                      </div>
                      {item?.recent_activities?.length > 0 && (
                        <Link
                          href={"#"}
                          className="text-[#0E70FF] border-b text-sm font-medium border-[#0E70FF] "
                          onClick={() =>
                            handleViewAllRecentActivity(item?.recent_activities)
                          }
                        >
                          View Recent Activities
                        </Link>
                      )}
                    </div>
                    {moreInfo?.includes(item?.id) && (
                      <div className="flex justify-between gap-3 items-center w-[100%] py-3 transition-all duration-500 ease-in-out">
                        <p className="text-darkGray font-size-medium font-normal">
                          Template
                        </p>
                        <span
                          className={` cursor-pointer text-black font-size-md  py-1.5 px-4 font-medium   ${"bg-[#D6CFB4]"} rounded-[24px]`}
                        >
                          {item?.templates?.template_name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {isDrawerOpen && (
        <ManageProjectDrawer
          projectData={project}
          handleDrawerClose={handleDrawerClose}
          isFetch={handleGetProjectsByWorkSpaceId}
          isCreate={isCreate}
          setIsCreate={setIsCreate}
        />
      )}
      <Dialog open={isLeadSwitchOpen}>
        <DialogOverlay className="fixed inset-0 z-40 bg-black bg-opacity-50" />
        <DialogContent className="fixed p-5  bg-secondaryBackground z-50   rounded-md shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px]">
          <Card className="p-3 bg-secondaryBackground  ">
            <DialogTitle className="text-[18px] font-semibold">
              Select new Lead
            </DialogTitle>
            <DialogDescription className="mt-4 text-gray-600 italic text-[0.9rem] ">
              <Select
                onValueChange={(value: any) => {
                  const selectedUser = [
                    ...Array.from(
                      new Map(
                        [
                          ...teamMembers,
                          {
                            id: user?.id,
                            first_name: user?.first_name,
                            last_name: user?.last_name,
                          },
                        ].map((item) => [item.id, item])
                      ).values()
                    ),
                  ]?.find((user: any) => user?.id === value);
                  setUpdatedLead(selectedUser);
                }}
                value={updatedLead?.id || updatedProject?.lead?.id}
              >
                <SelectTrigger className="text-[13px] font-normal outline- bg-inputBackground border outline-none border-tableBorder text-foreground cursor-pointer py-[.6rem] px-3 rounded flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <h1 className="text-[13px] text-muted-foreground  font-normal mb-1 capitalize">
                      {updatedLead?.id
                        ? `${updatedLead?.first_name} ${updatedLead?.last_name}`
                        : updatedProject?.lead?.id
                        ? `${updatedProject?.lead?.first_name} ${updatedProject?.lead?.last_name}`
                        : "Please select a role"}
                    </h1>
                  </div>
                </SelectTrigger>
                <SelectContent className="p-2 bg-inputBackground text-muted-foreground  border border-tableBorder rounded-md w-full shadow-lg">
                  {[
                    ...Array.from(
                      new Map(
                        [
                          ...teamMembers,
                          {
                            id: user?.id,
                            first_name: user?.first_name,
                            last_name: user?.last_name,
                          },
                        ].map((item) => [item.id, item])
                      ).values()
                    ),
                  ].map((user: any) => (
                    <SelectItem
                      value={user?.id}
                      key={`${user?.first_name} ${user?.last_name}`}
                    >{`${user?.first_name} ${user?.last_name}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DialogDescription>

            <div className="mt-6 flex justify-between gap-2">
              <Button
                onClick={(e) => handleCancel(e)}
                variant="secondary"
                className="rounded-full h-[32px] text-[13px] font-medium"
              >
                Cancel
              </Button>
              <Button
                className="button-full"
                variant="default"
                disabled={
                  isSwitchLoading ||
                  updatedProject?.lead?.id === updatedLead?.id ||
                  !updatedLead ||
                  updatedLead === null
                }
                onClick={(e) => {
                  handleTeamLeadSwitch(e);
                }}
              >
                Switch
              </Button>
            </div>
          </Card>
        </DialogContent>
      </Dialog>

      <Dialog open={resentActivityOpen} onOpenChange={setResentActivityOpen}>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="fixed p-5  z-40 bg-secondaryBackground   rounded-md shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px]">
          <DialogTitle className="text-[18px] font-semibold">
            RECENT ACTIVITY
          </DialogTitle>
          <DialogDescription className="mt-4 text-gray-600 italic text-[0.9rem] ">
            <div className="overflow-y-auto h-[430px] p-6">
              {allActivity.map((item: any, index: number) => {
                return (
                  <div key={index}>
                    <div
                      className={`flex justify-between items-start ${
                        (item.type === "Paper Uploaded" ||
                          item.type === "Uploaded" ||
                          item.type === "Paper Added Via Search" ||
                          item?.type === "Paper Uploaded Via Search" ||
                          item.type === "User Upload" || item.type === "Note Saved") &&
                        item?.file_id
                          ? "cursor-pointer"
                          : ""
                      }`}
                      onClick={() =>
                        (item.type === "Paper Uploaded" ||
                          item.type === "Uploaded" ||
                          item.type === "Paper Added Via Search" ||
                          item?.type === "Paper Uploaded Via Search" ||
                          item.type === "User Upload" || item.type === "Note Saved") &&
                        item?.file_id
                          ? router.push(`/info/${item?.file_id}`)
                          : null
                      }
                    >
                      <div className="flex gap-3">
                        <div className="border w-[32px] h-[32px] bg-secondaryBackground border-tableBorder rounded-full flex items-center justify-center p-1">
                          {item.type === "Paper Added Via Search" ||
                          item?.type === "Paper Uploaded Via Search" ? (
                            <OptimizedImage
                              src={
                                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//blueSearch.svg`
                              }
                              alt="filter"
                              height={20}
                              width={20}
                              className="cursor-pointer !max-w-[20px] "
                            />
                          ) : item.type === "Paper Uploaded" ||
                            item.type === "User Upload" ? (
                            <File
                              width={"20px"}
                              height={"20px"}
                              color="#1776ff"
                            />
                          ) : item.type === "Uploaded" ? (
                            <OptimizedImage
                              src={
                                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//blueSearch.svg`
                              }
                              alt="filter"
                              height={20}
                              width={20}
                              className="cursor-pointer !max-w-[20px] "
                            />
                          ) : (
                            <OptimizedImage
                              src={
                                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//edit.svg`
                              }
                              alt="filter"
                              height={20}
                              width={20}
                              className="cursor-pointer !max-w-[20px] "
                            />
                          )}
                        </div>

                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p
                                  className={`font-size-normal font-normal ${
                                    item.type === "Uploaded" ||
                                    item.type === "Paper Uploaded" ||
                                    item.type === "Paper Added Via Search" ||
                                    item?.type ===
                                      "Paper Uploaded Via Search" ||
                                    item.type === "User Upload" || item.type === "Note Saved" || item.type === "Deleted"
                                      ? `max-w-[300px] truncate ${
                                          !item?.file_id  && item.type !== "Note Saved"  && item.type !== "Note Saved" ? "line-through" : ""
                                        }`
                                      : ""
                                  }`}
                                >
                                  {item?.activity?.replace(/[^a-zA-Z0-9 \(\)\[\]\{\}\<\>\: ]/g, ' ')}
                                </p>
                              </TooltipTrigger>
                              {(item.type === "Uploaded" ||
                                item.type === "Paper Uploaded" ||
                                item.type === "Paper Added Via Search" ||
                                item?.type === "Paper Uploaded Via Search" ||
                                item.type === "User Upload" || item.type === "Note Saved" || item.type === "Deleted") && (
                                <TooltipContent className="border notification-break border-tableBorder text-left max-h-[150px] overflow-y-auto w-full max-w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                                  <p
                                    className={`font-size-normal font-normal break-words ${
                                      !item?.file_id ? "line-through" : ""
                                    }`}
                                  >
                                    {item?.activity?.replace(/[^a-zA-Z0-9 \(\)\[\]\{\}\<\>\: ]/g, ' ')}
                                  </p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                          <div className="flex gap-1 pt-2 items-center">
                            <p className="font-size-small font-normal text-darkGray ">
                              {item.type === "note"
                                ? "Added"
                                : item.type === "file"
                                ? "Added"
                                : item?.type === "Deleted"
                                ? "Deleted"
                                : item?.type !== "Updated" &&
                                  item?.type !== "Status Updated"
                                ? "Uploaded "
                                : item?.type}{" "}
                              by{" "}
                              <span className="text-[#0E70FF]">
                                {" "}
                                {` ${item.users?.first_name || ""} ${
                                  item.users?.last_name || ""
                                }`}
                              </span>{" "}
                            </p>
                            <OptimizedImage
                              className={`w-[24px] h-[24px] border-2 border-[#0E70FF]  rounded-full object-cover `}
                              src={
                                item?.users?.profile_image ||
                                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//dummyImg.png`
                              }
                              alt={"profile"}
                              width={ImageSizes.icon.md.width}
                              height={ImageSizes.icon.md.height}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="font-size-small font-normal text-darkGray">
                        {timeSinceUpdated(item?.created_at)}
                      </p>
                    </div>
                    {index !== allActivity.length - 1 && (
                      <hr className="border border-tableBorder my-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </DialogDescription>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              onClick={() => {
                setResentActivityOpen(false);
                setAllActivity([]);
              }}
              variant="secondary"
              className="rounded-full h-[32px] text-[13px] font-medium"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TemplateDialog
        open={!!templateProject}
        onOpenChange={handleTemplateModalClose}
      >
        <TemplateDialogContent>
          <TemplateDialogHeader>
            <DialogTitle>
              <h1 className="text-xl font-medium text-[#333333] dark:text-[#CCCCCC]">
                Templates
              </h1>
            </DialogTitle>
          </TemplateDialogHeader>
          <div className="mt-2 max-h-[500px] overflow-y-auto">
            {templates && templates?.length > 0 ? (
              templates?.map((item: any, index: number) => (
                <div className="max-w-xl mx-auto mb-2" key={index}>
                  <div className="bg-secondaryBackground rounded-lg shadow-md overflow-hidden">
                    <div className="p-3 bg-greyTh hover:bg-greyTh  flex justify-between items-center">
                      <div className="flex items-center">
                        <Checkbox
                          checked={selectedTemplate?.id === item?.id}
                          disabled={isEditLoading}
                          onCheckedChange={(checked: any) => {
                            if (checked) {
                              setSelectedTemplate(item);
                            } else {
                              setSelectedTemplate(null);
                            }
                          }}
                          className="mr-2"
                        />

                        <span className="flex-grow cursor-pointer w-fit">
                          {item?.template_name}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleTemplates(item?.id)}
                        className="text-[#333333] dark:text-[#CCCCCC]"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    {toggledTemplates?.includes(item?.id) && (
                      <div className="p-6">
                        <div>
                          <div className="flex flex-wrap gap-2" id="keywords">
                            {item?.template_json_data &&
                            item?.template_json_data?.length > 0 ? (
                              item?.template_json_data?.map(
                                (item: any, index: number) => (
                                  <span
                                    className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
                                    key={index}
                                  >
                                    {item?.promptKey}
                                  </span>
                                )
                              )
                            ) : (
                              <span className=" text-xs px-2 py-1" key={index}>
                                No Prompt key Exists
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-[#333333] dark:text-[#CCCCCC] text-sm font-medium ">
                  No project templates are currently available
                </p>
              </div>
            )}
          </div>
          {templateProject?.templates?.id && !selectedTemplate && (
            <span className="flex-grow cursor-pointer w-fit text-center text-[#FFC107]">
              Removing this template will delete all associated data. Do you
              want to proceed?
            </span>
          )}
          <TemplateDialogFooter>
            <Button
              className="rounded-[26px] text-[#0E70FF] border-[#0E70FF]"
              variant={"secondary"}
              onClick={() => handleTemplateModalClose()}
            >
              Cancel
            </Button>
            <Button
              className=" rounded-[26px] btn text-white"
              disabled={
                isEditLoading ||
                (!selectedTemplate && !templateProject?.templates?.id)
              }
              onClick={() => handleTemplateSubmit()}
            >
              {isEditLoading ? (
                <Loader variant="threeDot" size="lg" />
              ) : (
                "Submit"
              )}
            </Button>
          </TemplateDialogFooter>
        </TemplateDialogContent>
      </TemplateDialog>

      <TemplateDialog
        open={isDeleteDialogOpen}
        onOpenChange={() => {
          setIsDeleteDialogOpen(false);
          setProjectToDelete(null);
        }}
      >
        <TemplateDialogContent className="bg-tagBoxBg">
          <TemplateDialogHeader>
            <TemplateDialogTitle>
              <h1 className="text-xl font-medium text-[#333333] dark:text-[#CCCCCC]">
                Delete Project
              </h1>
            </TemplateDialogTitle>
          </TemplateDialogHeader>

          <div className="mt-4">
            <p className="text-sm font-medium">
              Are you sure you want to delete this Project?
            </p>
            <p className=" py-3 text-sm font-medium">
              Papers associated with this project will also be deleted.
            </p>
            <p className=" text-[#ffcc02] text-sm font-medium">
              This action cannot be undone.
            </p>
            <div className="mt-3">
              <Input
                id="new"
                type="text"
                className="outline-none"
                placeholder=""
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
              />
              <p className="text-xs mt-3">
                To confirm deletion, please type DELETE
              </p>
            </div>
          </div>

          <TemplateDialogFooter>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(false);
                  setProjectToDelete(null);
                  setDeleteText("");
                }}
                className="rounded-[26px]"
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                className="rounded-[26px] btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmDelete();
                  setDeleteText("");
                }}
                disabled={deleteText?.toLowerCase() !== "delete" || loading}
              >
                {loading ? <Loader variant="threeDot" size="lg" /> : "Delete"}
              </Button>
            </div>
          </TemplateDialogFooter>
        </TemplateDialogContent>
      </TemplateDialog>
    </div>
  );
};

export default ManageProjectInfo;
