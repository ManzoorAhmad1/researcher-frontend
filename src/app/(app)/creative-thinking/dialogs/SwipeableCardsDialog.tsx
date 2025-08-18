/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SwipeableCards from "../swipeable-cards/SwipeableCards";
import { scamperDataType, SwipeableCardsDialogProps } from "../utils/types";
import toast from "react-hot-toast";
import { creativeThinkingAddToFavorite } from "@/apis/topic-explorer";

const SwipeableCardsDialog: React.FC<SwipeableCardsDialogProps> = ({
  selectedValue,
  scamperDataId,
  isScamperData,
  setIsScamperData,
  setSwipeableCardsDialog,
  swipeableCardsDialog,
}) => {
  const [interested, setInterested] = useState<boolean[]>([]);
  const [cards, setCards] = useState<scamperDataType[]>([...isScamperData]);
  const interestRef = useRef<boolean[]>([]);

  const remove = () => {
    setIsScamperData((prev: scamperDataType[]) =>
      prev?.map((item: scamperDataType, i: number) => ({
        ...item,
        interested: interestRef.current[i],
      }))
    );
    setCards((prevCards) => {
    const newCards = prevCards.slice(1);
    if (newCards.length === 0) {
      handleUpdateItem();
      setSwipeableCardsDialog(false);
    }
      return newCards;
    });
    // if (cards.length === 1) {
    //   handleUpdateItem();
    //   setSwipeableCardsDialog(false);
    // }
  };

  const handleInterested = (value: string) => {
    const booleanValue = value !== "left";
    interestRef.current.push(booleanValue);
    setInterested([...interestRef.current]);
  };

  const handleUpdateItem = async () => {
    const updatedScamperData = isScamperData?.map((item, i: number) => ({
      ...item,
      interested: interested[i],
    }));
    await creativeThinkingAddToFavorite(scamperDataId, updatedScamperData);
  };

  useEffect(() => {
    setCards([...isScamperData]);
  }, [isScamperData?.length]);

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
      <DialogContent className="w-[80vw] max-w-[530px] dark:bg-[#233137] max-h-[658px] h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
        <SwipeableCards
          cards={cards}
          handleInterested={handleInterested}
          remove={remove}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SwipeableCardsDialog;
