import React, { useState, useEffect } from "react";

interface OTPExpireTimerProps {
  optExpireTime: string;
}

const OTPExpireTimer: React.FC<OTPExpireTimerProps> = ({ optExpireTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const expiryDate = new Date(optExpireTime);
      const diffInSeconds = Math.floor(
        (expiryDate.getTime() - now.getTime()) / 1000
      );
      return diffInSeconds > 0 ? diffInSeconds : 0;
    };

    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [optExpireTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex justify-center">
      <div className="relative w-40 h-40">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 overflow-hidden">
          <div
            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-1000"
            style={{ height: `${(timeLeft / 300) * 100}%` }}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-semibold text-[#413f3f] dark:text-white">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPExpireTimer;
