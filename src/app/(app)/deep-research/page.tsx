import React from "react";
import TopicAssistance from "./TopicAssistance";
import PsychologyIcon from '@mui/icons-material/Psychology';

const Page = () => {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#020818] h-full overflow-scroll pb-0">
      <section className="bg-[#F1F1F1] dark:bg-[#142328] flex justify-center pt-12 pb-20 flex-col items-center">
        <div className="flex gap-2 items-center">
          <PsychologyIcon className="text-[#333333] dark:text-[#CCCCCC] scale-x-[-1]" style={{ fontSize: "40px" }} />
          <h1 className="text-xl font-medium text-[#333333] dark:text-[#CCCCCC]">
            Deep Research
          </h1>
        </div>
        <p className="text-sm font-normal text-[#666666] mt-3 dark:text-[#999999]">
          Let the Deep Research Connect the Dots
        </p>
        <div className="text-[#FF9839] italic text-sm mt-3">Work in Progress..</div>
      </section>

      <TopicAssistance />
    </main>
  );
};

export default Page;
