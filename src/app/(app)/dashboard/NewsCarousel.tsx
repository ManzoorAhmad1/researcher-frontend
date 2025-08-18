"use client";
import { handleFavouriteNews } from "@/apis/explore";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import WelcomeSection from "./WelcomeSection";
import RecentKnowledge from "./RecentKnowledge";
import RecentFolder from "./RecentFolder";
import ColleagueUpdates from "./ColleagueUpdates";
import Favorites from "./Favorites";
import RemainingCredits from "./RemainingCredits";
import RecentActivities from "./RecentActivities";
import ActivityMap from "./ActivityMap";
import TrendingTopics from "./TrendingTopics";
import NewsDiscoveries from "./NewsDiscoveries";
import { getDashboardAnalytics } from "@/apis/collaborates";
import { useSelector } from "react-redux";
import {
  getNotesAndBookmarks,
  getProjects,
  getActivities,
  getWorkspaces,
  getRecentFolder,
  getFilesCount,
  getFavorites,
  getTrendingTopics,
  getUserStorage,
  getLatestReminders,
} from "@/apis/dashboard";
import { SlickCarouselLoader } from "@/components/SlickCarouselLoader";
import WhatsNewFeed from "./WhatsNewFeed";
import SmartSearchKeywords from "./SmartSearchKeywords";
import Reminders from "./Reminders";

interface NewsCarouselProps {
  handleGetNewsByTopics: (value?: boolean) => void;
  articles: NewsCarouselType[] | [];
  loading: boolean;
}

type NewsCarouselType = {
  created_at: string;
  date: string;
  description?: string;
  domain: string;
  id: number;
  is_favourite: boolean;
  link: string;
  search_id: number;
};

