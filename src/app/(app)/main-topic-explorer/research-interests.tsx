"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/apis/user";
import { Select, Text } from "rizzui";
import { formCompleted } from "@/reducer/roles_goals/rolesGoals";
import toast from "react-hot-toast";
import { Loader } from "rizzui";
import { useDispatch, useSelector } from "react-redux";
import { interestName } from "@/reducer/roles_goals/rolesGoals";

interface ResearchInterestsProps {
  onNext: (interest: string[]) => void;
  onBack: () => void;
  selectedRole: string;
  selectedGoal: any;
}

interface Category {
  name: string;
  options: string[];
}

const ResearchInterestsPage: React.FC<ResearchInterestsProps> = ({
  onNext,
  onBack,
  selectedRole,
  selectedGoal,
}) => {
  const state = useSelector(
    (state: { rolesGoalsData: { interestName: string[] } }) =>
      state?.rolesGoalsData
  );

  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    state?.interestName || []
  );
  const [interest, setInterest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [interests, setInterests] = React.useState<string[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any>([]);
  const [customInterest, setCustomInterest] = useState<string>("");

  const [selectedCategory, setSelectedCategory] = useState<any>({
    label: "All Category",
    value: "All Category",
  });
  const router = useRouter();
  const dispatch = useDispatch();
  const [value, setValue] = useState<string>("All Category");

  const options = [
    { label: "All Category", value: "All Category" },
    {
      label: "STEM (Science, Technology, Engineering, and Mathematics)",
      value: "STEM (Science, Technology, Engineering, and Mathematics)",
    },
    {
      label: "Social Sciences & Humanities",
      value: "Social Sciences & Humanities",
    },
    {
      label: "Interdisciplinary & Applied",
      value: "Interdisciplinary & Applied",
    },
    {
      label:
        "Other (For research topics that dont fit neatly into the categories above)",
      value:
        "Other (For research topics that dont fit neatly into the categories above)",
    },
  ];
  const categories: { [key: string]: Category[] } = {
    "STEM (Science, Technology, Engineering, and Mathematics)": [
      {
        name: "Natural Sciences",
        options: [
          "Physics",
          "Chemistry",
          "Biology",
          "Astronomy",
          "Geology",
          "Meteorology",
        ],
      },
      {
        name: "Engineering",
        options: [
          "Mechanical Engineering",
          "Electrical Engineering",
          "Civil Engineering",
          "Chemical Engineering",
        ],
      },
      {
        name: "Computing & Information Sciences",
        options: [
          "Information Technology",
          "Artificial Intelligence",
          "Cybersecurity",
          "Data Science",
        ],
      },
      {
        name: "Mathematics & Statistics",
        options: [
          "Pure Mathematics",
          "Applied Mathematics",
          "Statistical Analysis",
        ],
      },
      {
        name: "Agricultural & Food Sciences",
        options: ["Agronomy", "Food Technology", "Nutrition"],
      },
      {
        name: "Health & Medicine",
        options: ["Public Health", "Clinical Research", "Biomedical Sciences"],
      },
    ],
    "Social Sciences & Humanities": [
      {
        name: "Social Sciences",
        options: [
          "Sociology",
          "Psychology",
          "Anthropology",
          "Political Science",
          "International Relations",
          "Economics",
        ],
      },
      {
        name: "Humanities",
        options: [
          "Literature",
          "History",
          "Philosophy",
          "Linguistics",
          "Art & Art History",
          "Music",
        ],
      },
      {
        name: "Behavioral Sciences",
        options: ["Cognitive Science", "Behavioral Psychology", "Neuroscience"],
      },
      {
        name: "Education",
        options: [
          "Educational Psychology",
          "Curriculum Development",
          "E-learning",
          "Higher Education",
        ],
      },
      {
        name: "Law & Legal Studies",
        options: [
          "International Law",
          "Human Rights",
          "Corporate Law",
          "Criminal Justice",
        ],
      },
      {
        name: "Media & Communication",
        options: [
          "Journalism",
          "Digital Media",
          "Communication Studies",
          "Film Studies",
        ],
      },
    ],
    "Interdisciplinary & Applied": [
      {
        name: "Interdisciplinary Studies",
        options: ["Gender Studies", "Cultural Studies", "Urban Studies"],
      },
      {
        name: "Environmental Studies",
        options: ["Climate Change", "Conservation", "Sustainable Development"],
      },
      {
        name: "Public Policy & Administration",
        options: ["Public Administration", "Policy Analysis", "Governance"],
      },
      {
        name: "Business",
        options: [
          "Management",
          "Finance",
          "Marketing",
          "Accounting",
          "Entrepreneurship",
        ],
      },
      {
        name: "Innovation & Entrepreneurship",
        options: [
          "Startups",
          "Innovation Management",
          "Social Entrepreneurship",
        ],
      },
    ],
  };

  useEffect(() => {
    const options: Category[] =
      selectedCategory?.label === "All Category"
        ? Object.values(categories).flat()
        : categories[selectedCategory?.label] || [];
    setFilteredCategories(options);
  }, [selectedCategory]);

  const searchOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    const options: Category[] =
      selectedCategory?.label === "All Category"
        ? Object.values(categories).flat()
        : categories[selectedCategory?.label] || [];

    const filtered = query
      ? options.filter((category: any) => {
          const lowercasedSearchQuery = query?.toLowerCase() || "";
          return (
            category?.name?.toLowerCase()?.includes(lowercasedSearchQuery) ||
            category?.options?.some((option: any) =>
              option?.toLowerCase()?.includes(lowercasedSearchQuery)
            )
          );
        })
      : options;

    setFilteredCategories(filtered);
  };

  const toggleInterest = (interest: string) => {
    setInterest(true);
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    interests.forEach((value) => selectedInterests.push(value));
    if (selectedInterests.length === 0) {
      return toast.error("please select at least one interest");
    }
    dispatch(interestName(selectedInterests));

    if (selectedInterests.length > 0) onNext(selectedInterests);
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && customInterest.trim()) {
      e.preventDefault();
      setInterests((prevGoals) => [...prevGoals, customInterest.trim()]);
      setCustomInterest("");
    }
  };
  const handleRemoveGoal = (goal: string) => {
    setInterests((prevGoals) => prevGoals.filter((g) => g !== goal));
  };
  return (
    <div className="flex flex-col p-5 w-full min-h-screen">
      <div className="relative top-[-40px]">
        <div className="w-[95%] flex flex-wrap justify-between mx-auto bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] box-shadow py-4 px-3 rounded-lg">
          <div className="w-full md:w-1/4 border-r-[1px] border-r-[#CCCCCC] dark:border-r-[#CCCCCC33] mr-2 mb-4 md:mb-0">
            <Select
              placeholder="Select a category"
              options={options}
              value={value}
              onChange={(selectedValue: string) => {
                setSelectedCategory(selectedValue);
                setValue(selectedValue);
                setSearchQuery("");
              }}
              className="placeholder:text-blue-400"
              selectClassName="w-full border-none text-blue-500 placeholder:text-blue-400 dark:text-white"
              dropdownClassName="w-full md:w-1/3 bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] box-shadow py-4 rounded-lg px-4 mt-3"
              optionClassName="font-size-normal"
            />
          </div>

          <div className="text-[13px] flex w-full md:w-2/4 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Type in a topic or area of interest"
              className="outline-none w-full dark:bg-[#2C3A3F] px-3 bg-transparent"
              onChange={(e) => searchOnChange(e)}
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-1/5 justify-center border-t-[1px] md:border-t-0 md:border-l-[1px] border-[#CCCCCC] dark:border-[#CCCCCC33] pt-4 md:pt-0">
            <button type="submit" className="button-full w-full md:w-[130px]">
              <span
                className={`text-nowrap flex justify-center items-center gap-2`}
              >
                Search
              </span>
            </button>
          </div>
        </div>
      </div>
      <Text className="w-full max-w-[95%] mx-auto text-center md:text-left">
        {selectedCategory?.label}
      </Text>
      <div className="flex flex-col md:flex-row mt-5 mb-6 w-full max-w-[95%] mx-auto">
        {filteredCategories.length > 0 ? (
          <div className="w-full md:w-[70%] mx-auto flex-1 grid grid-cols-1 gap-4 mb-5">
            {filteredCategories.map((category: any) => (
              <div key={category.name}>
                <h3 className="font-medium text-[11px] uppercase">
                  {category?.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.options.map((option: any) => (
                    <button
                      key={option}
                      className={`px-4 py-2 border text-[13px] rounded-md text-center cursor-pointer transition-all duration-200 ${
                        selectedInterests.includes(option)
                          ? "bg-blue-50 text-[#0E70FF] border border-[#0E70FF]  dark:bg-[#0E70FF] dark:border-white dark:text-white"
                          : "bg-white text-[#333333] dark:text-[#CCCCCC] hover:bg-gray-100"
                      } dark:bg-[#3A474B] dark:border-[#3A474B]`}
                      onClick={() => toggleInterest(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <hr className="mt-2" />
              </div>
            ))}
          </div>
        ) : selectedCategory?.label ===
          "Other (For research topics that dont fit neatly into the categories above)" ? (
          <div className="mt-5 w-full">
            <p className="font-size-small font-semibold mb-1 text-darkGray">
              OTHERS
            </p>
            <hr className="mb-2" />

            <div className="relative flex border gap-2 h-auto min-h-[50px] bg-white dark:bg-[#3A474B] dark:border-[#3A474B] dark:text-[#BEBFBF] item-center w-full">
              <div className="w-full flex flex-wrap gap-2 pl-2 py-2">
                {interests.map((goal, index) => (
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
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter your interest and press Enter"
                  className="max-h-5 flex items-center border w-full md:w-1/4 h-auto border-none bg-transparent outline-none border-gray-300 rounded-md text-sm dark:bg-[#3A474B] dark:border-[#3A474B] dark:text-[#BEBFBF] resize-none overflow-hidden"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-[200px]">
            <p className="text-[#333333] dark:text-[#CCCCCC]">
              No matching categories found. Please try a different keyword
            </p>
          </div>
        )}

        {selectedInterests.length > 0 && (
          <div
            className={`hidden md:block w-full md:w-[306px] bg-[#FFFFFF] mt-4 md:mt-0 md:ml-4 p-4 rounded-md shadow-md dark:bg-[#3A474B] dark:border-[#3A474B]`}
          >
            <h3 className="font-size-small text-lg mb-3 dark:text-[#CCCCCC] font-semibold">
              SELECTED INTEREST
            </h3>
            <hr className="mb-3" />
            {selectedInterests.map((interest) => (
              <div
                key={interest}
                className="inline-flex font-size-normal gap-2 justify-between items-center ml-2 mb-2 px-2 py-1 bg-blue-50 text-[#0E70FF] border border-[#0E70FF] rounded-md dark:bg-[#3A474B] dark:border-white dark:text-white"
              >
                <span>{interest}</span>
                <button
                  className="text-[#0E70FF] hover:text-[#0E70FF] transition-all duration-200 dark:text-white"
                  onClick={() => toggleInterest(interest)}
                >
                  &#10005;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#2C3A3F] py-2 min-[601px]:py-3">
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
            disabled={selectedInterests.length === 0 && interests.length === 0}
          >
            {loading ? (
              <Loader variant="threeDot" size="sm" />
            ) : (
              <>
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
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchInterestsPage;
