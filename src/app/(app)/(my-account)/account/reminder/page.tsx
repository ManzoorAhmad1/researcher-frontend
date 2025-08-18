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
import { Skeleton } from "@/components/ui/skeleton";
import { BsPencil, BsTrash } from "react-icons/bs";
import { useSelector } from "react-redux";
import { removeReminder, getRemindersByUserTypeAndItem } from "@/apis/reminder";
import toast from "react-hot-toast";
import ReminderDialog from "@/components/coman/ReminderDailog";
import EditReminderDialog from "@/components/coman/EditReminderDialog";
import { formatTableDate } from "@/utils/formatDate";
import Pagination from "@/utils/components/pagination";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const ReminderPage = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteReminder, setDeleteReminder] = useState<any>(null);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [pageNo, setPageNo] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const user = useSelector((state: any) => state.user?.user?.user);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const getReminders = async () => {
    try {
      setIsLoading(true);
      const response = await getRemindersByUserTypeAndItem({
        user_id: user?.id,
        type: "all",
        item_id: "",
        status: selectedStatus,
        orderBy: "created_at",
        orderDirection: "desc",
        pageNo,
        limit,
        search: debouncedSearchQuery
      });
      
      if (response?.data?.data) {
        setReminders(response.data.data);
        setTotalCount(response?.data?.totalReminders || 0);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast.error("Failed to load reminders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getReminders();
    }
  }, [user?.id, pageNo, debouncedSearchQuery, selectedStatus]);

  const handleDeleteReminder = async () => {
    if (!deleteItemId) return;
    
    try {
      setIsDeleteLoading(true);
    const response =    await removeReminder(deleteItemId, {});
      toast.success(response?.data?.message || "Reminder deleted successfully");
      setDeleteItemId(null);
      setDeleteReminder(null);
      getReminders(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting reminder:", error);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleDeleteClick = (reminder: any) => {
    setDeleteItemId(reminder.id);
    setDeleteReminder(reminder);
  };

  const canDeleteReminder = (reminder: any) => {
    return reminder?.user_id === user?.id || user?.role === 'admin';
  };

  const handleEditReminder = (reminder: any) => {
    setEditingReminder(reminder);
    setIsEditDialogOpen(true);
  };

 

  const handleEditSuccess = () => {
    getReminders(); // Refresh the list after edit
  };

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  // Reset to page 1 when search query or status changes
  useEffect(() => {
    setPageNo(1);
  }, [debouncedSearchQuery, selectedStatus]);

  const formatScheduledDate = (scheduledAt: string) => {
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    const diffInMs = scheduledDate.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // If it's in the past
    if (diffInMs < 0) {
      const absDiffInHours = Math.abs(diffInHours);
      if (absDiffInHours < 1) {
        return "now";
      } else if (absDiffInHours === 1) {
        return "1 hour ago";
      } else if (absDiffInHours < 24) {
        return `${absDiffInHours} hours ago`;
      } else {
        const absDiffInDays = Math.abs(diffInDays);
        if (absDiffInDays === 1) {
          return "1 day ago";
        } else {
          return `${absDiffInDays} days ago`;
        }
      }
    }

    // If it's in the future
    if (diffInMs > 0) {
      if (diffInHours < 1) {
        return "now";
      } else if (diffInHours === 1) {
        return "1 hour time";
      } else if (diffInHours < 24) {
        return `${diffInHours} hours time`;
      } else if (diffInDays === 1) {
        return "tomorrow";
      } else if (diffInDays === 2) {
        return "day after tomorrow";
      } else if (diffInDays < 7) {
        return `${diffInDays} days time`;
      } else {
        // For dates more than a week away, use the original format
        const options: Intl.DateTimeFormatOptions = {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        };
        return scheduledDate.toLocaleDateString('en-US', options);
      }
    }

    return "now";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      completed: { color: "bg-green-100 text-green-800", text: "Completed" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-[7px] text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      paper: { color: "bg-blue-100 text-blue-800", text: "Paper" },
      note: { color: "bg-purple-100 text-purple-800", text: "Note" },
      bookmark: { color: "bg-orange-100 text-orange-800", text: "Bookmark" },
      reminder: { color: "bg-gray-100 text-gray-800", text: "Reminder" },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.reminder;
    
    return (
      <span className={`px-2 py-1 rounded-[7px] text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const clearStatusFilter = () => {
    setSelectedStatus("pending");
  };

  // Skeleton loader component for table rows
  const TableSkeleton = () => (
    <TableBody>
      {[...Array(5)].map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          <TableCell>
            <Skeleton className="h-4 w-full max-w-xs" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-[7px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16 rounded-[7px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

    return (
    <>
      <main className="flex flex-1 flex-col w-full max-w-[calc(100%-30px)] mx-auto lg:gap-6 ">
        <h1 className="text-base font-medium">Reminders Management</h1>

        <div>
          <Card className="bg-secondaryBackground border-tableBorder pb-1">
            <CardHeader className="px-0">
              <div className="flex justify-between items-center px-4">
                <div className="flex items-center">
                  <CardTitle className="text-sm font-medium">
                    My Reminders
                  </CardTitle>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search reminders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4"
                    />
                  </div>
                  <div className="flex items-center">
                    <div className="relative flex items-center gap-2 bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] rounded-full px-3 py-1.5 shadow-sm">
                      <Filter size={15} className="text-[#0E70FF]" />
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger
                          className="border-0 min-w-[150px] h-6 text-[13px] font-medium bg-transparent shadow-none !ring-0 !ring-offset-0 !outline-none"
                          style={{
                            outline: "none",
                            boxShadow: "none",
                            border: "none",
                          }}
                        >
                          <span className="truncate capitalize">
                            {selectedStatus === "all"
                              ? "All"
                              : selectedStatus}
                          </span>
                        </SelectTrigger>
                        <SelectContent className="p-1 bg-white dark:bg-[#27343A] border border-[#CCCCCC] dark:border-[#CCCCCC33] rounded-md shadow-lg">
                          <SelectItem
                            value="all"
                            className="text-sm font-medium cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#374A52] rounded-md my-1"
                          >
                            All
                          </SelectItem>
                          <SelectItem
                            value="pending"
                            className="text-sm font-medium cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#374A52] rounded-md my-1"
                          >
                            Pending
                          </SelectItem>
                          <SelectItem
                            value="completed"
                            className="text-sm font-medium cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-[#374A52] rounded-md my-1"
                          >
                            Completed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedStatus !== "pending" && (
                        <button
                          onClick={clearStatusFilter}
                          className="text-[#0E70FF] hover:text-[#0a5bc7]"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <>
              <div>
                <Table className="w-full px-0">
                  <TableHeader className="relative">
                    <TableRow className="bg-greyTh hover:bg-greyTh">
                      <TableHead className="text-[11px] font-semibold">
                        Reminder
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold">
                        Type
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold">
                        Scheduled Date
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold">
                        Status
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold">
                        Created
                      </TableHead>
                      <TableHead className="text-[11px] font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <>
                    {isLoading ? (
                      <TableSkeleton />
                    ) : reminders && reminders.length === 0 ? (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-center text-wrap lg:text-nowrap">
                              {selectedStatus === "all" 
                                ? "You have not created any reminders yet. Begin by creating one."
                                : `You have not created any reminders in ${selectedStatus} status yet. Begin by creating one.`}
                            </p>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    ) : (
                      <>
                        <TableBody>
                          {reminders?.map((reminder: any, index: number) => (
                            <TableRow
                              key={reminder.id}
                              className="cursor-pointer"
                            >
                              <TableCell className="text-xs font-normal">
                                <div className="max-w-xs truncate" title={reminder.description}>
                                  {reminder.description}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-normal">
                                {getTypeBadge(reminder.type)}
                              </TableCell>
                              <TableCell className="text-xs font-normal">
                               {formatScheduledDate(reminder.scheduled_at)}
                              </TableCell>
                              <TableCell className="text-xs font-normal">
                                {getStatusBadge(reminder.status)}
                              </TableCell>
                              <TableCell className="text-xs font-normal">
                                {formatTableDate(reminder.created_at)}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-row gap-4">
                                  {reminder.status !== "completed" && (
                                    <BsPencil
                                      width={18}
                                      height={18}
                                      color="#666666"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditReminder(reminder);
                                      }}
                                      className="cursor-pointer"
                                    />
                                  )}
                                  <BsTrash
                                    color="#666666"
                                    className="order-3 cursor-pointer"
                                    width={18}
                                    height={18}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(reminder);
                                    }}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <div className="my-8">
                          <Pagination
                            total={totalCount}
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

      {/* Delete Confirmation Modal */}
      {deleteItemId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Reminder</h3>
            {deleteReminder && !canDeleteReminder(deleteReminder) ? (
              <p className="text-red-600 mb-6">
                {`You don't have permission to delete this reminder.`}
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this reminder? This action cannot be undone.
              </p>
            )}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteItemId(null);
                  setDeleteReminder(null);
                }}
                disabled={isDeleteLoading}
              >
                Cancel
              </Button>
              {deleteReminder && canDeleteReminder(deleteReminder) && (
                <Button
                  onClick={handleDeleteReminder}
                  disabled={isDeleteLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reminder Dialog */}
      <ReminderDialog
        isOpen={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
        paperTitle={editingReminder?.description || "Reminder"}
        itemType={editingReminder?.type || "reminder"}
        itemId={editingReminder?.item_id || ""}
        userId={user?.id}
        type={editingReminder?.type || "reminder"}
      />

      {/* Edit Reminder Dialog */}
      <EditReminderDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        reminder={editingReminder}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

export default ReminderPage;
