"use client";
import React, { useEffect, useState, useRef } from "react";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TableBody,
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableHeaderItem from "@/components/coman/TableHeaderItem";
import Pagination from "@/utils/components/pagination";
import { ClipboardList, Share2, SquarePen, Trash2 } from "lucide-react";
import WorkspaceDrawer from "@/components/coman/WorkspaceDrawer";
import {
  deleteWorkspace,
  getWorkspacesByUser,
  updateWorkspaces,
} from "@/apis/workspaces";
import { TbSwitch2 } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import {
  addAllWorkspaces,
  addCurrentWorkSpace,
} from "@/reducer/services/workspaceSlice";
import { Loader } from "rizzui";
import { formatTableDate } from "@/utils/formatDate";
import DeleteModal from "@/components/coman/DeleteModal";
import toast from "react-hot-toast";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getOrganizationTeam } from "@/apis/team";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

const Workspace = () => {
  const MAX_VISIBLE_AVATARS = 3;
  const { socket } = useSocket();
  const users = useSelector((state: RootState) => state.user);
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [workspaceRowData, setWorkspaceRowData] = useState<any>(null);
  const [workspaces, setWorkSpaces] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteItem, setIsDeleteItem] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [pageNo, setPageNo] = useState<any>(1);
  const [limit] = useState<any>(10);
  const [isWorkspaceDeletable, SetIsWorkspaceDeletable] =
    useState<boolean>(false);
  const [teamMembers, setTeamMembers] = useState<any>([]);
  const [isOrganizationSwitchOpen, setIsOrganizationSwitchOpen] =
    useState<boolean>(false);
  const [newOrganization, setNewOrganization] = useState<any>(null);
  const [organizationData, setOrganizationData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isWorkspaceOrgSwitch, setIsWorkspaceOrgSwitch] = useState(false);
  const { user } = useSelector((state: RootState) => state.user?.user || "");

  const handleDeleteWorkspace = async () => {
    setIsDeleteLoading(true);

    try {
      let result: any;
      result = await deleteWorkspace(isDeleteItem);
      if (result) {
        toast.success(`workspace deleted successfully.`);
        setIsDeleteItem("");
        handleGetWorkSpaces();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleGetWorkSpaces = async (restrictRefresh?: boolean) => {
    try {
      if (users && users !== null) {
        if (!restrictRefresh) {
          setIsLoading(true);
        }

        let response = await getWorkspacesByUser({ pageNo, limit });
        if (response?.data?.isSuccess) {
          setWorkSpaces(response?.data?.data);
          setTeamMembers(response?.data?.data?.members);
        }
      }
    } catch (error: any) {
      setIsLoading(false);
      setWorkSpaces([]);
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
      console.error("Error fetching workspaces data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGetAllOrganization = async () => {
    try {
      setLoading(true);
      let response: any = await getOrganizationTeam({});
      if (response?.success === false) {
        toast.error(response?.message);
      }
      setOrganizationData(response?.data?.organizations);
    } catch (error: any) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetWorkSpaces();
  }, [pageNo]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    if (socket) {
      socket.on("fileProcessing", (fileProcessing: any) => {
        handleGetWorkSpaces(true);
      });

      socket.on("WorkspaceDeleted", (WorkspaceDeleted: any) => {
        handleGetWorkSpaces(true);
      });
      socket.on("projectDeleted", (projectDeleted: any) => {
        handleGetWorkSpaces(true);
      });

      socket.on("collaboratorUpdated", (collaboratorUpdated: any) => {
        handleGetWorkSpaces(true);
      });
      return () => {
        socket.off("fileProcessing");
        socket.off("WorkspaceDeleted");
        socket.off("projectDeleted");
        socket.off("collaboratorUpdated");
      };
    }
  }, [socket]);
  useEffect(() => {
    handleGetAllOrganization();
  }, [isOrganizationSwitchOpen]);

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
  }, [user?.id]);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setWorkspaceRowData(null);
  };
  const handlePageChange = (newPage: number) => {
    setPageNo(newPage);
  };

  const handleWorkspaceOrgSwitch = async (e: any) => {
    e.preventDefault();
    setIsWorkspaceOrgSwitch(true);
    try {
      const response = await updateWorkspaces({
        data: { organization_id: newOrganization?.id },
        id: workspaceRowData?.workspaces?.id,
      });
      if (response) {
        toast.success(response?.data?.message);
        handleGetWorkSpaces(true);
        setWorkspaceRowData(null);
        setNewOrganization(null);
        setIsOrganizationSwitchOpen(false);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsWorkspaceOrgSwitch(false);
    }
  };
  return (
    <>
      <main className="flex flex-1 flex-col w-full max-w-[calc(100%-30px)] mx-auto lg:gap-6 ">
        <h1 className="text-base font-medium">Workspace Management</h1>

        <div>
          <Card className="bg-secondaryBackground border-tableBorder  pb-1My Account">
            <CardHeader className="px-0">
              <div className="flex justify-between items-center px-4">
                <div className="flex items-center ">
                  <CardTitle className=" text-sm font-medium">
                    My Workspace
                  </CardTitle>
                </div>
                <Button
                  className=" rounded-[26px] btn text-white"
                  onClick={() => setIsDrawerOpen(true)}
                >
                  + Add New Workspace
                </Button>
              </div>
            </CardHeader>
            <>
              <div>
                <Table className="w-full px-0">
                  <TableHeader className="relative">
                    <TableRow className="bg-greyTh hover:bg-greyTh   ">
                      <TableHead className="text-[11px] font-semibold">
                        <TableHeaderItem columnName={"NAME"} fieldName="name" />
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold">
                        <TableHeaderItem
                          columnName={"PROJECT"}
                          fieldName="project"
                        />
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold">
                        <TableHeaderItem
                          columnName={"CREATED"}
                          fieldName="created"
                        />
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold">
                        <TableHeaderItem
                          columnName={"LAST MODIFIED"}
                          fieldName="lastModified"
                        />
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold">
                        <TableHeaderItem
                          columnName={"COLLABORATORS & TEAMS"}
                          fieldName="collaborators"
                        />
                      </TableHead>

                      <TableHead className="text-[11px] font-semibold">
                        ACTION
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <>
                    {isLoading ||
                    (workspaces?.workspaces &&
                      workspaces?.workspaces?.length === 0) ? (
                      isLoading ? (
                        <>
                          <TableCell className="font-medium" />
                          <TableCell className="font-medium" />
                          <TableCell className="font-medium" />
                          <div className="flex justify-center items-center h-64">
                            <Loader variant="threeDot" size="lg" />
                          </div>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium" />
                          <TableCell className="font-medium" />
                          <TableCell className="font-medium" />
                          <div className="flex justify-center items-center h-64">
                            No Data Found
                          </div>
                        </>
                      )
                    ) : (
                      <>
                        <TableBody>
                          {workspaces?.workspaces?.map(
                            (workspace: any, index: number) => (
                              <TableRow
                                key={index}
                                className="cursor-pointer "
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/projects/${workspace?.id}`);
                                }}
                              >
                                <TableCell className="text-xs font-normal">
                                  {`${
                                    workspace?.is_default_workspace
                                      ? workspace?.name + " (Default Workspace)"
                                      : workspace.type &&  workspace.type !== "owner"  ? workspace?.name + " (Shared Workspace)":
                                      workspace?.name 
                                      
                                        
                                  }`}
                                </TableCell>
                                <TableCell className="text-xs font-normal">
                                  <div className="break-words text-justify overflow-hidden">
                                    {workspace?.projects?.length}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs font-normal">
                                  {formatTableDate(workspace?.created_at)}
                                </TableCell>
                                <TableCell className="text-xs font-normal">
                                  {formatTableDate(workspace?.updated_at)}
                                </TableCell>
                                <TableCell className="text-xs font-normal">
                                  {!workspace?.is_default_workspace ? (
                                    <div className="flex -space-x-4">
                                      {workspace?.teams?.map(
                                        (team: any, index: number) => (
                                          <div
                                            className="w-[36px] h-[36px] border-2 border-[#fff] rounded-full object-cover bg-[#F59B14] flex justify-center text-center items-center"
                                            key={team?.id}
                                          >
                                            {team?.teams?.name ? (
                                              <span>
                                                {team?.teams?.name
                                                  ?.charAt(0)
                                                  .toUpperCase()}
                                              </span>
                                            ) : (
                                              <OptimizedImage
                                                src={team?.users?.profile_image}
                                                alt="team"
                                                width={
                                                  ImageSizes.avatar.lg.width
                                                }
                                                height={
                                                  ImageSizes.avatar.lg.height
                                                }
                                                className="rounded-full"
                                              />
                                            )}
                                          </div>
                                        )
                                      )}

                                      {+workspace?.owner_user_id ===
                                        +users?.user?.user?.id && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setWorkspaceRowData(workspace);
                                            setIsDrawerOpen(true);
                                          }}
                                          className="w-[36px] h-[36px] flex items-center text-2xl justify-center border border-[#D5D5D5]  bg-white  text-[#007EEF] rounded-full"
                                        >
                                          +
                                        </button>
                                      )}
                                    </div>
                                  ) : workspace?.is_default_workspace ? (
                                    "Not Shareable"
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>

                                <TableCell>
                                  <div className="flex flex-row gap-4">
                                    <Share2
                                      width={18}
                                      height={18}
                                      color="#666666"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsDrawerOpen(true);
                                      }}
                                    />

                                    {+workspace?.owner_user_id ===
                                      +users?.user?.user?.id &&
                                      organizationData?.length > 1 && (
                                        <TbSwitch2
                                          className="w-[18px] h-[18px]"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOrganizationSwitchOpen(true);
                                            setWorkspaceRowData(workspace);
                                          }}
                                          color="#666666"
                                        />
                                      )}
                                   
                                    {+workspace?.owner_user_id ===
                                      +users?.user?.user?.id && (
                                      <SquarePen
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setWorkspaceRowData(workspace);
                                          setIsDrawerOpen(true);
                                        }}
                                        width={18}
                                        height={18}
                                        color="#666666"
                                      />
                                    )}
                                    {+workspace?.owner_user_id ===
                                      +users?.user?.user?.id &&
                                      !workspace?.is_default_workspace && (
                                        <Trash2
                                          color="#666666"
                                          className="order-3"
                                          width={18}
                                          height={18}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            SetIsWorkspaceDeletable(
                                              !!workspace?.projects?.length
                                            );
                                            setIsDeleteItem(workspace?.id);
                                          }}
                                        />
                                      )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                        <div className="my-8">
                          <Pagination
                            total={workspaces?.count}
                            current={pageNo}
                            onChange={handlePageChange}
                          />
                        </div>
                      </>
                    )}
                  </>
                </Table>
              </div>
            </>
          </Card>
        </div>
      </main>

      {isDrawerOpen && (
        <WorkspaceDrawer
          workspaceRowData={workspaceRowData}
          handleDrawerClose={handleDrawerClose}
          allMembers={teamMembers}
          isFetch={handleGetWorkSpaces}
        />
      )}
      <DeleteModal
        isDeleteItem={!!isDeleteItem}
        setIsDeleteItem={setIsDeleteItem}
        loading={isDeleteLoading}
        handleDelete={handleDeleteWorkspace}
        Title={"Delete Workspace"}
        heading={"Are you sure you want to delete this Workspace?"}
        subheading={
          "Projects, Papers and folder associated with this workspace will also be deleted."
        }
        message={"This action cannot be undone."}
        isDeletable={isWorkspaceDeletable}
      />
    </>
  );
};

export default Workspace;
