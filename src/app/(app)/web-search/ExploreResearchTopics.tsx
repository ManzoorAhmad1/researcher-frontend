import { RootState } from "@/reducer/store";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ExploreResearchProps } from "./utils/types";

const ExploreResearchTopics: React.FC<ExploreResearchProps> = ({
  setValue,
  onSubmit,
  handleSubmit,
  aiExploreResearchData,
  setInputValue
}) => {
  const { lightMode } = useSelector((state: RootState) => state.userUtils);
  const [active, setActive] = useState<Number>();

  return (
    <div className="w-[90%] mx-auto">
      <h5 className="text-[18px] text-[#333333] dark:text-[#CCCCCC] font-medium  px-5 ml-4 mb-6">
        Explore Research Topics
      </h5>
      <div className="flex flex-wrap justify-center gap-5">
        {aiExploreResearchData?.map((item, i) => (
          <div
            onClick={() => {
              setActive(i);
              setValue("search", item?.aiTopic)
              setInputValue(item?.aiTopic)
              handleSubmit(onSubmit({ search: item?.aiTopic }));
            }}
            className="w-full max-w-[470px] p-5 rounded-tl-3xl rounded rounded-b-3xl rounded-bl flex gap-4 items-center cursor-pointer border-2"
            style={{
              background: lightMode ? item.cardLightBg : item.cardDarkBg,
              borderColor: i === active ? item.bgLightIconColor : "transparent",
            }}
            key={i}
          >
            <div
              style={{ background: item.bgLightIconColor }}
              className="w-[45px] h-[40px] rounded-full flex items-center justify-center"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6.75 0.5C8.92297 0.5 10.8572 1.52853 12.0921 3.125H9.99885C9.1053 2.42036 7.97692 2 6.75 2C3.84937 2 1.5 4.34937 1.5 7.25C1.5 10.1506 3.84937 12.5 6.75 12.5C8.3652 12.5 9.80947 11.7715 10.7723 10.625H12.596C11.4284 12.6421 9.24682 14 6.75 14C3.024 14 0 10.976 0 7.25C0 3.524 3.024 0.5 6.75 0.5ZM13.114 12.5533L15.2353 14.6746L14.1746 15.7353L12.0533 13.614L13.114 12.5533ZM9.75 6.125H4.5V4.625H9.75V6.125ZM14.25 9.125H4.5V7.625H14.25V9.125Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="dark:text-[#CCCCCC] w-full">{item?.aiTopic}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreResearchTopics;
