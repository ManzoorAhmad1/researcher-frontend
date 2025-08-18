"use client";
import withAuth from "@/utils/privateRoute";
import MainSidebar from "@/components/new-sidebar/MainSidebar";
import Header from "@/components/new-sidebar/Header";
import { axiosInstancePrivate } from "@/utils/request";
import "./layout.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ProgressBarProviders from "./ProgressBarProviders";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { currentModelData, updateUserPlan } from "@/reducer/auth/authSlice";
import { findById, getUserSubscription, tourGuide } from "@/apis/user";
import { GrUpgrade } from "react-icons/gr";
import ProjectMenu from "@/components/ProjectMenu";
import { driver } from "driver.js";
import { aiTopic } from "@/utils/aiTemplates";
import {
  suggestionLoader,
  webSearchSuggestion,
} from "@/reducer/web-search/webSearchSlice";
import { AppDispatch, RootState } from "@/reducer/store";
import { lastAllHistory } from "@/apis/topic-explorer";
import Cookies from "js-cookie";
import DndProviderWrapper from "./DndProviderWrapper";
import onboardingTour from "@/components/onboardingTour";
import { trackDailyVisit } from "@/apis/subscription";
import toast from "react-hot-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Loader, Text } from "rizzui";
import { IoInformationCircle, IoClose } from "react-icons/io5";
import { updateSubscription } from "@/reducer/services/subscriptionApi";
import ReferenceResultsModal from "@/components/Sidebar/ReferenceResultsModal";

