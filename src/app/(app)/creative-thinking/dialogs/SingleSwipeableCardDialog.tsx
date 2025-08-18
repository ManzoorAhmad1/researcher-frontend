import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { scamperDataType, SingleSwipeableCardProps } from "../utils/types";
import toast from "react-hot-toast";
import SwipeableCards from "../swipeable-cards/SwipeableCards";
import { creativeThinkingAddToFavorite } from "@/apis/topic-explorer";

const SingleSwipeableCardDialog: React.FC<SingleSwipeableCardProps> = ({
  scamperDataId,
  isScamperData,
  setIsScamperData,
  singleScamperData,
  swipeableCardsDialog,
  totalCards,
  setSwipeableCardsDialog,
}) => {
  const [cards, setCards] = useState<scamperDataType[]>([...singleScamperData]);

  const handleInterested = (value: string) => {
    const booleanValue = value !== "left";
    setIsScamperData((prev: any) =>
      prev.map((item: any) =>
        item.title === singleScamperData?.[0]?.title
          ? { ...singleScamperData?.[0], interested: booleanValue }
          : item
      )
    );
  };

  const remove = () => {
    setCards((prevCards) => prevCards.slice(1));
    if (cards.length === 1) {
      handleUpdateItem();
      setSwipeableCardsDialog(false);
      toast.success(
        `${singleScamperData?.[0]?.title} has been generated successfully.`
      );
    }
  };

  const handleUpdateItem = async () => {
    await creativeThinkingAddToFavorite(scamperDataId, isScamperData);
  };

  useEffect(() => {
    if (cards?.length === 0) {
      setSwipeableCardsDialog(false);
    }
  }, [cards?.length]);

  return (
    <Dialog
      open={swipeableCardsDialog}
      onOpenChange={() => setSwipeableCardsDialog(false)}
    >
      <DialogContent className="w-[80vw] max-w-[532px] dark:bg-[#233137]">
        <SwipeableCards
          totalCards={totalCards}
          cards={cards}
          remove={remove}
          handleInterested={handleInterested}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SingleSwipeableCardDialog;
