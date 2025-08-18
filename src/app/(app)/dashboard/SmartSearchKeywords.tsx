"use client";
import { RootState } from "@/reducer/store";
import { CirclePlus, CircleX } from "lucide-react";
import React, { useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Text } from "rizzui";
import { Loader, Empty } from "rizzui";
import toast from "react-hot-toast";
import {
  addKeywords,
  removeKeywords,
} from "@/reducer/global-search/globalSearchSlice";
import { LuX } from "react-icons/lu";

const SmartSearchKeywords = ({ allActivities, loadingOld }: any) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [customAddIsOpen, setcustomAddIsOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const userData = useSelector((state: any) => state?.user?.user?.user);
  const { keywords, loading } = useSelector(
    (state: RootState) => state.researchKeywords
  );
  const dispatch = useDispatch();

  const addKeyword = async () => {
    if (newKeyword === "") {
      setcustomAddIsOpen(false);
    } else {
      const alreadyExists = keywords.some(
        (kw: string) => kw.toLowerCase() === newKeyword.toLowerCase()
      );

      if (alreadyExists) {
        toast.error(`“${newKeyword}” already have in list.`);
      } else {
        const addAndSave = async () => {
          await dispatch(
            addKeywords({ userId: userData?.id, newWords: [newKeyword] }) as any
          );
          setNewKeyword("");
          setcustomAddIsOpen(false);
        };

        try {
          await toast.promise(addAndSave(), {
            loading: `Adding "${newKeyword}"...`,
            success: `“${newKeyword}” added and saved successfully.`,
            error: `Failed to add “${newKeyword}”.`,
          });
        } catch (error) {
          toast.error("Failed to save keyword.");
          console.error(error);
        }
      }
    }
  };

  const removeKeyword = async (word: string) => {
    try {
      // await dispatch(
      //   removeKeywords({ userId: userData?.id, newWords: [word] }) as any
      // );
      // toast.success(`"${word}" Removed Successfully`);
      await toast.promise(
        dispatch(
          removeKeywords({ userId: userData?.id, newWords: [word] }) as any
        ),
        {
          loading: `Removing "${word}"...`,
          success: `"${word}" removed successfully!`,
          error: `Failed to remove "${word}".`,
        }
      );
    } catch (error) {
      toast.error("Failed to remove keyword.");
      console.error(error);
    }
  };

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  return (
    <div className="w-full mt-6 border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-6 h-auto">
      <div className="flex justify-between">
        <div className="flex gap-2 justify-center items-center mt-2 mb-2">
          <div className="text-[#9e0773]">
            <RiSearch2Line className="h-[15px] w-[15px]" />
          </div>
          <h2 className="font-semibold font-size-normal text-primaryDark dark:text-[#cccccc]">
            SAVED KEYWORDS
          </h2>
        </div>
        {keywords?.length === 0 && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newKeyword) {
                  addKeyword();
                }
              }}
              className="px-2 py-1 text-xs sm:text-sm rounded-full border-2 border-[#0e7aff] bg-blue-600 hover:bg-blue-700 text-[#000000] dark:text-[#ffffff] cursor-pointer flex items-center"
              placeholder="Add keyword"
            />
            <button
              onClick={addKeyword}
              className="text-xs sm:text-sm text-[#0e7aff] cursor-pointer flex items-center"
            >
              <span className="cursor-pointer">
                <CirclePlus className="h-7 w-7" />
              </span>
            </button>
          </div>
        )}
        {keywords?.length > 3 && (
          <div className="items-center mt-3 cursor-pointer">
            <Text
              onClick={openModal}
              className="font-normal font-size-normal text-[#0E70FF]"
            >
              Show More
            </Text>
          </div>
        )}
      </div>
      <div className="p-[0.5px] bg-[#E5E5E5]"></div>

      {loading ? (
        <div className="flex flex-col gap-4 mt-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
            ></div>
          ))}
        </div>
      ) : keywords?.length < 1 ? (
        <div>
          <Empty
            text="SAVED KEYWORDS IS EMPTY"
            textClassName="text-gray-300 mt-2"
            className="w-full mt-2"
            imageClassName="stroke-gray-200 fill-black"
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 py-2">
          {keywords
            ?.slice()
            ?.reverse()
            ?.slice(0, 10)
            ?.map((update: any, index: any) => (
              <div
                onClick={() => removeKeyword(update)}
                className="px-3 py-1 text-xs sm:text-sm rounded-full border border-[#0E70FF] bg-[#0E70FF1F] hover:bg-[#0E70FF33] text-[#0E70FF] cursor-pointer flex items-center"
              >
                <span className="flex gap-2 justify-center items-center">
                  <span>{update}</span>{" "}
                  <span className="cursor-pointer">
                    <CircleX className="h-4 w-4" />
                  </span>
                </span>
              </div>
            ))}
          {!customAddIsOpen ? (
            <div
              onClick={() => setcustomAddIsOpen(true)}
              className="px-2 py-1 text-xs sm:text-sm rounded-full border border-[#0e7aff] bg-blue-600 hover:bg-blue-700 text-[#ffffff] cursor-pointer flex items-center"
            >
              <span className="flex gap-2 justify-center items-center">
                <span className="cursor-pointer">
                  <CirclePlus className="h-4 w-4" />
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newKeyword) {
                    addKeyword();
                  }
                }}
                className="px-2 py-1 text-xs sm:text-sm rounded-full border-2 border-[#0e7aff] bg-blue-600 hover:bg-blue-700 text-[#000000] dark:text-[#ffffff] cursor-pointer flex items-center"
                placeholder="Add keyword"
              />
              <button
                onClick={addKeyword}
                className="text-xs sm:text-sm text-[#0e7aff] cursor-pointer flex items-center"
              >
                <span className="cursor-pointer">
                  <CirclePlus className="h-7 w-7" />
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {modalIsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={closeModal}
          ></div>
          <div className="bg-white dark:bg-[#1F2E34] rounded-lg shadow-lg p-5 md:p-10 z-50 w-full max-w-lg md:max-w-3xl lg:max-w-4xl h-auto max-h-screen md:h-auto overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <Text className="text-[20px] font-semibold dark:text-[#cccccc]">
                SAVED KEYWORDS
              </Text>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-[#cccccc] dark:hover:text-gray-100"
              >
                <LuX className="h-6 w-6" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center mt-5">
                <Loader variant="threeDot" size="sm" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 py-2">
                {keywords?.map((update: any, index: any) => (
                  <div
                    onClick={() => removeKeyword(update)}
                    className="px-3 py-1 text-xs sm:text-sm rounded-full border border-[#0E70FF] bg-[#0E70FF1F] hover:bg-[#0E70FF33] text-[#0E70FF] cursor-pointer flex items-center"
                  >
                    <span className="flex gap-2 justify-center items-center">
                      <span>{update}</span>{" "}
                      <span className="cursor-pointer">
                        <CircleX className="h-4 w-4" />
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!loading && keywords?.length === 0 && (
              <div>
                <Empty
                  text="SAVED KEYWORDS IS EMPTY"
                  textClassName="text-gray-300 mt-2"
                  className="w-full mt-2"
                  imageClassName="stroke-gray-200 fill-black"
                />
              </div>
            )}

            <div className="text-right mt-7">
              <a
                className="bg-gradient-to-t from-[#0F55BA] to-[#0E70FF] text-white text-[13px] md:text-[14px] font-medium rounded-full px-12 py-2 hover:cursor-pointer border-[#3686FC] border-[2px]"
                onClick={closeModal}
              >
                Close
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearchKeywords;