const NewsCarousel: React.FC<NewsCarouselProps> = ({
  articles,
  handleGetNewsByTopics,
}) => {
  const handleIsFavourite = async (
    is_favourite: boolean,
    id: number,
    search_id: number
  ) => {
    try {
      const response = await handleFavouriteNews(is_favourite, id, search_id);

      if (response) {
        toast.success("Favourite news updated Successfully!");
        handleGetNewsByTopics(true);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    }
  };

  const [workspace, setWorkspace] = React.useState<any>([]);
  const [projects, setProjects] = React.useState<any>([]);
  const [resources, setResources] = React.useState<any>([]);
  const [recentFolder, setRecentFolder] = React.useState<any>([]);
  const [favorite, setFavorite] = React.useState<any>([]);
  const [trendingTopics, setTrendingTopics] = React.useState<any>([]);
  const [loading, setLoading] = React.useState(false);
  const [activities, setActivities] = React.useState<any>([]);
  const [fileCount, setFileCount] = React.useState<any>(0);
  const [userStorage, setUserStorage] = React.useState<any>(0);
  const [loadingResources, setLoadingResources] = React.useState(false);
  const [loadingProjects, setLoadingProjects] = React.useState(false);
  const [loadingActivities, setLoadingActivities] = React.useState(false);
  const [loadingWorkspace, setLoadingWorkspace] = React.useState(false);
  const [loadingRecentFolder, setLoadingRecentFolder] = React.useState(false);
  const [loadingFileCount, setLoadingFileCount] = React.useState(false);
  const [loadingFavorites, setLoadingFavorites] = React.useState(false);
  const [loadingReminders, setLoadingReminders] = React.useState(false);
  const [loadingTrendingTopics, setLoadingTrendingTopics] =
    React.useState(false);
  const [loadingUserStorage, setLoadingUserStorage] = React.useState(false);
const [reminders, setReminders] = React.useState<any>([]);
  const projectId = useSelector((state: any) => state?.project?.project?.id);

  useEffect(() => {
    const fetchResources = async () => {
      setLoadingResources(true);
      try {
        const response = await getNotesAndBookmarks();
        setResources(response?.data?.notesAndBookmarks?.data);
      } catch (error: any) {
        console.error("Error fetching resources:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoadingResources(false);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await getProjects();
        setProjects(response?.data.projects);
      } catch (error: any) {
        console.error("Error fetching projects:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const response = await getActivities();
        setActivities(response?.data?.allActivities);
      } catch (error: any) {
        console.error("Error fetching activities:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchWorkspace = async () => {
      setLoadingWorkspace(true);
      try {
        const response = await getWorkspaces();
        setWorkspace(response?.data?.workspaces);
      } catch (error: any) {
        console.error("Error fetching workspace:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoadingWorkspace(false);
      }
    };
    fetchWorkspace();
  }, []);

  useEffect(() => {
    const fetchRecentFolder = async () => {
      setLoadingRecentFolder(true);
      try {
        const response = await getRecentFolder();
        setRecentFolder(response?.data?.recentFolder);
      } catch (error: any) {
        console.error("Error fetching recent folder:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoadingRecentFolder(false);
      }
    };
    fetchRecentFolder();
  }, []);

  useEffect(() => {
    const fetchFileCount = async () => {
      setLoadingFileCount(true);
      try {
        const response = await getFilesCount();
        setFileCount(response?.data.filesCount);
      } catch (error: any) {
        console.error("Error fetching file count:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoadingFileCount(false);
      }
    };
    fetchFileCount();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoadingFavorites(true);
      try {
        const response = await getFavorites();
        setFavorite(response?.data?.favorites);
      } catch (error: any) {
        console.error("Error fetching favorites:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoadingFavorites(false);
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      setLoadingTrendingTopics(true);
      try {
        const response = await getTrendingTopics();
        setTrendingTopics(response?.data?.trendingTopics);
      } catch (error: any) {
        console.error("Error fetching trending topics:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoadingTrendingTopics(false);
      }
    };
    fetchTrendingTopics();
  }, []);

  useEffect(() => {
    const fetchUserStorage = async () => {
      setLoadingUserStorage(true);
      try {
        const response = await getUserStorage();
        setUserStorage(response?.data?.userStorage);
      } catch (error: any) {
        console.error("Error fetching user storage:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoadingUserStorage(false);
      }
    };
    fetchUserStorage();
  }, []);

  useEffect(() => {
    const fetchlatestReminders = async () => {
      setLoadingReminders(true);
      try {
        const response = await getLatestReminders();
        console.log(response,"responsecssc")  
        setReminders(response?.data?.data);
        // setUserStorage(response?.data?.userStorage);
      } catch (error: any) {
        console.error("Error fetching user storage:", error);
        toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      } finally {
        setLoadingReminders(false);
      }
    };
    fetchlatestReminders();
  }, []);


  const filterActivities =
    activities &&
    activities?.filter((item: any) => item?.project_id === projectId);

  // Example: get user's research area from profile or state (hardcoded for now)
  const userResearchArea = "Artificial Intelligence";

  return (
    <main className="bg-headerBackground p-4 font-poppins sm:w-auto">
      <SlickCarouselLoader />

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 group mb-16">
        <div className="col-span-12 lg:col-span-8">
          <div className="col-span-1 lg:col-span-8  order-1 lg:order-none">
            <WelcomeSection
              loading={
                loadingTrendingTopics ||
                loadingWorkspace ||
                loadingProjects ||
                loadingFileCount ||
                loadingResources
              }
              trendingTopics={trendingTopics?.ShortSummary}
              workspace={workspace}
              projects={projects}
              fileCount={fileCount}
              resources={resources}
            />
          </div>

          <div className="col-span-1 lg:col-span-8 order-3 lg:order-none">
            <WhatsNewFeed
              researchArea={userResearchArea}
            />
          </div>

          <div className="col-span-1 lg:col-span-8 order-5 lg:order-none">
            <RecentKnowledge loading={loadingResources} resources={resources} />
          </div>

          <div className="col-span-1 lg:col-span-8 order-7 lg:order-none">
            <RecentFolder
              loading={loadingRecentFolder}
              recentFolder={recentFolder}
            />
          </div>

          <div className="col-span-1 lg:col-span-8 order-9 lg:order-none">
            <Favorites loading={loadingFavorites} favorite={favorite} />
          </div>

          <div className="col-span-1 lg:col-span-8 order-11 lg:order-none">
            <ColleagueUpdates
              loading={loadingActivities}
              allActivities={filterActivities}
            />
          </div>

          <div className="col-span-1 lg:col-span-8 order-13 lg:order-none">
            <SmartSearchKeywords
              loading={loadingActivities}
              allActivities={filterActivities}
            />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="col-span-1 lg:col-span-4 order-2 lg:order-none">
            <RemainingCredits
              loading={loadingUserStorage}
              userStorage={userStorage}
            />
          </div>
          <div className="col-span-1 lg:col-span-4 order-4 lg:order-none">
            { <Reminders reminders={reminders} loading={loadingReminders} />}
          </div>
          <div className="col-span-1 lg:col-span-4 order-4 lg:order-none">
            <RecentActivities
              loading={loadingActivities}
              filterActivities={filterActivities}
            />
          </div>

          <div className="col-span-1 lg:col-span-4 order-6 lg:order-none">
            <ActivityMap
              loading={loadingActivities}
              allActivities={filterActivities}
            />
          </div>

          <div className="col-span-1 lg:col-span-4 order-8 lg:order-none">
            <TrendingTopics
              loading={loadingTrendingTopics}
              trendingTopics={trendingTopics}
            />
          </div>
          <div className="col-span-1 lg:col-span-4 order-10 lg:order-none">
            <NewsDiscoveries articles={articles} loading={false} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default NewsCarousel;
