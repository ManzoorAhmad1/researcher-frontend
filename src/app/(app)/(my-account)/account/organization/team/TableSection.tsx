import React, { useState, useRef, useEffect } from "react";
import { Edit, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader } from "rizzui";
import moment from "moment";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { deleteTeam, updateTeamApi } from "@/apis/team";
import Pagination from "@/utils/components/pagination";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import { useSelector, shallowEqual } from "react-redux";
interface Team {
  teams: {
    id: number;
    name: string;
    description: string;
    created_at: string;
  };
  memberCount: number;
  invitations: { count: number }[] | [];
}
interface FormData {
  name: string;
  description: string;
  team_id?: number;
}

interface TableSectionProps {
  getTeam: () => Promise<void>;
  teamData: Team[];
  loading: boolean;
  setPageNo: (value: any) => void;
  pageNo: any;
  limit: any;
  totalTeams: any;
  setSearchQuery: (value: any) => void;
  searchQuery: any;
}

export const TableSection: React.FC<TableSectionProps> = ({
  getTeam,
  teamData,
  loading,
  setPageNo,
  pageNo,
  totalTeams,
  searchQuery,
  setSearchQuery,
}) => {
  const router = useRouter();
  const refModel = useRef(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);

  const accountType = useSelector(
    (state: any) => state.user?.user?.user?.account_type,
    shallowEqual
  );
  const [allowEdit, SetAllowEdit] = useState<boolean>(false);
  useEffect(() => {
    if (accountType === "owner") {
      SetAllowEdit(true);
    }
  }, []);

  const methods = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = methods;

  const handleDialogContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredTeams =
    teamData?.filter((team: any) => {
      if (!team?.teams?.name || !searchQuery) return true;
      return team?.teams?.name
        ?.toLowerCase()
        ?.includes(searchQuery?.toLowerCase() || "");
    }) || [];

  const handleRowClick = (
    id: number,
    name: string,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (refModel.current === e.currentTarget) {
    } else {
    }
    router.push(
      `/account/organization/team/member?id=${id}&name=${encodeURIComponent(
        name
      )}`
    );
  };
  //
  const handleDeleteTeam = async () => {
    if (selectedTeamId) {
      setDeleteLoading(true);
      try {
        const response = await deleteTeam(selectedTeamId.toString());
        setIsDeleteDialogOpen(false);
        setSelectedTeamId(null);
        await getTeam();
        if (response) {
          toast.success(response?.message);
        }
      } catch (error: any) {
        console.error("Failed to delete team:", error.message);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleEditSubmit: SubmitHandler<FormData> = async (data) => {
    if (editTeam) {
      setEditLoading(true);
      try {
        const response: any = await updateTeamApi({
          ...data,
          team_id: editTeam.teams.id,
        });
        if (response?.success === false) {
          toast.error(response?.message);
        }
        setEditDialogOpen(false);
        setEditTeam(null);
        await getTeam();
        if (response?.data?.message) {
          toast.success(response.data.message);
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setEditLoading(false);
      }
    }
  };

  const openEditDialog = (team: Team) => {
    setEditTeam(team);
    setValue("name", team.teams.name);
    setValue("description", team.teams.description);
    setValue("team_id", team.teams.id);
    setEditDialogOpen(true);
  };
  const handlePageChange = (newPage: number) => {
    setPageNo(newPage);
  };

  return (
    <Tabs defaultValue="users">
      <Card>
        <CardHeader>
          <CardTitle>All Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 gap-4">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-500">
                <OptimizedImage
                  src={
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//search.svg`
                  }
                  alt="search icon"
                  width={ImageSizes.icon.xs.width}
                  height={ImageSizes.icon.xs.height}
                />
              </span>

              <input
                id="content"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-inputBackground border outline-none tableBorder text-foreground text-sm rounded-full block w-full pl-10 p-2.5"
                required
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto max-w-[1500px]">
              {filteredTeams.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="font-semibold text-lg text-center">
                  You have not created any organization team yet. Begin by creating one.
                  </p>
                </div>
              ) : (
                <Table className="px-4">
                  <TableHeader className="px-4">
                    <TableRow>
                      <TableHead className="max-w-[8px]"># No.</TableHead>
                      <TableHead className="w-[50px]">Name</TableHead>
                      <TableHead className="w-[100px]">Description</TableHead>
                      <TableHead className="w-[100px]">Members</TableHead>
                      <TableHead className="w-[100px] min-w-[100px]">
                        Created
                      </TableHead>
                      {allowEdit && (
                        <TableHead className="w-[80px] min-w-[80px]">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.map((team: any, index: number) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer font-normal"
                      >
                        <TableCell className="w-[8px]">{index + 1}</TableCell>
                        <TableCell
                          className=""
                          onClick={(e) =>
                            handleRowClick(team.teams.id, team.teams.name, e)
                          }
                        >
                          {team.teams.name}
                        </TableCell>
                        <TableCell>
                          <div className="break-words text-justify overflow-hidden">
                            {team.teams.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="break-words text-justify overflow-hidden">
                            {team?.memberCount || 0}
                          </div>
                        </TableCell>
                        <TableCell className="">
                          {moment(team.teams.created_at).format("MMMM Do YYYY")}
                        </TableCell>
                        {allowEdit && (
                          <TableCell className="flex justify-start">
                            <div className="flex space-x-4">
                              <OptimizedImage
                                onClick={(e) =>
                                  handleRowClick(
                                    team.teams.id,
                                    team.teams.name,
                                    e
                                  )
                                }
                                src={
                                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//view.png`
                                }
                                height={ImageSizes.icon.sm.height}
                                width={ImageSizes.icon.sm.width}
                                alt="View"
                              />
                              <Edit
                                className="w-4 h-4 text-black-500 cursor-pointer"
                                onClick={() => openEditDialog(team)}
                              />
                              <span
                                onClick={() => {
                                  setSelectedTeamId(team.teams.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="gap-4"
                              >
                                <Trash className="w-4 h-4 text-red-500 cursor-pointer" />
                              </span>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent onClick={handleDialogContentClick}>
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <p>
              Are you sure you want to delete this team? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              className="rounded-[26px]"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-[26px] text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTeam();
              }}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader variant="threeDot" size="lg" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent onClick={handleDialogContentClick}>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(handleEditSubmit)}
              className="grid gap-4"
            >
              <div className="grid gap-2 relative">
                <Label htmlFor="name">Team Name</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter team name"
                        {...register("name", {
                          required: "Team name is required",
                        })}
                      />
                    </TooltipTrigger>
                    {errors.name && (
                      <TooltipContent>{errors.name.message}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="description">Description</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Textarea
                        id="description"
                        placeholder="Enter team description"
                        {...register("description", {
                          required: "Description is required",
                        })}
                      />
                    </TooltipTrigger>
                    {errors.description && (
                      <TooltipContent>
                        {errors.description.message}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex justify-between gap-2">
                <DialogClose asChild>
                  <Button
                    variant="secondary"
                    className="rounded-[26px]"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" className="rounded-[26px] btn text-white">
                  {editLoading ? (
                    <Loader variant="threeDot" size="lg" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
      <div className="mt-8">
        <Pagination
          total={totalTeams?.totalTeams}
          defaultCurrent={pageNo}
          onChange={handlePageChange}
        />
      </div>
    </Tabs>
  );
};

export default TableSection;
