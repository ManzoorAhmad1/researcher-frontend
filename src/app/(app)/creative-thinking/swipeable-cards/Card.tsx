"use client";
import React, { useEffect, useRef } from "react";
import { CardProps } from "../utils/types";
import CopyToClipboard from "react-copy-to-clipboard";
import { IoMdCopy } from "react-icons/io";
import toast from "react-hot-toast";

const Card: React.FC<CardProps> = ({ cards, reamingCard, totalCards }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  }, [cards?.ans]);

  return (
    <>
      <div className="select-none cursor-grabbing rounded-2xl swipeable-card-shadow h-full swipeable-card">
        {cards?.ans && (
          <div className="absolute top-3 right-3 flex gap-2">
            <CopyToClipboard text={cards?.ans}>
              <IoMdCopy
                className="text-[20px] cursor-pointer"
                onClick={() => toast.success("Copy to clipboard!")}
              />
            </CopyToClipboard>
          </div>
        )}
        <div
          ref={contentRef}
          className="w-full rounded-md pt-7 px-6 overflow-auto text-center h-[80%] text-[24px] text-[#333333] dark:text-[#CCCCCC] font-normal scrollbar-hide grid place-items-center"
        >
          {cards?.ans}
        </div>
        <div className="flex h-[20%] justify-evenly items-center">
          <div className="border border-[#0E70FF] rounded-full font-normal px-4 py-2">
            {totalCards || 7 - reamingCard?.length + 1} / {totalCards || 7}
          </div>
          <div className="text-lg text-[#666666] dark:text-[#CCCCCC]">
            {cards?.title}
          </div>
          <div className="w-[66.42px]" />
        </div>
      </div>
      <div></div>
    </>
  );
};

export default Card;
