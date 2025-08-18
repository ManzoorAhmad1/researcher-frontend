// components/ArticleList.js

import { handleFavouriteNews } from "@/apis/explore";
import NewsItem from "@/components/coman/NewsItem";
import { Star } from "lucide-react";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";
import Slider from "react-slick";
import { Loader } from "rizzui";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { SlickCarouselLoader } from "@/components/SlickCarouselLoader";

interface NewsItemProps {
  handleGetNewsByTopics: (value?: boolean, isFavouriteFetch?: number) => void;
  articles: NewsItemType[] | [];
  loading: boolean;
}

type NewsItemType = {
  created_at: string;
  date: string;
  description?: string;
  domain: string;
  id: number;
  is_favourite: boolean;
  link: string;
  search_id: number;
};

const SamplePrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div onClick={onClick} className={`arrow ${className}`}>
      <FaChevronLeft className="arrows" />
    </div>
  );
};

const SampleNextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div onClick={onClick} className={`arrow ${className}`}>
      <FaChevronRight className="arrows" />
    </div>
  );
};

const NewsList: React.FC<NewsItemProps> = ({
  articles,
  loading,
  handleGetNewsByTopics,
}) => {
  const handleIsFavourite = async (
    is_favourite: boolean,
    id: number,
    search_id: number
  ) => {
    try {
      const response = await handleFavouriteNews(is_favourite, id, search_id);
      if (response) {
        toast.success("Favourite news updated Successfully!");
        handleGetNewsByTopics(true, id);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    }
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: articles?.length <= 4 ? articles?.length : 4,
    slidesToScroll: articles?.length <= 4 ? articles?.length : 4,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: articles?.length <= 4 ? articles?.length : 3,
          slidesToScroll: articles?.length <= 4 ? articles?.length : 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: articles?.length <= 4 ? articles?.length : 2,
          slidesToScroll: articles?.length <= 4 ? articles?.length : 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: articles?.length <= 4 ? articles?.length : 1,
          slidesToScroll: articles?.length <= 4 ? articles?.length : 1,
        },
      },
    ],
  };
  return (
    <div className="slider-container pt-8">
      <SlickCarouselLoader />
      <h1 className="text-md font-medium text-gray-800 mx-2 dark:text-[#CCCCCC]">
        Related News
      </h1>
      <hr className="my-6 dark:bg-[#E5E5E533]" />

      <div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader variant="threeDot" size="lg" />
          </div>
        ) : (!articles || articles?.length === 0) && !loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="font-semibold text-lg text-center">
              No Related News Found
            </p>
          </div>
        ) : (
          <div>
            <Slider {...settings}>
              {articles?.map((article: any, index: number) => (
                <NewsItem
                  index={index}
                  key={article.id}
                  article={article}
                  handleIsFavourite={handleIsFavourite}
                />
              ))}
            </Slider>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;
