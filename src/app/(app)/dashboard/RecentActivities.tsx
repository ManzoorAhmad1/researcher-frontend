import React, { useState } from "react";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { GoDotFill } from "react-icons/go";
import { Text, Loader, Empty } from "rizzui";
import { LuX } from "react-icons/lu";
import { useSelector } from "react-redux";

const activities = [
  {
    time: "2 Hours Ago",
    title: "New Note added",
    description: '"Sustainable AI"',
  },
  {
    time: "3 Hours Ago",
    title: "New Bookmark added",
    description: '"UN Development Goals"',
  },
  { time: "4 Hours Ago", title: "15 Papers Added", description: "" },
];

const RecentActivities = ({ filterActivities, loading }: any) => {
  const userData = useSelector((state: any) => state?.user?.user?.user);

  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  return (
    <div className="mt-5 border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-5 ">
      <div className="w-full flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="text-[#0E70FF]">
            <RiCalendarScheduleLine className="h-[15px] w-[15px]" />
          </div>
          <Text className="font-semibold font-size-normal text-primaryDark dark:text-[#cccccc] ">
            RECENT ACTIVITIES
          </Text>
        </div>
        <div>
          {filterActivities && filterActivities?.length > 3 && (
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

      {/* Loader when loading is true */}
      {loading ? (
        <div className="flex flex-col gap-4 mt-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
            ></div>
          ))}
        </div>
      ) : filterActivities?.length < 1 ? (
        <div>
          <Empty
            text="RECENT ACTIVITIES IS EMPTY"
            textClassName="text-gray-300 mt-2"
            className="w-full mt-2"
            imageClassName="stroke-gray-200 fill-black"
          />
        </div>
      ) : (
        filterActivities
          ?.filter((activity: any) => activity?.users?.id === userData?.id)
          .slice(0, 3)
          ?.map((activity: any, index: number, array: any) => {
            const favoriteTime = new Date(activity?.created_at);

            const formattedDate = favoriteTime.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <div key={index} className="flex gap-5 mb-2 items-stretch">
                <div className="relative text-[#0E70FF] flex flex-col items-center mt-1.5">
                  <GoDotFill className="h-[15px] w-[15px] z-10" />
                  {index < array?.length && (
                    <div
                      className="blue-line-dynamic w-[2px] bg-[#0E70FF] opacity-20 rounded-full"
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
                    <Text className="font-normal font-size-md text-primaryDark dark:text-[#cccccc]">
                      {activity?.activity}
                    </Text>
                    <Text className="font-medium font-size-normal text-[#0E70FF] ml-1">
                      {activity?.type}
                    </Text>
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
                Recent Activities
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
              ) : filterActivities?.length < 1 ? (
                <div>
                  <Empty
                    text="RECENT ACTIVITIES IS EMPTY"
                    textClassName="text-gray-300 mt-2"
                    className="w-full mt-2"
                    imageClassName="stroke-gray-200 fill-black"
                  />
                </div>
              ) : (
                filterActivities
                  ?.filter(
                    (activity: any) => activity?.users?.id === userData?.id
                  )
                  .slice(3)
                  ?.map((activity: any, index: number, array: any) => {
                    const favoriteTime = new Date(activity?.created_at);

                    const formattedDate = favoriteTime.toLocaleDateString(
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
                        <div className="relative text-[#0E70FF] flex flex-col items-center mt-1.5">
                          <GoDotFill className="h-[15px] w-[15px] z-10" />
                          {index < array?.length && (
                            <div
                              className="blue-line-dynamic w-[2px] bg-[#0E70FF] opacity-20 rounded-full"
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
                            <Text className="font-normal font-size-md text-primaryDark dark:text-[#cccccc] white-space-pre-wrap">
                              {activity?.activity}
                            </Text>
                            <Text className="font-medium font-size-normal text-[#0E70FF] ml-1 whitespace-pre-wrap">
                              {activity?.type}
                            </Text>
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

export default RecentActivities;
