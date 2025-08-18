import React, { useRef, useState } from "react";
import Swipeable from "react-swipy";
import Card from "./Card";
import { SwipeableCardsProps } from "../utils/types";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

const SwipeableCards: React.FC<SwipeableCardsProps> = ({
  cards,
  totalCards,
  handleInterested,
  remove,
}) => {
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);

  const simulateSwipe = (direction: string) => {
    setSwipeDirection(direction);

    setTimeout(() => {
      handleInterested(direction);
      remove();
      setSwipeDirection(null);
    }, 300);
  };

  return (
    <div className="p-6">
      <div className="text-center font-medium text-xl mb-5 text-[#999999]">
        Swipe Left or Right
      </div>
      {cards.length > 0 && (
        <div className="relative">
          <div
            className={`max-w-[374px] w-full mx-auto h-[410px] ${
              swipeDirection ? `swipe-${swipeDirection}` : ""
            }`}
          >
            <Swipeable
              limit={100}
              onSwipe={(value: string) => handleInterested(value)}
              onAfterSwipe={remove}
            >
              <Card
                cards={cards[0]}
                reamingCard={cards}
                totalCards={totalCards}
              />
            </Swipeable>
          </div>
        </div>
      )}
      <div className="flex gap-5 justify-center mt-11">
        <button
          type="button"
          className="bg-[#FFA5A5] dark:bg-[#E922223D] rounded-[26px] dark:text-[white] text-[15px] flex items-center justify-center  p-3 gap-3 max-w-[180px] w-full focus-visible:outline-none"
          onClick={() => simulateSwipe("left")}
        >
          <OptimizedImage
            width={ImageSizes.icon.md.width}
            height={ImageSizes.icon.md.height}
            src={
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//arrow-left.png`
            }
            alt="left-icon"
          />
          <span>Not Interesting</span>
        </button>
        <button
          type="button"
          className="bg-[#90F5A6] rounded-[26px] dark:bg-[#079E283D] dark:text-[white] text-[15px] flex items-center justify-center p-3 gap-3 max-w-[180px] w-full focus-visible:outline-none"
          onClick={() => simulateSwipe("right")}
        >
          <span>Interesting</span>
          <OptimizedImage
            width={ImageSizes.icon.md.width}
            height={ImageSizes.icon.md.height}
            src={
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//arrow-right.png`
            }
            alt="right-icon"
          />
        </button>
      </div>
    </div>
  );
};

export default SwipeableCards;
