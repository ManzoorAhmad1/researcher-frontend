/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import "./main-sidebar.css";
import Image from "next/image";
import WorksSpaceDropdown from "./WorksSpaceDropdown";
import {
  Collaboration,
  DashBord,
  IdeaBank,
  MyProjects,
  SearchPapers,
  TopicExplorer,
  ManageProject,
  CollectiveMind,
} from "./icons/icons";
import Dropdown from "./Dropdown";
import {
  projectDropdownItems,
  topicExplorerDropdownItems,
} from "../Sidebar/const";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import {
  addAllWorkspaces,
  addCurrentWorkSpace,
  currentWorkSpaceLoading,
} from "@/reducer/services/workspaceSlice";
import {
  addCurrentProject,
  currentProjectLoading,
} from "@/reducer/services/projectSlice";
import { getWorkspacesByUser } from "@/apis/workspaces";
import toast from "react-hot-toast";
import { useRouter } from "next-nprogress-bar";
import { getFilesByProject } from "@/apis/files";
import {
  getProjectById,
  getProjectByUser,
  getProjectByWorkspace,
} from "@/apis/projects";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import localStorageService from "@/utils/localStorage";
import sessionStorageService from "@/utils/sessionStorage";
import { logout, updateUserPlan } from "@/reducer/auth/authSlice";
import { FaProjectDiagram } from "react-icons/fa";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { RiMenu2Fill, RiMenuLine } from "react-icons/ri";
import TopicExplorerDialog from "./TopicExplorerDialog";
import { findById, updateTopicExplorerDialog, updateUser } from "@/apis/user";
import withAuth from "@/utils/privateRoute";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import { TbWorldSearch } from "react-icons/tb";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { setBetaModeConfirm } from "@/reducer/feature/featureSlice";
interface Workspace {
  id: number;
  name: string;
  initials: string;
}
interface SidebarProps {
  expand: boolean;
  onLinkClick: () => void;
  setExpand: any;
  setIsProjectSelected: any;
  isProjectRoute: (pathname: string) => boolean;
  setProjectSubMenu: any;
  projectSubMenu: any;
  isTopicExplorerDialog: boolean;
  setIsTopicExplorerDialog: (item: boolean) => void;
  setOpenSideMenu: any;
  openSideMenu: any;
  isSubscriptionExpired: boolean;
}

