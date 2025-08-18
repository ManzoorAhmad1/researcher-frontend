import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Raleway } from "next/font/google";
import localStorageService from "@/utils/localStorage";
import { useRouter } from "next-nprogress-bar";
import { useDispatch, useSelector } from "react-redux";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

interface TopicExplorerDialogProps {
  topicExplorerDialog: boolean;
  setTopicExplorerDialog: (open: boolean) => void;
}

const topics = [
  {
    title: "Explore Relevant Research Topics",
    description:
      "Dive into new research areas and uncover questions that inspire your next project.",
    bgColor: "bg-[#0E70FF29]",
    btnColor: "bg-[#0E70FF]",
    btnText: "TOPIC SEARCH →",
    link: "/web-search",
  },
  {
    title: "Need a fresh research perspective?",
    description:
      "Explore adjacent topics and generate innovative ideas to uncover new research horizons.",
    bgColor: "bg-[#F59B1429]",
    btnColor: "bg-[#F59B14]",
    btnText: "CREATIVE THINKING →",
    link: "/creative-thinking",
  },
  {
    title: "Challenge Your Assumptions",
    description:
      "Uncover hidden risks and generate insightful questions with our critical thinking tool.",
    bgColor: "bg-[#079E2829]",
    btnColor: "bg-[#079E28]",
    btnText: "TOPIC ANALYSIS →",
    link: "/topic-analysis",
  },
  {
    title: "Smart Research Outline Creator",
    description:
      "Generate a structured research paper outline instantly based on your title, type, and level.",
    bgColor: "bg-[#ff000024]",
    btnColor: "bg-[#ff0000ad]",
    btnText: "OUTLINE GENERATOR →",
    link: "/outline-generator",
  },
];

const TopicExplorerDialog: React.FC<TopicExplorerDialogProps> = ({
  topicExplorerDialog,
  setTopicExplorerDialog,
}) => {
  const user = useSelector((state: any) => state.user?.user?.user);

  const route = useRouter();
  return (
    <div className="flex justify-end">
      <Dialog
        open={topicExplorerDialog}
        onOpenChange={() => {
          setTopicExplorerDialog(false);
          localStorageService.setItem("topicExplorerDialog", false);
        }}
      >
        <DialogContent className="w-[80vw] max-w-[1200px] max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="p-6 w-full">
            <h2
              className={`${raleway.className} text-[27px] font-semibold text-center mb-2`}
            >
              Let's get to work!
            </h2>
            <p
              className={`${raleway.className} text-[22px] text-gray-600 dark:text-[#cccccc] mb-8 font-semibold text-center`}
            >
              What would you like to do first
            </p>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 place-items-center">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-6 hover:shadow-lg transition h-[291px] flex flex-col justify-between ${topic?.bgColor}`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-[#333333] dark:text-white mb-2">
                      {topic?.title}
                    </h3>
                    <p className="text-sm text-[#333333] mb-4 font-normal text-[15px] dark:text-[#CCCCCC]">
                      {topic?.description}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      localStorageService.setItem("topicExplorerDialog", false);
                      setTopicExplorerDialog(false);
                      if (user?.research_interests?.length > 0) {
                        route.push(topic?.link);
                      } else {
                        route.push("/main-topic-explorer");
                      }
                    }}
                    className={`px-4 text-[15px] py-2 text-white rounded-[26px] w-full ${topic?.btnColor}`}
                  >
                    {topic?.btnText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopicExplorerDialog;
