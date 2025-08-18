import React from "react";
import { featureFlags } from "@/utils/featureFlags";
import TableSection from "./TableSection";
import TemplateList from "./TemplateList";

const Template = () => {
  return (
    <main className="flex flex-1 flex-col gap-4 lg:gap-6 max-w-[calc(100%-32px)] mx-auto">
      {featureFlags.enableTemplateList ? <TemplateList /> : <TableSection />}
    </main>
  );
};

export default Template;
