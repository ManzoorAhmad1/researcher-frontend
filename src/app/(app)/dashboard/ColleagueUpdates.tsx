"use client";
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { RiGroupLine } from "react-icons/ri";
import { GoDotFill } from "react-icons/go";
import { LuX } from "react-icons/lu";
import { useSelector } from "react-redux";
import { Text } from "rizzui";
import { Loader, Empty } from "rizzui";

const ColleagueUpdates = ({ allActivities, loading }: any) => {
  const userData = useSelector((state: any) => state?.user?.user?.user);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  // Function to generate consistent color based on project name
  const getProjectColor = (projectName: string) => {
    if (!projectName) return "text-blue-600 dark:text-blue-400";

    const colors = [
      "text-blue-600 dark:text-blue-400",
      "text-green-600 dark:text-green-400",
      "text-purple-600 dark:text-purple-400",
      "text-pink-600 dark:text-pink-400",
      "text-indigo-600 dark:text-indigo-400",
      "text-teal-600 dark:text-teal-400",
      "text-orange-600 dark:text-orange-400",
      "text-red-600 dark:text-red-400",
      "text-yellow-600 dark:text-yellow-400",
      "text-cyan-600 dark:text-cyan-400",
    ];

    // Create a simple hash from project name to ensure consistency
    let hash = 0;
    for (let i = 0; i < projectName.length; i++) {
      const char = projectName.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Use absolute value and modulo to get consistent color index
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };
  // console.log(allActivities, "allActivities");
  const updates =
    allActivities &&
    allActivities
      ?.filter((activity: any) => activity?.users?.id !== userData?.id)
      .map((activity: any) => {
        if (
          !activity?.users ||
          !activity?.activity ||
          !activity?.projects?.name
        ) {
          console.log("Missing required data in activity:", activity);
          return null;
        }
        const user = activity?.users;
        const activityDescription = activity?.activity;
        const projectName = activity?.projects?.name;

        // Extract file/resource name and action from activity description
        let resourceName = "";
        let resourceType = activity?.activity; // Default type
        let actionType = activity?.type; // Default action
        let actionColor = "#079E28"; // Default green color

        // Parse activity description to extract resource details
        if (activityDescription) {
          // Check for deletion (show in red text)
          if (activityDescription.toLowerCase().includes("deleted")) {
            actionType = "Deleted";
            actionColor = "#DC2626"; // Red color for deleted
          } else if (
            activityDescription.toLowerCase().includes("updated") ||
            activityDescription.toLowerCase().includes("modified")
          ) {
            actionType = "Updated";
            actionColor = "#F59B14"; // Orange for updated
          } else if (
            activityDescription.toLowerCase().includes("upload") ||
            activityDescription.toLowerCase().includes("added")
          ) {
            actionType = activity?.type;
            actionColor = "#079E28"; // Green for new upload
          }

          // Extract resource name (assuming it's in quotes or after certain keywords)
          const paperMatch = activityDescription.match(
            /Paper\s*["']([^"']+)["']/i
          );
          const fileMatch = activityDescription.match(
            /file\s*["']([^"']+)["']/i
          );
          const documentMatch = activityDescription.match(
            /document\s*["']([^"']+)["']/i
          );

          if (paperMatch) {
            resourceName = paperMatch[1];
            resourceType = "Paper";
          } else if (fileMatch) {
            resourceName = fileMatch[1];
            resourceType = "File";
          } else if (documentMatch) {
            resourceName = documentMatch[1];
            resourceType = "Document";
          } else {
            // Check for dynamic separators in activity description
            if (activityDescription.includes("/")) {
              // If there's a "/" show the left side as resourceType
              const parts = activityDescription.split("/");
              resourceType = parts[0].trim();
              resourceName = activityDescription;
            } else if (activityDescription.includes("-")) {
              // If there's a "-" show the right side as resourceType
              const parts = activityDescription.split("-");
              resourceType = parts[parts.length - 1].trim();
              resourceName = activityDescription;
            } else {
              // Fallback: use the activity description itself
              resourceName = activityDescription;
            }
          }
        }

        return {
          teamMemberName: `${user?.first_name || ""} ${user?.last_name || ""}`,
          resourceName: resourceName || activityDescription || "",
          resourceType: resourceType,
          actionType: actionType,
          projectName: projectName || "",
          actionColor: actionColor,
          isDeleted: actionType === "Deleted", // Add flag for deleted items
        };
      })
      .filter(Boolean);
  const isUpdatesEmpty = updates?.length === 0;

  return (
    <div className="mt-5 border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-5">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="text-blue-500">
            <RiGroupLine className="h-[15px] w-[15px]" />
          </div>
          <Text className="font-semibold font-size-normal text-primaryDark dark:text-[#cccccc]">
            COLLEAGUE UPDATES
          </Text>
        </div>
        <div>
          {updates?.length > 3 && (
            <Text
              onClick={openModal}
              className="text-blue-500 text-md font-size-normal cursor-pointer"
            >
              Show More
            </Text>
          )}
        </div>
      </div>
      <div className="p-[0.5px] mt-3 bg-[#E5E5E5]"></div>

      {loading ? (
        <div className="flex flex-col gap-4 mt-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
            ></div>
          ))}
        </div>
      ) : isUpdatesEmpty ? (
        <div>
          <Empty
            text="COLLEAGUE UPDATES IS EMPTY"
            textClassName="text-gray-300 mt-2"
            className="w-full mt-2"
            imageClassName="stroke-gray-200 fill-black"
          />
        </div>
      ) : (
        updates?.slice(0, 3)?.map((update: any, index: any, array: any) => {
          const updateTime = new Date(update?.created_at || Date.now());
          const formattedDate = updateTime.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return (
            <div key={index} className="flex gap-5 mb-2 items-stretch">
              <div className="relative text-blue-500 flex flex-col items-center mt-1.5">
                <GoDotFill className="h-[15px] w-[15px] z-10" />
                {index < array?.length && (
                  <div
                    className="green-line-dynamic w-[2px] bg-blue-500 opacity-20 rounded-full"
                    style={{
                      flex: 1,
                      minHeight: 40,
                      height: "100%",
                      marginTop: 0,
                      zIndex: 0,
                    }}
                  ></div>
                )}
              </div>
              <div className="flex-1">
                <Text className="ml-1 font-normal font-size-md text-primaryDark dark:text-[#cccccc] mt-1.5">
                  {formattedDate}
                </Text>
                <div className="ml-1 mt-3 p-4 bg-[#E5E5E566] dark:bg-transparent dark:border dark:border-white rounded-lg shadow hover:shadow-lg transition-shadow h-auto relative z-10">
                  <Text className="font-medium text-sm text-primaryDark dark:text-[#cccccc] mb-1">
                    {update?.resourceName}
                  </Text>
                  <Text className="font-normal text-sm italic text-gray-500 dark:text-gray-400 mb-2">
                    by {update?.teamMemberName}
                  </Text>
                  <div className="flex flex-wrap items-center gap-2">
                    <Text
                      className={`font-medium font-size-sm ${
                        update?.actionType === "Deleted"
                          ? "text-red-500"
                          : "text-blue-500"
                      }`}
                    >
                      {update?.actionType}
                    </Text>
                    <Text className={`font-medium font-size-sm`}>
                      | {update?.projectName}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="bg-white dark:bg-[#1F2E34] rounded-lg shadow-lg z-50 w-full max-w-lg md:max-w-3xl lg:max-w-4xl flex flex-col h-auto max-h-[90vh]">
            <div className="flex justify-between items-center p-5 md:pt-6 md:px-6 md:pb-1.5 border-gray-200 dark:border-gray-700">
              <Text className="text-[20px] font-semibold dark:text-[#cccccc]">
                Colleague Updates
              </Text>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-[#cccccc] dark:hover:text-gray-100 focus:outline-none mr-3"
              >
                <LuX className="h-6 w-6" />
              </button>
            </div>

            <div className="p-5 md:p-6 flex-grow overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader variant="threeDot" size="sm" />
                </div>
              ) : isUpdatesEmpty ? (
                <div>
                  <Empty
                    text="COLLEAGUE UPDATES IS EMPTY"
                    textClassName="text-gray-300 mt-2"
                    className="w-full mt-2"
                    imageClassName="stroke-gray-200 fill-black"
                  />
                </div>
              ) : (
                updates
                  ?.slice(3)
                  ?.map((update: any, index: number, array: any) => {
                    const updateTime = new Date(
                      update?.created_at || Date.now()
                    );
                    const formattedDate = updateTime.toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    );

                    return (
                      <div
                        key={index}
                        className="flex gap-5 mb-2 items-stretch"
                      >
                        <div className="relative text-blue-500 flex flex-col items-center mt-1.5">
                          <GoDotFill className="h-[15px] w-[15px] z-10" />
                          {index < array?.length && (
                            <div
                              className="green-line-dynamic w-[2px] bg-blue-500 opacity-20 rounded-full"
                              style={{
                                flex: 1,
                                minHeight: 40,
                                height: "100%",
                                marginTop: 0,
                                zIndex: 0,
                              }}
                            ></div>
                          )}
                        </div>
                        <div className="flex-1 overflow-x-hidden">
                          <Text className="ml-1 font-normal font-size-md text-primaryDark dark:text-[#cccccc] mt-1.5">
                            {formattedDate}
                          </Text>
                          <div className="ml-1 mt-3 p-4 bg-[#E5E5E566] dark:bg-transparent dark:border dark:border-white rounded-lg shadow hover:shadow-lg transition-shadow h-auto relative z-10">
                            <Text className="font-medium text-sm text-primaryDark dark:text-[#cccccc] mb-1">
                              {update?.resourceName}
                            </Text>
                            <Text className="font-normal text-sm italic text-gray-500 dark:text-gray-400 mb-2">
                              by {update?.teamMemberName}
                            </Text>
                            <div className="flex flex-wrap items-center gap-2">
                              <Text
                                className={`font-medium font-size-sm ${
                                  update?.actionType === "Deleted"
                                    ? "text-red-500"
                                    : "text-blue-500"
                                }`}
                              >
                                {update?.actionType}
                              </Text>
                              <Text
                                className={`font-medium font-size-sm whitespace-pre-wrap`}
                              >
                                | {update?.projectName}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="p-2 md:mx-6 md:my-2 border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                className="bg-gradient-to-t from-[#0F55BA] to-[#0E70FF] text-white text-[13px] md:text-[14px] font-medium rounded-full px-12 py-2 cursor-pointer border-[#3686FC] border-[2px]"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColleagueUpdates;
