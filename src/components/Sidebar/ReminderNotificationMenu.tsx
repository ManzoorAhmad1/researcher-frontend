"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../reducer/store";
import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import css from "./NotificaationMenu.module.css";
import {
  getNotications,
  markAllNotificationAsSeen,
  markNotificationAsSeen,
} from "@/apis/team";
import { useRouter } from "next/navigation";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import toast from "react-hot-toast";

interface Notification {
  id: number;
  message: string;
  created_at: string;
  notification_type?: string;
  target_id?: string | number;
}

interface ReminderNotificationMenuProps {
  getNotifications: () => void;
  notifList: Notification[];
  setNotifList: React.Dispatch<React.SetStateAction<Notification[]>>;
  setTotalNotification: React.Dispatch<React.SetStateAction<number>>;
}

export default function ReminderNotificationMenu({
  getNotifications,
  notifList,
  setNotifList,
  setTotalNotification,
}: ReminderNotificationMenuProps) {
  const dispatch: AppDispatch = useDispatch();
  const [readNotif, setReadNotif] = useState<Set<number>>(new Set());
  const [totalReminderNotification, setTotalReminderNotification] = useState<number>(0);
  const router = useRouter();
  const user = useSelector((state: any) => state.user?.user?.user);
  const fetchMounted = useRef<boolean>(false);
  const { socket } = useSocket();

  // Filter only reminder_due notifications
  const reminderNotifications = notifList.filter(
    (notif) => notif.notification_type === "reminder_due"
  );

  // Calculate unread reminder notifications count
  const unreadReminderNotifications = reminderNotifications.filter(
    (notif) => !readNotif.has(notif.id)
  );

  // Update total reminder notification count when reminderNotifications change
  useEffect(() => {
    setTotalReminderNotification(unreadReminderNotifications.length);
  }, [reminderNotifications, readNotif]);

  useEffect(() => {
    if (fetchMounted.current) return;
    fetchMounted.current = true;
    getNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleReminderDueNotification = (reminder: any) => {
        if (user?.id === reminder?.userId) {
          getNotifications();
          setTotalReminderNotification((prev) => prev + 1);
        }
      };

      socket.on("reminderDue", handleReminderDueNotification);

      return () => {
        socket.off("reminderDue", handleReminderDueNotification);
      };
    }
  }, [user, socket]);

  const markAllRemindersAsSeen = async () => {
    try {
      const response: any = await markAllNotificationAsSeen('reminder_due');
      if (response?.success === false) {
        toast.error(
          <span className={css.errorMessage}>{response?.message}</span>
        );
      }
    } catch (error: any) {
      toast.error(error?.response?.message || error?.message || "An error occurred");
      console.error("Error marking reminder notifications as seen:", error);
    }
    setTotalReminderNotification(0);
    // Mark all reminder notifications as read locally
    const reminderIds = reminderNotifications.map(notif => notif.id);
    setReadNotif(prev => new Set([...prev, ...reminderIds]));
  };

  const handleReminderClick = async (notif: any) => {
    if (!readNotif.has(notif.id)) {
      try {
        const response: any = await markNotificationAsSeen(notif.id);
        if (response?.success === false) {
          toast.error(
            <span className={css.errorMessage}>{response?.message}</span>
          );
        }
        setTotalReminderNotification((prev) => Math.max(prev - 1, 0));
      } catch (error: any) {
        toast.error(error?.response?.message || error?.message || "An error occurred");
        console.error("Error marking reminder notification as seen:", error);
      }
    }
    setReadNotif((prev) => new Set(prev).add(notif.id));
      

    // Parse the reminder message to determine the type and target
    const message = notif?.message?.toLowerCase() || '';
    
    if (notif?.target_id) {
      if (message.includes('paper') ) {
        router.push(`/info/${notif.target_id}`);
      } else if (message.includes('note')) {
        router.push(`/knowledge-bank/note/${notif.target_id}`);
      } else if (message.includes('bookmark')) {
        router.push(`/knowledge-bank`);
      } 
    } 
  };

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-transparent focus-visible:ring-transparent focus:ring-offset-0 focus-visible:ring-offset-0">
        <Button
          variant="secondary"
          size="icon"
          className="relative bg-transparent h-auto !focus:outline-none !focus-visible:outline-none !focus:ring-0 !focus-visible:ring-0 !focus:ring-transparent !focus-visible:ring-transparent !focus:ring-offset-0 !focus-visible:ring-offset-0"
        >
          <Clock className="w-6 h-6 text-[#999999] mt-2" />
          {totalReminderNotification > 0 && (
            <span className="absolute -top-[0.5px] right-[5px] w-4 h-4 text-[9px] font-normal text-white bg-red-600 rounded-full flex justify-center items-center">
              {totalReminderNotification}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`bg-tagBoxBg w-[350px] px-4 mt-2 ${reminderNotifications?.length > 0 ? "max-h-[400px]" : "h-auto"
          } overflow-y-auto ${css.customScrollbar}`}
      >
        <div className="flex justify-between items-center gap-10 my-4">
          <span
            className={`${css.notificationFonts} cursor-pointer rounded-md text-lightGray`}
            onClick={() => {
              router.push("/notifications?tab=reminders");
            }}
          >
            REMINDERS DUE
          </span>
          <div>
            <p
              onClick={() => {
                markAllRemindersAsSeen();
              }}
              className={`${css.notificationFonts} w-full border-none font-size-small font-normal cursor-pointer text-lightGray`}
            >
              Mark All as Read
            </p>
          </div>
        </div>
        {reminderNotifications.length > 0 ? (
          reminderNotifications.map((notif) => (
            <div
              key={notif.id}
              className="cursor-pointer"
              onClick={() => handleReminderClick(notif)}
            >
              <div className="flex my-4 items-start gap-x-3 box-border">
                <div className="flex-shrink-0">
                  <div className="rounded-full h-10 w-10 bg-gray-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#999999]" />
                  </div>
                </div>

                <div className="flex flex-col gap-y-2">
                  <p
                    className={`${css.notificationFonts} ${css.noWordBreak} text-lightGray`}
                  >
                    <span className="text-[#0E70FF] font-size-normal font-normal">
                      {user && user?.first_name}
                    </span>{" "}
                    <span className={`font-size-normal font-normal `}>
                      {(() => {
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
                              <span className="text-darkGray">Description: {parts[1]}</span>
                            </>
                          );
                        }
                        // Handle case without Description
                        let messageWithDate = cleanedMessage.replace(/is due now/gi, `was due ${formatDate(notif.created_at)}`);
                        messageWithDate = messageWithDate.replace(/due now/gi, `was due ${formatDate(notif.created_at)}`);
                        return messageWithDate;
                      })()}
                    </span>
                  </p>
                  <div
                    className={`flex gap-x-2 items-center text-darkGray ${css.notificationHoursFont} mt-1`}
                  >
                    <p className="font-size-small font-light text-darkGray">
                      {formatDate(notif.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-b border-borderColor" />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-36">
            <p className="text-darkGray">No Reminders Due</p>
          </div>
        )}

{   reminderNotifications.length > 0 && <div className="sticky bottom-0 flex justify-end py-3 bg-tagBoxBg">
          <button
            onClick={() => router.push("/notifications?tab=reminders")}
            className="text-[#0E70FF] text-sm font-medium hover:text-blue-700 transition-colors"
          >
            View All
          </button>
        </div>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 