const MainSidebar: React.FC<SidebarProps> = ({
  expand,
  onLinkClick,
  setExpand,
  setIsTopicExplorerDialog,
  isProjectRoute,
  setProjectSubMenu,
  projectSubMenu,
  isTopicExplorerDialog,
  setOpenSideMenu,
  openSideMenu,
  isSubscriptionExpired,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { socket } = useSocket();
  const currentProject = useSelector((state: any) => state?.project);
  const currentWorkspaces = useSelector((state: any) => state?.workspace);

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );
  const [totalPapersInProject, setTotalPapersInProject] = useState(0);
  const [projectExplorer, setProjectExplorer] = useState(false);
  const [topicExplorer, setTopicExplorer] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(setBetaModeConfirm(user?.user?.user?.hasAiResearchAssistantBeta));

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      window.innerWidth <= 768 && setExpand(true);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const accountType = useSelector(
    (state: any) => state.user?.user?.user?.account_type
  );
  const workspace: any = useSelector((state: any) => state?.workspace);
  const userPlan = useSelector(
    (state: any) => state.user?.user?.user?.subscription_plan
  );
  const state: any = useSelector(
    (state: { rolesGoalsData: { currentPage: number } }) =>
      state?.rolesGoalsData
  );
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const [upgradeShow, setUpgradeShow] = useState<boolean>(false);
  const [topicExplorerDialog, setTopicExplorerDialog] = useState(false);
  let isCollaboratorMessageShown = false;
  const { confirmBetaMode } = useSelector((state: RootState) => state.feature);
  const hasRunRef = useRef(false);
  useEffect(() => {
    const userToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (accountType === "owner" && userPlan === "free") {
      setUpgradeShow(true);
    }
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    userToken && handleGetWorkSpacesByUser();
  }, [accountType]);

  useEffect(() => {
    if (currentWorkspaces?.workspace?.id) {
      handleGetProjectsByWorkSpaceId();
    }
  }, [currentWorkspaces?.workspace?.id]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    if (socket) {
      const currentProjectId: any = localStorage.getItem("currentProject");
      socket.on("collaboratorUpdated", async (collaboratorUpdated: any) => {
        const userToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (accountType === "owner" && userPlan === "free") {
          setUpgradeShow(true);
        }

        if (userToken) {
          await handleGetWorkSpacesByUser();
          const currentWorkspaceId = localStorage.getItem("currentWorkspace");
          if (currentWorkspaceId) {
            await handleGetProjectsByWorkSpaceId(currentWorkspaceId);
          }
        }
      });

      socket.on("projectDeleted", async (projectDeleted: any) => {
        const isDeletedProjectExists = currentWorkspaces?.allWorkspaces?.find(
          (workspace: any) =>
            workspace?.projects?.find(
              (project: any) => project.id === projectDeleted?.projectId
            )
        );
        if (
          isDeletedProjectExists ||
          currentProject?.project?.id === projectDeleted?.projectId
        ) {
          const userToken =
            localStorage.getItem("token") || sessionStorage.getItem("token");
          if (accountType === "owner" && userPlan === "free") {
            setUpgradeShow(true);
          }

          if (userToken) {
            await handleGetWorkSpacesByUser();
            const currentWorkspaceId = localStorage.getItem("currentWorkspace");
            if (currentWorkspaceId) {
              await handleGetProjectsByWorkSpaceId(currentWorkspaceId);
            }
          }
        }
      });

      socket.on("projectCreated", async (projectCreated: any) => {
        const userToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (accountType === "owner" && userPlan === "free") {
          setUpgradeShow(true);
        }

        if (userToken) {
          await handleGetWorkSpacesByUser();
          const currentWorkspaceId = localStorage.getItem("currentWorkspace");
          if (currentWorkspaceId) {
            await handleGetProjectsByWorkSpaceId(currentWorkspaceId);
          }
        }
      });
      socket.on("fileDeleted", () => {
        getTotalFilesInProject(currentProjectId);
      });

      socket.on("projectUpdated", async (projectUpdated: any) => {
        const isUpdatedProjectExists = currentWorkspaces?.allWorkspaces?.find(
          (workspace: any) =>
            workspace?.projects?.find(
              (project: any) => project.id === projectUpdated?.projectId
            )
        );

        if (
          isUpdatedProjectExists ||
          currentProject?.project?.id === projectUpdated?.projectId
        ) {
          const userToken =
            localStorage.getItem("token") || sessionStorage.getItem("token");
          if (accountType === "owner" && userPlan === "free") {
            setUpgradeShow(true);
          }

          if (userToken) {
            await handleGetWorkSpacesByUser();
            const currentWorkspaceId = localStorage.getItem("currentWorkspace");
            if (currentWorkspaceId) {
              await handleGetProjectsByWorkSpaceId(currentWorkspaceId);
            }
          }
        }
      });

      socket.on("orgDeleted", async (orgDeleted: any) => {
        const isCurrentUserDeleted = orgDeleted?.orgUsers?.some(
          (userId: number) => userId === user?.user?.user?.id
        );
        const isCurrentUserOwner = orgDeleted?.owner === user?.user?.user?.id;
        if (isCurrentUserDeleted) {
          localStorageService.clear();
          sessionStorageService.clear();
          sessionStorage.clear();
          dispatch(logout());
          router.push("/login");
        }

        if (isCurrentUserOwner) {
          const userToken =
            localStorage.getItem("token") || sessionStorage.getItem("token");
          if (accountType === "owner" && userPlan === "free") {
            setUpgradeShow(true);
          }

          if (userToken) {
            await handleGetWorkSpacesByUser();
            const currentWorkspaceId = localStorage.getItem("currentWorkspace");
            if (currentWorkspaceId) {
              await handleGetProjectsByWorkSpaceId(currentWorkspaceId);
            }
          }
        }
      });

      socket.on("workspaceCreated", async (workspaceCreated: any) => {
        const isCurrentUserWorkspace =
          workspaceCreated?.user === user?.user?.user?.id;

        if (isCurrentUserWorkspace) {
          const userToken =
            localStorage.getItem("token") || sessionStorage.getItem("token");
          if (accountType === "owner" && userPlan === "free") {
            setUpgradeShow(true);
          }

          if (userToken) {
            await handleGetWorkSpacesByUser();
            const currentWorkspaceId = localStorage.getItem("currentWorkspace");
            if (currentWorkspaceId) {
              await handleGetProjectsByWorkSpaceId(currentWorkspaceId);
            }
          }
        }
      });

      socket.on("workspaceUpdated", async (workspaceUpdated: any) => {
        const isUpdatedWorkspaceExists = currentWorkspaces?.allWorkspaces?.find(
          (workspace: any) =>
            workspace?.workspaces?.id === workspaceUpdated?.workspaceId
        );

        if (isUpdatedWorkspaceExists) {
          const userToken =
            localStorage.getItem("token") || sessionStorage.getItem("token");
          if (accountType === "owner" && userPlan === "free") {
            setUpgradeShow(true);
          }

          if (userToken) {
            await handleGetWorkSpacesByUser();
            const currentWorkspaceId = localStorage.getItem("currentWorkspace");
            if (currentWorkspaceId) {
              await handleGetProjectsByWorkSpaceId(currentWorkspaceId);
            }
          }
        }
      });

      socket.on("currentProjectUpdate", async (currentProjectUpdate: any) => {
        if (currentProjectUpdate?.userId === user?.user?.user?.id) {
          const userToken =
            localStorage.getItem("token") || sessionStorage.getItem("token");
          if (accountType === "owner" && userPlan === "free") {
            setUpgradeShow(true);
          }

          if (userToken) {
            await handleGetWorkSpacesByUser();
            const currentWorkspaceId = localStorage.getItem("currentWorkspace");
            if (currentWorkspaceId) {
              await handleGetProjectsByWorkSpaceId(currentWorkspaceId);
            }
          }
        }
      });

      return () => {
        socket.off("collaboratorUpdated");
        socket.off("projectDeleted");
        socket.off("fileDeleted");
        socket.off("orgDeleted");
        socket.off("workspaceCreated");
        socket.off("projectUpdated");
        socket.off("currentProjectUpdate");
      };
    }
  }, [
    socket,
    currentProject?.project?.id,
    currentWorkspaces?.workspace?.id,
    user,
  ]);

  const handleGetProjectsByWorkSpaceId = useCallback(
    async (workspaceId?: string | null, restrictRefresh?: boolean) => {
      try {
        const targetWorkspaceId =
          workspaceId || currentWorkspaces?.workspace?.id;
        if (!restrictRefresh) {
          setLoading(true);
        }
        if (targetWorkspaceId && targetWorkspaceId !== null) {
          let response: any = await getProjectByWorkspace({
            workspaceId: targetWorkspaceId,
          });

          if (response?.success === false) {
            toast.error(response?.message);
          }

          const currentProjectId = currentProject?.project?.id;
          const sortedProjects = [...response?.data?.projects].sort(
            (a: any, b: any) => {
              if (a.id === currentProjectId) return -1;
              if (b.id === currentProjectId) return 1;
              return 0;
            }
          );

          setProjects(sortedProjects);
        }
      } catch (error: any) {
        setLoading(false);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "An error occurred."
        );
      } finally {
        setLoading(false);
      }
    },
    [currentWorkspaces?.workspace?.id, currentProject?.project?.id]
  );

  const handleGetWorkSpacesByUser = useCallback(
    async (restrictRefresh?: boolean) => {
      try {
        if (user?.user?.user?.id && user?.user?.user?.id !== null) {
          if (!restrictRefresh) {
            setIsLoading(true);
          }
          dispatch(currentWorkSpaceLoading());
          dispatch(currentProjectLoading());
          let response = await getWorkspacesByUser({});

          if (response?.data?.isSuccess) {
            const workspacesWithProjects =
              response?.data?.data?.workspaces?.filter(
                (workspace: any) =>
                  workspace?.projects && workspace?.projects?.length > 0
              );
            dispatch(addAllWorkspaces(response?.data?.data?.workspaces));

            let projectToSet = null;
            let workspaceToSet = null;

            // First check if current_project_id exists in user state
            // const userCurrentProjectId = user?.user?.user?.current_project_id;
            const UserInfo = await findById(user?.user?.user?.id);
            const userCurrentProjectId =
              UserInfo?.data?.data?.current_project_id;

            if (userCurrentProjectId && userCurrentProjectId !== null) {
              const workspaceWithCurrentProject = workspacesWithProjects?.find(
                (workspace: any) =>
                  workspace?.projects?.some(
                    (project: any) =>
                      project?.id === userCurrentProjectId && project?.active
                  )
              );
              if (workspaceWithCurrentProject) {
                workspaceToSet = workspaceWithCurrentProject;
                projectToSet = workspaceWithCurrentProject.projects.find(
                  (project: any) => project.id === userCurrentProjectId
                );
              } else {
                const projects: any = await getProjectByUser({
                  orderBy: "created_at",
                });
                const isProjectExists = projects?.data?.projects?.find(
                  (project: any) =>
                    project?.id === userCurrentProjectId && project?.active
                );
                if (isProjectExists && isProjectExists !== null) {
                  projectToSet = isProjectExists;
                  const workspaceWithProject = workspacesWithProjects?.find(
                    (workspace: any) =>
                      workspace?.projects?.some(
                        (project: any) =>
                          project?.id === isProjectExists?.id && project?.active
                      )
                  );

                  if (workspaceWithProject) {
                    workspaceToSet = workspaceWithProject;
                  } else {
                    const workspaceWithActiveProjects =
                      workspacesWithProjects?.find((workspace: any) =>
                        workspace?.projects?.some(
                          (project: any) => project?.active
                        )
                      );
                    if (workspaceWithActiveProjects) {
                      workspaceToSet = workspaceWithActiveProjects;
                    }
                  }
                } else {
                  const workspaceWithActiveProjects =
                    workspacesWithProjects?.find((workspace: any) =>
                      workspace?.projects?.some(
                        (project: any) => project?.active
                      )
                    );
                  if (workspaceWithActiveProjects) {
                    workspaceToSet = workspaceWithActiveProjects;
                    projectToSet = workspaceWithActiveProjects?.projects[0];
                  }
                }
              }
            } else {
              const currentWorkspace = localStorage.getItem("currentWorkspace");

              if (!currentWorkspace || currentWorkspace === "undefined") {
                const workspaceWithActiveProjects =
                  workspacesWithProjects?.find((workspace: any) =>
                    workspace?.projects?.some((project: any) => project?.active)
                  );
                if (workspaceWithActiveProjects) {
                  workspaceToSet = workspaceWithActiveProjects;
                  projectToSet = workspaceWithActiveProjects?.projects[0];
                } else {
                  toast.error("No Workspace with active projects found!");
                }
              } else {
                const currentWorkspaceId =
                  localStorage.getItem("currentWorkspace");
                const currentProjectId = localStorage.getItem("currentProject");

                const currentWorkspace = workspacesWithProjects
                  ?.filter((workspace: any) =>
                    workspace?.projects?.some((project: any) => project?.active)
                  )
                  ?.find(
                    (workspace: any) => workspace?.id === currentWorkspaceId
                  );

                if (!currentWorkspace) {
                  const anyWorkspace = workspacesWithProjects?.filter(
                    (workspace: any) =>
                      workspace?.projects?.some(
                        (project: any) => project?.active
                      )
                  );
                  if (anyWorkspace?.length > 0) {
                    workspaceToSet = anyWorkspace[0];
                    projectToSet = anyWorkspace[0]?.projects[0];
                  } else {
                    toast.error("No Workspace with active projects found!");
                  }
                } else {
                  workspaceToSet = currentWorkspace;
                  const currentproject = currentWorkspace?.projects
                    ?.filter((project: any) => project?.active)
                    ?.find((project: any) => project?.id === currentProjectId);

                  if (currentproject) {
                    projectToSet = currentproject;
                  } else if (currentProjectId) {
                    const project = await getProjectById(currentProjectId);
                    if (project?.data?.project?.data?.id) {
                      projectToSet = project?.data?.project?.data;
                    } else {
                      projectToSet = currentWorkspace?.projects[0];
                    }
                  } else {
                    projectToSet = currentWorkspace?.projects[0];
                  }
                }
              }
            }

            if (workspaceToSet) {
              localStorage.setItem("currentWorkspace", workspaceToSet.id);
              dispatch(addCurrentWorkSpace(workspaceToSet));
            }

            if (projectToSet) {
              localStorage.setItem("currentProject", projectToSet.id);
              dispatch(addCurrentProject(projectToSet));

              if (projectToSet && projectToSet?.id !== userCurrentProjectId) {
                const userResponse = await updateUser({
                  current_project_id: projectToSet.id,
                });

                if (userResponse?.data?.user) {
                  dispatch(updateUserPlan(userResponse.data.user));
                  localStorage.setItem(
                    "user",
                    JSON.stringify(userResponse.data.user)
                  );
                }
              }
            }
          }
        }
      } catch (error: any) {
        setIsLoading(false);
        console.error("Error fetching team data:", error);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "An error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [accountType, currentProject, currentWorkspaces, user]
  );

  const handleWorkspaceChange = async (workspaceId: string) => {
    try {
      const selectedWorkspace = currentWorkspaces?.allWorkspaces?.find(
        (workspace: any) => workspace?.id === workspaceId
      );

      const activeProject = selectedWorkspace?.projects?.find(
        (project: any) => project?.active
      );
      if (selectedWorkspace && activeProject) {
        if (activeProject?.id !== user?.user?.user?.current_project_id) {
          const userResponse = await updateUser({
            current_project_id: activeProject.id,
          });

          if (userResponse?.data?.user) {
            dispatch(updateUserPlan(userResponse.data.user));
            localStorage.setItem(
              "user",
              JSON.stringify(userResponse.data.user)
            );
          }
        }

        localStorage.setItem("currentWorkspace", workspaceId);
        localStorage.setItem("currentProject", activeProject.id);

        dispatch(addCurrentWorkSpace(selectedWorkspace));
        dispatch(addCurrentProject(activeProject));
        toast.success("Workspace switched successfully");
      } else {
        // toast.error("No active projects found in this workspace");

        router?.push(`/manage-projects?workspace=${workspaceId}`);
      }
      handleRedirectToExplorerOrBookmark();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkClick = (path: string) => {
    if (
      state.formCompleted === false &&
      !user?.user?.user?.research_interests
    ) {
      return;
    }
    onLinkClick();
    !isSubscriptionExpired && router.push(path);
  };

  useEffect(() => {
    if (topicExplorerDropdownItems?.some((item) => item.href === pathname)) {
      setTopicExplorer(true);
    }
    if (projectDropdownItems?.some((item) => item.href === pathname)) {
      setProjectExplorer(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (
      pathname === "/main-topic-explorer" &&
      (state.formCompleted === true ||
        user?.user?.user?.research_interests?.length > 0)
    ) {
      router.push("/dashboard");
    }
  }, [pathname, state.formCompleted, user?.user?.research_interests]);

  useEffect(() => {
    if (currentProject?.project?.id) {
      getTotalFilesInProject(currentProject?.project?.id);
    }
  }, [currentProject?.project?.id]);

  const handleRedirectToExplorerOrBookmark = async () => {
    // Array of paths that should redirect to explorer
    const redirectToExplorerPaths = ["/info", "/explorer"];
    const redirectToKowledgeBankPaths = [
      "/knowledge-bank/note",
      "/knowledge-bank/bookmark",
      "/knowledge-bank",
    ];
    // Check if current path includes any of the redirect paths
    const currentPath = window.location.pathname;
    if (redirectToExplorerPaths.some((path) => currentPath.includes(path))) {
      router.push("/explorer");
    }
    if (
      redirectToKowledgeBankPaths.some((path) => currentPath.includes(path))
    ) {
      router.push("/knowledge-bank");
    }
  };

  useEffect(() => {
    const currentProjectId: any = localStorage.getItem("currentProject");
    if (socket === null) {
      return;
    }
    if (socket) {
      socket.on("fileProcessing", (fileProcessing: any) => {
        getTotalFilesInProject(currentProjectId);
      });
      return () => {
        socket.off("fileProcessing");
      };
    }
  }, [socket]);

  const getTotalFilesInProject = async (id: string) => {
    const filesByProject: any = await getFilesByProject(id);
    if (filesByProject?.success === false) {
      toast.error(filesByProject?.message);
    }
    setTotalPapersInProject(filesByProject?.data?.count);
  };

  const handleProjectChange = async (project_id: string) => {
    try {
      let selectedProject: any;

      const projectInCurrentWorkspace =
        currentWorkspaces?.workspace?.projects?.find(
          (project: any) => project?.id === project_id
        );

      if (projectInCurrentWorkspace) {
        selectedProject = projectInCurrentWorkspace;
      } else {
        const workspaceWithProject = currentWorkspaces?.allWorkspaces?.find(
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

          if (!response?.success) {
            throw new Error(response?.message || "Failed to fetch project");
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

      localStorage.setItem("currentProject", selectedProject.id);
      dispatch(addCurrentProject(selectedProject));
      const sortedProjects = [...projects].sort((a: any, b: any) => {
        if (a.id === selectedProject.id) return -1;
        if (b.id === selectedProject.id) return 1;
        return 0;
      });
      setProjects(sortedProjects);

      if (selectedProject?.id !== user?.user?.user?.current_project_id) {
        const userResponse = await updateUser({
          current_project_id: selectedProject.id,
        });

        if (userResponse?.data?.user) {
          dispatch(updateUserPlan(userResponse.data.user));
          localStorage.setItem("user", JSON.stringify(userResponse.data.user));
        }
      }

      handleRedirectToExplorerOrBookmark();
    } catch (error: any) {
      console.error("Project switch error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to switch project"
      );
    }
  };

  const handleMenuToggle = () => {
    setTopicExplorer((prev: any) => !prev);
    if (!isTopicExplorerDialog) {
      setTopicExplorerDialog(true);
      updateTopicExplorerDialog();
      setIsTopicExplorerDialog(true);
    }
  };
  return (
    <div
      className={`fixed left-0 top-0 h-full animation ${
        !user?.user?.user?.research_interests?.length &&
        "inset-0 blur-[2px] z-10 bg-[#2e2a2af7] backdrop-blur-[6px] pointer-events-none cursor-not-allowed"
      } ${expand ? "expand-menu-vertical" : "menu-vertical"} ${
        isMobile && !openSideMenu ? "hidden" : ""
      } custom-mobile-menu`}
    >
      <div className="pt-5">
        <div
          className={`${
            expand ? "px-4 app-logo items-center" : "px-2 pl-2  flex gap-1 "
          }`}
          id="app-logo"
        >
          <OptimizedImage
            width={28}
            height={ImageSizes.icon.md.height}
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//researchcollab-logo.svg`}
            alt="logo"
            className="w-[28px] h-[24px]"
          />
          <span>ResearchCollab</span>
          <div
            onClick={() => setExpand((prev: any) => !prev)}
            className="fullScreenMenuBtn"
          >
            {expand ? (
              <RiMenu2Fill
                className="text-3xl text-[#0E70FF] cursor-pointer"
                width={18}
                height={18}
              />
            ) : (
              <RiMenuLine
                className="text-3xl text-[#0E70FF] cursor-pointer"
                width={18}
                height={18}
              />
            )}
          </div>
          <div
            onClick={() => setOpenSideMenu((prev: any) => !prev)}
            className="hidden smallScreenMenuBtn"
          >
            {openSideMenu ? (
              <RiMenu2Fill
                className="text-3xl text-[#0E70FF] cursor-pointer"
                width={18}
                height={18}
              />
            ) : (
              <RiMenuLine
                className="text-3xl text-[#0E70FF] cursor-pointer"
                width={18}
                height={18}
              />
            )}
          </div>
        </div>
        <div id="workspace-dropdown">
          <WorksSpaceDropdown
            workspaces={currentWorkspaces?.allWorkspaces}
            selectedWorkspace={selectedWorkspace}
            onSelectWorkspace={handleWorkspaceChange}
            isDisable={
              state.formCompleted === true ||
              user?.user?.user?.research_interests?.length > 0
            }
          />
        </div>
      </div>
      {/* main contain  */}
      <div className="h-[calc(100vh-170px)] overflow-auto">
        <ul
          className={`menu-inner ${
            state.formCompleted === true ||
            user?.user?.user?.research_interests?.length > 0
              ? "cursor-pointer"
              : "cursor-not-allowed"
          }`}
        >
          <li
            onClick={() => handleLinkClick("/dashboard")}
            id="dashboard-link"
            className={`mx-4 !gap-[12px] ${
              pathname === "/dashboard" ? "active" : ""
            }`}
          >
            <DashBord />
            <span>Dashboard</span>
          </li>
          <li className="mx-4 !text-[11px] font-semibold">RESEARCH TOOLKIT</li>
          <div id="explorer-link">
            <Dropdown
              expand={expand}
              icon={<TopicExplorer />}
              label="Topic Explorer"
              setToggle={handleMenuToggle}
              toggle={topicExplorer}
              dropDownItems={topicExplorerDropdownItems}
              notification={false}
              isDisable={
                state.formCompleted === true ||
                user?.user?.user?.research_interests?.length > 0
              }
              onClick={() => !topicExplorer}
              handleLinkClick={handleLinkClick}
              isSubscriptionExpired={isSubscriptionExpired}
            />
          </div>
          <li
            onClick={() => handleLinkClick("/papers")}
            id="search-papers"
            className={`mx-4 !gap-[12px] ${
              pathname === "/papers" || pathname === "/papers/history-timeline"
                ? "active"
                : ""
            } ${
              state.formCompleted === true ||
              user?.user?.user?.research_interests?.length > 0
                ? "cursor-pointer"
                : "cursor-not-allowed"
            }`}
          >
            <SearchPapers />
            <span>Search Papers</span>
          </li>
          <div
            className={`${
              isProjectRoute(pathname) ? "bg-[#F9F9F9] dark:bg-[#0E70FF0F]" : ""
            }`}
          >
            <li
              className="mx-4 flex justify-between "
              id="my-projects"
              onClick={() => handleLinkClick("/myprojects")}
            >
              <div className="flex gap-3 items center">
                <MyProjects />
                <span>My Projects</span>
              </div>
              <div className="sidebar-notification text-[11px] pt-[1px] h-5 w-5 flex justify-center items-center rounded-full font-medium text-[#666666] bg-[#0E70FF38] dark:text-white">
                {projects?.length}
              </div>
            </li>
            {projects?.length > 0 && (
              <div className="h-[100%] max-h-[205px] overflow-y-auto">
                {projects.map((item: any, index) => {
                  return (
                    <div key={index}>
                      <li
                        className={`${expand ? "!mb-0 ml-7 mr-3" : ""}`}
                        onClick={() => {
                          if (
                            state.formCompleted === false &&
                            !user?.user?.user?.research_interests
                          ) {
                            return;
                          }
                          if (item?.active) {
                            handleProjectChange(item?.id);
                          }

                          handleLinkClick(
                            projectSubMenu === "papers"
                              ? "/explorer"
                              : "/knowledge-bank"
                          );
                          setExpandedProject(
                            expandedProject === item?.id ? null : item?.id
                          );
                        }}
                      >
                        <FaProjectDiagram
                          className={`w-[16px] h-[16px] mt-1 ${
                            currentProject?.project?.id === item?.id &&
                            (isProjectRoute(pathname) ||
                              pathname === "/myprojects")
                              ? "text-[#0E70FF]"
                              : "text-[#999999]"
                          }`}
                        />

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className={`${
                                  currentProject?.project?.id === item?.id &&
                                  (isProjectRoute(pathname) ||
                                    pathname === "/myprojects")
                                    ? "text-[#0E70FF]"
                                    : "text-[#666666] dark:text-[#CCCCCC] "
                                }  text-[13px] font-normal  text-left max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap  `}
                              >
                                {item?.name}
                              </span>
                            </TooltipTrigger>

                            <TooltipContent className="border border-tableBorder text-left w-full max-w-[220px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray  transition-opacity duration-200 group-hover:opacity-100 ">
                              <span
                                className={`${
                                  currentProject?.project?.id === item?.id &&
                                  isProjectRoute(pathname)
                                    ? "text-[#0E70FF]"
                                    : "text-[#666666] dark:text-[#CCCCCC] "
                                }  text-[13px] font-normal  text-left  `}
                              >
                                {item?.name}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </li>
                      {currentProject?.project?.id === item?.id && (
                        <div className={` ${expand ? "ml-10" : ""} `}>
                          <div
                            className={`${
                              !expand
                                ? "  "
                                : "!mb-0 mr-3  pl-2  py-2 flex items-center gap-2 cursor-pointer text-[13px]"
                            } ${
                              pathname === "/explorer"
                                ? `active-dropdwon pl-2  text-[#666666] dark:text-[#CCCCCC]`
                                : `${expand ? "" : "flex justify-center"} text-[#666666] dark:text-[#CCCCCC]`
                            }`}
                            onClick={() => {
                              setProjectSubMenu("papers");
                              handleLinkClick("/explorer");
                            }}
                          >
                            <OptimizedImage
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//projectIcon.svg`}
                              alt="ProjectIcon"
                              width={ImageSizes.icon.xs.width}
                              height={ImageSizes.icon.xs.height}
                            />
                            <span>Papers</span>
                          </div>
                          <div
                            className={`!mb-0 mr-3 py-2 pl-2  flex items-center gap-2 cursor-pointer text-[13px] ${expand?'':'flex justify-center mt-2'} ${
                              pathname === "/knowledge-bank"
                                ? `active-dropdwon  text-[#666666] dark:text-[#CCCCCC] `
                                : "text-[#666666] dark:text-[#CCCCCC] "
                            }`}
                            onClick={() => {
                              setProjectSubMenu("knowledge-bank");
                              handleLinkClick("/knowledge-bank");
                            }}
                          >
                            <IdeaBank />
                            <span>Knowledge Bank</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <li className="mx-4 !pt-4 !text-[11px] font-semibold text-center">
            WORKSPACE TOOLS
          </li>
          <li
            className={`mx-4 !gap-[12px]
               ${
                 state.formCompleted === true ||
                 user?.user?.user?.research_interests?.length > 0
                   ? "cursor-pointer"
                   : "cursor-not-allowed"
               } ${pathname === "/manage-projects" ? "active" : ""}`}
            onClick={() => handleLinkClick("/manage-projects")}
          >
            <ManageProject />
            <span>Manage Projects</span>
          </li>

          <li
            id="collaboration"
            className={`mx-4 !gap-[12px] ${
              state.formCompleted === true ||
              user?.user?.user?.research_interests?.length > 0
                ? "cursor-pointer"
                : "cursor-not-allowed"
            } ${pathname === "/collaboration" ? "active" : ""}`}
            onClick={() => handleLinkClick("/collaboration")}
          >
            <Collaboration />
            <span>Collaboration</span>
          </li>

          {confirmBetaMode && (
            <li
              className={`mx-4 !gap-[12px] ${
                pathname === "/collective-mind" ? "active" : ""
              }`}
              onClick={() => handleLinkClick("/collective-mind")}
            >
              <CollectiveMind />
              <span className="flex items-end">
                Collective Mind
                <span className="text-[10px] ms-1 mb-[.12rem]">Beta</span>
              </span>
            </li>
          )}
          {confirmBetaMode && (
            <li
              onClick={() => handleLinkClick("/referral-state")}
              id="search-papers"
              className={`mx-4 !gap-[12px] ${
                pathname === "/referral-state" ? "active" : ""
              } ${
                state.formCompleted === true ||
                user?.user?.user?.research_interests?.length > 0
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              }`}
            >
              <TopicExplorer />
              <span>
                Referral and share
                <span className="text-[10px] ms-1 mb-[.12rem]">Beta</span>
              </span>
            </li>
          )}
        </ul>
        {confirmBetaMode && (
          <>
            <hr className="border-[#E5E5E5] dark:border-[#38464C] my-4" />
            <div className="mx-4" id="ai-chat">
              <button
                onClick={() => handleLinkClick("/deep-research")}
                type="button"
                className="flex w-full py-1 justify-center gap-2 items-center rounded-full ai-btn"
              >
                <div
                  style={{
                    background:
                      "linear-gradient(178.94deg, #0F55BA 3.06%, #0E70FF 101.28%)",
                  }}
                  className="border-2 border-[#0E70FF] p-1 rounded-full h-[30px] w-[30px] flex items-center justify-center"
                >
                  <PsychologyIcon className="text-[#F59B14] scale-x-[-1]" />
                </div>
                <span className="text-white text-[13px] flex items-end whitespace-nowrap">
                  Deep Research
                  <span className="text-[9px] ms-1 mb-[.11rem]">Beta</span>
                </span>
              </button>
            </div>
            <hr className="border-[#E5E5E5] dark:border-[#38464C] my-4" />
          </>
        )}
      </div>
      <TopicExplorerDialog
        topicExplorerDialog={topicExplorerDialog}
        setTopicExplorerDialog={setTopicExplorerDialog}
      />
    </div>
  );
};

export default MainSidebar;
