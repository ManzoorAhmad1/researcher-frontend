"use client";
import { VscRecord } from "react-icons/vsc";
import {
  Alert,
  CulturalFactors,
  MainQuestion,
  PotentialImprovement,
  RelatedPapers,
  Risks,
  UaeCharacteristics,
} from "../icons";
import { TopicAnalysisBodyProps } from "../utils/types";

const TopicAnalysisBody: React.FC<TopicAnalysisBodyProps> = ({
  topicAnalysis,
  singleTopicAnalysis,
}) => {
  return (
    <div className="p-6 px-24 pt-0">
      <div className="grid grid-cols-2 gap-6">
        {singleTopicAnalysis ? (
          <>
            <div className="col-span-2">
              {/* Main Question */}
              <div className="bg-white dark:bg-[#2C3A3F] dark:border-[#505A5E] border border-[#E5E5E5] rounded-lg p-6 ">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <MainQuestion />
                  <span className="text-[16px]">Main Question</span>
                </h3>
                <p className="text-gray-600 dark:text-[#C0C1C1] text-[14px] overflow-auto">
                  {singleTopicAnalysis?.guiding_questions}
                </p>
              </div>

              <div className="bg-white dark:bg-[#2C3A3F] dark:border-[#505A5E] border border-[#E5E5E5] rounded-lg p-6 mt-6">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <CulturalFactors />
                  <span className="text-[16px]">Real-World Examples</span>
                </h3>
                <ul className="overflow-auto">
                  <p className="text-gray-600 dark:text-[#C0C1C1] text-[14px] overflow-auto">
                    {singleTopicAnalysis?.real_world_examples}
                  </p>
                </ul>
              </div>

              <div className="bg-white dark:bg-[#2C3A3F] dark:border-[#505A5E] border border-[#E5E5E5] rounded-lg p-6 mt-6">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <Risks />
                  <span className="text-[16px]">Risks</span>
                </h3>
                <p className="text-gray-600 dark:text-[#C0C1C1] text-[14px] overflow-auto">
                  {singleTopicAnalysis?.risks_challenges}
                </p>
              </div>
            </div>
            <div className="col-span-2">
              <div className="bg-white dark:bg-[#2C3A3F] dark:border-[#505A5E] border border-[#E5E5E5] rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <UaeCharacteristics />
                  <span className="text-[16px]">Expert Insight</span>
                </h3>
                <p className="text-gray-600 dark:text-[#C0C1C1] text-[14px] overflow-auto">
                  {singleTopicAnalysis?.expert_insight}
                </p>
              </div>

              <div className="bg-white dark:bg-[#2C3A3F] dark:border-[#505A5E] border border-[#E5E5E5] rounded-lg p-6 mt-6">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <PotentialImprovement />
                  <span className="text-[16px]">Opportunities</span>
                </h3>
                <p className="text-gray-600 dark:text-[#C0C1C1] text-[14px] overflow-auto">
                  {singleTopicAnalysis?.opportunities}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="col-span-2">
              <div className="bg-white dark:bg-[#2C3A3F] dark:border-[#505A5E] border border-[#E5E5E5] rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <VscRecord color="#0F6AEF" />
                  <span className="text-[16px]">Summaries</span>
                </h3>
                <ul className="overflow-auto ps-4">
                  {topicAnalysis?.entry_summaries?.map((item: any, i: any) => (
                    <li
                      className="flex items-start gap-2 text-[#4D4D4D] text-[14px] mb-3 "
                      key={i}
                    >
                      <span className="text-[20px] relative top-[-4px] text-gray-600 dark:text-[#C0C1C1]">
                        •
                      </span>
                      <span className="text-gray-600 dark:text-[#C0C1C1] ">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-span-2">
              <div className="bg-white dark:bg-[#2C3A3F] dark:border-[#505A5E] border border-[#E5E5E5] rounded-lg p-6">
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <VscRecord color="#0F6AEF" />
                  <span className="text-[16px]">Synthesis</span>
                </h3>
                <ul className="overflow-auto ps-4">
                  {topicAnalysis?.synthesis?.map((item: any, i: any) => (
                    <li
                      className="flex items-start gap-2 text-[#4D4D4D] text-[14px] mb-3"
                      key={i}
                    >
                      <span className="text-[20px] relative top-[-4px] text-gray-600 dark:text-[#C0C1C1]">
                        •
                      </span>
                      <span className="text-gray-600 dark:text-[#C0C1C1]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopicAnalysisBody;
