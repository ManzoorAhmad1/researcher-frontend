"use client";
import React, { useEffect, useRef, useState } from "react";
import "./header.css";
import { RiMenu2Fill, RiMenuLine } from "react-icons/ri";
import { IoCloudUploadOutline } from "react-icons/io5";
import { CommandMenu } from "../CommandMenu/command-menu";
import UserMenu from "../Sidebar/UserMenu";
import NotificationMenu from "../Sidebar/NotificationMenu";
import ReminderNotificationMenu from "../Sidebar/ReminderNotificationMenu";
import TutorialButton from "./TutorialButton";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import Timer, { UpDateIcon } from "../Header/Timer";
import { changeMode } from "@/reducer/services/userApi";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  fetchSubscription,
  updateSubscription,
} from "@/reducer/services/subscriptionApi";
import { updateUserPlan } from "@/reducer/auth/authSlice";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import fetchSubscriptionData from "@/utils/funcToUpdateUser";
import { FiGift } from "react-icons/fi";
import { getNotications } from "@/apis/team";
import toast from "react-hot-toast";
import css from '../../components/Sidebar/NotificaationMenu.module.css';
import { FileText } from "lucide-react"; // Add an icon for reference extraction progress

type HeaderProps = {
  setProjectMenuOpen: any;
  projectMenuOpen: boolean;
  isProjectRoute: (pathname: string) => boolean;
  setOpenSideMenu: any;
  openSideMenu: any;
  setShowDailyReward: (show: boolean) => void;
  showDailyRewardGift?: boolean;
  setShowDailyRewardGift?: any;
};
const Header: React.FC<HeaderProps> = ({
  projectMenuOpen,
  setProjectMenuOpen,
  isProjectRoute,
  setOpenSideMenu,
  openSideMenu,
  setShowDailyReward,
  showDailyRewardGift,
  setShowDailyRewardGift,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const pathname = usePathname();
  const { lightMode } = useSelector(
    (state: RootState) => state.userUtils ?? {}
  );
  const theme = localStorage.getItem("theme");
  const timerRef: any = useRef(null);
  const [isDark, setIsDark] = useState(false);
  const [progressBar, setProgressBar] = useState<any[]>([]);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const { socket } = useSocket();
  const state: any = useSelector(
    (state: { rolesGoalsData: { currentPage: number } }) =>
      state?.rolesGoalsData
  );

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const user = useSelector((state: RootState) => state.user);
  const { subscriptionData } = useSelector(
    (state: RootState) => state.subscription ?? {}
  );
  const [giftAnimationPaused, setGiftAnimationPaused] = useState(false);
  const giftAnimationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [refProgress, setRefProgress] = useState({ percentage: 0, message: '', visible: false });

  const userData = useSelector((state: any) => state?.user?.user?.user ?? {});
  useEffect(() => {
    if (
      userData?.subscription?.achive_daily_credits?.includes(today) === false &&
      userData?.subscription?.hasClaimed7DayStreak !== today
    ) {
      setShowDailyRewardGift(true);
    }
  }, [today]);
  const handleToggle = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      localStorage.setItem("theme", `${newValue}`);
      dispatch(changeMode(newValue));
      return newValue;
    });
  };
  const truncateFileName = (name: string) =>
    name.length > 17 ? `${name.slice(0, 17)}...` : name;
  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark");
      dispatch(changeMode(false));
    } else {
      document.body.classList.remove("dark");
      dispatch(changeMode(true));
    }
  }, [isDark]);

  useEffect(() => {
    if (theme === "true") setIsDark(true);
    else {
      setIsDark(false);
    }
  }, [theme]);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    // setIsDark(darkModeMediaQuery.matches);
    dispatch(changeMode(darkModeMediaQuery.matches));

    const handleChange = (e: any) => {
      setIsDark(e.matches);
    };

    darkModeMediaQuery.addEventListener("change", handleChange);

    return () => darkModeMediaQuery.removeEventListener("change", handleChange);
  }, []);
  useEffect(() => {
    if (socket) {
      socket.on("creditUpdate", async () => {
        try {
          await fetchSubscriptionData(dispatch, userData);
        } catch (error) {
          console.error("Error fetching subscription data:", error);
        }
      });

      return () => {
        socket.off("creditUpdate");
      };
    }
  }, [socket]);
  useEffect(() => {
    if (socket) {
      socket.on("uploadProgressBar", (data) => {
        if (data?.userId?.toString() === userData?.id?.toString()) {
          resetTimer();
          if (data?.totalFiles === 1) {
            setTotalFiles(0);
          } else {
            setTotalFiles(
              totalFiles === 0
                ? data?.totalFiles
                : data?.totalFiles + totalFiles
            );
          }

          setProgressBar((prev) => {
            const updatedProgress = [...prev];
            const fileIndex = updatedProgress.findIndex(
              (file) => file.fileName === data.fileName
            );
            if (fileIndex !== -1) {
              updatedProgress[fileIndex] = data;
            } else {
              updatedProgress.push(data);
            }
            return updatedProgress;
          });
        }
      });
      return () => {
        socket.off("uploadProgressBar");
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [socket, userData]);

  useEffect(() =>  {
    if (!socket) return;
    const handleProgress = (data: any) => {
      if (typeof data.percentage === "number") {
        setRefProgress({ percentage: data.percentage, message: data.message, visible: true });
        if (data.percentage >= 100) {
          setTimeout(() => setRefProgress((p) => ({ ...p, visible: false })), 2000);
        }
      }
    };
    socket.on("search_progress", handleProgress);
    return () => {socket.off("search_progress", handleProgress);}
  }, [socket]);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setProgressBar([]);
    }, 10 * 1000);
  };

  const handleClearUploadProgress = () => {
    setProgressBar([]);
    setTotalFiles(0);
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [notifList, setNotifList] = useState<any>([]);
  const [totalNotification, setTotalNotification] = useState<number>(0);

  const getNotifications:any = async () => {
    try {
      const response: any = await getNotications({ pageNo: 1, limit: 10 });
      if (response?.success === false) {
        toast.error(
          <span className={css.errorMessage}>{response?.message}</span>
        );
      }
      setNotifList(response?.data?.data || []);
      const totalDocs = response?.data?.totalDocuments || 0;
      setTotalNotification(totalDocs);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching notifications:", error);
    }
  };
  useEffect(() => {
    socket &&
      socket.on("updateLoyalityPoint", (data: any) => {
        let updateDiscriptionData: any;
        if (data?.credit_limit && data?.billingCycleEndDate) {
          updateDiscriptionData = {
            ...subscriptionData?.data,
            credit_limit: data?.credit_limit && data?.credit_limit,
            billingCycleEndDate: data?.billingCycleEndDate,
          };
          dispatch(updateSubscription(updateDiscriptionData));
        } else if (data?.credit_limit) {
          updateDiscriptionData = {
            ...subscriptionData?.data,
            credit_limit: data?.credit_limit && data?.credit_limit,
          };
          dispatch(updateSubscription(updateDiscriptionData));
        } else if (data?.billingCycleEndDate) {
          updateDiscriptionData = {
            ...subscriptionData?.data,
            billingCycleEndDate: data?.billingCycleEndDate,
          };
          const updatedData = {
            ...userData,
            referral_count: data.referral_count && data.referral_count,
            subscription: {
              ...userData?.subscription,
              billingCycleEndDate: data?.billingCycleEndDate,
            },
          };
          dispatch(updateUserPlan(updatedData));

          dispatch(updateSubscription(updateDiscriptionData));
        } else if (data.referradUser || data.refferalUser) {
          if (data.referradUser && data.referradUser.id === userData?.id) {
            const result = data.referradUser;
            dispatch(
              updateUserPlan({
                ...result,
                subscription: data?.refferedSubscriptionData,
              })
            );
            dispatch(updateSubscription(data?.refferedSubscriptionData));
          }
          if (data.refferalUser.id === userData?.id) {
            const result = data.refferalUser;
            dispatch(
              updateUserPlan({
                ...result,
                subscription: data?.refferalSubscription,
              })
            );
            dispatch(updateSubscription(data?.refferalSubscription));
          }
          getNotifications()
        }
      });
  }, [socket]);
  return (
    <div
      className="flex flex-row justify-between dark:bg-[#1A2A2E]"
      style={{ boxShadow: "0px 1px 2px 0px #0000002E" }}
    >
      <div className="flex items-center ms-3 gap-4">
        <div className="hidden custom-show">
          <RiMenuLine
            className="text-3xl text-[#0E70FF] cursor-pointer"
            width={18}
            height={18}
            onClick={() => setOpenSideMenu(true)}
          />
        </div>
        <div
          id="commandMenu"
          onClick={() => {
            if (
              state.formCompleted === true ||
              user?.user?.user?.research_interests?.length > 0
            ) {
              setProjectMenuOpen(!projectMenuOpen);
            }
          }}
        >
          {!projectMenuOpen &&
            (isProjectRoute(pathname) || pathname === "/myprojects") && (
              <ArrowRight
                className={`${
                  state.formCompleted === true ||
                  user?.user?.user?.research_interests?.length > 0
                    ? "cursor-pointer"
                    : "cursor-not-allowed"
                }`}
                width={18}
                height={18}
                color="#666666"
              />
            )}
        </div>
        <div id="search-bar">
          <CommandMenu />
        </div>
      </div>

      <div className="me-5 flex items-center gap-3  ">
        {/* Reference Extraction Progress Indicator */}
        {refProgress.visible && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8 p-[7px] btn rounded-full relative ml-1">
                <span className="absolute text-[10px] top-[3px] right-[3px] text-white">
                  {Math.round(refProgress.percentage)}%
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="flex flex-col gap-3 bg-greyTh">
              <div className="p-2 min-w-[220px]">
                <div className="font-semibold text-[15px] mb-1">Reference Extraction Progress</div>
                <div className="mb-2 text-xs text-gray-700">{refProgress.message}</div>
                <div className="w-full bg-blue-200 rounded h-2">
                  <div
                    className="bg-blue-600 h-2 rounded"
                    style={{ width: `${refProgress.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-right mt-1">{Math.round(refProgress.percentage)}%</div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {progressBar && progressBar?.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 p-[7px] btn rounded-full relative ml-1"
              >
                <IoCloudUploadOutline color="white" />
                <p className="absolute text-[8px] top-[-2px] right-1 text-white">
                  {" "}
                  {totalFiles}
                </p>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="flex flex-col gap-3 bg-greyTh"
            >
              <div className="max-h-[300px] min-w-[300px] mt-2 overflow-y-auto p-2 pl-2 border-tableBorder">
                {progressBar?.map((fileProgress, index) => (
                  <div
                    className=" w-[100%] flex items-center mx-auto px-2 py-1.5 "
                    key={index}
                  >
                    <div className="flex flex-col items-center justify-between w-[100%]">
                      <div className="w-full flex items-center justify-between ">
                        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 border">
                          <div className="flex items-center mb-3">
                            <OptimizedImage
                              src={
                                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//PDFIcon.png`
                              }
                              alt="File icon"
                              width={ImageSizes.icon.sm.width}
                              height={ImageSizes.icon.sm.height}
                              className="mr-3"
                            />
                            <div className="flex-grow">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-size-small font-medium w-[100px] whitespace-nowrap">
                                  {truncateFileName(fileProgress.fileName)}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {(
                                    fileProgress?.fileSize /
                                    (1024 * 1024)
                                  ).toFixed(2)}{" "}
                                  MB
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded bg-blue-200">
                              <div
                                style={{
                                  width: `${fileProgress.percentCompleted}%`,
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
                              ></div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-600">
                                {fileProgress.percentCompleted}% Uploaded
                              </span>
                              <span className="text-xs text-blue-600">
                                {fileProgress.percentCompleted === 100
                                  ? "Complete"
                                  : "Uploading"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="w-[100%] flex justify-end px-6 my-2">
                <Button
                  className="w-fit btn flex justify-end text-white"
                  onClick={() => handleClearUploadProgress()}
                >
                  Clear
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {showDailyRewardGift && (
          <FiGift
            onClick={() => setShowDailyReward(true)}
            className={`ml-4 cursor-pointer text-yellow-500 text-3xl ${
              giftAnimationPaused
                ? "gift-icon-animate paused"
                : "gift-icon-animate"
            }`}
          ></FiGift>
        )}
        <Timer />
        <div>
          <input
            type="checkbox"
            className="checkbox"
            id="checkbox"
            checked={isDark}
            onChange={handleToggle}
          />
          <label htmlFor="checkbox" className="checkbox-label">
            <svg
              className="relative z-10"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1466_691)">
                <path
                  d="M2.71267 8.66667H0V7.33333H2.71267C2.68533 7.552 2.66667 7.774 2.66667 8C2.66667 8.226 2.68533 8.448 2.71267 8.66667ZM4.73533 3.792L2.81467 1.87133L1.872 2.814L3.79267 4.73467C4.06667 4.382 4.38267 4.066 4.73533 3.792ZM12.208 4.73467L14.1287 2.814L13.186 1.87133L11.2653 3.792C11.6173 4.066 11.9333 4.38267 12.208 4.73467ZM8 2.66667C8.226 2.66667 8.448 2.68533 8.66667 2.71267V0H7.33333V2.71267C7.552 2.68533 7.774 2.66667 8 2.66667ZM8 13.3333C7.774 13.3333 7.552 13.3147 7.33333 13.2873V16H8.66667V13.2873C8.448 13.3147 8.226 13.3333 8 13.3333ZM13.2873 7.33333C13.3147 7.552 13.3333 7.774 13.3333 8C13.3333 8.226 13.3147 8.448 13.2873 8.66667H16V7.33333H13.2873ZM11.2653 12.208L13.1853 14.128L14.1287 13.1853L12.2087 11.2653C11.934 11.6173 11.618 11.9333 11.2653 12.208ZM3.792 11.2647L1.872 13.1847L2.81467 14.1273L4.73467 12.2073C4.38267 11.9333 4.066 11.6173 3.792 11.2647ZM5.33333 8C5.33333 9.47067 6.52933 10.6667 8 10.6667C9.47067 10.6667 10.6667 9.47067 10.6667 8C10.6667 6.52933 9.47067 5.33333 8 5.33333C6.52933 5.33333 5.33333 6.52933 5.33333 8ZM12 8C12 10.2093 10.2093 12 8 12C5.79067 12 4 10.2093 4 8C4 5.79067 5.79067 4 8 4C10.2093 4 12 5.79067 12 8Z"
                  fill={isDark ? "#999999" : "white"}
                />
              </g>
              <defs>
                <clipPath id="clip0_1466_691">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <svg
              className="relative z-10"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1466_693)">
                <path
                  d="M7.146 1.388C5.43133 2.74 4 4.86267 4 8C4 11.046 5.292 13.1987 7.032 14.5967C3.81267 14.1267 1.33333 11.3473 1.33333 8C1.33333 4.61333 3.872 1.808 7.146 1.388ZM8 0C3.58867 0 0 3.58867 0 8C0 12.4113 3.58867 16 8 16C9.26267 16 10.58 15.778 11.58 15.214C9.278 14.8053 5.33333 12.9693 5.33333 8C5.33333 2.96333 9.61467 1.122 11.58 0.786C10.42 0.331333 9.26267 0 8 0ZM8 7.33267C8.958 7.62467 9.708 8.37533 9.99933 9.33333C10.2927 8.37533 11.0427 7.62533 12 7.33333C11.0427 7.04067 10.2927 6.29133 9.99933 5.33333C9.708 6.29067 8.958 7.04067 8 7.33267ZM13.334 7.33333C13.9727 7.52867 14.472 8.028 14.6673 8.66733C14.8613 8.028 15.362 7.528 16 7.33333C15.362 7.13867 14.862 6.63867 14.6667 6C14.4713 6.63867 13.972 7.13867 13.334 7.33333ZM12.6673 1.33333C12.376 2.29133 11.6253 3.04133 10.6687 3.334C11.6273 3.62733 12.376 4.37667 12.6693 5.33533C12.9607 4.37667 13.7113 3.62667 14.6667 3.334C13.7113 3.04267 12.9607 2.29133 12.6673 1.33333Z"
                  fill={!isDark ? "#999999" : "white"}
                />
              </g>
              <defs>
                <clipPath id="clip0_1466_693">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>

            <span className="ball"></span>
          </label>
        </div>{" "}
        <div className="h-[60%] w-[.5px] bg-[#E5E5E5]"></div>
        <div id="reminderNotificationMenu">
          <ReminderNotificationMenu
            getNotifications={getNotifications}
            notifList={notifList}
            setNotifList={setNotifList}
            setTotalNotification={setTotalNotification}
          />
        </div>
        <div id="notificationMenu">
          <NotificationMenu
            getNotifications={getNotifications}
            notifList={notifList}
            setNotifList={setNotifList}
            setTotalNotification={setTotalNotification}
            totalNotification={totalNotification}
          />
        </div>
        <div className="h-[60%] w-[.5px] bg-[#E5E5E5]"></div>
        <div id="tutorialButton">
          <TutorialButton />
        </div>
        <div className="h-[60%] w-[.5px] bg-[#E5E5E5]"></div>
        <div id="userMenu">
          <UserMenu />
        </div>
      </div>
    </div>
  );
};

export default Header;
