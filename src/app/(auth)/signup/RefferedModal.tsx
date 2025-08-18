"use client";

import React, { useEffect, useState } from "react";
import { FiGift } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import { BsFillPersonCheckFill } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  referrerName: string;
}

const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  referrerName,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300 ${
        isAnimating ? "bg-opacity-70 backdrop-blur-sm" : "bg-opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-11/12 max-w-md mx-auto bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl p-6 shadow-2xl border border-[#ffffff20] transition-all duration-300 ${
          isAnimating
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <AiOutlineClose size={24} />
        </button>

        <div className="flex flex-col items-center">
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-[#e65c5c] rounded-full p-4 shadow-lg animate-pulse">
            <FiGift size={36} className="text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            You&apos;ve Been Invited!
          </h2>

          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-[#e65c5c] rounded-full mb-4"></div>

          <div className="mb-5 text-center">
            <p className="text-lg text-gray-300 mb-2">
              <span className="font-bold text-white">{referrerName}</span> has
              referred you to Research Collab.
            </p>
            <p className="text-gray-400">
              Sign up now to access exclusive features!
            </p>
          </div>

          <div className="w-full bg-[#ffffff10] rounded-lg p-4 mb-5">
            <div className="mb-3 text-center text-white text-sm font-semibold">
              Join Research Collab for:
            </div>
            <div className="space-y-3">
              <div className="flex items-center p-2 rounded-md hover:bg-[#ffffff10] transition-colors">
                <BsFillPersonCheckFill
                  className="text-blue-500 mr-3 transition-transform group-hover:scale-110"
                  size={18}
                />
                <span className="text-sm text-gray-300">
                  Collaborate with researchers{" "}
                </span>
              </div>
              <div className="flex items-center p-2 rounded-md hover:bg-[#ffffff10] transition-colors">
                <HiSparkles className="text-blue-500 mr-3" size={18} />
                <span className="text-sm text-gray-300">
                  Access powerful research tools
                </span>
              </div>
            </div>
          </div>
          <div className="w-full space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-[#e65c5c] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:translate-y-[-2px] active:translate-y-[1px]"
            >
              Continue Sign Up
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 border border-[#ffffff30] text-gray-300 font-medium rounded-lg hover:bg-[#ffffff10] transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;
