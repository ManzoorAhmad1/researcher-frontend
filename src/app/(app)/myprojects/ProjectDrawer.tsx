import { Label } from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../../../components/ui/input";
import Image from "next/image";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader } from "rizzui";
import { createProject, updateProjectCollaboration } from "@/apis/projects";
import { useSelector, useDispatch } from "react-redux";
import { getAllTeam, getAllTeamsMembersByUser } from "@/apis/team";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getWorkspacesByUser } from "@/apis/workspaces";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import { useSearchParams } from "next/navigation";
import { AppDispatch, RootState } from "@/reducer/store";
import { addCurrentWorkSpace } from "@/reducer/services/workspaceSlice";
import { addCurrentProject } from "@/reducer/services/projectSlice";
import { updateUser } from "@/apis/user";
import { updateUserPlan } from "@/reducer/auth/authSlice";
interface EditWorkspaceDrawerProps {
  projectData: any;
  handleDrawerClose: () => void;
  isFetch: any;
  isCreate?: boolean;
  setIsCreate?: (value: boolean) => void;
}
interface Option {
  id: string;
  email: string;
}
interface Workspace {
  id: string;
  name: string;
  owner_user_id: string;
}

const ManageProjectDrawer = ({
  projectData,
  handleDrawerClose,
  isFetch,
  isCreate,
  setIsCreate,
}: EditWorkspaceDrawerProps) => {
  const dispatch: AppDispatch = useDispatch();
  const searchParams = useSearchParams();
  const [allTeamMembers, setAllTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const user = useSelector((state: any) => state.user?.user?.user);
  const [teamData, setTeamData] = useState([]);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Option[]>([]);
  const [searchMember, setSearchMember] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [workSpaces, setWorkSpaces] = useState<Workspace[]>([]);
  const selectRef = useRef<HTMLDivElement>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );
  const [workspaceError, setWorkspaceError] = useState(false);

  const getTeam = async (owner_user_id?: string) => {
    try {
      setLoading(true);
      setIsTeamLoading(true);
      setMemberLoading(true);
      let response = await getAllTeam({
        isOwnerTeam: true,
        id: owner_user_id ? owner_user_id : projectData?.owner_user_id,
      });
      const teamMembers = await getAllTeamsMembersByUser({
        id: owner_user_id ? owner_user_id : projectData?.owner_user_id,
      });

      if (response?.data?.isSuccess) {
        setAllTeamMembers(response?.data?.teams);
        setTeamData(response?.data?.teams);
      } else {
        toast.error(response?.data?.message);
      }
      if (teamMembers?.data?.isSuccess) {
        const teamWithUser = projectData?.teams
          ?.filter((team: any) => team.users)
          .map((team: any) => ({ ...team.users, type: team?.type }));

        if (teamWithUser?.length > 0) {
          const uniqueEmailMap = new Map();
          teamWithUser.forEach((user: any) => {
            uniqueEmailMap.set(user.email, {
              id: user.id,
              email: user.email,
              type: user.type,
            });
          });
          const uniqueTeamMembers: any = Array.from(uniqueEmailMap.values());

          setSelectedValues(uniqueTeamMembers);
          setTeamMembers(uniqueTeamMembers);
        } else {
          const uniqueMembers = teamMembers?.data?.members.filter(
            (member: any, index: number, self: any[]) =>
              index === self.findIndex((m: any) => m.email === member.email)
          );
          setTeamMembers(() => uniqueMembers);
        }
      } else {
        toast.error(teamMembers?.data?.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching team data:", error);
    } finally {
      setIsTeamLoading(false);
      setLoading(false);
      setMemberLoading(false);
    }
  };
  useEffect(() => {
    if (projectData && projectData !== null) {
      getTeam();
    }
  }, []);

  useEffect(() => {
    const handleGetWorkSpaces = async () => {
      try {
        setIsLoading(true);
        const response = await getWorkspacesByUser({});
        if (response?.data?.isSuccess) {
          const workspacesData = response?.data?.data?.workspaces || [];
          setWorkSpaces(
            workspacesData?.filter(
              (workspace: any) => workspace?.owner_user_id === user?.id
            )
          );
        }
      } catch (error: any) {
        setWorkSpaces([]);
        toast.error(
          error?.response?.data?.message ||
          error?.message ||
          "An error occurred."
        );
        console.error("Error fetching workspaces data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    handleGetWorkSpaces();
  }, []);
  const workspace: string | null = searchParams.get("workspace");
  useEffect(() => {
    const workspace: string | null = searchParams.get("workspace");
    if (
      workSpaces &&
      workSpaces?.length > 0 &&
      workspace &&
      workspace !== null
    ) {
      const currentWorkspace: any = workSpaces.find((w) => w.id === workspace);
      setSelectedWorkspace(currentWorkspace);
    }
  }, [searchParams, workSpaces]);

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      selectedCollaborators:
        projectData?.teams?.map((team: any) => team?.teams?.id) || [],
      projectName: projectData?.name || "",
    },
  });

  const handelUpdate = async (data: any) => {
    if (!projectData && !selectedWorkspace) {
      setWorkspaceError(true);
      return;
    }
    setWorkspaceError(false);
    setIsLoading(true);
    const existingCollaborators =
      projectData?.teams?.map((team: any) => team?.teams?.id) || [];
    const updatedCollaborators = data?.selectedCollaborators;
    const collaborators = updateCollaborators(
      projectData?.teams,
      existingCollaborators,
      updatedCollaborators,
      projectData?.project_id
    );
    const AddedCollaborators = allTeamMembers
      ?.filter((member: any) =>
        collaborators?.newCollaborators?.includes(member?.team_id)
      )
      ?.map((item: any) => `${item?.teams?.name}`);
    const removedCollaborators = allTeamMembers
      ?.filter((member: any) =>
        collaborators?.deletedCollaborators?.some(
          (item) => item === member?.team_id
        )
      )
      ?.map((item: any) => `${item?.teams?.name}`);

    const teamWithUser = projectData?.teams
      ?.filter((team: any) => team.users)
      .map((team: any) => team.users);
    const previousValues = teamWithUser?.map((item: any) => item.email) || [];

    const newValues = selectedValues.map((item) => item.email);

    const addedEmails = newValues.filter(
      (email: any) => !previousValues.includes(email)
    );
    const removedEmails = previousValues.filter(
      (email: any) => !newValues.includes(email)
    );

    try {
      let response: any;
      if (projectData) {
        response = await updateProjectCollaboration({
          owner_id: projectData?.owner_user_id,
          project_id: projectData?.id,
          workspace_id: projectData?.workspace_id,
          collaborators: collaborators,
          individual_collaborators: {
            newCollaborators: addedEmails,
            removedCollaborators: removedEmails,
          },
          lead_id: projectData?.lead_user_id,
          recent_Activity_removed_collaborator:
            removedCollaborators?.length > 0
              ? `Removed collaborator ${removedCollaborators?.join(
                ","
              )} from project`
              : "",
          recent_Activity_add_collaborator:
            AddedCollaborators?.length > 0
              ? `Added new collaborator ${AddedCollaborators?.join(
                ","
              )} to project`
              : "",
        });
      } else {
        response = await createProject({
          name: data.projectName,
          workspace_id: selectedWorkspace?.id,
          individual_collaborators: { newCollaborators: addedEmails },
          collaborators: collaborators,
        });
      }

      if (response?.success === false) {
        toast.error(response?.message);
      }
      if (response) {
        if (response?.data?.message && response?.data?.message !== null) {
          toast.success(response?.data?.message);

          if (workspace) {

            let currentWorkspace: any;


            currentWorkspace = workSpaces.find(
              (w: any) => w.id === workspace
            );

            const updatedWorkspace = {
              ...currentWorkspace,
              projects: [...currentWorkspace?.projects,
              { ...response?.data?.project, workspaces: { name: currentWorkspace?.name } }],

            }
            const userResponse = await updateUser({
              current_project_id: response?.data?.project.id,
            });

            if (userResponse?.data?.user) {
              dispatch(updateUserPlan(userResponse.data.user));
              localStorage.setItem(
                "user",
                JSON.stringify(userResponse.data.user)
              );
            }


            toast.success(
              `Your active workspace has been updated to ${updatedWorkspace?.name}. ${response?.data?.project?.name} is now set as your current working project.`
            );

          }
        }
        reset();
        handleDrawerClose();
        isFetch();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  function updateCollaborators(
    collaborators: any,
    oldArray: number[],
    newArray: number[],
    projectId: string
  ) {
    const deletedCollaboratorWorkspace = [];
    const newCollaborators = newArray.filter(
      (item) => !oldArray?.includes(item)
    );

    let deletedCollaborators = oldArray.filter(
      (item) => !newArray.includes(item)
    );
    if (deletedCollaborators && deletedCollaborators?.length > 0) {
      for (const deletedCollaborator of deletedCollaborators) {
        deletedCollaboratorWorkspace?.push(
          ...collaborators
            ?.filter((team: any) => team?.teams?.id === deletedCollaborator)
            ?.map((item: any) => item?.id)
        );
      }
    }
    return {
      newCollaborators,
      deletedCollaborators: deletedCollaboratorWorkspace,
    };
  }

  const filteredOptions = teamMembers?.filter((option: { email: string }) =>
    option?.email?.toLowerCase()?.includes(searchMember?.toLowerCase() || "")
  );
  const toggleOption = (option: { email: string }) => {
    setSelectedValues((current: any) =>
      current.find((el: any) => el.email === option.email)
        ? current.filter((el: any) => el.email !== option.email)
        : [...current, option]
    );
  };

  const removeValue = (
    optionToRemove: { id: string; email: string },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedValues((current: any) =>
      current.filter((option: any) => option.email !== optionToRemove.email)
    );
  };
  return (
    <div ref={drawerRef}>
      <form onSubmit={handleSubmit(handelUpdate)}>
        <div
          className=" px-6 pb-6 pt-4 z-20 top-0 absolute w-full max-w-[338px] right-0 h-[100vh] bg-secondaryBackground"
          style={{ boxShadow: "-2px 0px 6px 0px #00000040" }}
        >
          <div className="flex justify-between items-center  mb-5">
            <h2 className=" text-base font-semibold">
              {!projectData ? "Create Project" : projectData?.name}
            </h2>
            <X
              onClick={() => handleDrawerClose()}
              className=" cursor-pointer "
              color="#9A9A9A"
              width={20}
              height={20}
            />
          </div>
          {!projectData && (
            <div className="mt-3 mb-6">
              <h3 className="text-[12px] font-semibold mb-1 uppercase">
                Project Name
              </h3>
              <Input
                {...register("projectName", {
                  required: "Project name is required",
                })}
                placeholder="Enter project name"
                className={`w-full bg-inputBackground border border-tableBorder`}
              />
              {errors.projectName && (
                <span className="text-red-500 text-xs mt-1">
                  {errors.projectName.message as string}
                </span>
              )}
            </div>
          )}

          {!projectData && <hr className="border-tableBorder mb-4" />}
          {!projectData && (
            <div className="mb-6">
              <h3 className="text-[12px] font-semibold mb-1 uppercase">
                Select Workspace
              </h3>
              <Select
                onValueChange={(value) => {
                  const workspace = workSpaces.find((w) => w.id === value);
                  setSelectedWorkspace(workspace || null);
                  getTeam(workspace?.owner_user_id);
                  setWorkspaceError(false);
                }}
                disabled={!!workspace}
                defaultValue={projectData?.workspace_id || ""}
              >
                <SelectTrigger className={`w-full bg-inputBackground border`}>
                  <span className="text-sm">
                    {isLoading
                      ? "Loading workspaces..."
                      : selectedWorkspace?.name ||
                      workSpaces.find(
                        (workspace) =>
                          workspace.id === projectData?.workspace_id
                      )?.name ||
                      "Select Workspace"}
                  </span>
                </SelectTrigger>
                <SelectContent className="bg-inputBackground">
                  {isLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading workspaces...
                    </SelectItem>
                  ) : workSpaces.length > 0 ? (
                    workSpaces.map((workspace) => (
                      <SelectItem
                        key={workspace.id}
                        value={workspace.id}
                        className="text-sm"
                      >
                        {workspace.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-workspace" disabled>
                      No workspaces available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {workspaceError && !selectedWorkspace && (
                <span className="text-red-500 text-xs mt-1">
                  Please select a workspace
                </span>
              )}
            </div>
          )}
          {!projectData && <hr className="border-tableBorder mb-4" />}

          {allTeamMembers?.length > 0 && (
            <div className="flex  max-w-sm gap-4">
              <div className="relative w-full">
                <h3 className="text-[12px] font-semibold mb-1 uppercase">
                  Teams
                </h3>
                <div className="relative flex items-center"></div>
              </div>
            </div>
          )}

          <div className=" mt-3 mb-6">
            <div className="drawer-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader variant="threeDot" size="lg" />
                </div>
              ) : allTeamMembers?.length > 0 ? (
                <div className="max-h-[224px] overflow-y-auto custom-scrollbar">
                  {" "}
                  {allTeamMembers?.map((team: any, index: any) => {
                    const isLeadUser =
                      team.user_id === projectData?.lead_user_id &&
                      projectData?.lead_user_id !== projectData?.owner_user_id;

                    const isWorkspaceCollaborator = projectData?.teams?.find(
                      (item: any) =>
                        item?.type === "workspace" &&
                        item?.teams?.id === team?.teams?.id
                    );

                    const tooltipMessage = isLeadUser
                      ? "Please remove lead role before unchecking"
                      : isWorkspaceCollaborator
                        ? "Please remove from workspace first to uncheck"
                        : "";

                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between my-[8px] ">
                          <div className="flex items-center gap-[12px] ">
                            <div
                              className="w-[36px] h-[36px] border-2 border-[#2EB0D9] rounded-full object-cover bg-[#F59B14] flex justify-center text-center items-center"
                              key={team?.id}
                            >
                              {team?.teams?.name ? (
                                <span>
                                  {team?.teams?.name?.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <OptimizedImage
                                  src={team?.users?.profile_image}
                                  alt="team"
                                  width={ImageSizes.avatar.lg.width}
                                  height={ImageSizes.avatar.lg.height}
                                  className="rounded-full"
                                />
                              )}
                            </div>
                            <p className="text-[13px] leading-[19.5px] font-normal overflow-hidden max-w-[200px] text-ellipsis  ">
                              {`${team?.teams?.name}`}
                            </p>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Controller
                                    control={control}
                                    name="selectedCollaborators"
                                    render={({ field }: any) => (
                                      <Checkbox
                                        checked={field.value.includes(
                                          team?.teams?.id as any
                                        )}
                                        disabled={
                                          projectData?.teams
                                            ?.map(
                                              (team: any) => team?.teams?.id
                                            )
                                            .includes(team?.teams?.id) &&
                                          (isWorkspaceCollaborator ||
                                            isLeadUser)
                                        }
                                        onCheckedChange={(checked: any) => {
                                          if (checked) {
                                            field.onChange([
                                              ...field.value,
                                              team?.teams?.id,
                                            ]);
                                          } else {
                                            field.onChange(
                                              field.value.filter(
                                                (id: any) =>
                                                  id && id !== team?.teams?.id
                                              )
                                            );
                                          }
                                        }}
                                        className="mr-2"
                                      />
                                    )}
                                  />
                                </div>
                              </TooltipTrigger>
                              {projectData?.teams
                                ?.map((team: any) => team?.teams?.id)
                                .includes(team?.teams?.id) &&
                                (isWorkspaceCollaborator || isLeadUser) && (
                                  <TooltipContent>
                                    <p className="text-[11px] font-normal">
                                      {tooltipMessage}
                                    </p>
                                  </TooltipContent>
                                )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <hr className="border-tableBorder mt-4" />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {!projectData && <div className="mt-3 mb-6"></div>}

          {!loading && (
            <Popover open={open} onOpenChange={setOpen}>
              <h3 className="text-[12px] font-semibold mb-1 uppercase">
                Collaborators
              </h3>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between hover:bg-inputBackground border border-tableBorder  relative h-auto min-h-10 flex items-center rounded-md  bg-inputBackground px-3 py-2 text-sm "
                >
                  <div className="flex flex-wrap gap-1 ">
                    {selectedValues.length === 0 ? (
                      <span className="text-[#666666] dark:text-[#93a1b6] font-light ">
                        Select Members
                      </span>
                    ) : (
                      selectedValues.map(
                        (option: {
                          id: string;
                          email: string;
                          type?: string;
                        }) => {
                          const isLeadUser =
                            option?.id === projectData?.lead_user_id &&
                            projectData?.lead_user_id !==
                            projectData?.owner_user_id &&
                            selectedValues
                              ?.map((item: any) => item?.id)
                              .includes(option?.id) &&
                            projectData?.teams
                              ?.filter((team: any) => team.users)
                              .map((team: any) => ({
                                ...team.users,
                                type: team?.type,
                              }))
                              ?.map((item: any) => item?.id)
                              .includes(option?.id);
                          const tooltipMessage = isLeadUser
                            ? "Please remove lead role before unchecking"
                            : option.type === "workspace"
                              ? "Remove from workspace first to uncheck"
                              : "";

                          return (
                            <TooltipProvider key={option.email}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`border border-tableBorder rounded px-1 py-0.5 text-[11px] flex items-center gap-1 ${option.type === "workspace" || isLeadUser
                                      ? "bg-blue-100 text-[#0f6fff] opacity-50"
                                      : "bg-blue-100 dark:bg-[#1f2d32] text-[#0f6fff]"
                                      }`}
                                  >
                                    {option.email}
                                    <X
                                      className={`h-3 w-3 ${option.type === "workspace" ||
                                        isLeadUser
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:text-red-500 cursor-pointer"
                                        }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (
                                          option.type !== "workspace" &&
                                          !isLeadUser
                                        ) {
                                          removeValue(option, e);
                                        }
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                {(option.type === "workspace" ||
                                  isLeadUser) && (
                                    <TooltipContent>
                                      <p className="text-[11px] font-normal">
                                        {tooltipMessage}
                                      </p>
                                    </TooltipContent>
                                  )}
                              </Tooltip>
                            </TooltipProvider>
                          );
                        }
                      )
                    )}
                  </div>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                ref={popoverRef}
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-inputBackground"
                align="start"
              >
                {filteredOptions.length > 0 && (
                  <div className="p-2">
                    <Label className="text-[11px] pt-2 font-semibold mb-1 uppercase">
                      Add Existing Collaborators
                    </Label>
                  </div>
                )}
                <div>
                  <div className="p-2 space-y-1">
                    {memberLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader variant="threeDot" size="lg" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="max-h-[180px] overflow-y-auto">
                          {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-gray-500">
                              No emails found
                            </div>
                          ) : (
                            filteredOptions.map((option: any) => {
                              const isSelected: any = selectedValues.find(
                                (el: any) => el.email === option.email
                              );
                              const isLeadUser =
                                option?.id === projectData?.lead_user_id &&
                                projectData?.lead_user_id !==
                                projectData?.owner_user_id &&
                                selectedValues
                                  ?.map((item: any) => item?.id)
                                  .includes(option?.id) &&
                                projectData?.teams
                                  ?.filter((team: any) => team.users)
                                  .map((team: any) => ({
                                    ...team.users,
                                    type: team?.type,
                                  }))
                                  ?.map((item: any) => item?.id)
                                  .includes(option?.id);
                              return (
                                <div
                                  key={option.EmailSelectedFIlters}
                                  className={`flex items-center gap-2 rounded-sm px-2 py-1.5 ${isSelected?.type === "workspace" ||
                                    isLeadUser
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer"
                                    }
                                ${isSelected
                                      ? "bg-blue-50  dark:bg-[#1f2d32]"
                                      : "hover:bg-gray-100 dark:hover:bg-[#2d3c42]"
                                    }`}
                                  onClick={() => {
                                    if (
                                      isSelected?.type !== "workspace" &&
                                      !isLeadUser
                                    ) {
                                      toggleOption(option);
                                    }
                                  }}
                                >
                                  <div
                                    className={`flex h-4 w-4 items-center justify-center rounded-sm border
                                    ${isSelected
                                        ? "bg-blue-500 border-[#0f6fff]"
                                        : "border-gray-300"
                                      }`}
                                  >
                                    {isSelected && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                  <span
                                    className={`
                                    font-medium text-[11px]
                                    text-[#666666] dark:text-[#999999]
                                    ${isSelected?.type === "workspace"
                                        ? "opacity-50"
                                        : "text-[#0f6fff]"
                                      }
                                  `}
                                  >
                                    {option.email}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <hr className="border border-tableBorder" />
                        <div className="">
                          <Label className="text-[11px] font-semibold mb-1 uppercase">
                            Add External Collaborators
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="Email"
                              className="text-[13px] font-normal bg-inputBackground border outline-none border-tableBorder text-foreground focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <Button
                              className="rounded-md btn text-white "
                              onClick={() => {
                                if (newEmail) {
                                  toggleOption({
                                    email: newEmail,
                                  });
                                  setNewEmail("");
                                }
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          <div className="flex gap-6 justify-end items-center py-6 ">
            <Button
              className="rounded-[20px] text-[#0E70FF] border-[#0E70FF]"
              variant={"outline"}
              onClick={() => handleDrawerClose()}
            >
              Cancel
            </Button>
            <Button
              className=" rounded-[26px] btn text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader variant="threeDot" size="lg" />
              ) : !projectData ? (
                "Create Project"
              ) : (
                "Save & Invite"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManageProjectDrawer;
