import React, { Suspense } from "react";
const UserPreferences = React.lazy(() => import("./UserPreferences"));

const Template = () => {
  return (
    <main className=" flex flex-1 flex-col gap-4 lg:gap-6 max-w-[calc(100%-32px)] mx-auto ">
      <h1 className="text-base font-medium">User Preferences</h1>
      <Suspense fallback={<div>Loading User Preferences...</div>}>
        <UserPreferences />
      </Suspense>
    </main>
  );
};

export default Template;
