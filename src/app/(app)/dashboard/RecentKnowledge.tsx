import Link from "next/link";
import React, { useState } from "react";
import { LuBookMinus, LuX } from "react-icons/lu";
import { Text, Empty, Loader } from "rizzui";

const RecentKnowledge = ({ resources, loading }: any) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const isResourcesEmpty = resources?.length === 0;

  return (
    <div className="w-full border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-6 mt-6">
      <div className="flex justify-between">
        <div className="flex gap-2 mt-5 mb-5">
          <div className="text-[#8D17B5]">
            <LuBookMinus className="h-[15px] w-[15px]" />
          </div>
          <Text className="font-semibold font-size-normal text-primaryDark dark:text-[#cccccc]">
            RECENT KNOWLEDGE BANK RESOURCES
          </Text>
        </div>
        {resources?.length > 3 && (
          <div className="items-center mt-3">
            <Text
              onClick={openModal}
              className="font-normal font-size-normal text-[#0E70FF] cursor-pointer"
            >
              Show More
            </Text>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4 mt-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
            ></div>
          ))}
        </div>
      ) : isResourcesEmpty ? (
        <div>
          <Empty
            text="RECENT KNOWLEDGE IS EMPTY"
            textClassName="text-gray-300 mt-2"
            className="w-full mt-2"
            imageClassName="stroke-gray-200 fill-black"
          />
        </div>
      ) : (
        resources?.slice(0, 3)?.map((item: any, index: number) => (
          <div
            key={index}
            className="mb-5 p-4 bg-[#E5E5E566] dark:bg-transparent dark:border dark:border-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <Link
              href={`/knowledge-bank`}
              className="font-medium font-size-normal cursor-pointer text-primaryDark dark:text-[#cccccc]"
            >
              {item?.title}
            </Link>

            <div className="flex">
              <Text
                className={`font-normal font-size-md ${
                  item?.type === "note"
                    ? "text-green-500"
                    : item.type === "file"
                    ? "text-purple-500"
                    : ""
                }`}
              >
                {item.type === "note"
                  ? "Notes"
                  : item?.type === "file" && "Bookmarked"}
              </Text>
              <Text className="font-normal font-size-md text-primaryDark dark:text-[#cccccc]">
                &nbsp; |&nbsp; {item?.project_name}
              </Text>
            </div>
          </div>
        ))
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
                Knowledge Bank Resources
              </Text>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-[#cccccc] dark:hover:text-gray-100 focus:outline-none mr-3"
              >
                <LuX className="h-6 w-6" />
                </button>
            </div>

            <div className="px-5 pt-5 md:px-6 md:pt-6 flex-grow overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader variant="threeDot" size="sm" />
                </div>
              ) : isResourcesEmpty ? (
                <div>
                  <Empty
                    text="RECENT KNOWLEDGE BANK RESOURCES EMPTY"
                    textClassName="text-gray-300 mt-2"
                    className="w-full mt-2"
                    imageClassName="stroke-gray-200 fill-black"
                  />
                </div>
              ) : (
                resources?.slice(3).map((item: any, index: number) => (
                  <div
                    key={index}
                    className="mb-5 p-4 bg-[#E5E5E566] dark:bg-transparent dark:border dark:border-white rounded-lg shadow hover:shadow-lg transition-shadow"
                  >
                    <Link
                      href={`/knowledge-bank`}
                      className="font-medium font-size-normal cursor-pointer text-primaryDark dark:text-[#cccccc]"
                    >
                      {item?.title}
                    </Link>
                    <div className="flex">
                      <Text
                        className={`font-normal font-size-md ${
                          item.type === "note"
                            ? "text-green-500"
                            : item.type === "file"
                            ? "text-purple-500"
                            : ""
                        }`}
                      >
                        {item.type === "note"
                          ? "Notes"
                          : item?.type === "file" && "Bookmarked"}
                      </Text>
                      <Text className="font-normal font-size-md text-primaryDark dark:text-[#cccccc]">
                        &nbsp; |&nbsp; {item.project_name}
                      </Text>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 md:mx-6 md:my-2  border-gray-200 dark:border-gray-700 flex justify-end">
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

export default RecentKnowledge;
