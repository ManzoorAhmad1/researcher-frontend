"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ResearchInterestForm from "../topic-explorer/ResearchInterestForm";
import { getFavouriteNews } from "@/apis/explore";
import NewsCarousel from "./NewsCarousel";
import Credit from "@/images/userProfileIcon/credit";
import ActivePaper from "@/images/userProfileIcon/activePaper";
import ResearchPaper from "@/images/userProfileIcon/researchPaper";
import IdeaBank from "@/images/userProfileIcon/ideaBank";
import SharedResources from "@/images/userProfileIcon/sharedResources";

const Dashboard: React.FC = () => {
  const [isResearchInterestOpen, setIsResearchInterestOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favouriteNews, setFavouriteNews] = useState([]);

  const handleGetNewsByTopics = async () => {
    setIsLoading(true);
    try {
      const response = await getFavouriteNews();
      if (response?.success) {
        setFavouriteNews(response?.data);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetNewsByTopics();
  }, []);

  return (
    <main className="p-6 space-y-6 ">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="w-[248px] cards_bg h-[117px] bg-[#F59B1436] rounded-md flex gap-6 items-center justify-center">
          <div className="w-10 h-10 mr-4  flex items-center  justify-center rounded-full">
            <ActivePaper />
          </div>
          <div>
            <p className="font-size-md font-semibold text-secondaryDark">
              {" "}
              Active Projects
            </p>
            <p className="font-size-extra-larg font-medium text-primaryDark mt-2">
              5
            </p>
            <p className="font-size-md font-semibold text-secondaryDark">
              Researchers Involved
            </p>
          </div>
        </div>
        <div className="w-[248px] cards_bg h-[117px] bg-[#079E2833] rounded-md flex gap-6 items-center justify-center">
          <div className="w-10 h-10 mr-4  flex items-center  justify-center rounded-full">
            <ResearchPaper />
          </div>
          <div>
            <p className="font-size-md font-semibold text-secondaryDark">
              RESEARCH PAPERS
            </p>
            <p className="font-size-extra-larg font-medium text-primaryDark mt-2">
              5
            </p>
            <p className="font-size-md font-semibold text-secondaryDark">
              Under Analysis
            </p>
          </div>
        </div>
        <div className="w-[248px] cards_bg h-[117px] bg-[#AF2FEC33] rounded-md flex gap-6 items-center justify-center">
          <div className="w-10 h-10 mr-4  flex items-center  justify-center rounded-full">
            <IdeaBank />
          </div>
          <div>
            <p className="font-size-md font-semibold text-secondaryDark">
              IDEAS BANK
            </p>
            <p className="font-size-extra-larg font-medium text-primaryDark mt-2">
              5
            </p>
            <p className="font-size-md font-semibold text-secondaryDark">
              Potential Projects{" "}
            </p>
          </div>
        </div>
        <div className="w-[248px] cards_bg h-[117px] bg-[#0E70FF33] rounded-md flex gap-6 items-center justify-center">
          <div className="w-10 h-10 mr-4  flex items-center  justify-center rounded-full">
            <SharedResources />
          </div>
          <div>
            <p className="font-size-md font-semibold text-secondaryDark">
              {" "}
              SHARED RESOURCES
            </p>
            <p className="font-size-extra-larg font-medium text-primaryDark mt-2">
              5
            </p>
            <p className="font-size-md font-semibold text-secondaryDark">
              {" "}
              Across All Projects
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-sm ">ACTIVE RESEARCH PROJECTS</h2>
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 className="text-sm ">Energy Market Dynamics</h3>
              <p className="text-sm text-gray-600">
                4 papers · 3 resources · 8 bookmarks
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  Market Analysis
                </span>
                <span className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded">
                  Economics
                </span>
              </div>
            </div>
            <div className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 className="text-sm ">Renewable Integration</h3>
              <p className="text-sm text-gray-600">
                3 papers · 5 resources · 12 bookmarks
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded">
                  Grid
                </span>
                <span className="px-2 py-1 text-sm bg-purple-100 text-purple-800 rounded">
                  Technology
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-sm">RESEARCH IDEAS BANK</h2>
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 className="text-sm ">Carbon Trading Mechanisms</h3>
              <p className="text-sm text-gray-600">
                Exploring efficiency of different carbon pricing models
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  Policy
                </span>
                <span className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded">
                  Market
                </span>
              </div>
            </div>
            <div className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 className="text-sm ">Energy Storage Economics</h3>
              <p className="text-sm text-gray-600">
                Cost-benefit analysis of grid scale storage solutions
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-sm bg-purple-100 text-purple-800 rounded">
                  Technology
                </span>
                <span className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded">
                  Investment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-10 p-6 border border-gray-200  rounded-lg shadow-md">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          KEY RESEARCH QUESTION
        </h3>
        <div>
          <h3 className="text-sm  text-gray-600 mb-4">
            From Energy Market Dynamics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-[#E5E5E566] border border-blue-100 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-800  mb-3">
                “How do regional energy market structures influence renewable
                energy adoption rates?”
              </p>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  Innovation
                </span>

                <span className="text-sm text-gray-600 ">3 related papers</span>
              </div>
            </div>

            <div className="p-4 bg-[#E5E5E566] border border-blue-100 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-800  mb-3">
                “What is the impact of carbon pricing on energy market
                equilibrium?”
              </p>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"></span>

                <span className="text-sm text-gray-600">2 related papers</span>
              </div>
            </div>

            <div className="p-4 bg-[#E5E5E566] border border-blue-100 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-800  mb-3">
                “What role do subsidies play in shaping renewable energy
                transitions?”
              </p>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  Market Dynamics
                </span>

                <span className="text-sm text-gray-600">4 related papers</span>
              </div>
            </div>

            <div className="p-4 bg-[#E5E5E566] border border-blue-100 rounded-lg hover:shadow-lg transition-shadow">
              <p className="text-gray-800  mb-3">
                “How does energy policy influence innovation in renewable
                technologies?”
              </p>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  Innovation
                </span>

                <span className="text-sm text-gray-600">5 related papers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg shadow p-6">
        <h2 className="text-sm font-semibold">AI Research Analysis Insights</h2>
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow">
            <p>
              Strong correlation between carbon pricing mechanisms and renewable
              energy investment patterns across studied markets.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                Energy Market Dynamics
              </span>
              <span className="px-2 py-1 text-sm bg-green-100 text-blue-800 rounded">
                Carbon Trading
              </span>
              <span className="px-2 py-1 text-sm">Confidence 89.0%</span>
            </div>
          </div>
          <div className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow">
            <p>
              Multiple research streams indicate synergies between energy
              storage economics and market stability.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-1 text-sm bg-purple-100 text-blue-800 rounded">
                Storage Economics
              </span>
              <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                Market Dynamics
              </span>
              <span className="px-2 py-1 text-sm">Confidence 92.0%</span>
            </div>
          </div>

          <div className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow">
            <p>
              Emerging research gap in quantifying indirect economic benefits of
              distributed energy resources{" "}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-1 text-sm bg-purple-100 text-blue-800 rounded">
                Storage Economics
              </span>
              <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                Market Dynamics
              </span>
              <span className="px-2 py-1 text-sm">Confidence 42.0%</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
