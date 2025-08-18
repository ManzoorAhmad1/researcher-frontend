import React from "react";
import ProjectInfo from "./ProjectInfo";

const page = () => {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#020818] h-full overflow-scroll pb-0">
      <section className="bg-[#F1F1F1] dark:bg-[#142328] flex justify-center pt-12 pb-20 flex-col items-center">
        <h1 className="text-xl font-medium text-[#333333] dark:text-[#CCCCCC]">
          Projects Overview
        </h1>
      </section>

      <ProjectInfo />
    </main>
  );
};

export default page;
