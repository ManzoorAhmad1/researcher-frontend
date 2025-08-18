import React from "react";
import WebSearch from "./WebSearch";

const Page = () => {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#020818] h-full overflow-scroll pb-0">
      <section className="bg-[#F1F1F1] dark:bg-[#142328] flex justify-center pt-12 pb-20 flex-col items-center">
        <h1 className="text-xl font-medium text-[#333333] dark:text-[#CCCCCC]">
          Topic Explorer
        </h1>
        <p className="text-sm font-normal text-[#666666] mt-3 dark:text-[#999999] text-center">
          Discover the latest research papers, news articles and websites,{" "}
          <br />
          tailored to your interest
        </p>
      </section>

      <WebSearch />
    </main>
  );
};

export default Page;
