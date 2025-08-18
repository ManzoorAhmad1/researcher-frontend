
import React from "react";
import { RiNewspaperLine } from "react-icons/ri";
import { Loader, Empty, Text } from 'rizzui'; 

const NewsDiscoveries = ({ articles, loading }: any) => {

    return (
        <div className="p-5 mt-5 border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
                <div className="flex gap-2">
                    <div className="text-[#6A60C1]">
                        <RiNewspaperLine className="h-[15px] w-[15px]" />
                    </div>
                    <h2 className="font-semibold font-size-normal text-primaryDark dark:text-[#cccccc]">NEWS & DISCOVERIES</h2>
                </div>
               {articles?.length > 3 &&
                <div className="items-center">
                    <Text className="font-normal font-size-normal text-[#0E70FF]">View More</Text>
                </div>}
            </div>
            <div className="p-[0.25px] bg-[#E5E5E5]"></div>

            {loading ? (
                <div className="flex flex-col gap-4 mt-3">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
                  ></div>
                ))}
              </div>
            ) : articles?.length === 0 ? (
                <div className="flex justify-center items-center mt-5">
                    <Empty
                        text="NO NEWS & DISCOVERIES"
                        textClassName="text-gray-300 mt-2"
                        className="w-full mt-2"
                        imageClassName="stroke-gray-200 fill-black"
                    />
                </div>
            ) : (
                articles?.map((item: any, index: number) => (
                    <div key={index} className="mt-5 mb-5">
                        <p className="font-medium font-size-normal text-primaryDark ">
                            <a href={item?.link} target="_blank" rel="noopener noreferrer" className="text-primaryDark">{item?.description}</a>
                        </p>

                        <div className="flex">
                            <h2 className="font-normal font-size-md  text-[#6A60C1] ">
                                <strong>{item?.domain}</strong> 
                            </h2>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default NewsDiscoveries;
