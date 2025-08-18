"use client";
import React, { useEffect, useState } from "react";

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
import { deleteWorkspace, getWorkspacesByUser } from "@/apis/workspaces";
import useSocket from "../info/[...slug]/socket";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { addAllWorkspaces } from "@/reducer/services/workspaceSlice";
import { Loader } from "rizzui";
import { formatTableDate } from "@/utils/formatDate";
import DeleteModal from "@/components/coman/DeleteModal";
import toast from "react-hot-toast";
import { OptimizedImage } from "@/components/ui/optimized-image";

const WorkspaceTableSection = () => {
  const { socket } = useSocket();
  const users = useSelector((state: RootState) => state.user);
  const dispatch: AppDispatch = useDispatch();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [workspaceRowData, setWorkspaceRowData] = useState(null);
  const [workspaces, setWorkSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteItem, setIsDeleteItem] = useState("");
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isWorkspaceDeletable, SetIsWorkspaceDeletable] =
    useState<boolean>(false);
  const [teamMembers, setTeamMembers] = useState<any>([]);

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

        let response = await getWorkspacesByUser();

        if (response?.data?.isSuccess) {
          // const workspacesWithProjects =
          //   response?.data?.workspaces?.data?.filter(
          //     (workspace: any) =>
          //       workspace?.workspaces?.user_projects &&
          //       workspace?.workspaces?.user_projects?.length > 0
          //   );
          dispatch(addAllWorkspaces(response?.data?.workspaces?.data));

          setWorkSpaces(response?.data?.workspaces?.data);
          setTeamMembers(response?.data?.workspaces?.members);
        }
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Error fetching workspaces data:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    handleGetWorkSpaces();
  }, []);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    if (socket) {
      socket.on("fileProcessing", (fileProcessing: any) => {
        handleGetWorkSpaces();
      });
      return () => {
        socket.off("fileProcessing");
      };
    }
  }, [socket]);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setWorkspaceRowData(null);
  };
  return (
    <>
      <Card className="border-[0.5px] border-tableBorder ">
        <CardHeader className="px-0">
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center ">
              <CardTitle className=" text-sm font-medium text-muted-foreground">
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
                <TableRow className="bg-[#E5E5E5] hover:bg-[#E5E5E5] text-[11px] font-semibold">
                  <TableHead>
                    <TableHeaderItem columnName={"NAME"} fieldName="name" />
                  </TableHead>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"PROJECT"}
                      fieldName="project"
                    />
                  </TableHead>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"CREATED"}
                      fieldName="created"
                    />
                  </TableHead>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"LAST MODIFIED"}
                      fieldName="lastModified"
                    />
                  </TableHead>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"COLLABORATORS"}
                      fieldName="collaborators"
                    />
                  </TableHead>

                  <TableHead>ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <>
                {isLoading || (workspaces && workspaces.length === 0) ? (
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
                    <></>
                  )
                ) : (
                  <>
                    <TableBody>
                      {workspaces.map((workspace: any, index: number) => (
                        <TableRow
                          key={index}
                          className="cursor-pointer text-xs font-normal "
                        >
                          <TableCell className="font-medium">
                            {workspace?.workspaces?.name}
                          </TableCell>
                          <TableCell>
                            <div className="break-words text-justify overflow-hidden">
                              {workspace?.workspaces?.user_projects?.length}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatTableDate(workspace?.workspaces?.created_at)}
                          </TableCell>
                          <TableCell>
                            {formatTableDate(workspace?.workspaces?.updated_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2 relative">
                              {workspace?.collaborators?.map(
                                (collaborator: any, index: number) => (
                                  <OptimizedImage
                                    key={collaborator?.user?.id}
                                    className={`w-8 h-8 border-1 border-[#fff]  rounded-full object-cover z-${
                                      index + 100
                                    }`}
                                    src={
                                      collaborator?.user?.avatar ||
                                      "https://lh3.googleusercontent.com/a/default-user=s64"
                                    }
                                    alt={collaborator?.user?.email}
                                    title={collaborator?.user?.email}
                                    width={32}
                                    height={32}
                                    style={{
                                      position: "relative",
                                      left: `${index * -12}px`,
                                    }}
                                  />
                                )
                              )}

                              <button
                                onClick={() => {
                                  setWorkspaceRowData(workspace);
                                  setIsDrawerOpen(true);
                                }}
                                style={{
                                  position: "relative",
                                  left: `${teamMembers.length * -11}px`,
                                  zIndex: teamMembers.length + 10,
                                }}
                                className="min-w-8 h-8 flex items-center text-2xl justify-center border border-[#D5D5D5]  bg-white  text-[#007EEF] rounded-full"
                              >
                                +
                              </button>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-row gap-4">
                              <Share2 width={18} height={18} color="#666666" />
                              <ClipboardList
                                width={18}
                                height={18}
                                color="#666666"
                              />
                              <SquarePen
                                onClick={() => {
                                  setWorkspaceRowData(workspace);
                                  setIsDrawerOpen(true);
                                }}
                                width={18}
                                height={18}
                                color="#666666"
                              />
                              <Trash2
                                color="#666666"
                                className="order-3"
                                width={18}
                                height={18}
                                onClick={() => {
                                  SetIsWorkspaceDeletable(
                                    !!workspace?.workspaces?.user_projects
                                      ?.length
                                  );
                                  setIsDeleteItem(workspace?.workspaces?.id);
                                }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <div className="my-8">
                      <Pagination />
                    </div>
                  </>
                )}
              </>
            </Table>
          </div>
        </>
      </Card>
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
          "Projects,Papers and folder associated with this workspace will also be deleted."
        }
        message={"This action cannot be undone."}
        isDeletable={isWorkspaceDeletable}
      />
    </>
  );
};

export default WorkspaceTableSection;
