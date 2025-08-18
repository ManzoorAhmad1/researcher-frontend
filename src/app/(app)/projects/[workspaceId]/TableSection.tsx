"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteProject, getProjectByWorkspace } from "@/apis/projects";
import {
  TableBody,
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDebounce from "@/hooks/useDebounce";
import { Loader } from "rizzui";
import { ChevronLeft, SquarePen, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ProjectsDialogForm from "./ProjectsDialogForm";
import moment from "moment";
import TableHeaderItem from "@/components/coman/TableHeaderItem";
import { useParams, useRouter } from "next/navigation";
import Pagination from "@/utils/components/pagination";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import DeleteModal from "@/components/coman/DeleteModal";
import useSocket from "../../info/[...slug]/socket";

const TableSection = () => {
  const [projects, setProjects] = useState<any>([]);
  const [project, setProject] = useState<any>(null);
  const [limit, setLImit] = useState<any>(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpenAddTemplate, setIsOpenAddTemplate] = useState(false);
  const [sortDirection, setSortDirection] = useState<string>("DESC");
  const [orderBy, setOrderBy] = useState<string>("updated_at");
  const searchRef: any = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce<string>(searchQuery, 1000);
  const [pageNo, setPageNo] = useState(1);
  const params: { workspaceId: string } = useParams();
  const router = useRouter();
  const [isDeleteItem, setIsDeleteItem] = useState("");
  const currentProject = useSelector((state: any) => state?.project);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const user = useSelector((state: any) => state.user?.user?.user);
  const currentWorkspace = useSelector((state: any) => state?.workspace);
  const [isAddProjectAllowed, setIsAddProjectAllowed] = useState(false);
  const [workspace, setWorkspace] = useState<any>(null);
  const { socket } = useSocket();
  useEffect(() => {
    const isOwnerWorksapce = currentWorkspace?.allWorkspaces?.find(
      (workspace: any) =>
        workspace?.owner_user_id === user?.id &&
        params?.workspaceId === workspace?.id
    );

    setIsAddProjectAllowed(!!isOwnerWorksapce);
  }, [currentWorkspace]);
  useEffect(() => {
    setPageNo(1);
    handleGetProjectsByWorkSpaceId();
  }, [debouncedQuery]);

  useEffect(() => {
    if (searchRef.current && !loading) {
      searchRef.current.focus();
    }
  }, [loading]);
  useEffect(() => {
    const workspace = currentWorkspace?.allWorkspaces?.find(
      (workspace: any) => params?.workspaceId === workspace?.id
    );
    setWorkspace(workspace);
  }, [params?.workspaceId, currentWorkspace]);
  const handleGetProjectsByWorkSpaceId = async (restrictRefresh?: boolean) => {
    try {
      if (!restrictRefresh) {
        setLoading(true);
      }

      let response: any = await getProjectByWorkspace({
        workspaceId: params?.workspaceId,
        pageNo,
        limit,
        search: searchQuery,
        orderBy,
        orderDirection: sortDirection,
      });
      if (response?.success === false) {
        toast.error(response?.message);
      }
      setProjects(response?.data);
    } catch (error: any) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetProjectsByWorkSpaceId();
  }, [limit, pageNo]);

  useEffect(() => {
    handleGetProjectsByWorkSpaceId(true);
  }, [orderBy, sortDirection]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    if (socket) {
      socket.on("projectDeleted", (projectDeleted: any) => {
        handleGetProjectsByWorkSpaceId();
      });
      return () => {
        socket.off("projectDeleted");
      };
    }
  }, [socket]);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handelSorting = (orderBy: string) => {
    setPageNo(1);
    setSortDirection((prev) => (prev === "DESC" ? "ASC" : "DESC"));
    setOrderBy(orderBy);
  };

  const handlePageChange = (newPage: number) => {
    setPageNo(newPage);
  };
  const handleDeleteProject = async () => {
    setIsDeleteLoading(true);

    try {
      let result: any;
      result = await deleteProject(isDeleteItem);
      if (result) {
        toast.success(` deleted successfully.`);
        setIsDeleteItem("");
        handleGetProjectsByWorkSpaceId();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsDeleteLoading(false);
    }
  };
  return (
    <>
      <Card className="bg-secondaryBackground px-4  ">
        <CardHeader className="px-0">
          <div className="flex justify-between items-center ">
            <div className="flex items-center ml-[-15px] mt-4 ">
              <ChevronLeft
                onClick={() => router.back()}
                className="cursor-pointer "
                size={30}
              />
              <CardTitle className="ml-[-6px]">Projects</CardTitle>
            </div>
            {isAddProjectAllowed && (
              <Button
                onClick={() => setIsOpenAddTemplate(true)}
                className="mt-4 rounded-[26px] btn"
              >
                + Create New project
              </Button>
            )}
          </div>
          {loading ? (
            <Loader variant="threeDot" size="sm" />
          ) : (
            <h5 className=" text-sm font-medium ml-2.5">
              {workspace?.workspaces?.name}
            </h5>
          )}
        </CardHeader>
        <>
          <div className="overflow-x-auto max-w-[1500px]">
            <div className="flex items-center justify-between pb-1">
              <div className="flex mb-1 max-w-sm gap-4">
                <div className="relative w-full">
                  <input
                    ref={searchRef}
                    autoFocus
                    disabled={loading}
                    type="text"
                    id="simple-search"
                    onChange={(e) => handleSearchChange(e)}
                    value={searchQuery}
                    className="bg-inputBackground border outline-none border-tableBorder text-foreground  text-sm rounded-lg block w-full p-2.5"
                    placeholder="Search Projects..."
                    required
                  />
                </div>
              </div>
            </div>

            <Table className="w-full px-0">
              <TableHeader className="relative bg-greyTh hover:bg-greyTh">
                <TableRow>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"Project Name"}
                      handelSorting={handelSorting}
                      fieldName="name"
                    />
                  </TableHead>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"Created At"}
                      handelSorting={handelSorting}
                      fieldName="updated_at"
                    />
                  </TableHead>

                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <>
                {loading || projects?.projects?.length === 0 ? (
                  <TableBody>
                    <TableCell />
                    <TableCell>
                      {loading ? (
                        <div className="flex justify-center items-center h-64">
                          <Loader variant="threeDot" size="lg" />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center h-64">
                          <p className="text-center text-wrap lg:text-nowrap">
                          You have not created any project yet. Begin by creating one.
                          </p>
                        </div>
                      )}
                    </TableCell>
                  </TableBody>
                ) : (
                  <>
                    <TableBody>
                      {projects?.projects?.map((temp: any, index: number) => {
                        return (
                          <TableRow
                            key={index}
                            className="cursor-pointer font-normal"
                          >
                            <TableCell className="font-medium">
                              {temp?.name}
                            </TableCell>
                            <TableCell>
                              <div className="break-words text-justify overflow-hidden">
                                {moment(temp?.updated_at).format(
                                  "MMMM Do YYYY"
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex flex-row gap-4">
                                <SquarePen
                                  onClick={() => {
                                    setIsOpenAddTemplate(true);
                                    setProject(temp);
                                  }}
                                />
                                {currentProject?.project?.id !== temp?.id &&
                                  temp?.owner_user_id === user?.id &&
                                  !temp?.is_default_project && (
                                    <Trash2
                                      color="red"
                                      className="order-3"
                                      onClick={() => setIsDeleteItem(temp?.id)}
                                    />
                                  )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <div className="my-8">
                      <Pagination
                        total={projects?.count}
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
        {isOpenAddTemplate && (
          <ProjectsDialogForm
            project={project}
            isOpen={isOpenAddTemplate}
            refetch={handleGetProjectsByWorkSpaceId}
            onOpenChange={() => {
              setIsOpenAddTemplate(false);
              setProject(null);
            }}
          />
        )}

        <DeleteModal
          isDeleteItem={!!isDeleteItem}
          setIsDeleteItem={setIsDeleteItem}
          loading={isDeleteLoading}
          handleDelete={handleDeleteProject}
          Title={"Delete Project"}
          heading={"Are you sure you want to delete this Project?"}
          subheading={`Papers associated with this project will also be deleted.${
            projects?.projects?.length === 1
              ? `Once the projects is deleted you will not be able to switch the workspace because atleast one project is needed to switch the workspace.`
              : ""
          }`}
          message={"This action cannot be undone."}
        />
      </Card>
    </>
  );
};

export default TableSection;
