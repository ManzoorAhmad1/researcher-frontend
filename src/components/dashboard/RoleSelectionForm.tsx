import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import { useDispatch, useSelector } from "react-redux";
import { rolesName } from "@/reducer/roles_goals/rolesGoals";
import toast from "react-hot-toast";

interface RoleSelectionFormProps {
  onNext: (roles: string[]) => void;
}

const RoleSelectionForm: React.FC<RoleSelectionFormProps> = ({ onNext }) => {
  const state = useSelector(
    (state: { rolesGoalsData: { rolesName: string[]; customRole: string } }) =>
      state?.rolesGoalsData
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    JSON.parse(localStorage.getItem("selectedRoles") || "[]") ||
      state?.rolesName ||
      []
  );
  const [customRole, setCustomRole] = useState<string>(
    localStorage.getItem("customRole") || state?.customRole || ""
  );
  const [IsShowError, setShowError] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  useEffect(() => {
    localStorage.setItem("selectedRoles", JSON.stringify(selectedRoles));
  }, [selectedRoles]);

  useEffect(() => {
    localStorage.setItem("customRole", customRole);
  }, [customRole]);

  const roles = [
    {
      name: "Academic Researcher",
      svg: (
        <svg
          className="fill-current"
          width="18"
          height="21"
          viewBox="0 0 18 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 2.5C5 3.60457 4.10457 4.5 3 4.5C1.89543 4.5 1 3.60457 1 2.5C1 1.39543 1.89543 0.5 3 0.5C4.10457 0.5 5 1.39543 5 2.5ZM2 14.5V20.5H0V8.5C0 6.84315 1.34315 5.5 3 5.5C3.82059 5.5 4.56423 5.82946 5.10585 6.36333L7.4803 8.6057L9.7931 6.29289L11.2073 7.70711L7.5201 11.3943L6 9.9587V20.5H4V14.5H2ZM3 7.5C2.44772 7.5 2 7.94772 2 8.5V12.5H4V8.5C4 7.94772 3.55228 7.5 3 7.5ZM16 3.5H7V1.5H17C17.5523 1.5 18 1.94772 18 2.5V13.5C18 14.0523 17.5523 14.5 17 14.5H13.5758L16.3993 20.5H14.1889L11.3654 14.5H7V12.5H16V3.5Z" />
        </svg>
      ),
    },
    {
      name: "Students",
      svg: (
        <svg
          className="fill-current"
          width="24"
          height="24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4 11.8333L0 9.5L12 2.5L24 9.5V18H22V10.6667L20 11.8333V18.5113L19.7774 18.7864C17.9457 21.0499 15.1418 22.5 12 22.5C8.85817 22.5 6.05429 21.0499 4.22263 18.7864L4 18.5113V11.8333ZM6 13V17.7917C7.46721 19.454 9.61112 20.5 12 20.5C14.3889 20.5 16.5328 19.454 18 17.7917V13L12 16.5L6 13ZM3.96927 9.5L12 14.1846L20.0307 9.5L12 4.81541L3.96927 9.5Z" />
        </svg>
      ),
    },
    {
      name: "Research Professionals",
      svg: (
        <svg
          className="fill-current"
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 5.5V2.5C7 1.94772 7.44772 1.5 8 1.5H16C16.5523 1.5 17 1.94772 17 2.5V5.5H21C21.5523 5.5 22 5.94772 22 6.5V20.5C22 21.0523 21.5523 21.5 21 21.5H3C2.44772 21.5 2 21.0523 2 20.5V6.5C2 5.94772 2.44772 5.5 3 5.5H7ZM9 13.5H4V19.5H20V13.5H15V16.5H9V13.5ZM20 7.5H4V11.5H9V9.5H15V11.5H20V7.5ZM11 11.5V14.5H13V11.5H11ZM9 3.5V5.5H15V3.5H9Z" />
        </svg>
      ),
    },
    {
      name: "Consultants",
      svg: (
        <svg
          className="fill-current"
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20 2.5C21.6569 2.5 23 3.84315 23 5.5V7.5H21V19.5C21 21.1569 19.6569 22.5 18 22.5H4C2.34315 22.5 1 21.1569 1 19.5V17.5H17V19.5C17 20.0128 17.386 20.4355 17.8834 20.4933L18 20.5C18.5128 20.5 18.9355 20.114 18.9933 19.6166L19 19.5V4.5H6C5.48716 4.5 5.06449 4.88604 5.00673 5.38338L5 5.5V15.5H3V5.5C3 3.84315 4.34315 2.5 6 2.5H20Z" />
        </svg>
      ),
    },
    {
      name: "Content Creators",
      svg: (
        <svg
          className="fill-current"
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8.17071 3.5C8.58254 2.33481 9.69378 1.5 11 1.5H13C14.3062 1.5 15.4175 2.33481 15.8293 3.5H21C21.5523 3.5 22 3.94772 22 4.5V20.5C22 21.0523 21.5523 21.5 21 21.5H3C2.44772 21.5 2 21.0523 2 20.5V4.5C2 3.94772 2.44772 3.5 3 3.5H8.17071ZM4 5.5V19.5H20V5.5H15.8293C15.4175 6.66519 14.3062 7.5 13 7.5H11C9.69378 7.5 8.58254 6.66519 8.17071 5.5H4ZM11 3.5C10.4477 3.5 10 3.94772 10 4.5C10 5.05228 10.4477 5.5 11 5.5H13C13.5523 5.5 14 5.05228 14 4.5C14 3.94772 13.5523 3.5 13 3.5H11ZM10 9.5L15 12.5L10 15.5V9.5Z" />
        </svg>
      ),
    },
    {
      name: "Policy Analysts",
      svg: (
        <svg
          className="fill-current"
          width="22"
          height="21"
          viewBox="0 0 22 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 0.5C20.6569 0.5 22 1.84315 22 3.5V5.5H20V17.5C20 19.1569 18.6569 20.5 17 20.5H3C1.34315 20.5 0 19.1569 0 17.5V15.5H16V17.5C16 18.0128 16.386 18.4355 16.8834 18.4933L17 18.5C17.5128 18.5 17.9355 18.114 17.9933 17.6166L18 17.5V2.5H5C4.48716 2.5 4.06449 2.88604 4.00673 3.38338L4 3.5V13.5H2V3.5C2 1.84315 3.34315 0.5 5 0.5H19Z" />
        </svg>
      ),
    },
    {
      name: "Library and Information Professionals",
      svg: (
        <svg
          className="fill-current"
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4 3.5C3.44772 3.5 3 3.94772 3 4.5V20.5C3 21.0523 3.44772 21.5 4 21.5H14C14.5523 21.5 15 21.0523 15 20.5V15.7973L15.9995 20.4996C16.1143 21.0398 16.6454 21.3847 17.1856 21.2699L21.0982 20.4382C21.6384 20.3234 21.9832 19.7924 21.8684 19.2522L18.9576 5.5581C18.8428 5.01788 18.3118 4.67304 17.7716 4.78786L14.9927 5.37853C14.9328 4.88353 14.5112 4.5 14 4.5H10C10 3.94772 9.55228 3.5 9 3.5H4ZM10 6.5H13V14.5H10V6.5ZM10 19.5V16.5H13V19.5H10ZM8 5.5V15.5H5V5.5H8ZM8 17.5V19.5H5V17.5H8ZM17.3321 17.1496L19.2884 16.7338L19.7042 18.6898L17.7479 19.1057L17.3321 17.1496ZM16.9163 15.1933L15.253 7.36789L17.2092 6.95207L18.8726 14.7775L16.9163 15.1933Z" />
        </svg>
      ),
    },
    {
      name: "Market Researchers",
      svg: (
        <svg
          className="fill-current"
          width="19"
          height="19"
          viewBox="0 0 19 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 0.5V16.5H18V18.5H0V0.5H2ZM17.2929 3.79289L18.7071 5.20711L13 10.9142L10 7.915L5.70711 12.2071L4.29289 10.7929L10 5.08579L13 8.085L17.2929 3.79289Z" />
        </svg>
      ),
    },
  ];

  const isCustomRole = (role: string) => {
    return !roles.some((r) => r.name === role);
  };

  const handleRoleSelect = (role: string) => {
    let updatedRoles = [...selectedRoles];
    if (updatedRoles.includes(role)) {
      updatedRoles = updatedRoles.filter((r) => r !== role);
    } else {
      if (updatedRoles.length >= 5) {
        toast.error("You can select maximum upto 5 roles");
        return;
      }
      updatedRoles.push(role);
    }
    setSelectedRoles(updatedRoles);
    dispatch(rolesName(updatedRoles));
  };

  const handleCustomRoleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setCustomRole(value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && customRole.trim()) {
      event.preventDefault();
      if (selectedRoles.length >= 5) {
        toast.error("A maximum of 5 roles can be selected.");
        return;
      }
      if (!selectedRoles.includes(customRole.trim())) {
        setSelectedRoles([...selectedRoles, customRole.trim()]);
      }
      setCustomRole("");
    }
  };

  const handleRemoveCustomRole = (roleToRemove: string) => {
    setSelectedRoles(selectedRoles.filter((role) => role !== roleToRemove));
  };

  const handleNext = () => {
    setShowError(true);
    if (selectedRoles.includes("Role Not Found") && customRole === "") {
      toast.error("please enter your custom role");
    }

    if (selectedRoles.includes("Role Not Found") && customRole.trim()) {
      onNext([
        ...selectedRoles.filter((role) => role !== "Role Not Found"),
        customRole,
      ]);
    } else if (
      selectedRoles.length > 0 &&
      !selectedRoles.includes("Role Not Found")
    ) {
      onNext(selectedRoles);
    }
    dispatch(rolesName({ rolesName: selectedRoles, customRole }));
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };
  return (
    <div className="flex flex-col items-center">
      <ProgressBar step={step} totalSteps={totalSteps} />
      <p className="text-center mt-2 font-semibold w-11/12 sm:w-4/5 md:w-3/5 items-center mb-5 font-size-medium text-gray-600 dark:text-[#CCCCCC]">
        Select your professional role to receive a personalized experience that
        aligns with your expertise, preferences, and specific requirements
      </p>
      {(!selectedRoles.length || IsShowError) && (
        <p className="text-center mt-2 font-semibold w-11/12 sm:w-4/5 md:w-3/5 items-center mb-5 font-size-medium text-red-600">
          Please select at least one option
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-4 my-5 w-full px-2 sm:px-4">
        {roles.map((role) => (
          <div
            key={role.name}
            className={`flex flex-col items-center px-4 py-2 rounded-md h-auto w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-1rem)] cursor-pointer transition-all duration-200 ${
              selectedRoles.includes(role.name)
                ? "bg-blue-50 text-[#0E70FF] border border-[#0E70FF] dark:bg-[#0E70FF] dark:border-white dark:text-[#BEBFBF]"
                : "border border-gray-300 hover:bg-gray-100 text-black"
            } dark:bg-[#3A474B] dark:border-[#3A474B]`}
            onClick={() => handleRoleSelect(role.name)}
          >
            <p
              className={`text-[24px] ${
                selectedRoles.includes(role.name)
                  ? "text-[#0E70FF] dark:text-white"
                  : "text-gray-500"
              } ${role.name === "Role Not Found" ? "mt-0" : "mt-2"}`}
            >
              {role.svg}
            </p>
            <p
              className={`text-[13px] text-center break-words ${
                role.name === "Role Not Found" ? "mt-0" : "mt-2"
              } dark:text-[#CCCCCC]`}
            >
              {role.name}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 w-full">
        <p className="font-size-small font-semibold mb-1 text-darkGray">
          OTHERS / ROLE NOT FOUND
        </p>
        <hr className="mb-2" />

        <div className="relative flex border gap-2 h-auto min-h-[50px] bg-white dark:bg-[#3A474B] dark:border-[#3A474B] dark:text-[#BEBFBF] item-center w-full">
          <div className="w-full flex flex-wrap gap-2 pl-2 py-2">
            {selectedRoles.filter(isCustomRole).map((role, index) => (
              <div
                key={index}
                className="flex items-center h-[30px] bg-blue-100 text-[#0E70FF] border border-[#0E70FF] rounded-sm px-3 text-xs dark:bg-[#3A474B] dark:border-white dark:text-white"
              >
                <span>{role}</span>
                <button
                  onClick={() => handleRemoveCustomRole(role)}
                  className="ml-2 text-[#0E70FF] dark:text-white"
                >
                  ✕
                </button>
              </div>
            ))}

            <textarea
              value={customRole}
              onChange={handleCustomRoleChange}
              onKeyDown={handleKeyPress}
              placeholder="Enter your goal and press Enter"
              className="max-h-5 flex items-center border w-1/4 h-auto border-none bg-transparent outline-none border-gray-300 rounded-md text-sm dark:bg-[#3A474B] dark:border-[#3A474B] dark:text-[#BEBFBF] resize-none overflow-hidden"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end w-full mt-6 px-2 sm:px-4 mb-4 sm:mb-0">
        <button
          className={`w-full md:w-36 mb-3 px-6 sm:px-10 py-2 md:py-1 text-sm sm:text-lg mr-4 sm:mr-7  flex items-center justify-center gap-2 text-white rounded-full  transition-all duration-200 ${
            !selectedRoles.length ||
            (selectedRoles.includes("Role Not Found") && !customRole.trim())
              ? "bg-gray-400 cursor-not-allowed"
              : "btn cursor-pointer"
          }`}
          onClick={handleNext}
          disabled={!selectedRoles.length}
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

export default RoleSelectionForm;
