"use client";
import React from "react";
import HistoryTimeLine from "./TimeLine";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import "./history-timeline.css";

const Page = () => {
  const router = useRouter();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <section className="flex justify-center rounded-lg border text-card-foreground shadow-sm bg-[#eef7ff] dark:bg-transparent px-4">
        <FaArrowLeftLong
          className="mt-3 text-2xl cursor-pointer"
          onClick={() => router.back()}
        />
        <HistoryTimeLine />
      </section>
    </main>
  );
};

export default Page;
