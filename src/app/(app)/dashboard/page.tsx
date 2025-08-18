"use client";

import { HeaderTitle } from "@/components/Header/HeaderTitle";
import React, { useEffect, useState, useRef } from "react";
import { createSelector } from "reselect";
import {
  DialogHeader,
  DialogTitle,
  DialogContent,
  Dialog,
} from "@/components/ui/dialog";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { RootState } from "@/reducer/store";
import { useSelector } from "react-redux";
import ResearchInterestForm from "../topic-explorer/ResearchInterestForm";
import { getFavouriteNews } from "@/apis/explore";
import ArticleList from "../web-search/NewsList";
import NewsCarousel from "./NewsCarousel";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { tourGuide } from "@/apis/user";
import VideoTutorialModal from "./WelcomeModal";

const Dashboard: React.FC = () => {
  const [isResearchInterestOpen, setIsResearchInterestOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favouriteNews, setFavouriteNews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [onNextLoader, setOnNextLoader] = useState(false);
  const [onCloseLoader, setOnCloseLoader] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const orgName = searchParams.get("org_name") as string;
  const teamName = searchParams.get("team_name") as string;

  const selectUser = createSelector(
    [(state: RootState) => state.user],
    (userState) => userState?.user || ""
  );

  const { user } = useSelector(selectUser);

  const handleGetNewsByTopics = async () => {
    setIsLoading(true);

    try {
      let response = await getFavouriteNews();

      if (response?.success) {
        setFavouriteNews(response?.data);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching workspaces data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = async () => {
    const lastCheckTime = localStorage.getItem("lastCreditCheckTime");
    const currentTime = new Date().getTime();

    if (!lastCheckTime || currentTime - parseInt(lastCheckTime) > 3600000) {
      const { forward, message, mode } = (await verifyCreditApi(user?.id)) as {
        forward: boolean;
        message: string;
        mode: string;
      };
      localStorage.setItem("lastCreditCheckTime", currentTime.toString());
    }
  };

  const handleTour = async () => {
    setShowModal(false);
    setVideoModal(true);
    localStorage.removeItem("showWelcomeTour");
    localStorage.setItem("AppOverViewModal", "true");
  };

  const referral_code = localStorage.getItem("referral_code");
  const exploreItself = async () => {
    try {
      setOnCloseLoader(true);
      setVideoModal(false);
      localStorage.removeItem("AppOverViewModal");
      await tourGuide(referral_code);
      setOnCloseLoader(false);
    } catch (error) {
      setOnCloseLoader(false);
      console.error("Error in exploreItself:", error);
    }
  };

  const handleNextStep = async () => {
    try {
      setOnNextLoader(true);
      await tourGuide(referral_code);
      setVideoModal(false);
      const event = new Event("startAppTour");
      window.dispatchEvent(event);
      localStorage.removeItem("AppOverViewModal");
      setOnNextLoader(false);
    } catch (error) {
      setOnNextLoader(false);
      console.error("Error in handleNextStep:", error);
    }
  };
  useEffect(() => {
    const shouldShowTour = localStorage.getItem("showWelcomeTour") === "true";
    const isAppOverViewModal =
      localStorage.getItem("AppOverViewModal") === "true";
    if (shouldShowTour) {
      setShowModal(true);
    }
    if (isAppOverViewModal) {
      setVideoModal(true);
    }
  }, []);

  useEffect(() => {
    if (orgName) {
      toast.success(
        `Invitation from "${orgName}" Organization has been accepted successfully. Congratulations!`
      );
      router.push(`/dashboard`);
    }
    if (teamName) {
      toast.success(
        `Invitation from "${teamName}" Team has been accepted successfully. Congratulations!`
      );
      router.push(`/main-topic-explorer`);
    }
  }, [orgName, teamName, router]);

  useEffect(() => {
    handleGetNewsByTopics();
  }, []);

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    filterData();
  }, []);

  return (
    <main className="mb-12">
      <Dialog
        open={isResearchInterestOpen}
        onOpenChange={setIsResearchInterestOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Workspace</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4">
            <div className="flex flex-col justify-between gap-2">
              <ResearchInterestForm fullwidth />
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <NewsCarousel
        articles={favouriteNews}
        handleGetNewsByTopics={handleGetNewsByTopics}
        loading={isLoading}
      />

      {videoModal && (
        <VideoTutorialModal
          onClose={() => exploreItself()}
          onNext={() => handleNextStep()}
          onNextLoader={onNextLoader}
          onCloseLoader={onCloseLoader}
          videoSrc="https://shyulpexykcgruhbjihk.supabase.co/storage/v1/object/public/userProfileImage/videos/1744297952301-SAMPLE%20002.mp4"
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 md:p-4">
          <div className="bg-white rounded-3xl w-full max-w-md md:max-w-2xl h-auto shadow-lg overflow-hidden">
            <div className="bg-[linear-gradient(94.97deg,#D8E8FF_17.56%,#FFE8C7_94.43%)] rounded-t-3xl p-3 md:p-6 text-center flex flex-col items-center">
              <p className="text-[#333333] text-xs md:text-lg">Welcome To</p>
              <img
                src="https://ik.imagekit.io/HuzaifaKhan/Group%201.svg?updatedAt=1739365884022"
                alt="Welcome"
                className="mx-auto w-1/2 md:w-1/3 py-1 md:py-2"
              />
              <p className="text-[#333333] text-xs md:text-sm text-center">
                Streamline your research workflow and boost productivity with
                <span className="hidden sm:inline">
                  <br />
                </span>{" "}
                AI-driven automation.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-4 text-center mt-2 md:mt-4 px-2 md:px-6">
              {[
                { title: "Explore Trends", icon: "Group 293.svg" },
                { title: "Collaborate Effectively", icon: "Group 294.svg" },
                { title: "Gain Insights", icon: "Group 293 (1).svg" },
                { title: "Discover Unique Topics", icon: "Group 293 (2).svg" },
                { title: "Share Knowledge", icon: "Group 294 (1).svg" },
                { title: "Automatic AI Analysis", icon: "Group 293 (3).svg" },
              ].map(({ title, icon }, index) => (
                <div key={index} className="flex flex-col items-center p-1">
                  <img
                    src={`https://ik.imagekit.io/HuzaifaKhan/${icon}`}
                    alt={title}
                    className="mx-auto w-1/2 md:w-2/5"
                  />
                  <p className="font-semibold text-[#333333] text-xs md:text-sm leading-tight h-8 md:h-10 flex items-center justify-center">
                    {title}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-2 md:mt-4 flex-col gap-2 md:gap-4 px-3 md:px-6 pb-4 md:pb-6">
              <p className="text-center text-gray-600 text-xs md:text-sm">
                Discover, collaborate, and innovate. Your all-in-one research
                platform.
                <span className="hidden sm:inline">
                  <br />
                  Simplify your research workflow.
                </span>
              </p>
              <div className="flex justify-center mt-1 md:mt-2">
                <button
                  className="bg-gradient-to-t from-[#0F55BA] to-[#0E70FF] text-white text-xs md:text-sm font-medium rounded-[26px] px-8 md:px-12 py-2 border-[#3686FC] border-[2px]"
                  onClick={handleTour}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
