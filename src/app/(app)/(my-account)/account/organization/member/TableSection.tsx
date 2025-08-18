"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "rizzui";
import { Trash } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import moment from "moment";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteOrganizationMember,
  handleDeleteMember,
  updateTeamMemberApi,
} from "@/apis/team";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/coman/Pagination";
import { updateUser } from "@/apis/user";
import { useSelector, shallowEqual } from "react-redux";
import { Input } from "@/components/ui/input";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

const roleMap: Record<string, string> = {
  team_owner: "Owner",
  team_member: "Member",
};

interface TeamMember {
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string;
  role: string;
  status: string;
  created_at: string;
  id: number;
  org_member_status: string;
  last_active: string;
}

export const TableSection: React.FC<{
  teamMembers: any[];
  loading: boolean;
  fetchTeamMembers: any;
  setPageNo: any;
  pageNo: any;
  totalTeamsMember: any;
  searchQuery: any;
  setSearchQuery: (value: any) => void;
  allowEdit: any;
  setLimit: (value: number) => void;
  limit: number;
}> = ({
  teamMembers,
  loading,
  fetchTeamMembers,
  setPageNo,
  pageNo,
  totalTeamsMember,
  setSearchQuery,
  searchQuery,
  allowEdit,
  setLimit,
  limit,
}) => {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("id");

  const filteredTags = teamMembers;
  const user = useSelector(
    (state: any) => state.user?.user?.user,
    shallowEqual
  );
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [editDialogue, setEditDialogue] = useState<boolean>(false);
  const [deleteText, setDeleteText] = useState<string>("");
  const handleDialogContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const hanldeDialogueBox = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [isStatusLoading, setisStatusLoading] = useState<boolean>(false);
  const handleDeleteMemberAction = async () => {
    if (selectedMemberId) {
      setisLoading(true);
      try {
        const response: any = await deleteOrganizationMember(
          selectedMemberId?.toString()
        );
        fetchTeamMembers();
        setIsDeleteDialogOpen(false);
        setSelectedMemberId(null);
        if (response) {
          setDeleteText("");
          toast.success(response?.data?.message);
        }
      } catch (error: any) {
        console.error("Failed to delete member:", error.message);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setisLoading(false);
      }
    }
  };

  const handleMemberEdit = async () => {
    if (selectedMemberId) {
      setisLoading(true);
      try {
        const response: any = await updateTeamMemberApi({
          new_role: editRole,
          team_id: teamId,
          member_id: selectedMemberId,
        });
        if (response?.success === false) {
          toast.error(response?.message);
        }
        setEditDialogue(false);
        setSelectedMemberId(null);
        fetchTeamMembers();
        if (response) {
          toast.success(response?.data?.message);
        }
      } catch (error: any) {
        console.error("Failed to edit member:", error.message);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setisLoading(false);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPageNo(newPage);
  };

  const handleMemberStatus = async (status: boolean, member: any) => {
    setisStatusLoading(true);
    try {
      const response = await updateUser({
        user_id: member?.id,
        org_member_status: status ? "active" : "disabled",
      });
      if (response?.data?.success === false) {
        toast.error(response?.data?.message);
      }
      setEditDialogue(false);

      fetchTeamMembers(true).then(() => {
        setisStatusLoading(false);
        setSelectedMemberId(null);
      });
      if (response) {
        toast.success(
          status
            ? "Member activated successfully"
            : "Member disabled successfully"
        );
      }
    } catch (error: any) {
      console.error("Failed to edit member:", error.message);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      setisStatusLoading(false);
    }
  };

  const [editRole, SetEditRole] = useState("Select Role");

  const cardRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div
      ref={cardRef}
      className={`w-full ${
        windowWidth < 700 ? "grid grid-cols-[40%,60%]" : ""
      }`}
    >
      <div
        className={`overflow-x-auto ${windowWidth < 700 ? "col-span-2" : ""}`}
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto max-w-[1500px]">
              {filteredTags.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-center text-wrap lg:text-nowrap">
                  You have not added any organization member yet. Begin by adding one.
                  </p>
                </div>
              ) : (
                <Table
                  className={`w-full ${
                    windowWidth < 700 ? "table-fixed min-w-[800px]" : ""
                  }`}
                >
                  <TableHeader className="bg-greyTh hover:bg-greyTh">
                    <TableRow className="">
                      <TableHead className="text-[11px] font-semibold">
                        NAME
                      </TableHead>

                      <TableHead className="text-[11px] font-semibold">
                        EMAIL
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold">
                        LAST ACTIVE
                      </TableHead>

                      <TableHead className="text-[11px] font-semibold">
                        STATUS
                      </TableHead>
                      {allowEdit && (
                        <TableHead className="w-[100px] min-w-[100px] text-[11px] font-semibold">
                          ACTIONS
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTags.map((member: TeamMember, index) => {
                      return (
                        <TableRow key={index} className="text-xs font-normal">
                          <TableCell className="flex items-center gap-2 capitalize">
                            <OptimizedImage
                              src={
                                member?.profile_image &&
                                member?.profile_image !== ""
                                  ? member?.profile_image
                                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//dummyImg.png`
                              }
                              alt="profile_image"
                              width={ImageSizes.avatar.md.width}
                              height={ImageSizes.avatar.md.height}
                              className="rounded-full border h-[40px] border-[#2EB0D9] object-cover"
                            />
                            {member?.first_name || member?.last_name
                              ? `${member?.first_name ?? ""} ${
                                  member?.last_name ?? ""
                                }`
                              : "Name not available"}
                          </TableCell>

                          <TableCell>{member?.email}</TableCell>
                          <TableCell>{member?.last_active ? moment(member.last_active).fromNow() : 'N/A'}</TableCell>
                          <TableCell>
                            {isStatusLoading &&
                            member.id === selectedMemberId ? (
                              <Loader variant="threeDot" size="lg" />
                            ) : (
                              <div className="flex items-center gap-3">
                                {member?.org_member_status === "pending" &&
                                  member?.org_member_status}
                                {member?.org_member_status != "pending" && (
                                  <Switch.Root
                                    className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-200 ease-in-out ${
                                      member?.org_member_status === "active"
                                        ? "bg-blue-600"
                                        : "bg-gray-300"
                                    }`}
                                    id="switch"
                                    checked={
                                      member?.org_member_status === "active"
                                    }
                                    disabled={
                                      member?.org_member_status === "pending" ||
                                      isLoading ||
                                      member?.id?.toString() ===
                                        user?.id?.toString()
                                    }
                                    onCheckedChange={(e: boolean) => {
                                      setSelectedMemberId(member.id);
                                      handleMemberStatus(e, member);
                                    }}
                                  >
                                    <Switch.Thumb
                                      className={`block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
                                        member?.org_member_status === "active"
                                          ? "translate-x-6"
                                          : "translate-x-1"
                                      }`}
                                    />
                                  </Switch.Root>
                                )}
                                {member?.org_member_status !== "pending"
                                  ? member?.org_member_status === "disabled" &&
                                    member?.id?.toString() ===
                                      user?.id?.toString()
                                    ? "Disabled By Owner"
                                    : member?.org_member_status
                                        .charAt(0)
                                        .toUpperCase() +
                                      member?.org_member_status.slice(1)
                                  : null}
                              </div>
                            )}
                          </TableCell>
                          {allowEdit && (
                            <TableCell className=" ">
                              <div className="flex space-x-4">
                                <span
                                  onClick={() => {
                                    setSelectedMemberId(member.id);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="gap-4"
                                >
                                  <Trash
                                    color="#666666"
                                    width={18}
                                    height={18}
                                    className="cursor-pointer"
                                  />
                                </span>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
            <div
              className={`bg-secondaryBackground border-t border-tableBorder ${
                windowWidth < 700 ? "col-span-2" : ""
              }`}
            >
              <Pagination
                totalPages={totalTeamsMember?.totalMembers}
                handlePagination={handlePageChange}
                currentPage={pageNo}
                perPageLimit={limit}
                setPerPageLimit={setLimit}
              />
            </div>
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogContent onClick={handleDialogContentClick}>
                <DialogHeader>
                  <DialogTitle>Delete</DialogTitle>
                </DialogHeader>
                <div className="mt-2">
                  <p>
                    Are you sure you want to delete this organization member?
                    This action cannot be undone.
                  </p>
                </div>
                <DialogFooter>
                  <div className="flex gap-2 w-full flex-col">
                    <div className="w-full">
                      <Input
                        id="new"
                        type="text"
                        className="outline-none"
                        value={deleteText}
                        onChange={(e) => setDeleteText(e.target.value)}
                      />

                      <p className="text-xs mt-3">{`To confirm deletion,please type "DELETE"`}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
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
                        disabled={deleteText.toUpperCase() !== "DELETE"}
                        className="text-white rounded-[26px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMemberAction();
                        }}
                      >
                        {isLoading ? (
                          <Loader variant="threeDot" size="lg" />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={editDialogue} onOpenChange={setEditDialogue}>
              <DialogContent onClick={hanldeDialogueBox}>
                <DialogHeader>
                  <DialogTitle>Change the Role of Member</DialogTitle>
                </DialogHeader>
                <Select onValueChange={SetEditRole} defaultValue={editRole}>
                  <SelectTrigger>
                    <span>{roleMap[editRole] || editRole}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team_owner">Owner</SelectItem>
                    <SelectItem value="team_member">Member</SelectItem>
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    className="rounded-[26px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditDialogue(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    className="rounded-[26px] btn text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMemberEdit();
                    }}
                  >
                    {isLoading ? (
                      <Loader variant="threeDot" size="lg" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
};
