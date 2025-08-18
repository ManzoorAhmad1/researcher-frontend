"use client";
import React from "react";
import { ExpertAdvice, TopicAnalysisSidebarProps } from "../utils/types";
import { MdArrowForwardIos } from "react-icons/md";
import { expert_advice } from "../utils/const";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import SaveKnowledgeBankBtn from "@/components/coman/SaveKnowledgeBankBtn";
import { useRouter } from "next-nprogress-bar";
import { outlineGeneratorDetails } from "@/reducer/topic-explorer/topicExplorerSlice";

const TopicAnalysisSidebar: React.FC<TopicAnalysisSidebarProps> = ({
  isActive,
  addToNote,
  inputValue,
  setIsActive,
  alreadyNoted,
  topicAnalysis,
  setSingleTopicAnalysis,
}) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { folderLoading } = useSelector(
    (state: RootState) => state.notesbookmarks
  );

  const handleActive = (i: number, item: ExpertAdvice) => {
    setIsActive(i);
    if (item.title !== "Summaries and Synthesis") {
      setSingleTopicAnalysis(item);
    } else {
      setSingleTopicAnalysis(undefined);
    }
  };

  const handleSend = () => {
    router.push(`/outline-generator`);
    dispatch(
      outlineGeneratorDetails({
        keyWord: inputValue,
        ans: JSON.stringify(
          topicAnalysis?.entry_summaries + topicAnalysis?.synthesis
        ),
        type: "Formal",
        level: "Intermediate",
      })
    );
  };

  return (
    <>
      <h2 className="text-[14px] font-semibold px-2">Analysis Result</h2>
      <hr className="my-2 dark:border-[#505A5E]" />
      <ul>
        {topicAnalysis?.expert_advice?.length > 0 &&
          [...expert_advice, ...topicAnalysis?.expert_advice]?.map(
            (item: any, i: any) => {
              return (
                <>
                  <li
                    className={`flex items-center cursor-pointer rounded-lg my-2 py-1 px-2 gap-2 ${
                      isActive === i && "bg-[#0E70FF0F] dark:bg-[#38464C]"
                    }`}
                    key={i}
                    onClick={() => handleActive(i, item)}
                  >
                    <span className="text-[13px] line-clamp-2 w-full">
                      {item?.title}
                    </span>
                    <MdArrowForwardIos className="w-[6%]" />
                  </li>
                  <hr className=" dark:border-[#505A5E]" />
                </>
              );
            }
          )}
      </ul>

      <div className="mt-3">
        <SaveKnowledgeBankBtn
          handleOpen={addToNote}
          alreadyNoted={alreadyNoted}
          folderLoading={folderLoading}
        />
      </div>
      <button
        onClick={() => handleSend()}
        type="button"
        className="button-full mt-3 w-full"
      >
        Send to Outline Generator
      </button>
    </>
  );
};

export default TopicAnalysisSidebar;
