'use client';
import React, { useEffect, useState } from "react";
import { FaRegStar } from "react-icons/fa";
import { RiFolder6Line, RiPagesLine } from "react-icons/ri";
import { StickyNote, MessageSquareText } from 'lucide-react';
import { Loader, Empty } from 'rizzui'; 
import {  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";


const Favorites = ({ favorite, loading }: any) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [favoriteChat, openFavoriteChat] = useState<boolean>(false);

  const { favorites, notesFileFavorites, notesFolderFavorites, favoritesPDFChat } = favorite;
  const sections = [
    {
      title: "Project Folders",
      items: favorites?.filter((fav: any) => fav?.item_type === "folder").map((file: any) => ({
        icon: <RiFolder6Line className="h-[15px] w-[15px]" />,
        text: file?.item_name,
      })),
    },
    {
      title: "Project Files",
      items: favorites?.filter((fav: any) => fav?.item_type === "file").map((file: any) => ({
        icon: <RiPagesLine className="h-[15px] w-[15px]" />,
        text: file?.item_name,
      })),
    },
    {
      title: "Bookmarked Notes",
      items: notesFileFavorites?.map((note: any) => ({
        icon: <StickyNote className="h-[15px] w-[15px]" />,
        text: note?.title,
      })),
    },
    {
      title: "Favorite Chats",
      items: favoritesPDFChat?.map((value:any)=>{
        return({
          icon: <MessageSquareText className="h-[15px] w-[15px]" />,
          text: value?.text,
          answer: value?.answer,
          id: value?.id
        })
      }),
    },
  ];
  const favoriteChats = sections?.find((value:any)=> value?.title=='Favorite Chats')
  const hasFavorites = sections?.some(section => section?.items && section?.items?.length > 0);
  
  const toggleExpand = (id:string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const showMore = () => {
    openFavoriteChat(!favoriteChat)
  };

  return (
    <div className="w-full">
      <div className="border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-6 mt-6 h-auto">
        <div className="flex justify-between">
          <div className="flex gap-2 justify-center items-center mt-3 mb-3">
            <div className="text-[#F59B14]">
              <FaRegStar className="h-[15px] w-[15px]" />
            </div>
            <h2 className="font-semibold font-size-normal text-primaryDark dark:text-[#cccccc]">FAVORITES</h2>
          </div>
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
        ) : hasFavorites ? (
          sections?.map((section:any, index:any) =>
            section?.items?.length > 0 ? (
              <React.Fragment key={index}>
                <div className="mt-3 mb-3">
                  <div className="flex justify-between">
                    <p className="font-medium text-primaryDark dark:text-[#cccccc]">{section?.title}</p>
                    {section?.title == "Favorite Chats" && section?.items?.length > 3 && <a onClick={showMore} className="font-normal font-size-normal cursor-pointer text-blue-500">Show More</a>}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {(section?.title == "Favorite Chats" ? section?.items.slice(0, 3) : section?.items)?.map((item: any, idx: any) => (<>
                      <div key={idx} className={`flex items-center gap-2 ${item?.id ? 'cursor-pointer' : ''}`} onClick={() => { item?.id && toggleExpand(item?.id) }}>

                          <div className={`text-[#0E70FF] ${item?.id ? 'cursor-pointer' : ''}`}>{item.icon}</div>
                          <p className={`font-size-normal text-[#0E70FF] ${item?.id ? 'cursor-pointer' : 'cursor-text'}`}>{item?.text}</p>
  
                      </div>
                      {expandedId === item.id && (
                        <div className="p-2 sm:p-3 bg-white text-gray-700 border-b border-gray-200">
                          {typeof item.answer === 'string' ? (<ul className="list-disc pl-6 marker:text-black">
                            <li className="text-base mb-1 leading-relaxed font-size-normal">
                              {item.answer}
                            </li>
                            </ul>) : (<>
                            <ul className="list-disc pl-6 marker:text-black">
                              {item?.answer?.map((section: any, sectionIdx: number) => {
                                return (
                                    <li key={sectionIdx} className="text-base mb-1 leading-relaxed font-size-normal">
                                        {section?.data}
                                    </li>
                                )
                              })}
                            </ul>
                            </>)}
                        </div>
                      )}
                    </>))}
                  </div>
                </div>
                {index < sections?.length - 1 && <div className="p-[0.5px] bg-[#E5E5E5]"></div>}
              </React.Fragment>
            ) : null
          )
        ) : (
          <div>
            <Empty
              text="FAVORITES IS EMPTY"
              textClassName="text-gray-300 mt-2"
              className="w-full mt-2"
              imageClassName="stroke-gray-200 fill-black"
            />
          </div>
        )}
      </div>
      <Dialog open={favoriteChat} onOpenChange={showMore}>
        <DialogContent className="max-w-[56rem] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Favorite Chats</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <div className="flex flex-wrap gap-2 items-center">
              {favoriteChats?.items?.slice(3)?.map((item: any, idx: any) => (<>
                <div key={idx} className={`flex items-center gap-2 ${item?.id ? 'cursor-pointer' : ''}`} onClick={() => { item?.id && toggleExpand(item?.id) }}>

                  <div className={`text-[#0E70FF] ${item?.id ? 'cursor-pointer' : ''}`}>{item.icon}</div>
                  <p className={`font-size-normal text-[#0E70FF] ${item?.id ? 'cursor-pointer' : 'cursor-text'}`}>{item?.text}</p>

                </div>
                {expandedId === item.id && (
                  <div className="p-2 sm:p-3 bg-white text-gray-700 border-b border-gray-200">
                    {typeof item.answer === 'string' ? (<ul className="list-disc pl-6 marker:text-black">
                      <li className="text-base mb-1 leading-relaxed font-size-normal">
                        {item.answer}
                      </li>
                    </ul>) : (<>
                      <ul className="list-disc pl-6 marker:text-black">
                        {item?.answer?.map((section: any, sectionIdx: number) => {
                          return (
                            <li key={sectionIdx} className="text-base mb-1 leading-relaxed font-size-normal">
                              {section?.data}
                            </li>
                          )
                        })}
                      </ul>
                    </>)}
                  </div>
                )}
              </>))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Favorites;
