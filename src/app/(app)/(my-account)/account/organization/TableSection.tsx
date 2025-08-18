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
import { updateOrganizationApi } from "@/apis/team";
import Pagination from "@/utils/components/pagination";
import { useSelector, shallowEqual } from "react-redux";
import { deleteOrganization } from "@/apis/team";
import DeleteModal from "@/components/coman/DeleteModal";
import { updateUser } from "@/apis/user";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface Team {
  name: string;
  description: string;
  created_at: string;
  id: number;
  email: string;
  phone: any;
  members: number;
  teams_count: number;
  owner_id: number;
  teams: {
    count: { id: number }[];
    id: number;
  }[];
}

interface FormData {
  name: string;
  description: string;
  id?: number;
  phone: string;
  email: string;
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
  const [optExpireTime, setOptExpireTime] = useState<string | null>(null);
  const [isOTPExpired, setIsOTPExpired] = useState(false);
  const [allowEdit, SetAllowEdit] = useState<boolean>(false);
  const accountType = useSelector(
    (state: any) => state.user?.user?.user?.account_type,
    shallowEqual
  );
  const userData = useSelector(
    (state: any) => state.user?.user?.user,
    shallowEqual
  );
  useEffect(() => {
    if (accountType === "owner") {
      SetAllowEdit(true);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (optExpireTime && optExpireTime !== null) {
      interval = setInterval(() => {
        const nowUTC = new Date().toISOString();
        const expireDate = new Date(optExpireTime);
        if (new Date(nowUTC) >= new Date(expireDate)) {
          setIsOTPExpired(true);
        }
      }, 1000); // Update every second
    }
    return () => clearInterval(interval);
  }, [optExpireTime]);

  const methods = useForm<FormData>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
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

  const filteredTeams = React.useMemo(() => {
    if (!teamData) return [];

    const searchTerm = searchQuery?.trim().toLowerCase() || "";

    return teamData.filter((team: any) =>
      team?.name?.toLowerCase().includes(searchTerm)
    );
  }, [teamData, searchQuery]);

  const handleRowClick = (
    id: number,
    name: string,
    e: React.MouseEvent<HTMLDivElement>,
    allowEdit?: any
  ) => {
    if (allowEdit) {
      if (refModel.current === e.currentTarget) {
      } else {
      }
    }

    router.push(
      `/account/organization/member?id=${id}&name=${encodeURIComponent(name)}`
    );
  };

  const handleEditSubmit: SubmitHandler<FormData> = async (data) => {
    if (editTeam) {
      setEditLoading(true);
      try {
        const response: any = await updateOrganizationApi({
          organizationId: editTeam.id,
          name: data.name,
          description: data.description,
          phone: data.phone,
          email: data.email,
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

  const handleDeleteOrg = async (otp?: string) => {
    if (selectedTeamId) {
      setDeleteLoading(true);
      try {
        if (otp && otp !== null) {
          const response = await deleteOrganization(
            selectedTeamId.toString(),
            otp
          );
          setIsDeleteDialogOpen(false);
          setSelectedTeamId(null);
          await getTeam();
          if (response) {
            setOptExpireTime(response?.data?.user?.org_otp_expires_at);
            toast.success(response?.message);
          }
        } else {
          const now = new Date();
          const utcTime = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000
          );
          const utcPlus5 = new Date(utcTime.getTime() + 5 * 60000);
          const utcFormatted = utcPlus5.toISOString().slice(0, 19) + "Z";

          const response = await updateUser({
            org_otp_expires_at: utcFormatted,
          });
          if (response?.data?.isSuccess) {
            setOptExpireTime(response?.data?.user?.org_otp_expires_at);
          }
        }
      } catch (error: any) {
        console.error("Failed to delete team:", error.message);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setDeleteLoading(false);
      }
    }
    setIsOTPExpired(false);
  };

  const openEditDialog = (team: Team) => {
    setEditTeam(team);
    setValue("name", team.name);
    setValue("description", team.description);
    setValue("id", team.id);
    setValue("phone", team.phone);
    setValue("email", team.email);
    setEditDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPageNo(newPage);
  };
  return (
    <Tabs defaultValue="users">
      <Card className="bg-secondaryBackground border-tableBorder mr-4">
        <CardHeader>
          <CardTitle>All Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto max-w-[1500px]">
              {!filteredTeams || filteredTeams?.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-center text-wrap lg:text-nowrap">
                  You have not created any organizations yet. Begin by creating one.
                  </p>
                </div>
              ) : (
                <Table className="px-4">
                  <TableHeader className="px-4">
                    <TableRow>
                      <TableHead className="w-[100px]"># No.</TableHead>
                      <TableHead className="">Name</TableHead>
                      <TableHead className="">Description</TableHead>
                      <TableHead className="">Members</TableHead>
                      <TableHead className="">Created</TableHead>
                      {allowEdit && <TableHead className="">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams?.map((team, index) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer font-normal"
                      >
                        <TableCell className="w-[8px]">{index + 1}</TableCell>
                        <TableCell
                          className=""
                          onClick={(e) =>
                            handleRowClick(team.id, team.name, e, allowEdit)
                          }
                        >
                          {team.name}
                        </TableCell>
                        <TableCell>
                          <div className="break-words text-justify overflow-hidden">
                            {team.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="">{team?.members}</div>
                        </TableCell>

                        <TableCell className="">
                          {moment(team.created_at).format("MMMM Do YYYY")}
                        </TableCell>
                        {allowEdit && (
                          <TableCell className="flex h-full w-full justify-start items-center my-auto">
                            <div className="flex space-x-4 mt-2">
                              <OptimizedImage
                                onClick={(e) =>
                                  handleRowClick(team.id, team.name, e)
                                }
                                src={
                                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//view.png`
                                }
                                height={ImageSizes.icon.sm.height}
                                width={ImageSizes.icon.sm.width}
                                alt="View"
                              />

                              {team?.owner_id === userData?.id && (
                                <Edit
                                  className="h-4 w-4 text-black-500 cursor-pointer"
                                  onClick={() => openEditDialog(team)}
                                />
                              )}
                              {team?.owner_id === userData?.id && (
                                <span
                                  onClick={() => {
                                    setSelectedTeamId(team.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="gap-4"
                                >
                                  <Trash className="w-4 h-4 text-red-500 cursor-pointer" />
                                </span>
                              )}
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

      <DeleteModal
        isDeleteItem={!!isDeleteDialogOpen}
        setIsDeleteItem={setIsDeleteDialogOpen}
        loading={deleteLoading}
        handleDelete={handleDeleteOrg}
        optExpireTime={optExpireTime}
        Title={!optExpireTime ? "Delete Organization" : "Add OTP"}
        heading={
          !optExpireTime
            ? "Are you sure you want to delete this Organization?"
            : isOTPExpired
            ? "Your OTP has expired. Please request a new one to continue."
            : "Enter the OTP sent to your email. The code expires in 5 minutes."
        }
        subheading={`Deleting this organization will also remove all associated users, workspaces, projects, and papers. To retain your workspaces, projects, and papers, you can transfer the workspaces to another organization before proceeding. Are you sure you want to proceed?`}
        message={"This action cannot be undone."}
        handleCancel={() => {
          setOptExpireTime(null);
          setIsOTPExpired(false);
        }}
        isOTPExpired={isOTPExpired}
      />
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent onClick={handleDialogContentClick}>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(handleEditSubmit)}
              className="grid gap-4"
            >
              <div className="grid gap-2 relative">
                <Label htmlFor="name">Organization Name</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter Organization name"
                        {...register("name", {
                          required: "Organization name is required",
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
                <Label htmlFor="name">Phone</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="phone"
                        type="text"
                        placeholder="Enter Phone number"
                        {...register("phone")}
                      />
                    </TooltipTrigger>
                    {errors.phone && (
                      <TooltipContent>{errors.phone.message}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="name">Email</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="email"
                        type="text"
                        placeholder="Enter your email"
                        {...register("email")}
                      />
                    </TooltipTrigger>
                    {errors.email && (
                      <TooltipContent>{errors.email.message}</TooltipContent>
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
                        placeholder="Enter Organization description"
                        {...register("description", {
                          required: "Description is required",
                          validate: (value) =>
                            value.trim().length > 0 ||
                            "Description cannot be empty or whitespace only",
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
                <Button type="submit" className="btn rounded-[26px] text-white">
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
          total={totalTeams}
          defaultCurrent={pageNo}
          onChange={handlePageChange}
        />
      </div>
    </Tabs>
  );
};

export default TableSection;