// Daily Reward Modal Component

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useDispatch<AppDispatch>();
  const [expand, setExpand] = useState(true);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userSubscriptionTime, setUserSubscriptionTime] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [isProjectSelected, setIsProjectSelected] = useState(false);
  const [isTopicExplorerDialog, setIsTopicExplorerDialog] = useState(false);
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showDailyRewardGift, setShowDailyRewardGift] = useState(false);
  const [isReferenceResultsModalOpen, setIsReferenceResultsModalOpen] = useState(false);

  const userData = useSelector(
    (state: any) => state?.user?.user?.user,
    shallowEqual
  );
  const currentModel = useSelector(
    (state: any) => state?.user.currentModel,
    shallowEqual
  );
  const { workspace } = useSelector(
    (state: RootState) => state.workspace,
    shallowEqual
  );

  const router = useRouter();
  const pathname = usePathname();
  const driverObj = useRef({} as any);
  const [projectSubMenu, setProjectSubMenu] = useState("papers");
  const supabase: SupabaseClient = createClient();
  let isSubscriptionExpired: boolean = false;
  const dispatches = useDispatch();
  const searchParams = useSearchParams();

  const isProjectRoute = (pathname: string) => {
    return (
      pathname.includes("/explorer") ||
      pathname.includes("/knowledge-bank") ||
      pathname.includes("/project-overview") ||
      pathname.includes("/info")
    );
  };
  const isBelow900 = useMediaQuery({ maxWidth: 900 });
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (pathname?.startsWith("/info/") && tab === "chat") {
      const desiredState = !isBelow900;
      if (expand !== desiredState) {
        setExpand(desiredState);
      }
    }
  }, [isBelow900]);
  const handleConnectClick: any = async () => {
    try {
      const response: any = await getUserSubscription(userData?.id);
      response && sessionStorage.setItem("userStatusFlag", "true");
      setUserSubscriptionTime(response?.data?.data?.billingCycleEndDate);

      if (response) {
        new Date(userSubscriptionTime) < new Date()
          ? localStorage.setItem("userStatusFlag", "false")
          : localStorage.setItem("userStatusFlag", "true");
      }
    } catch (error: any) {
      if (error?.status === 401) {
        sessionStorage.setItem("userStatusFlag", "true");
      }
    }
  };

  const generateTopics = async () => {
    try {
      const apiRes = await lastAllHistory(workspace?.id);
      let research_interests = [];
      const lastHistory = apiRes?.data?.map((item: any) => item?.search_value);

      if (apiRes?.data?.length === 5) {
        research_interests = lastHistory;
      } else {
        research_interests = [
          ...(userData?.research_keywords || []),
          ...lastHistory,
        ];
      }

      const body = { prompt: `${aiTopic(research_interests)}` };
      dispatch(webSearchSuggestion({ id: userData?.id, body }));
      Cookies.set("lastApiCall", Date.now().toString(), { expires: 1 });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useLayoutEffect(() => {
    dispatch(suggestionLoader(true));
    if (workspace?.id) {
      const lastApiCall = Cookies.get("lastApiCall");
      if (
        lastApiCall === undefined &&
        userData?.research_interests?.length > 0
      ) {
        generateTopics();
      } else {
        dispatch(suggestionLoader(false));
      }
    }
  }, [dispatch, userData?.research_interests?.length, workspace?.id]);

  useEffect(() => {
    handleConnectClick();
  }, [userData]);

  useEffect(() => {
    if (!isProjectRoute(pathname)) {
      setProjectMenuOpen(false);
      setIsProjectSelected(false);
    }
  }, [pathname]);

  const startTour = () => {
    driverObj.current = driver({
      popoverClass: "driverjs-theme large-video-popover",
      showProgress: true,
      overlayClickNext: false,
      allowClose: true,
      showButtons: ["next", "previous", "close"],
      onHighlightStarted: (element: any) => {
        if (!document.getElementById("driver-custom-styles")) {
          const styleSheet = document.createElement("style");
          styleSheet.id = "driver-custom-styles";
          styleSheet.innerHTML = `
            .large-video-popover {
              max-width: 400px !important;
              width: 400px !important;
            }
            .large-video-popover .driver-popover-content-wrapper {
              max-width: 100% !important;
            }
            .large-video-popover .driver-popover-description {
              max-height: none !important;
            }
          `;
          document.head.appendChild(styleSheet);
        }
      },
      onPopoverRender: (popover: any) => {
        const overlay = document.querySelector(".driver-overlay");
        if (overlay) {
          overlay.addEventListener("click", () => {
            if (confirm("Are you sure you want to exit the tour?")) {
              driverObj.current.destroy();
            }
          });
        }
      },
      steps: onboardingTour,
    } as any);

    if (driverObj.current) {
      driverObj.current.drive();
    } else {
      console.error("Driver.js initialization failed.");
    }
  };
  const notifyModelAPI = async (payload: any) => {
    try {
      manageAIModel();
    } catch (error) {
      console.error("Error notifying API:", error);
    }
  };
  const subscribeToCreditHistoryChanges = () => {
    const channel = supabase.channel("table-ai-model");

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "manage_ai_model" },
      async (payload) => {
        await notifyModelAPI(payload);
      }
    );

    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "manage_ai_model" },
      async (payload) => {
        await notifyModelAPI(payload);
      }
    );

    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "manage_ai_model" },
      async (payload) => {
        await notifyModelAPI(payload);
      }
    );

    channel.subscribe();
    return channel;
  };

  const manageAIModel = async () => {
    try {
      const { data } = await axiosInstancePrivate.get(`/users/get-model`);
      if (data.data[0]) {
        dispatches(currentModelData(data.data[0].current_model));
      }
    } catch (error: any) {
      console.error(`Model Table API Error: ${error}`);
    }
  };
  const getCurrentModel = () => {
    manageAIModel();
    return subscribeToCreditHistoryChanges();
  };

  useEffect(() => {
    const checkTour = async () => {
      try {
        const response: any = await findById(userData?.id);
        setIsTopicExplorerDialog(response?.data.data.hasTopicExplorerModal);
        const hasTourSeen = response?.data?.data?.hasTourSeen;
        if (hasTourSeen === false) {
        }
      } catch (error) {
        console.error("Error checking tour:", error);
      }
    };

    let channel: any;
    if (userData?.id) {
      checkTour();
      channel = getCurrentModel();
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [userData]);

  useEffect(() => {
    const handleStartTour = () => {
      startTour();
    };

    window.addEventListener("startAppTour", handleStartTour);

    return () => {
      window.removeEventListener("startAppTour", handleStartTour);
    };
  }, []);

  let restoredShowUpgradePlanMode: any = localStorage.getItem("userStatusFlag");

  if (userSubscriptionTime) {
    isSubscriptionExpired = new Date(userSubscriptionTime) < new Date();

    isSubscriptionExpired && sessionStorage.setItem("userStatusFlag", "false");
  }
  useEffect(() => {
    if (isSubscriptionExpired) {
      localStorage.setItem("userPlanStatusFlag", "true");
      setIsModalOpen(true);
      router.push("/account/subscriptions");
    } else {
      localStorage.setItem("userPlanStatusFlag", "false");
    }
  }, [isSubscriptionExpired]);

  // Add event listener for reference results modal
  useEffect(() => {
    const handleOpenReferenceResultsModal = () => {
      setIsReferenceResultsModalOpen(true);
    };

    window.addEventListener('openReferenceResultsModal', handleOpenReferenceResultsModal);

    return () => {
      window.removeEventListener('openReferenceResultsModal', handleOpenReferenceResultsModal);
    };
  }, []);

  const handleUpgradeClick = () => {
    setIsModalOpen(false);
    router.push("/account/subscriptions");
  };
  const contactSupportClick = () => {
    window.open("https://chat.cloud.board.support/969665972?ticket", "_blank");
  };

  const showUpgradePlanMode = isSubscriptionExpired && isModalOpen;
  return (
    <div className="h-full w-full flex ">
      <ProgressBarProviders>
        <div
          className={`${
            !userData?.research_interests?.length
              ? " inset-0 z-10 bg-[#2e2a2af7] backdrop-blur-[6px] pointer-events-none cursor-not-allowed"
              : ""
          }`}
        >
          <MainSidebar
            setOpenSideMenu={setOpenSideMenu}
            openSideMenu={openSideMenu}
            expand={expand}
            setExpand={setExpand}
            isProjectRoute={isProjectRoute}
            isTopicExplorerDialog={isTopicExplorerDialog}
            setIsTopicExplorerDialog={setIsTopicExplorerDialog}
            onLinkClick={() =>
              restoredShowUpgradePlanMode === false || setIsModalOpen(true)
            }
            setIsProjectSelected={setIsProjectSelected}
            setProjectSubMenu={setProjectSubMenu}
            projectSubMenu={projectSubMenu}
            isSubscriptionExpired={isSubscriptionExpired}
          />
        </div>
    <div
          className={`layout-page-animation ${
            expand ? "layout-page" : "expand-layout-page"
          }`}
        >
          {/* Header with overlay blur and dark effect */}
          <div className="relative">
            {  !userData?.research_interests?.length && (
              <div className="absolute inset-0 z-10 bg-[#2e2a2af7] backdrop-blur-[6px] pointer-events-none cursor-not-allowed" />
            )}
            <div className={!userData?.research_interests?.length ? "pointer-events-none" : ""}>
              <Header
                setOpenSideMenu={setOpenSideMenu}
                openSideMenu={openSideMenu}
                projectMenuOpen={projectMenuOpen || isProjectSelected}
                setProjectMenuOpen={setProjectMenuOpen}
                isProjectRoute={isProjectRoute}
                setShowDailyReward={setShowDailyReward}
                showDailyRewardGift={showDailyRewardGift}
                setShowDailyRewardGift={setShowDailyRewardGift}
              />
            </div>
          </div>

          <div className="flex main-contain">
            {(projectMenuOpen || isProjectSelected) && (
              <ProjectMenu
                projectMenuOpen={projectMenuOpen || isProjectSelected}
                expand={expand}
                setProjectMenuOpen={setProjectMenuOpen}
                onLinkClick={() =>
                  restoredShowUpgradePlanMode === false || setIsModalOpen(true)
                }
                sidebarWidth={sidebarWidth}
                setSidebarWidth={setSidebarWidth}
                isProjectSelected={isProjectSelected}
                setIsProjectSelected={setIsProjectSelected}
                setProjectSubMenu={setProjectSubMenu}
                projectSubMenu={projectSubMenu}
              />
            )}

            <div
              className={`relative ml-0 w-full`}
              id="commandMenu"
              style={
                projectMenuOpen || isProjectSelected
                  ? { marginLeft: `${sidebarWidth}px` }
                  : {}
              }
            >
              {showUpgradePlanMode && (
                <div className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
                  <div className="bg-white p-10 rounded-lg shadow-xl text-center space-y-6 max-w-lg w-full">
                    <div className="flex justify-center">
                      <GrUpgrade className="text-red-500 w-48 h-32" />
                    </div>

                    <p className="text-2xl font-semibold text-gray-800">
                      Your subscription has expired.
                    </p>
                    <p className="text-lg text-gray-500">
                      To continue enjoying all features, please upgrade your
                      plan.
                    </p>

                    <button
                      className="bg-red-600 text-white py-3 px-8 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 transition-all duration-300"
                      onClick={handleUpgradeClick}
                    >
                      Upgrade Plan
                    </button>

                    <p className="text-sm text-gray-500">
                      Need help?{" "}
                      <a
                        onClick={contactSupportClick}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Contact Support
                      </a>
                    </p>
                  </div>
                </div>
              )}

              <DndProviderWrapper>{children}</DndProviderWrapper>
            </div>
          </div>
        </div>
      </ProgressBarProviders>
      <DailyRewardModal
        isOpen={showDailyReward}
        onClose={() => setShowDailyReward(false)}
        setShowDailyRewardGift={setShowDailyRewardGift}
      />
      <ReferenceResultsModal
        isOpen={isReferenceResultsModalOpen}
        onClose={() => setIsReferenceResultsModalOpen(false)}
        onPaperAdd={(paperId, url) => {
          // Handle paper addition if needed
        }}
      />
    </div>
  );
}
const DailyRewardModal = ({
  isOpen,
  onClose,
  setShowDailyRewardGift,
}: {
  isOpen: boolean;
  onClose: () => void;
  setShowDailyRewardGift:any
}) => {
  const userData = useSelector(
    (state: any) => state?.user?.user?.user,
    shallowEqual
  );
  const dispatch = useDispatch<any>();
  const [isLoading, setIsLoading] = useState(false);

  // Calculate consecutive days from achive_daily_credits array
  const getDaysConsecutive = () => {
    if (!userData?.subscription?.achive_daily_credits) return 0;

    const achievedDates = userData.subscription.achive_daily_credits;
    if (achievedDates.length === 0) return 0;

    return achievedDates.length;
  };

  const currentConsecutiveDays = getDaysConsecutive();

  const getDailyReward = () => {
    if (currentConsecutiveDays === 6) {
      return 500;
    }
    return 100;
  };

  const handleClaim = async () => {
    setIsLoading(true);

    try {
      const response = await trackDailyVisit();
      if (response?.data?.isSuccess === true) {
        dispatch(
          updateUserPlan({
            ...userData,
            subscription: response?.data?.subscription,
          })
        );
        dispatch(updateSubscription(response?.data?.subscription));
        setShowDailyRewardGift(false);
        toast.success(
          response?.data?.message || "Daily reward claimed successfully!"
        );
        onClose();
      }
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      toast.error("Failed to claim daily reward. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-6 max-w-md dark:bg-gray-800">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold dark:text-white">
            Daily Reward
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your daily reward is ready to be claimed. Come back every day to
            earn more credits.
          </p>

          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Today Award
              </p>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getDailyReward().toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                credits
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded flex items-center gap-3 ">
            <div className="text-blue-500 dark:text-blue-400">
              <IoInformationCircle className="h-5 w-5" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {currentConsecutiveDays >= 6
                ? "Congratulations on your 7-day login streak! You've earned the exclusive 500 credit bonus reward."
                : "Sign in for 7 consecutive days to unlock a special 500 credit bonus. Your consistency is valued!"}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleClaim}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader variant="threeDot" size="sm" className="text-white" />
              </span>
            ) : (
              "Claim Reward"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default withAuth(RootLayout);
