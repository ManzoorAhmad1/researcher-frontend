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
import { Loader } from "rizzui";
import useSocket from "@/app/(app)/info/[...slug]/socket";

interface userManagementData {
  id: number;
  cancelSubsctionReasonNote: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  subscription_plan: string;
  cancelSubscriptionDate: string;
  email: string;
  stripe_id: string;
}
interface PageProps {
  params: { slug: string[] };
}

const Management = ({ params }: PageProps) => {
  const [users, setUsers] = useState<userManagementData[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true); // Add loading state
  const { socket } = useSocket();
  const router = useRouter();
  const selectTab = (value: any) => {
    router.push(`/admin-user-view/${value}`);
  };
  const getUsersData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstancePublic.get(
        `/admin/get-cancel-subscriptions?page=${pageNo}&limit=${limit}`
      );
      if (res.data?.isSuccess) {
        setUsers(res.data.data);
        setTotalPages(res.data?.totalPages);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsersData();
  }, [pageNo, limit]);
  useEffect(() => {
    if (!socket) return;

    socket.on("cancelSubscription", () => {
      getUsersData();
    });
  }, [socket]);
  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const toggleExpandRow = (userId: number) => {
    setExpandedRows((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const truncateWords = (text: string, limit: number) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(" ") + "...";
  };

  return (
    <WrapperBox>
      <div className="" style={{ height: "100vh" }}>
        {loading ? (
          <div className="flex justify-center items-center h-72">
            <Loader variant="threeDot" className="w-24 h-12" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex justify-center items-center h-72 flex-col gap-4">
            <p className="text-lg text-gray-500">No subscription data found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-greyTh w-full">
                <TableRow
                  className="text-[11px] cursor-move w-full"
                  style={{ backgroundColor: "#f9fafb" }}
                >
                  <TableHead className="w-[25%]" style={{ fontSize: "1rem" }}>
                    User Name
                  </TableHead>
                  <TableHead className="w-[25%]" style={{ fontSize: "1rem" }}>
                    Email
                  </TableHead>
                  <TableHead className="w-[20%]" style={{ fontSize: "1rem",whiteSpace: "nowrap" }}>
                    Stripe ID
                  </TableHead>
                  <TableHead className="w-[15%]" style={{ fontSize: "1rem",whiteSpace: "nowrap" }}>
                    Created At
                  </TableHead>
                  <TableHead className="w-[15%]" style={{ fontSize: "1rem" }}>
                    Plan
                  </TableHead>
                </TableRow>
              </TableHeader>
              {users.map((user: userManagementData) => (
                <React.Fragment key={user.id}>
                  <TableBody
                    style={{ borderBottomWidth: "1px", borderColor: "#e6e6e6" }}
                    onClick={() => toggleExpandRow(user.id)}
                    className="cursor-pointer hover:bg-gray-50 w-full"
                  >
                    <TableCell className="w-[25%]">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-[40px] h-[40px]">
                          <OptimizedImage
                            src={
                              user.profile_image ||
                              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//profile.png`
                            }
                            alt="user profile"
                            height={40}
                            width={40}
                            style={{ borderRadius: "3rem", objectFit: "cover" }}
                          />
                        </div>
                        <Label className="truncate">
                          {user.first_name + " " + user.last_name}
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell className="w-[25%]">
                      <span className="text-sm" style={{ color: "#858b94" }}>
                        {user.email || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <span className="text-sm" style={{ color: "#858b94" }}>
                        {user.stripe_id || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="w-[15%]">
                      <span
                        className="text-sm whitespace-nowrap"
                        style={{ color: "#858b94" }}
                      >
                        {moment(user.cancelSubscriptionDate).format(
                          "MMMM Do YYYY"
                        ) || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="w-[15%]">
                      <Label className="text-blue-600 bg-blue-100 px-2 py-1 rounded-full capitalize whitespace-nowrap">
                        {user.subscription_plan === "pro-plan-stripe" ||
                        user?.subscription_plan === "pro-plan-discount"
                          ? "Pro Subscription Annual"
                          : "Plus Subscription Annual"}
                      </Label>
                    </TableCell>
                  </TableBody>
                  {user.cancelSubsctionReasonNote && (
                    <TableBody
                      style={{
                        borderBottomWidth: "1px",
                        borderColor: "#e6e6e6",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <TableCell colSpan={5} className="px-4 py-2">
                        <div className="text-sm">
                          <div>
                            <span className="font-medium text-base text-blue-500">
                              Reason:
                            </span>
                            <div className="mt-1">
                              <p
                                style={{ color: "#858b94", fontWeight: "300" }}
                              >
                                {expandedRows.includes(user.id)
                                  ? user.cancelSubsctionReasonNote
                                  : truncateWords(
                                      user.cancelSubsctionReasonNote,
                                      20
                                    )}
                                {user.cancelSubsctionReasonNote?.split(" ")
                                  .length > 20 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpandRow(user.id);
                                    }}
                                    className="text-blue-500 hover:underline focus:outline-none ml-2"
                                  >
                                    {expandedRows.includes(user.id)
                                      ? "Show Less"
                                      : "Show More"}
                                  </button>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableBody>
                  )}
                </React.Fragment>
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
          </>
        )}
      </div>
    </WrapperBox>
  );
};

export default Management;
