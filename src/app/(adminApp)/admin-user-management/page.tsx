"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import moment from "moment";
import { axiosInstancePublic } from "@/utils/request";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import WrapperBox from "@/components/ui/WrapperBox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/coman/Pagination";

import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface userManagementData {
  id: number;
  email: string;
  account_type: string;
  is_user_plan_active: boolean;
  first_name: string;
  last_name: string;
  profile_image: string;
  last_login: string;
}
interface PageProps {
  params: { slug: string[] };
}

const Management = ({ params }: PageProps) => {
  const [users, setUsers] = useState<userManagementData[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedOption, setSelectedOption] = React.useState(null);
  const promptModel = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "claude", label: "Claude" },
  ];
  const { slug }: any = params;

  const router = useRouter();

  const selectTab = (value: any) => {
    router.push(`/admin-user-view/${value}`);
  };
  const getUsersData = async () => {
    try {
      const res = await axiosInstancePublic.get(
        `/admin/admin-user-data?page=${pageNo}&limit=${limit}`
      );

      if (res.data.isSuccess) {
        setUsers(res.data.data);
        setTotalPages(res.data.totalPages);
      } else {
        console.error("Error:", res.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  };

  useEffect(() => {
    getUsersData();
  }, [pageNo, limit]);

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  return (
    <WrapperBox>
      <div className="" style={{ height: "100vh" }}>
        <Table>
          <TableHeader className="bg-greyTh">
            <TableRow
              className="text-[11px] cursor-move"
              style={{ backgroundColor: "#f9fafb" }}
            >
              <TableHead style={{ fontSize: "1rem" }}>User</TableHead>
              <TableHead style={{ fontSize: "1rem" }}>Role</TableHead>
              <TableHead style={{ fontSize: "1rem" }}>Status</TableHead>
              <TableHead style={{ fontSize: "1rem" }}>Last Login</TableHead>
              <TableHead style={{ fontSize: "1rem" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          {users.map((user: userManagementData) => (
            <TableBody
              key={user.id}
              style={{ borderBottomWidth: "1px", borderColor: "#e6e6e6" }}
            >
              <TableCell className="align-center">
                <div style={{ display: "flex" }}>
                  <OptimizedImage
                    src={
                      user.profile_image ||
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//profile.png`
                    }
                    alt="user profile"
                    height={ImageSizes.avatar.md.height}
                    width={ImageSizes.avatar.md.width}
                    style={{ borderRadius: "3rem" }}
                  />
                  <div
                    style={{ display: "flex", flexDirection: "column" }}
                    className="ml-2"
                  >
                    <Label>{user.first_name + " " + user.last_name}</Label>
                    <Label style={{ color: "#858b94", fontWeight: "300" }}>
                      {user.email}
                    </Label>
                  </div>
                </div>
              </TableCell>
              <TableCell className="align-center">
                {user.account_type == "owner" && (
                  <Label
                    style={{
                      color: "#517ffa",
                      backgroundColor: "#517ffa2f",
                      padding: "0.3em 0.5em",
                      borderRadius: "1em",
                      textTransform: "capitalize",
                    }}
                  >
                    {user.account_type}
                  </Label>
                )}
                {user.account_type == "member" && (
                  <Label
                    style={{
                      color: "#8a60f0",
                      backgroundColor: "#8a60f02f",
                      padding: "0.3em 0.5em",
                      borderRadius: "1em",
                      textTransform: "capitalize",
                    }}
                  >
                    {user.account_type}
                  </Label>
                )}
              </TableCell>
              <TableCell className="align-center">
                {user.is_user_plan_active ? (
                  <Label
                    style={{
                      color: "#27b67d",
                      backgroundColor: "#27b67d2f",
                      padding: "0.3em 0.5em",
                      borderRadius: "1em",
                    }}
                  >
                    Active
                  </Label>
                ) : (
                  <Label
                    style={{
                      color: "#c05b5b",
                      backgroundColor: "#c05b5b2f",
                      padding: "0.3em 0.5em",
                      borderRadius: "1em",
                    }}
                  >
                    Inactive
                  </Label>
                )}
              </TableCell>
              <TableCell className="align-center">
                <Label style={{ color: "#495360d6" }}>
                  {user.last_login ? moment(user.last_login).fromNow() : "N/A"}
                </Label>
              </TableCell>
              <TableCell className="align-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-none bg-greyTh"
                    >
                      <MoreVertical className="h-6 w-6" />
                      <span className="sr-only">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="p-2 bg-inputBackground border border-borderColor text-lightGray "
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        selectTab(user.id);
                      }}
                    >
                      View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator
                      color="borderColor"
                      className="border-borderColor"
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableBody>
          ))}
        </Table>
        <div className="bg-secondaryBackground border-t-0 border-tableBorder rounded-bl-xl rounded-br-xl border pb-3 dark:border-[#393F49]">
          <Pagination
            totalPages={totalPages}
            handlePagination={handlePageChange}
            currentPage={pageNo}
            perPageLimit={limit}
            setPerPageLimit={setLimit}
          />
        </div>
      </div>
    </WrapperBox>
  );
};

export default Management;
