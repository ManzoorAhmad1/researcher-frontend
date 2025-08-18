"use client";

import React, { useEffect } from "react";
import { CustomModal, CustomModalTitle, CustomModalContent } from "@/components/ui/CustomModal";
import { triggerConfetti } from "@/components/Account/Subcription";
import { FaCoins } from "react-icons/fa";

interface AICreditsPurchaseSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  creditsPurchased?: number;
}

const AICreditsPurchaseSuccess = ({
  isOpen,
  onClose,
  creditsPurchased,
}: AICreditsPurchaseSuccessProps) => {
  useEffect(() => {
    if (isOpen) {
      setTimeout(triggerConfetti, 300);
    }
  }, [isOpen]);
  return (
    <CustomModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <CustomModalContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center pt-4 pb-2">
          <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="w-14 h-14 text-green-500 dark:text-green-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <CustomModalTitle className="text-2xl font-bold text-center mb-2">
            Congratulations!
          </CustomModalTitle>

          <div className="text-center">
            {" "}
            <p className="text-lg font-medium mb-4">
              AI Credits Successfully Activated!
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-5 flex items-center justify-center">
              <div className="flex items-center gap-2">
                {" "}
                <span className="text-yellow-400 mr-2 text-xl">
                  <FaCoins size={24} />
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {creditsPurchased}
                </span>
              </div>
            </div>{" "}
            <p className="text-sm text-muted-foreground mb-4">
              Your AI credits are now active and ready to use. These credits
              never expire and will be used after your monthly and bonus credits
              run out.
            </p>{" "}
            <p className="text-sm text-muted-foreground mb-2">
              Keep using our advanced AI features without interruption with your
              new credits.
            </p>          </div>
        </div>
      </CustomModalContent>
    </CustomModal>
  );
};

export default AICreditsPurchaseSuccess;
