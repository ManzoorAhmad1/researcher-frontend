"use client";

import React, { useRef, useEffect } from "react";
import { Loader } from "rizzui";

interface VideoTutorialModalProps {
  onClose: () => void;
  onNext: () => void;
  videoSrc: string;
  onNextLoader?: boolean;
  onCloseLoader?: boolean;
}

const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({
  onClose,
  onNext,
  videoSrc,
  onNextLoader = false,
  onCloseLoader = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-4xl h-auto shadow-lg overflow-y-auto rounded-lg">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 text-gray-600 hover:text-gray-900  rounded-md p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="flex flex-col">
            <div className="relative aspect-video w-full overflow-hidden">
              <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-fit"
                controls
                playsInline
              />
            </div>

            <div className="bg-white dark:bg-gray-950 p-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={onClose}
                  disabled={onCloseLoader}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-6 py-2.5 rounded-full text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {onCloseLoader ? (
                    <Loader variant="threeDot" />
                  ) : (
                    "Explore My Own"
                  )}
                </button>
                <button
                  onClick={onNext}
                  disabled={onNextLoader}
                  className="bg-gradient-to-t from-[#0F55BA] to-[#0E70FF] text-white text-sm font-medium rounded-full px-8 py-2.5 border-[#3686FC] border-[2px] hover:opacity-90"
                >
                  {onNextLoader ? <Loader variant="threeDot" /> : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoTutorialModal;
