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
import { Bell, Clock } from "lucide-react";
import css from "./NotificaationMenu.module.css";
import {
  getNotications,
  markAllNotificationAsSeen,
  markNotificationAsSeen,
} from "@/apis/team";
import { useRouter } from "next/navigation";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import toast from "react-hot-toast";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface Notification {
  id: number;
  message: string;
  created_at: string;
  notification_type?: string;
  target_id?: string | number;
}

interface UserMenuProps {
  getNotifications: () => void;
  notifList: Notification[];
  totalNotification: number;
  setNotifList: React.Dispatch<React.SetStateAction<Notification[]>>;
  setTotalNotification: React.Dispatch<React.SetStateAction<number>>;
}

export default function UserMenu({
  getNotifications,
  notifList,
  totalNotification,
  setNotifList,
  setTotalNotification,
}: UserMenuProps) {
  const dispatch: AppDispatch = useDispatch();
  const [readNotif, setReadNotif] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [totalOtherNotification, setTotalOtherNotification] = useState<number>(0);
  const router = useRouter();
  const user = useSelector((state: any) => state.user?.user?.user);
  const fetchMounted = useRef<boolean>(false);
  const { socket } = useSocket();

  // Filter out reminder_due notifications
  const otherNotifications = notifList.filter(
    (notif) => notif.notification_type !== "reminder_due"
  );

  // Calculate unread other notifications count
  const unreadOtherNotifications = otherNotifications.filter(
    (notif) => !readNotif.has(notif.id)
  );

  // Update total other notification count when otherNotifications change
  useEffect(() => {
    setTotalOtherNotification(unreadOtherNotifications.length);
  }, [otherNotifications, readNotif]);

  useEffect(() => {
    if (fetchMounted.current) return;
    fetchMounted.current = true;
    getNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleSubscriptionNotification = (notification: any) => {
        if (notification?.user === user?.email) {
          setNotifList((prevList) => [
            { id: prevList.length + 1, ...notification },
            ...prevList,
          ]);
          setTotalOtherNotification((prev) => prev + 1);
        }
      };

      const handleUsageNotification = (notification: any) => {
        if (notification?.user === user?.email) {
          setNotifList((prevList) => [
            { id: prevList.length + 1, ...notification },
            ...prevList,
          ]);
          setTotalOtherNotification((prev) => prev + 1);
        }
      };

      const handleFileProcessing = (fileProcessing: any) => {
        if (user?.id === fileProcessing?.userId) {
          if (fileProcessing?.isSuccess) {
            toast.success(fileProcessing?.message);
          } else {
            toast.error(fileProcessing?.message);
          }
          getNotifications();
          setTotalOtherNotification((prev) => prev + 1);
        }
      };
      const handleBackgroundProcessingComplete = (notification: any) => {
        if (user?.id === notification?.userId) {
          if (notification?.success) {
            toast.success("Reference extraction completed successfully!");
          } else {
            toast.error(notification?.message || "Reference extraction failed. Please try again.");
          }
          getNotifications();
          setTotalOtherNotification((prev) => prev + 1);
        }
      };

      const handleReferenceExtractionComplete = (result: any) => {

        if (result?.success && result?.data) {
          // Show toast with "Show Results" button for successful completion with data
          toast.success(
            (t) => (
              <div className="flex items-center justify-between gap-2">
                <span>Reference extraction completed successfully!</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Store the result data for modal display
                      localStorage.setItem('referenceExtractionResults', JSON.stringify(result));
                      // Trigger modal open event
                      window.dispatchEvent(new CustomEvent('openReferenceResultsModal'));
                      toast.dismiss(t.id);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Show Results
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ),
            { duration: Infinity }
          );
        } else if (result?.success) {
          // Show simple success message when no data
          toast.success(
            (t) => (
              <div className="flex items-center justify-between gap-4">
                <span>{result?.message}</span>
                <div className="flex items-center gap-2">

                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ),
            { duration: Infinity }
          );
        } else {
          // Show error message
          toast.error(result?.message || "Reference extraction failed. Please try again.");



        }

        getNotifications();
        setTotalNotification((prev) => prev + 1);
      };

      socket.on("subscriptionNotification", handleSubscriptionNotification);
      socket.on("usageNotification", handleUsageNotification);
      socket.on("fileProcessing", handleFileProcessing);
      socket.on("reference_extraction_complete", handleReferenceExtractionComplete);
      
      socket.on("team_invitation", (team_invitation: any) => {
        if (user?.id === team_invitation?.user_id) {
          getNotifications();
          setTotalOtherNotification((prev) => prev + 1);
        }
      });
      socket.on("org_invitation", (org_invitation: any) => {
        if (user?.id === org_invitation?.user_id) {
          getNotifications();
          setTotalOtherNotification((prev) => prev + 1);
        }
      });

      socket.on("selectedNotification", (notification: any) => {
        const id = notification?.paperId;
        notification?.selectedNotification && getNotifications();
      });
      socket.on("userNotFound", (userNotFound: any) => {
        if (user?.id?.toString() === userNotFound?.userId?.toString()) {
          toast.error(userNotFound?.message);
        }
      });
      socket.on(
        "projectCollaboratorNotification",
        (projectCollaboratorNotification: any) => {
          if (
            user?.id?.toString() ===
            projectCollaboratorNotification?.userId?.toString()
          ) {
            getNotifications();
            setTotalOtherNotification((prev) => prev + 1);
          }
        }
      );
      socket.on(
        "workspaceCollaboratorNotification",
        (workspaceCollaboratorNotification: any) => {
          if (
            user?.id?.toString() ===
            workspaceCollaboratorNotification?.userId?.toString()
          ) {
            getNotifications();
            setTotalOtherNotification((prev) => prev + 1);
          }
        }
      );

      return () => {
        socket.off("subscriptionNotification", handleSubscriptionNotification);
        socket.off("usageNotification", handleUsageNotification);
        socket.off("fileProcessing", handleFileProcessing);
        socket.off("reference_extraction_complete", handleReferenceExtractionComplete);
        socket.off("selectedNotification");
        socket.off("userNotFound");
        socket.off("team_invitation");
        socket.off("org_invitation");
        socket.off("projectCollaboratorNotification");
        socket.off("workspaceCollaboratorNotification");
      };
    }
  }, [user, socket]);



  const markAllAsSeen = async () => {
    try {
      const response: any = await markAllNotificationAsSeen('others');
      if (response?.success === false) {
        toast.error(
          <span className={css.errorMessage}>{response?.message}</span>
        );
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error marking notifications as seen:", error);
    }
    setTotalOtherNotification(0);
    // Mark all other notifications as read locally
    const otherIds = otherNotifications.map(notif => notif.id);
    setReadNotif(prev => new Set([...prev, ...otherIds]));
  };

  const handleNotificationClick = async (notif: any) => {
    if (!readNotif.has(notif.id)) {
      try {
        const response: any = await markNotificationAsSeen(notif.id);
        if (response?.success === false) {
          toast.error(
            <span className={css.errorMessage}>{response?.message}</span>
          );
        }
        setTotalOtherNotification((prev) => Math.max(prev - 1, 0));
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
        console.error("Error marking notification as seen:", error);
      }
    }
    setReadNotif((prev) => new Set(prev).add(notif.id));
    
    // Find the notification to get its type and target_id
    if (notif.notification_type === 'file_processing') {
       
      router.push(`/info/${notif.target_id}`)
    
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

  const filteredNotifications = (type: "all" | "unread") => {
    return otherNotifications.filter((notif) => {
      const isRead = readNotif.has(notif.id);
      return type === "all" || (type === "unread" && !isRead);
    });
  };


  const profile_image =
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/userProfileImage/uploads/19/images.png`;



  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-transparent focus-visible:ring-transparent focus:ring-offset-0 focus-visible:ring-offset-0">
        <Button
         
          variant="secondary"
          size="icon"
          className="relative bg-transparent h-auto !focus:outline-none !focus-visible:outline-none !focus:ring-0 !focus-visible:ring-0 !focus:ring-transparent !focus-visible:ring-transparent !focus:ring-offset-0 !focus-visible:ring-offset-0"
        >
          <Bell className="w-6 h-6 text-[#999999] mt-2" />
          {totalOtherNotification > 0 && (
            <span className="absolute -top-[0.5px] right-[5px] w-4 h-4 text-[9px] font-normal text-white bg-red-600 rounded-full flex justify-center items-center">
              {totalOtherNotification}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`bg-tagBoxBg w-[350px] px-4 mt-2 ${filteredNotifications(activeTab)?.length > 0 ? "max-h-[400px]" : "h-auto"
          } overflow-y-auto ${css.customScrollbar}`}
      >
        <div className="flex justify-between items-center gap-10  my-4">
          <span
            className={`${css.notificationFonts} cursor-pointer rounded-md text-lightGray`}
            onClick={() => {
              setActiveTab("all");
              router.push("/notifications");
            }}
          >
            NOTIFICATION
          </span>
          <div>
            <p
              onClick={() => {
                markAllAsSeen();
              }}
              className={`${css.notificationFonts} w-full border-none font-size-small font-normal  cursor-pointer text-lightGray`}
            >
              Mark All as Read
            </p>
          </div>
        </div>
        {filteredNotifications(activeTab).length > 0 ? (
          filteredNotifications(activeTab).map((notif) => (
            <div
              key={notif.id}
              className="cursor-pointer"
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="flex my-4 items-start gap-x-3 box-border">
                <div className="flex-shrink-0">
                  <OptimizedImage
                    src={user?.profile_image || profile_image}
                    alt="Profile User"
                    className="rounded-full h-10 w-10 object-cover"
                    width={ImageSizes.avatar.md.width}
                    height={ImageSizes.avatar.md.height}
                  />
                </div>

                <div className="flex flex-col gap-y-2">
                  <p
                    className={`${css.notificationFonts} ${css.noWordBreak} ${notif?.message?.toLowerCase()?.includes("error")
                        ? "text-red-600"
                        : "text-lightGray"
                      }`}
                  >
                    <span className="text-[#0E70FF] font-size-normal font-normal">
                      {user && user?.first_name}
                    </span>{" "}
                    <span className={`font-size-normal font-normal `}>
                      {(() => {
                        const cleanedMessage = notif?.message?.replace(/[^a-zA-Z0-9 \(\)\[\]\{\}\<\>\: ]/g, ' ');
                        if (cleanedMessage?.includes('Description:')) {
                          const parts = cleanedMessage.split('Description:');
                          return (
                            <>
                              {parts[0]}
                              <br />
                              <span className="text-darkGray">Description: {parts[1]}</span>
                            </>
                          );
                        }
                        return cleanedMessage;
                      })()}
                    </span>
                  </p>
                  <div
                    className={`flex gap-x-2 items-center text-darkGray ${css.notificationHoursFont}`}
                  >
                    <p className="font-size-small font-normal text-darkGray">
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
            <p className="text-darkGray">No New Notifications</p>
          </div>
        )}
        
        {/* View All Button */}
             {   filteredNotifications(activeTab).length > 0 && <div className="sticky bottom-0 flex justify-end py-3  bg-tagBoxBg">
          <button
            onClick={() => router.push("/notifications")}
            className="text-[#0E70FF] text-sm font-medium hover:text-blue-700 transition-colors"
          >
            View All
          </button>
        </div>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}