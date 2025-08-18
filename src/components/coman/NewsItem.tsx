/* eslint-disable react/jsx-key */
import {
  AddIcon,
  AiIcon,
  CarIcon,
  IdeaIcon,
  LayOutIcon,
} from "@/app/(app)/web-search/icons/websearch-icons";
import { Star } from "lucide-react";
import Link from "next/link";
import React from "react";

type NewsItemProps = {
  article: NewsItem;
  index: number;
  handleIsFavourite: (
    is_favourite: boolean,
    id: number,
    search_id: number
  ) => void;
};

type NewsItem = {
  created_at: string;
  date: string;
  description?: string;
  domain: string;
  id: number;
  is_favourite: boolean;
  link: string;
  search_id: number;
};
const icons = [<CarIcon />, <LayOutIcon />, <IdeaIcon />];

const NewsItem: React.FC<NewsItemProps> = ({
  article,
  handleIsFavourite,
  index,
}) => {
  const iconIndex = index % icons.length;
  return (
    <div
      key={article.id}
      className="bg-white dark:bg-[#142328] border mb-2  p-6  transition duration-300 ease-in-out mx-2 rounded-tl-3xl rounded-r-lg rounded-b-3xl rounded-bl-lg"
    >
      <div className="mb-4 w-[100%] overflow-hidden h-[100%] max-h-[100px] min-h-[190px]">
        <div className="flex justify-between mb-4">
          <div>{icons[iconIndex]}</div>
          <div className="flex items-center justify-center gap-5">
            <AiIcon />
            <AddIcon />
            <Star
              className={`h5 w-5 cursor-pointer ${
                article.is_favourite
                  ? "fill-[#FDBB11] text-[#FDBB11]"
                  : "text-[#666666]"
              }`}
              onClick={() =>
                handleIsFavourite(
                  !article.is_favourite,
                  article.id,
                  article?.search_id
                )
              }
            />
          </div>
        </div>
        <div className="flex justify-between items-center flex-wrap ">
          <h2 className="text-xl font-medium mt-2 mb-2 text-[#333333] dark:text-[#CCCCCC] hover:underline text-wrap text-[15px]">
            <Link
              style={{ display: "flex" }}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-wrap">{article.domain}</span>
            </Link>
          </h2>
        </div>
        <span className="text-sm text-[#333333] dark:text-[#CCCCCC]">
          {article.date}
        </span>
        <p className="text-[#666666] dark:text-[#999999] mt-5">
          {article.description}
        </p>
      </div>
      <div className="flex justify-between items-center">
        <Link
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
        >
          Read More &rarr;
        </Link>
      </div>
    </div>
  );
};

export default NewsItem;
