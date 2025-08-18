import React from "react";
import ManageProjectInfo from "./ManageProjectInfo";

const page = () => {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#020818] h-full overflow-scroll pb-0">
      <section className="bg-[#F1F1F1] dark:bg-[#142328] flex justify-center pt-12 pb-20 flex-col items-center">
        <h1 className="text-xl font-medium text-[#333333] dark:text-[#CCCCCC]">
          Manage Projects
        </h1>
        <p className="text-sm font-normal text-[#666666] mt-3 dark:text-[#999999] text-center">
          Discover all the projects here
        </p>
      </section>
      <ManageProjectInfo/>

     
    </main>
  );
};

export default page;
