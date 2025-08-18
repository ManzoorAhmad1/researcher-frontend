import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { goalName } from "@/reducer/roles_goals/rolesGoals";

interface ResearchGoalsProps {
  onNext: (goals: string[]) => void;
  onBack: () => void;
  selectedRole: string;
}

const ResearchGoalsPage: React.FC<ResearchGoalsProps> = ({
  onNext,
  onBack,
  selectedRole,
}) => {
  const state = useSelector(
    (state: { rolesGoalsData: { goalName: string[] } }) => state?.rolesGoalsData 
  );

  const [customGoal, setCustomGoal] = useState<string>("");
  const [goals, setGoals] = React.useState<string[]>(state?.goalName || []);
  const [goalError, setGoalError] = useState<boolean>(false);

  const dispatch = useDispatch();

  const goalsOptions = [
    "Streamline Research Workflow",
    "Centralize Document Management",
    "Facilitate Collaboration",
    "Enable Cross-Paper Analysis",
    "Ensure Data Security and Compliance",
    "Simplify Citation and Reference Management",
    "Track Emerging Research Trends",
  ];

  const handleGoalSelect = (g: string) => {
    setGoals((prevGoals) => {
      if (prevGoals.includes(g)) {
        return prevGoals.filter((goal) => goal !== g);
      } else {
        return [...prevGoals, g];
      }
    });
  };

  useEffect(() => {
    if (goals.length > 0) {
      dispatch(goalName(goals));
    }
  }, [goals, dispatch]);

  const handleNext = () => {
    setGoalError(true);
    if (goals.length > 0) onNext(goals);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && customGoal.trim()) {
      e.preventDefault();
      setGoals((prevGoals) => [...prevGoals, customGoal.trim()]);
      setCustomGoal("");
    }
  };

  const handleRemoveGoal = (goal: string) => {
    setGoals((prevGoals) => prevGoals.filter((g) => g !== goal));
  };

  return (
    <div className="flex flex-col items-center p-5">
      <p className="text-center mt-2 mb-5 font-semibold w-4/5 items-center font-size-medium  text-gray-600 dark:text-[#CCCCCC]">
        Clearly outline your objectives, such as publishing a paper, connecting
        with collaborators, advancing in your field, or gaining specific
        research skills.
      </p>

      {(goals.length === 0 || goalError) && (
        <p className="text-center mt-2 font-semibold w-3/5 items-center mb-5 font-size-medium text-red-600">
          Please select at least one option
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5 ">
        {goalsOptions.map((g) => (
          <div
            key={g}
            className={`px-4 py-2 w-auto border rounded-md text-center cursor-pointer transition-all duration-200 ${
              goals.includes(g)
                ? "bg-blue-50 text-[#0E70FF] border border-[#0E70FF] dark:text-white dark:border-white "
                : "bg-white text-black hover:bg-gray-100 dark:text-[#CCCCCC] "
            } dark:bg-[#3A474B] dark:border-[#3A474B] dark:text-[#BEBFBF]}`}
            onClick={() => handleGoalSelect(g)}
          >
            <p className="text-center text-[13px] ">{g}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 w-full">
        <p className="font-size-small font-semibold mb-1 text-darkGray">
          OTHERS / GOAL NOT FOUND
        </p>
        <hr className="mb-2" />

        <div className="relative flex border gap-2 h-auto min-h-[50px] bg-white dark:bg-[#3A474B] dark:border-[#3A474B] dark:text-[#BEBFBF] item-center w-full">
          <div className="w-full flex flex-wrap gap-2 pl-2 py-2">
            {goals
              .filter(goal => !goalsOptions.includes(goal))
              .map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center h-[30px] bg-blue-100 text-[#0E70FF] border border-[#0E70FF] rounded-sm px-3 text-xs dark:bg-[#3A474B] dark:border-white dark:text-white"
                >
                  <span>{goal}</span>
                  <button
                    onClick={() => handleRemoveGoal(goal)}
                    className="ml-2 text-[#0E70FF] dark:text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}

            <textarea
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter your goal and press Enter"
              className="max-h-5 flex items-center border w-1/4 h-auto border-none bg-transparent outline-none border-gray-300 rounded-md text-sm dark:bg-[#3A474B] dark:border-[#3A474B] dark:text-[#BEBFBF] resize-none overflow-hidden"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:justify-end w-full mt-6 gap-4 sm:gap-3">
        <button
          className="text-blue-600 border text-base sm:text-lg flex items-center justify-center px-6 sm:px-10 py-2 sm:py-1 border-blue-600 font-medium rounded-full"
          onClick={onBack}
        >
          <span>
        <svg
          width="19"
          height="18"
          viewBox="0 0 19 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.3713 8.24968L10.3943 4.22667L9.33365 3.16602L3.5 8.99968L9.33365 14.8333L10.3943 13.7726L6.3713 9.74968H15.5V8.24968H6.3713Z"
            fill="#0E70FF"
          />
        </svg>
          </span>
          Back
        </button>

        <button
          className={`px-6 sm:px-10 py-2 sm:py-1 text-base sm:text-lg  flex items-center justify-center gap-2 text-white rounded-full  transition-all duration-200 ${
        goals.length === 0
          ? "bg-gray-400 cursor-not-allowed"
          : "btn cursor-pointer"
          }`}
          onClick={handleNext}
          disabled={goals.length === 0}
        >
          Next
          <span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.1287 5.24968L5.1057 1.22667L6.16635 0.166016L12 5.99968L6.16635 11.8333L5.1057 10.7726L9.1287 6.74968H0V5.24968H9.1287Z"
            fill="white"
          />
        </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ResearchGoalsPage;
