import React from "react";
import CreativeThinking from "./CreativeThinking";

const Page = () => {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#020818] h-full overflow-scroll pb-0">
      <section className="bg-[#F1F1F1] dark:bg-[#142328] flex justify-center pt-12 pb-20 flex-col items-center">
        <h1 className="text-xl font-medium text-[#333333] dark:text-[#CCCCCC]">
        Creative Thinking Tool
        </h1>
        <p className="text-sm font-normal text-[#666666] mt-3 dark:text-[#999999]">
          Unlock Fresh Ideas: Enter Your Keywords to Spark Creativity!
        </p>
      </section>

      <CreativeThinking />
    </main>
  );
};

export default Page;
