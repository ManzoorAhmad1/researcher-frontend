"use client";

import { useEffect, useState, useCallback } from "react";
import { getNotications, markNotificationAsSeen } from "@/apis/team";
import { useSelector } from "react-redux";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import { useRouter, useSearchParams } from "next/navigation";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import toast from "react-hot-toast";

interface Notification {
  created_at: string;
  message: string;
  notification?: {
    message: string;
  };
  is_seen?: boolean;
  target_id?: string | number;
  notification_type?: string;
}

interface ApiResponse {
  data: {
    data: Notification[];
  };
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsDiff < 60) return "just now";
  
  const minutes = Math.floor(secondsDiff / 60);
  if (secondsDiff < 3600) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  
  const hours = Math.floor(secondsDiff / 3600);
  if (secondsDiff < 86400) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  
  const days = Math.floor(secondsDiff / 86400);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const formatHeaderDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString();
};

const Notifications = () => {
  const [notifList, setNotifList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const { socket } = useSocket();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [clickedNotifications, setClickedNotifications] = useState<Set<string>>(
    new Set()
  );
  const user = useSelector((state: any) => state.user?.user?.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const handleNotificationClick = async (id: any) => {
    try {
      const response: any = await markNotificationAsSeen(id);
      if (response?.success === false) {
        toast.error(response?.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error marking notification as seen:", error);
    }
  };

  const fetchAllNotifications = async (pageNo: number) => {
    setLoading(true);
    try {
      const response: any = (await getNotications({
        pageNo,
        limit: 20,
      })) as ApiResponse;
      if (response?.success === false) {
        toast.error(response?.message);
      }
      if (response?.data?.notificationData) {
        const uniqueNotifs = new Set([
          ...notifList,
          ...response.data.notificationData,
        ]);
        setNotifList(Array.from(uniqueNotifs));
        setHasMore(response.data.notificationData.length > 0);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("selectedNotification", () => {
        fetchAllNotifications(page);
      });
      return () => {
        socket.off("selectedNotification");
      };
    }
  }, [socket, page]);

  useEffect(() => {
    fetchAllNotifications(page);
  }, [page]);

  const groupByDate = (notifications: Notification[]) => {
    return notifications.reduce(
      (acc: { [key: string]: Notification[] }, notif) => {
        const date = new Date(notif.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        if (
          !acc[date].some(
            (existingNotif) => existingNotif.created_at === notif.created_at
          )
        ) {
          acc[date].push(notif);
        }
        return acc;
      },
      {}
    );
  };

  // Filter notifications based on tab parameter
  const getFilteredNotifications = () => {
    if (tab === "reminders") {
      return notifList.filter(notif => notif.notification_type === "reminder_due");
    } else {
      return notifList.filter(notif => notif.notification_type !== "reminder_due");
    }
  };

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight ||
      loading
    )
      return;

    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleRowClick = (notif: any) => {
    setClickedNotifications((prev) => new Set(prev).add(notif.created_at));
    const id = notif?.id;
    handleNotificationClick(id);

    // Redirect based on notification type and target_id
    
    
    // Handle reminder notifications
    if (notif?.notification_type === 'reminder_due') {
      const message = notif?.message?.toLowerCase() || '';
      
      if (notif.target_id) {
        // Parse message to determine type
        if (message.includes('paper') ) {
          router.push(`/info/${notif?.target_id}`);
        } else if (message.includes('note')) {
          router.push(`/knowledge-bank/note/${notif?.target_id}`);
        } else if (message.includes('bookmark')) {
          router.push(`/knowledge-bank`);
        } 
      } }else{
        if (notif.notification_type === 'file_processing') {
       
              router.push(`/info/${notif.target_id}`)
            
        } 
      }

  };

  const groupedNotifications = groupByDate(getFilteredNotifications());

  return (
    <div className="flex flex-col items-center w-full justify-start min-h-screen dark:bg-[#1A2A2E] p-4 overflow-y-auto">
      <div className="dark:bg-[#1A2A2E] rounded-lg shadow-lg w-full">
        <h1 className="text-2xl font-bold pl-6 pt-6 mb-4">
          {tab === "reminders" ? "Reminders" : "All Notifications"}
        </h1>
        {loading && page === 1 ? (
          <p className="text-center text-gray-500 dark:text-white">
            Loading...
          </p>
        ) : Object.keys(groupedNotifications).length > 0 ? (
          Object.keys(groupedNotifications).map((date, index) => (
            <div key={index} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-600 text-center mb-2 dark:text-white">
                {formatHeaderDate(date)}
              </h2>
              {groupedNotifications[date].map((notif, notifIndex) => (
                <div
                  key={notifIndex}
                  className={`flex items-start border-b px-6 cursor-pointer ${
                    notif.is_seen || clickedNotifications.has(notif.created_at)
                      ? ""
                      : "dark:bg-[#1A2A2E]"
                  }`}
                  onClick={() => handleRowClick(notif)}
                >
                  <div className="flex-shrink-0 mt-3">
                    <UserAvatar />
                  </div>
                  <div className="flex flex-col w-full ml-3">
                    <div
                      className={`flex items-center mb-1 ${
                        notif.is_seen ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          notif.is_seen ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span className="ml-1 text-sm">
                        {notif.is_seen ? "Seen" : "Not Seen"}
                      </span>
                    </div>
                    <p
                      className={`${
                        notif?.message?.toLowerCase()?.includes("error")
                          ? "text-red-400 font-semibold"
                          : "text-gray-800 dark:text-white"
                      }`}
                    >
                      {notif?.notification_type === 'reminder_due' 
                        ? (() => {
                            const cleanedMessage = notif?.message?.replace(/[^a-zA-Z0-9 \(\)\[\]\{\}\<\>\: ]/g, ' ');
                            if (cleanedMessage?.includes('Description:')) {
                              const parts = cleanedMessage.split('Description:');
                              // Replace "is due now" and "due now" with "was due" + formatted date
                              let messageWithDate = parts[0].replace(/is due now/gi, `was due ${formatDate(notif.created_at)}`);
                              messageWithDate = messageWithDate.replace(/due now/gi, `was due ${formatDate(notif.created_at)}`);
                              return (
                                <>
                                  {messageWithDate}
                                  <br />
                                  <span className="text-gray-600 dark:text-gray-400">Description: {parts[1]}</span>
                                </>
                              );
                            }
                            // Handle case without Description
                            let messageWithDate = cleanedMessage.replace(/is due now/gi, `was due ${formatDate(notif.created_at)}`);
                            messageWithDate = messageWithDate.replace(/due now/gi, `was due ${formatDate(notif.created_at)}`);
                            return messageWithDate;
                          })()
                        : (notif?.notification?.message || notif?.message)
                      }
                    </p>

                    <p className="text-gray-500 text-sm text-right mt-1 dark:text-white">
                      {formatDate(notif.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            {tab === "reminders" ? "No reminders found." : "No notifications found."}
          </p>
        )}
        {loading && page > 1 && (
          <p className="text-center text-gray-500">Loading more...</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;
