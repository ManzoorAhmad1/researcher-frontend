"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/apis/user";
import { formCompleted } from "@/reducer/roles_goals/rolesGoals";
import toast from "react-hot-toast";
import { Loader } from "rizzui";
import { updateUserPlan } from "@/reducer/auth/authSlice";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { keywordName } from "@/reducer/roles_goals/rolesGoals";

interface ResearchInterestsProps {
  onNext: () => void;
  onBack: () => void;
  selectedRole: string;
  selectedGoal: any;
  Interests: any;
}

const ResearchKeywordPage: React.FC<ResearchInterestsProps> = ({
  onNext,
  onBack,
  selectedRole,
  selectedGoal,
  Interests,
}) => {
  const state = useSelector(
    (state: { rolesGoalsData: { keywordName: string[] } }) =>
      state?.rolesGoalsData
  );
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedKeywords = localStorage.getItem("tempKeywords");
      return savedKeywords
        ? JSON.parse(savedKeywords)
        : state.keywordName || [];
    }
    return state.keywordName || [];
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [customInterest, setCustomInterest] = useState<string>("");
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    localStorage.setItem("tempKeywords", JSON.stringify(selectedInterests));
  }, [selectedInterests]);

  const removeInterest = (interest: string) => {
    setSelectedInterests((prev) => prev.filter((item) => item !== interest));
  };

  const validateKeyword = (keyword: string): boolean => {
    const wordCount = keyword.trim().split(/\s+/).length;
    if (wordCount > 5) {
      toast.error("Keywords should not be more than 5 words");
      return false;
    }
    if (selectedInterests.includes(keyword.trim())) {
      toast.error("This keyword has already been added");
      return false;
    }
    return true;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && customInterest.trim()) {
      e.preventDefault();
      const newInterest = customInterest.trim();
      if (validateKeyword(newInterest)) {
        setSelectedInterests((prev) => [...prev, newInterest]);
        setCustomInterest("");
      }
    }
  };

  const handleCustomInterestChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    const wordCount = value.trim().split(/\s+/).length;
    if (wordCount <= 5 || value.length < customInterest.length) {
      setCustomInterest(value);
    }
  };

  const handleAddClick = () => {
    if (customInterest.trim()) {
      const newInterest = customInterest.trim();
      if (validateKeyword(newInterest)) {
        setSelectedInterests((prev) => [...prev, newInterest]);
        setCustomInterest("");
      }
    }
  };

  const handleNext = async () => {
    try {
      if (selectedInterests.length === 0) {
        return toast.error("Please select at least one interest");
      }
      setLoading(true);
      const response: any = await updateUser({
        research_interests: Interests,
        research_goals: selectedGoal,
        research_roles: selectedRole,
        research_keywords: selectedInterests,
      });

      dispatch(updateUserPlan(response?.data?.user));
      localStorage.setItem("user", JSON.stringify(response?.data?.user));
      localStorage.setItem("showWelcomeTour", "true");
      localStorage.removeItem("tempKeywords");
      dispatch(formCompleted());
      dispatch(keywordName(selectedInterests));
      setLoading(false);
      onNext();
      router.push("/dashboard");
      toast.success("Your profile has been updated successfully.");
    } catch (error) {
      toast.error(
        "We are currently experiencing some technical issues. Kindly try again later."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br w-full dark:from-[#2C3A3F] dark:to-[#1F2937] p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-[95%] md:max-w-[90%] lg:max-w-[85%] mx-auto">
        <div className="bg-white dark:bg-[#2C3A3F] rounded-lg shadow-md p-3 sm:p-5 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-5 md:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:text-[#CCCCCC]">
            What interests you? (Add keywords)
          </h2>

          <div className="w-full mb-3 sm:mb-6 md:mb-8">
            <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-10">
              <div className="flex">
                <textarea
                  value={customInterest}
                  onChange={handleCustomInterestChange}
                  onKeyDown={handleKeyPress}
                  placeholder="eg. AI, Machine Learning, Data Science"
                  className="w-full px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm md:text-base rounded-l-lg border-2 border-r-0 border-blue-200 focus:outline-none dark:bg-[#3A474B] dark:border-blue-400 dark:text-white  placeholder:text-sm resize-none overflow-hidden"
                  style={{ minHeight: "38px", maxHeight: "38px" }}
                />
                <button
                  onClick={handleAddClick}
                  className="px-2 sm:px-3 md:px-6 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 border-2 border-blue-600 hover:border-blue-700 flex items-center justify-center font-medium text-xs sm:text-sm md:text-base"
                >
                  ADD
                </button>
              </div>
              <div className="absolute right-10 sm:right-14 md:right-20 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 flex items-center gap-1 text-xs">
                <span className="hidden lg:inline mr-3">
                  {customInterest.trim()
                    ? customInterest.trim().split(/\s+/).length
                    : 0}
                  /5
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 justify-center max-h-[40vh] overflow-y-auto px-1 py-2">
              {selectedInterests.map((interest: any, index: any) => (
                <motion.div
                  key={`${interest}-${index}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -5, 0],
                    transition: {
                      y: {
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      },
                    },
                  }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{
                    duration: 0.3,
                    type: "spring",
                    stiffness: 500,
                    damping: 25,
                  }}
                  layout
                  className="keyword-item bg-blue-50 text-[#0E70FF] border border-[#0E70FF] dark:bg-[#0E70FF] dark:border-white dark:text-white px-1.5 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-2 rounded-md text-[10px] sm:text-[11px] md:text-[13px] flex items-center gap-1 sm:gap-2"
                >
                  <span className="truncate max-w-[120px] sm:max-w-[150px] md:max-w-none">
                    {interest}
                  </span>
                  <motion.button
                    onClick={() => removeInterest(interest)}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                    whileTap={{ scale: 0.95 }}
                    className="cross-button rounded-full p-0.5 transition-all duration-200 flex-shrink-0"
                    aria-label={`Remove ${interest}`}
                  >
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="sm:w-[10px] sm:h-[10px]"
                    >
                      <path
                        d="M10 2L2 10M2 2L10 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#2C3A3F] py-2 sm:py-3">
          <div className="flex flex-col max-[600px]:flex-col min-[601px]:flex-row justify-end min-[601px]:mr-4 md:mr-20 lg:mr-40 w-full max-w-[95%] mx-auto gap-4 min-[601px]:gap-3">
            <button
              className="text-blue-600 border text-base min-[601px]:text-lg flex items-center justify-center px-6 min-[601px]:px-8 py-2 min-[601px]:py-1 border-blue-600 font-medium rounded-full focus:outline-none w-full min-[601px]:w-auto"
              onClick={onBack}
            >
              <span className="mr-2">
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
              className={`px-6 min-[601px]:px-8 py-2 min-[601px]:py-1 text-base min-[601px]:text-lg flex items-center justify-center gap-2 text-white rounded-full transition-all duration-200 focus:outline-none w-full min-[601px]:w-auto ${
                selectedInterests.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "btn cursor-pointer"
              }`}
              onClick={handleNext}
              disabled={selectedInterests.length === 0}
            >
              {loading ? (
                <Loader variant="threeDot" size="sm" />
              ) : (
                <>
                  Submit
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
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchKeywordPage;
