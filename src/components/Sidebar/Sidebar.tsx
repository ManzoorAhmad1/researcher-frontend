import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Logo from "./Logo";
import Link from "next/link";
import NavigationMenu from "./NavigationMenu";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "../ui/review-stage-select ";
import { ChevronDown } from "lucide-react";
import { getWorkspacesByUser, switchActiveWorkspace } from "@/apis/workspaces";
import {
  addAllWorkspaces,
  addCurrentWorkSpace,
  currentWorkSpaceLoading,
} from "@/reducer/services/workspaceSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { Loader } from "rizzui";
import {
  addCurrentProject,
  currentProjectLoading,
} from "@/reducer/services/projectSlice";
import toast from "react-hot-toast";
import FileUpload from "../Uploader/FileUpload";
export default function Sidebar() {
  const dispatch: AppDispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const accountType = useSelector(
    (state: any) => state.user?.user?.user?.account_type
  );
  const workspace: any = useSelector((state: any) => state?.workspace);
  const userPlan = useSelector(
    (state: any) => state.user?.user?.user?.subscription_plan
  );

  const [upgradeShow, setUpgradeShow] = useState<boolean>(false);

  useEffect(() => {
    if (accountType === "owner" && userPlan === "free") {
      setUpgradeShow(true);
    }
    handleGetWorkSpacesByUser();
  }, [accountType]);

  const handleGetWorkSpacesByUser = async (restrictRefresh?: boolean) => {
    try {
      if (user) {
        if (!restrictRefresh) {
          setIsLoading(true);
        }
        dispatch(currentWorkSpaceLoading());
        dispatch(currentProjectLoading());
        let response = await getWorkspacesByUser();
        if (response?.data?.isSuccess) {
          const workspacesWithProjects =
            response?.data?.data?.workspaces?.filter(
              (workspace: any) =>
                workspace?.workspaces?.user_projects &&
                workspace?.workspaces?.user_projects?.length > 0
            );
          dispatch(addAllWorkspaces(response?.data?.data?.workspaces));

          const currentWorkspace = localStorage.getItem("currentWorkspace");
          if (
            !currentWorkspace ||
            currentWorkspace === null ||
            currentWorkspace == undefined ||
            currentWorkspace == "undefined"
          ) {
            localStorage.setItem(
              "currentWorkspace",
              workspacesWithProjects[0]?.workspace_id
            );
            localStorage.setItem(
              "currentProject",
              workspacesWithProjects[0]?.workspaces?.user_projects[0]
                ?.project_id
            );
            dispatch(addCurrentWorkSpace(workspacesWithProjects[0]));
            dispatch(
              addCurrentProject(
                workspacesWithProjects[0]?.workspaces?.user_projects[0]
                  ?.projects
              )
            );
          } else {
            const currentWorkspaceId: any =
              localStorage.getItem("currentWorkspace");
            const currentProjectId: any =
              localStorage.getItem("currentProject");

            const currentWorkspace = workspacesWithProjects?.find(
              (workspace: any) => workspace?.workspace_id === currentWorkspaceId
            );
            const currentproject =
              currentWorkspace?.workspaces?.user_projects?.find(
                (project: any) => project?.project_id === currentProjectId
              );
            dispatch(addCurrentWorkSpace(currentWorkspace));
            dispatch(addCurrentProject(currentproject?.projects));
          }
        }
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Error fetching team data:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkspaceChange = async (workspaceId: string) => {
    try {
      const newWorkSpace = workspace?.allWorkspaces?.find(
        (workspace: any) => workspace?.workspaces?.id === workspaceId
      );
      localStorage.setItem("currentWorkspace", workspaceId);
      localStorage.setItem(
        "currentProject",
        newWorkSpace?.workspaces?.user_projects[0]?.project_id
      );
      dispatch(addCurrentWorkSpace(newWorkSpace));
      dispatch(
        addCurrentProject(newWorkSpace?.workspaces?.user_projects[0]?.projects)
      );
      toast.success("Workspace switched successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="hidden border-r bg-black/90 md:block md:sticky md:top-0 h-screen">
      <div className="flex h-full max-h-screen flex-col gap-2 ">
        <div className="flex min-h-[56px]  items-center border-b border-white/50 px-4 lg:h-[60px] lg:px-6">
          <Logo />
        </div>
        <div
          className={`flex min-h-[56px] ${
            workspace?.status === "loading" ? "justify-center" : "justify-start"
          } items-center border-b border-white/50 px-4 lg:h-[60px] lg:px-6`}
        >
          {workspace?.status === "loading" ? (
            <Loader className="mr-4 text-white" variant="threeDot" size="sm" />
          ) : (
            <Select
              disabled={isLoading}
              value={workspace?.workspace?.workspace_id}
              onValueChange={(workspace: string) => {
                handleWorkspaceChange(workspace);
              }}
            >
              <SelectTrigger>
                <>
                  <div className="flex gap-1 items-center">
                    <h1 className="text-white">
                      <div className="flex items-center gap-1">
                        {workspace?.workspace?.workspaces?.name}
                        <ChevronDown
                          size={"17px"}
                          className="ml-1"
                          color="white"
                        />
                      </div>
                    </h1>
                  </div>
                </>
              </SelectTrigger>
              <SelectContent className=" p-2  bg-[#191919] text-white border-none  shadow-lg shadow-[#d1d5db]">
                {workspace?.allWorkspaces?.map((item: any, index: number) => {
                  return (
                    <SelectItem
                      key={item?.workspaces?.id}
                      value={item?.workspaces?.id}
                    >
                      {item?.workspaces?.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex-1">
          <NavigationMenu />
        </div>
        <div>
          <FileUpload />
        </div>
      </div>
    </div>
  );
}
