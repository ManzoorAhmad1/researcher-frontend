"use client";

import { useEffect, useState } from "react";
import {
  favouriteCollaboration,
  getCallobrationsData,
  notesAndBookmarksCollaboration,
  projectFilesCollaboration,
} from "@/apis/collaborates";
import { useSelector } from "react-redux";
import DashboardCards from "./components/DashboardCards";
import ActiveProjects from "./components/ActiveProjects";
import KnowledgeBank from "./components/KnowledgeBank";
import AIInsights from "./components/AIInsights";
import KnowledgeBankModal from "./components/modals/KnowledgeBankModal";
import ResearchQuestions from "./components/ResearchQuestions";
import SharedBookmarks from "./components/SharedBookmarks";
import SharedNotes from "./components/SharedNotes";
import ResearchQuestionsModal from "./components/modals/ResearchQuestionsModal";
import AIInsightsModal from "./components/modals/AIInsightsModal";
import FavoritesModal from "./components/modals/FavoritesModal";
import ActiveProjectsModal from "./components/modals/ActiveProjectsModal";
import Favorites from "./components/Favorites";
import { toast } from "react-hot-toast";

const Collaboration: React.FC = () => {
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
  const [isNotesLoading, setIsNotesLoading] = useState(true);

  const [projectsFiles, setProjectsFiles] = useState<any>([]);
  const [activeProjectsFiles, setActiveProjectsFiles] = useState<any>([]);
  const [notesAndBookmarks, setNotesAndBookmarks] = useState<any>([]);
  const [favoritesDoc, setFavoritesDoc] = useState<any>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [activeSearchModel, setActiveSearchModel] = useState(false);
  const [analysisModel, setAnalysisSearchModel] = useState(false);
  const [researchQuestionsModal, setResearchQuestionsModal] = useState(false);
  const [favouriteModel, setFavouriteModel] = useState(false);

  const project = useSelector((state: any) => state?.project?.project);
  useEffect(() => {
    fetchProjectsData();
  }, []);

  useEffect(() => {
    fetchFavoritesData();
  }, []);

  useEffect(() => {
    fetchNotesAndBookmarksData();
  }, []);

  const fetchProjectsData = async () => {
    setIsProjectsLoading(true);
    try {
      const response: any = await getCallobrationsData();
      if (response?.data?.success) {
        setProjectsFiles(response?.data?.data?.projectFilesDoc);
        setActiveProjectsFiles(response?.data?.data?.projectFilesDoc);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching projects:", error);
    } finally {
      setIsProjectsLoading(false);
    }
  };

  const fetchFavoritesData = async () => {
    setIsFavoritesLoading(true);
    try {
      const response: any = await favouriteCollaboration();
      if (response?.data?.success) {
        setFavoritesDoc(response?.data?.data?.favorites);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching favorites:", error);
    } finally {
      setIsFavoritesLoading(false);
    }
  };

  const fetchNotesAndBookmarksData = async () => {
    setIsNotesLoading(true);
    try {
      const response: any = await notesAndBookmarksCollaboration();
      if (response?.data?.success) {
        setNotesAndBookmarks(response?.data?.data?.notesAndBookmarks);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error fetching notes and bookmarks:", error);
    } finally {
      setIsNotesLoading(false);
    }
  };

  const projectfile = projectsFiles?.length
    ? projectsFiles?.filter((item: any) => item?.projectId === project?.id)
    : [];

  return (
    <main className="p-6 space-y-6 bg-headerBackground">
      <DashboardCards
        isLoading={isProjectsLoading || isNotesLoading}
        projectsFiles={projectsFiles}
        notesAndBookmarks={notesAndBookmarks}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ActiveProjects
          isLoading={isProjectsLoading || isNotesLoading}
          projectsFiles={projectsFiles}
          notesAndBookmarks={notesAndBookmarks}
          onShowMore={() => setActiveSearchModel(true)}
        />

        <KnowledgeBank
          isLoading={isNotesLoading}
          notesAndBookmarks={notesAndBookmarks}
          onShowMore={() => setModalIsOpen(true)}
        />
      </div>

      <ResearchQuestions
        isLoading={isProjectsLoading}
        projectfile={projectfile}
        onShowMore={() => setResearchQuestionsModal(true)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <SharedBookmarks
          isLoading={isNotesLoading}
          projectsFiles={projectsFiles}
          notesAndBookmarks={notesAndBookmarks}
        />

        <SharedNotes
          isLoading={isNotesLoading}
          notesAndBookmarks={notesAndBookmarks}
        />
      </div>

      <Favorites
        isLoading={isFavoritesLoading}
        favoritesDoc={favoritesDoc}
        onShowMore={() => setFavouriteModel(true)}
      />

      <AIInsights
        isLoading={isProjectsLoading}
        activeProjectsFiles={activeProjectsFiles}
        onShowMore={() => setAnalysisSearchModel(true)}
      />

      {/* Modals */}
      <KnowledgeBankModal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        notesAndBookmarks={notesAndBookmarks}
      />

      <ActiveProjectsModal
        isOpen={activeSearchModel}
        onClose={() => setActiveSearchModel(false)}
        projectsFiles={projectsFiles}
        notesAndBookmarks={notesAndBookmarks}
      />

      <FavoritesModal
        isOpen={favouriteModel}
        onClose={() => setFavouriteModel(false)}
        favoritesDoc={favoritesDoc}
        isLoading={isFavoritesLoading}
      />

      <AIInsightsModal
        isOpen={analysisModel}
        onClose={() => setAnalysisSearchModel(false)}
        activeProjectsFiles={activeProjectsFiles}
        isLoading={isProjectsLoading}
      />
    </main>
  );
};

export default Collaboration;
