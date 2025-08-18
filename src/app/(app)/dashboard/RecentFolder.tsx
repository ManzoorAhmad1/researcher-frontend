import Link from 'next/link';
import { useState } from 'react';
import { PiClockCounterClockwiseBold } from 'react-icons/pi';
import { RiFolder6Line } from 'react-icons/ri';
import { LuX } from "react-icons/lu";
import { Loader, Text, Empty } from 'rizzui'; 

const RecentFolder = ({ recentFolder, loading }: any) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const folderItems = recentFolder?.data?.map((item: any) => ({
    title: item?.folder_name,
    category: item?.itemType ? 'Papers' : 'Knowledge Bank',
    categoryColor: '#0E70FF',
    project: item?.project_name,
  }));

  const isFoldersEmpty = folderItems?.length === 0;

  return (
    <div className="w-full p-6 border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow mt-6">

      <div className="flex justify-between">
        <div className="flex gap-2 mt-5 mb-5">
          <div className="text-[#8D17B5]">
            <PiClockCounterClockwiseBold className="h-[15px] w-[15px]" />
          </div>
          <Text className="font-semibold font-size-normal text-primaryDark dark:text-[#cccccc]">
          RECENT FOLDER
          </Text>
        </div>
        {recentFolder?.data?.length > 3 && (
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
      ) : isFoldersEmpty ? (
         <div>
                        <Empty
                          text="RECENT FOLDER IS EMPTY"
                          textClassName="text-gray-300 mt-2"
                          className=" w-full mt-2 "
                          imageClassName="stroke-gray-200 fill-black " />
                      </div>
      ) : (
        <>
          {folderItems?.slice(0, 3)?.map((item: any, index: any) => (
            <div key={index} className="mt-5 mb-5">
              <div className="flex gap-2">
                <div className="dark:text-yellow-500 text-[#0E70FF]">
                  <RiFolder6Line className="h-[15px] w-[15px]" />
                </div>
                <Link href={`/explorer`} className="font-normal font-size-normal text-[#0E70FF] cursor-pointer">
                  {item?.title}
                </Link>
              </div>
              <div className="flex mb-3">
                <h2
                  className="font-normal font-size-md cursor-text"
                  style={{ color: item?.category === 'Papers' ? '#079E28' : '#8D17B5' }}
                >
                  {item?.category}
                </h2>
                <p className="font-normal font-size-md text-[#0E70FF] cursor-text">
                  &nbsp; | {item?.project}
                </p>
              </div>
              {index < folderItems?.length - 1 && <div className="p-[0.5px] bg-[#E5E5E5]"></div>}
            </div>
          ))}
        </>
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
                Recent Folders
              </Text>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-[#cccccc] dark:hover:text-gray-100 focus:outline-none mr-3"
              >
                <LuX className="h-6 w-6" />
              </button>
            </div>

            <div className="p-5 md:px-6 md:py-1 flex-grow overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader variant="threeDot" size="sm" />
                </div>
              ) : isFoldersEmpty ? (
                <div>
                  <Empty
                    text="RECENT FOLDER IS EMPTY"
                    textClassName="text-gray-300 mt-2"
                    className="w-full mt-2"
                    imageClassName="stroke-gray-200 fill-black"
                  />
                </div>
              ) : (
                folderItems?.slice(3)?.map((item: any, index: any) => (
                  <div key={index} className="my-2">
                    <div className="flex gap-2">
                      <div className="dark:text-yellow-500 text-[#0E70FF]">
                        <RiFolder6Line className="h-[15px] w-[15px]" />
                      </div>
                      <Link href={`/explorer`} className="font-normal font-size-normal text-[#0E70FF] cursor-pointer">
                        {item?.title}
                      </Link>
                    </div>
                    <div className="flex mb-3">
                      <h2
                        className="font-normal font-size-md"
                        style={{ color: item?.category === 'Papers' ? '#079E28' : '#8D17B5' }}
                      >
                        {item?.category}
                      </h2>
                      <p className="font-normal font-size-md text-[#0E70FF]">
                        &nbsp; | {item?.project}
                      </p>
                    </div>
                    {index < folderItems?.length - 1 && <div className="p-[0.5px] bg-[#E5E5E5]"></div>}
                  </div>
                ))
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

export default RecentFolder;
