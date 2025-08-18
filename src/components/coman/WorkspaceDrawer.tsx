import { Label } from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Plus, SearchIcon, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import Image from "next/image";
import { formatTableDate } from "@/utils/formatDate";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useForm, Controller } from "react-hook-form";
import { createWorkSpace, updateWorkspaces } from "@/apis/workspaces";
import toast from "react-hot-toast";
import { getAllTeam, getAllTeamsMembersByUser } from "@/apis/team";
import { Loader } from "rizzui";
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
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface EditWorkspaceDrawerProps {
  workspaceRowData: any;
  handleDrawerClose: () => void;
  allMembers: any;
  isFetch: any;
}

interface Option {
  id: string;
  email: string;
  EmailSelectedFIlters?: string;
}

const WorkspaceDrawer = ({
  workspaceRowData,
  handleDrawerClose,
  isFetch,
}: EditWorkspaceDrawerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [teamData, setTeamData] = useState([]);
  const [teamMembers, setTeamMembers] = useState<Option[]>([]);
  const [searchMemberText, setSearchMemberText] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Option[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const filteredOptions = teamMembers.filter((option: Option) =>
    option?.email
      ?.toLowerCase()
      ?.includes(searchMemberText?.toLowerCase() || "")
  );
  const toggleOption = (option: Option, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValues((current) =>
      current?.find((el) => el.email === option.email)
        ? current?.filter((el) => el.email !== option.email)
        : [...current, option]
    );
  };

  const removeValue = (
    optionToRemove: { id: string; email: string },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setSelectedValues((current) =>
      current?.filter((option) => option.email !== optionToRemove.email)
    );
  };

  useEffect(() => {
    const getTeam = async () => {
      try {
        setIsTeamLoading(true);
        let response = await getAllTeam({
          isOwnerTeam: true,
          id: workspaceRowData?.owner_user_id,
        });
        const teamMembers = await getAllTeamsMembersByUser({
          id: workspaceRowData?.owner_user_id,
        });

        if (response?.data?.isSuccess) {
          setTeamData(response?.data?.teams);
        } else {
          toast.error(response?.data?.message);
        }

        if (teamMembers?.data?.isSuccess) {
          const teamWithUser = workspaceRowData?.teams
            ?.filter((team: any) => team.users)
            .map((team: any) => team.users);

          if (teamWithUser?.length > 0) {
            const uniqueMembers = new Map();

            teamMembers?.data?.members?.forEach((member: any) => {
              uniqueMembers.set(member.email, member);
            });

            teamWithUser?.forEach((user: any) => {
              if (!uniqueMembers.has(user.email)) {
                uniqueMembers.set(user.email, user);
              }
            });

            const updatedTeamMembers = Array.from(uniqueMembers.values());

            setTeamMembers(() => updatedTeamMembers);
            setSelectedValues(
              teamWithUser?.map((item: any) => ({
                id: item?.id,
                email: item?.email,
              }))
            );
          } else {
            const uniqueMembers = new Map();
            teamMembers?.data?.members?.forEach((member: any) => {
              uniqueMembers.set(member.email, member);
            });
            setTeamMembers(() => Array.from(uniqueMembers.values()));
          }
        } else {
          toast.error(teamMembers?.data?.message);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
        console.error("Error fetching team data:", error);
      } finally {
        setIsTeamLoading(false);
      }
    };
    getTeam();
  }, []);

  useEffect(() => {
    const teamWithUser = workspaceRowData?.teams
      ?.filter((team: any) => team.users)
      .map((team: any) => team.users);
    if (teamWithUser?.length > 0) {
      setSelectedValues(
        teamWithUser?.map((item: any) => ({ id: item?.id, email: item?.email }))
      );
    }
  }, [workspaceRowData]);
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      selectedCollaborators:
        workspaceRowData?.teams?.map((team: any) =>
          team?.team_id?.toString()
        ) || [],
      name: workspaceRowData?.name,
    },
  });
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const teamWithUser = workspaceRowData?.teams
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

      const response = await createWorkSpace({
        workspace: { name: data?.name },
        collaborators: JSON.stringify(data?.selectedCollaborators),
        individual_collaborators: {
          newCollaborators: addedEmails,
          removedCollaborators: removedEmails,
        },
      });

      if (response) {
        if (response?.data?.message && response?.data?.message !== null) {
          toast.success(response?.data?.message);
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

  const handelUpdate = async (data: any) => {
    setIsLoading(true);
    const existingCollaborators = workspaceRowData?.teams.map(
      (collaborator: any) => collaborator?.team_id?.toString()
    );
    const updatedCollaborators = data?.selectedCollaborators;
    const collaborators = updateCollaborators(
      workspaceRowData?.teams,
      existingCollaborators,
      updatedCollaborators,
      workspaceRowData?.workspace_id
    );

    const teamWithUser = workspaceRowData?.teams
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
      const response = await updateWorkspaces({
        data: { name: data?.name },
        collaborators: collaborators,
        individual_collaborators: {
          newCollaborators: addedEmails,
          removedCollaborators: removedEmails,
        },
        id: workspaceRowData?.id,
        owner_user_id: workspaceRowData?.owner_user_id,
        workspace_id: workspaceRowData?.id,
      });
      if (response) {
        if (response?.data?.message && response?.data?.message !== null) {
          toast.success(response?.data?.message);
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
    workdpaceId: string
  ) {
    const deletedCollaboratorWorkspace = [];
    const newCollaborators = newArray.filter(
      (item) => !oldArray.includes(item)
    );
    let deletedCollaborators = oldArray.filter(
      (item) => !newArray.includes(item)
    );
    if (deletedCollaborators && deletedCollaborators?.length > 0) {
      for (const deletedCollaborator of deletedCollaborators) {
        deletedCollaboratorWorkspace?.push(
          ...collaborators
            ?.filter(
              (collaborator: any) =>
                collaborator?.team_id?.toString() === deletedCollaborator
            )
            ?.map((item: any) => ({
              id: item?.id,
            }))
        );
      }
    }
    return {
      newCollaborators,
      deletedCollaborators: deletedCollaboratorWorkspace,
    };
  }

  const handleMemberFilter = (e: any) => {
    const value = e.target.value;
    if (!value || value === null) {
      setTeamData(teamData);
    } else {
      const filteredCollaborators = teamData.filter((collaborator: any) =>
        collaborator?.email
          ?.toLowerCase()
          ?.startsWith(value?.toLowerCase() || "")
      );
      setTeamData(filteredCollaborators);
    }
  };

  const handleAddNewEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newEmail) {
      const newOption: Option = {
        id: newEmail,
        email: newEmail,
      };
      setTeamMembers((prev) => [...prev, newOption]);
      setSelectedValues((prev) => [...prev, newOption]);
      setNewEmail("");
      setOpen(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(workspaceRowData ? handelUpdate : onSubmit)}>
        <div
          className=" p-6 z-20 top-0 absolute w-full max-w-[338px] right-0 h-[100vh] bg-secondaryBackground"
          style={{ boxShadow: "-2px 0px 6px 0px #00000040" }}
        >
          <div className="flex justify-between items-center">
            <h2 className=" text-base font-semibold">
              {workspaceRowData ? "EDIT WORKSPACE" : "ADD WORKSPACE"}
            </h2>
            <X
              onClick={() => handleDrawerClose()}
              className=" cursor-pointer "
              color="#9A9A9A"
              width={20}
              height={20}
            />
          </div>
          {workspaceRowData?.created_at && (
            <div className="py-6 text-[#666666] flex items-center gap-8 ">
              <div>
                <p className="text-[11px] font-semibold">CREATED DATE</p>
                <p className="text-[13px] font-normal">
                  {formatTableDate(workspaceRowData?.created_at)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold ">LAST MODIFIED</p>
                <p className="text-[13px] font-normal">
                  {formatTableDate(workspaceRowData?.updated_at)}
                </p>
              </div>
            </div>
          )}
          {workspaceRowData && <hr className="border-tableBorder" />}

          <div className=" pt-6">
            <Label className="text-[11px] font-semibold  mb-1 uppercase">
              Enter Your Workspace Name
            </Label>
            <Input
              id="name"
              placeholder="Workspace Name"
              className="text-[13px] font-normal bg-inputBackground border outline-none border-tableBorder text-foreground"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors?.name?.message as string}
              </p>
            )}
          </div>

          {workspaceRowData && workspaceRowData?.teams?.length > 0 && (
            <div className="pt-6">
              <p className="text-[11px] font-semibold text-foreground mb-1 ">
                COLLABORATORS AND TEAMS
              </p>

              <div className="flex items-center">
                {workspaceRowData?.teams?.map((team: any, index: any) => (
                  <div
                    className="w-[36px] h-[36px] border-2 border-[#fff] rounded-full object-cover bg-[#F59B14] flex justify-center text-center items-center"
                    key={team?.id}
                  >
                    {team?.teams?.name ? (
                      <span>{team?.teams?.name?.charAt(0).toUpperCase()}</span>
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
                ))}
              </div>
            </div>
          )}
          {isTeamLoading && (
            <div className=" flex items-center justify-center h-10">
              <Loader variant="threeDot" size="lg" />
            </div>
          )}

          {!isTeamLoading && teamData && teamData?.length > 0 && (
            <div className="flex pt-6  max-w-sm gap-4">
              <div className="relative w-full">
                <h3 className=" text-[14px] font-semibold mb-1 uppercase">
                  Teams
                </h3>
              </div>
            </div>
          )}

          {!isTeamLoading && (
            <div className="max-h-[224px] overflow-y-auto custom-scrollbar mt-3 mb-6">
              <div className="drawer-scrollbar">
                {teamData?.map((team: any, index: any) => {
                  const isMemberCollaborator = team?.members?.find(
                    (member: any) =>
                      workspaceRowData?.projects?.some(
                        (project: any) =>
                          project?.lead_user_id &&
                          project?.lead_user_id !== project?.owner_user_id
                      )
                  );
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between my-[12px] ">
                        <div className="flex items-center gap-[12px] ">
                          <p className="text-[13px] leading-[19.5px] font-normal overflow-hidden max-w-[200px] text-ellipsis  ">
                            {team?.teams?.name}
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
                                        team?.teams?.id?.toString() as any
                                      )}
                                      disabled={
                                        !!isMemberCollaborator &&
                                        workspaceRowData?.teams
                                          ?.map((team: any) =>
                                            team?.team_id?.toString()
                                          )
                                          ?.includes(
                                            team?.teams?.id?.toString() as any
                                          )
                                      }
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([
                                            ...field.value,
                                            team.teams.id?.toString(),
                                          ]);
                                        } else {
                                          field.onChange(
                                            field.value.filter(
                                              (id: any) =>
                                                id &&
                                                id.toString() !==
                                                  team?.teams?.id?.toString()
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
                            {isMemberCollaborator &&
                              workspaceRowData?.teams
                                ?.map((team: any) => team?.team_id?.toString())
                                ?.includes(
                                  team?.teams?.id?.toString() as any
                                ) && (
                                <TooltipContent>
                                  <p className="text-[11px] font-normal">
                                    Cannot remove team with active lead users
                                  </p>
                                </TooltipContent>
                              )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <hr className="border-tableBorder" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isTeamLoading && (
            <Popover open={open} onOpenChange={setOpen}>
              <h3 className="text-[14px] font-semibold mb-1 uppercase">
                Collaborators
              </h3>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between hover:bg-inputBackground border border-tableBorder  relative h-auto min-h-10 flex items-center rounded-md  bg-inputBackground px-3 py-2 text-sm "
                >
                  <div className="flex flex-wrap gap-1 ">
                    {selectedValues?.length === 0 ? (
                      <span className="text-[#666666] dark:text-[#93a1b6] font-light ">
                        Select Members
                      </span>
                    ) : (
                      selectedValues?.map(
                        (option: { id: string; email: string }) => {
                          const isLeadUser =
                            workspaceRowData?.projects?.some(
                              (project: any) =>
                                project?.lead_user_id &&
                                project?.lead_user_id === option?.id &&
                                project?.lead_user_id !== project?.owner_user_id
                            ) &&
                            workspaceRowData?.teams
                              ?.filter((team: any) => team.users)
                              .map((team: any) => team.users)
                              ?.map((item: any) => item?.id)
                              ?.includes(option?.id);
                          const tooltipMessage = isLeadUser
                            ? "Please remove lead role before removing"
                            : "";

                          return (
                            <TooltipProvider key={option.email}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`border border-tableBorder rounded px-1 py-0.5 text-[11px] flex items-center gap-1 ${
                                      isLeadUser
                                        ? "bg-blue-100 text-[#0f6fff] opacity-50"
                                        : "bg-blue-100 dark:bg-[#1f2d32] text-[#0f6fff]"
                                    }`}
                                  >
                                    {option.email}
                                    <X
                                      className={`h-3 w-3 ${
                                        isLeadUser
                                          ? "opacity-50 cursor-not-allowed"
                                          : "hover:text-red-500 cursor-pointer"
                                      }`}
                                      onClick={(e) => {
                                        if (!isLeadUser) {
                                          removeValue(option, e);
                                        }
                                      }}
                                    />
                                  </div>
                                </TooltipTrigger>
                                {isLeadUser && (
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
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-inputBackground"
                align="start"
                ref={popoverRef}
              >
                {filteredOptions.length > 0 && (
                  <div className="p-2">
                    <Label className="text-[11px] pt-2 font-semibold mb-1 uppercase">
                      Add Existing Collaborators
                    </Label>
                  </div>
                )}
                <div className="">
                  <div className="p-2 space-y-1">
                    {isTeamLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader variant="threeDot" size="lg" />
                      </div>
                    ) : (
                      <div className="space-y-4 ">
                        <div className=" max-h-[180px] overflow-y-auto">
                          {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-gray-500">
                              No emails found
                            </div>
                          ) : (
                            filteredOptions.map((option) => {
                              const isSelected = selectedValues?.find(
                                (el) => el.email === option.email
                              );
                              const isLeadUser =
                                workspaceRowData?.projects?.some(
                                  (project: any) =>
                                    project?.lead_user_id &&
                                    project?.lead_user_id === option?.id &&
                                    project?.lead_user_id !==
                                      project?.owner_user_id
                                ) &&
                                selectedValues
                                  ?.map((item: any) => item?.id)
                                  .includes(option?.id);
                              return (
                                <div
                                  key={option.EmailSelectedFIlters}
                                  className={`flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer
                      ${
                        isSelected
                          ? "bg-blue-50  dark:bg-[#1f2d32]"
                          : "hover:bg-gray-100 dark:hover:bg-[#2d3c42]"
                      }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(option, e);
                                  }}
                                >
                                  <div
                                    className={`flex h-4 w-4 items-center justify-center rounded-sm border
                      ${
                        isSelected
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
                                      ${isSelected && "text-[#0f6fff]"}
                                    `}
                                  >
                                    {option.email}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <hr className=" border border-tableBorder " />
                        <div className=" ">
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
                              onClick={handleAddNewEmail}
                              type="button"
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

          <div className="flex gap-6 justify-end items-center py-6">
            <Button
              className="rounded-[20px] text-[#0E70FF] border-[#0E70FF]"
              variant={"outline"}
              onClick={() => handleDrawerClose()}
            >
              Cancel
            </Button>
            <Button
              className=" rounded-[26px] btn text-white"
              disabled={isLoading || isTeamLoading}
            >
              {isLoading ? (
                <Loader variant="threeDot" size="lg" />
              ) : workspaceRowData ? (
                " Save Changes"
              ) : (
                "Add Workspace"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WorkspaceDrawer;
