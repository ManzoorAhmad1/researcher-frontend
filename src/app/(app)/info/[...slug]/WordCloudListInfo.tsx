"use client";
import { Sidebar } from "primereact/sidebar";
import React, { useEffect, useState } from "react";
import {
  customHeader,
  customIcons,
} from "@/components/Sidebar(Drower)/customHeader";
import { overviewTag } from "@/utils/commonUtils";
import { Button } from "@/components/ui/button";
import { createPaperPdf, paperExists } from "@/apis/explore";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Loader } from "rizzui";
import { FaCheck } from "react-icons/fa";
import { RootState } from "@/reducer/store";
import { CircleX } from "lucide-react";
import { removeKeywords } from "@/reducer/global-search/globalSearchSlice";

interface RelativePapersInfoProps {
  visible: boolean;
  setVisible: (item: boolean) => void;
  singleData: any;
}
const WordCloudListInfo: React.FC<RelativePapersInfoProps> = ({
  singleData,
  visible,
  setVisible,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user.user);
  const { keywords } = useSelector(
    (state: RootState) => state.researchKeywords
  );

  const removeKeyword = async (word: string) => {
    try {
      // await dispatch(
      //   removeKeywords({ userId: user?.id, newWords: [word] }) as any
      // );
      // toast.success(`"${word}" Removed Successfully`);
      await toast.promise(
        dispatch(removeKeywords({ userId: user?.id, newWords: [word] }) as any),
        {
          loading: `Removing "${word}"...`,
          success: `"${word}" removed successfully!`,
          error: `Failed to remove "${word}".`,
        }
      );
    } catch (error) {
      toast.error("Failed to remove keyword.");
      console.error(error);
    }
  };

  return (
    <Sidebar
      header={customHeader("SAVED KEYWORDS")}
      className="bg-white w-[25rem] dark:bg-[#152428]"
      style={{ boxShadow: "-2px 0px 6px 0px #00000040" }}
      visible={visible}
      closeIcon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-x h-8 w-8 dark:text-[#BBC0C2]"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      }
      position="right"
      onHide={() => setVisible(false)}
    >
      <hr className="mb-4 dark:border-[#BEBFBF]" />
      <div className="dark:text-[#BEBFBF]">
        <div>
          <label className="font-poppins text-[12px] font-semibold leading-[18px] text-left text-[#999999]">
            KEYWORDS
          </label>
          <div className="flex flex-wrap gap-2 py-2">
            {keywords &&
              // [...keywords, ...keywords, ...keywords]?.map(
              keywords?.map((value: string, index: number) => {
                const tag = overviewTag[index % overviewTag.length];
                return (
                  <div
                    // style={{
                    //   backgroundColor: tag?.bgColor,
                    //   color: tag?.color,
                    // }}
                    key={value}
                    // className="inline-block  mx-1 my-1 font-poppins text-sm font-medium leading-[19.5px] text-left px-3 py-1 rounded-full"
                    onClick={() => removeKeyword(value)}
                    className="px-3 py-1 text-xs sm:text-sm rounded-full border border-[#0E70FF] bg-[#0E70FF1F] hover:bg-[#0E70FF33] text-[#0E70FF] cursor-pointer flex items-center"
                  >
                    <span className="flex gap-2 justify-center items-center">
                      <span>{value}</span>{" "}
                      <span className="cursor-pointer">
                        <CircleX className="h-4 w-4" />
                      </span>
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default WordCloudListInfo;
