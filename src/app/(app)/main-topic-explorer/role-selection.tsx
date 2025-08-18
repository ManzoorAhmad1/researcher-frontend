"use client";

import React from "react";
import ProgressBar from "@/components/dashboard/ProgressBar";
import RoleSelectionForm from "@/components/dashboard/RoleSelectionForm";
import ResearchGoalsPage from "./research-goals";
import ResearchInterestsPage from "./research-interests";
import { useDispatch, useSelector } from "react-redux";
import { decrementPage, incrementPage } from "@/reducer/roles_goals/rolesGoals";
import ResearchKeywordPage from "./research-keywords";

const RoleSelectionPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = React.useState<string>("");
  const [selectedGoal, setSelectedGoal] = React.useState([]);
  const [Interests, setInterests] = React.useState([]);

  const state: any = useSelector(
    (state: { rolesGoalsData: { currentPage: number } }) =>
      state?.rolesGoalsData
  );
  const dispatch = useDispatch();
  const handleNext = (data?: any) => {
    if (state?.currentPage === 0 && data) setSelectedRole(data);
    if (state?.currentPage === 1 && data) setSelectedGoal(data);
    if (state?.currentPage === 2 && data) setInterests(data);

    dispatch(incrementPage());
  };

  const handleBack = () => {
    dispatch(decrementPage());
  };

  return (
    <div className="flex flex-col items-center  min-h-screen  bg-gray-50 dark:bg-[#2C3A3F]">
      {state?.currentPage !== 0 && (
        <ProgressBar step={state?.currentPage} totalSteps={3} />
      )}

      {state?.currentPage === 0 && (
        <RoleSelectionForm onNext={(role: string[]) => handleNext(role)} />
      )}

      {state?.currentPage === 1 && (
        <ResearchGoalsPage
          onNext={(goal: any) => handleNext(goal)}
          onBack={handleBack}
          selectedRole={selectedRole}
        />
      )}

      {state?.currentPage === 2 && (
        <ResearchInterestsPage
          onNext={(interest: any) => handleNext(interest)}
          onBack={handleBack}
          selectedRole={selectedRole}
          selectedGoal={selectedGoal}
        />
      )}
      {state?.currentPage === 3 && (
        <ResearchKeywordPage
          onNext={handleNext}
          onBack={handleBack}
          selectedRole={selectedRole}
          selectedGoal={selectedGoal}
          Interests={Interests}
        />
      )}
    </div>
  );
};

export default RoleSelectionPage;
