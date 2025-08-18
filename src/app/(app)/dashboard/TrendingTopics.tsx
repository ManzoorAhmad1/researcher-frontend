import React from "react";
import { FiTrendingUp } from "react-icons/fi";
import { useRouter } from "next/navigation";

const colorPairs = [
  { bg: "#0E70FF1F", text: "#0E70FF" },
  { bg: "#F59B141F", text: "#F59B14" },
  { bg: "#079E281F", text: "#079E28" },
  { bg: "#8D17B51F", text: "#8D17B5" },
  { bg: "#E922221F", text: "#E92222" },
];

const TrendingTopics = ({ trendingTopics, loading, onTopicClick }: any) => {
  const router = useRouter();

  const handleTopicClick = (topic: string) => {
    localStorage.setItem("selectedTopic", topic);
    router.push(`/web-search?topic=${encodeURIComponent(topic)}`);
    if (onTopicClick) {
      onTopicClick(topic);
    }
  };

  return (
    <div className="border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-xl shadow-lg p-6 mt-6 transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <FiTrendingUp className="text-[#079E28] w-5 h-5" />
        <h2 className="font-semibold font-size-normal text-primaryDark dark:text-[#cccccc]">
          TRENDING TOPICS
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4 mt-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <>
          {trendingTopics?.TrendingTopics?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">
              No trending topics
            </p>
          ) : (
            <div className="flex flex-wrap gap-3 items-center">
              {trendingTopics?.TrendingTopics?.map(
                (topic: string, index: number) => {
                  const colorIndex = index % colorPairs.length;
                  const { bg, text } = colorPairs[colorIndex];

                  return (
                    <button
                      key={index}
                      onClick={() => handleTopicClick(topic)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-left whitespace-normal break-words"
                      style={{
                        backgroundColor: bg,
                        color: text,
                        maxWidth: "100%",
                        display: "inline-block",
                      }}
                    >
                      {topic}
                    </button>
                  );
                }
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrendingTopics;
