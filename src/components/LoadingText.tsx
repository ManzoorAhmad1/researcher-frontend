import React, { useState, useEffect } from "react";

interface LoadingTextProps {
  messages: string[];
}

const LoadingText: React.FC<LoadingTextProps> = ({ messages }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLastMessage, setIsLastMessage] = useState(false);

  // Effect for handling the initial messages animation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentMessage = messages[currentMessageIndex];

    if (isWaiting) {
      timeout = setTimeout(() => {
        setIsWaiting(false);
        if (currentMessageIndex === messages.length - 1) {
          // If we're on the last message, set flag and keep repeating
          setIsLastMessage(true);
          return;
        }
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }

    if (isDeleting) {
      if (displayText === "") {
        setIsDeleting(false);
        if (currentMessageIndex < messages.length - 1) {
          setCurrentMessageIndex((prev) => prev + 1);
        }
        return;
      }
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
      }, 50);
    } else {
      if (displayText === currentMessage) {
        setIsWaiting(true);
        if (currentMessageIndex === messages.length - 1) {
          // Add the final message to completed steps
          setCompletedSteps((prev) => [...prev, currentMessage]);
        }
        return;
      }
      timeout = setTimeout(() => {
        setDisplayText((prev) => currentMessage.slice(0, prev.length + 1));
      }, 100);
    }

    return () => clearTimeout(timeout);
  }, [displayText, currentMessageIndex, isDeleting, isWaiting, messages]);

  // Effect for handling the repeating last message animation
  useEffect(() => {
    if (!isLastMessage) return;

    let timeout: NodeJS.Timeout;
    const lastMessage = messages[messages.length - 1];

    if (displayText === lastMessage) {
      timeout = setTimeout(() => {
        setDisplayText("");
      }, 2000);
    } else if (displayText === "") {
      timeout = setTimeout(() => {
        setDisplayText(lastMessage);
      }, 500);
    } else {
      timeout = setTimeout(() => {
        setDisplayText((prev) => lastMessage.slice(0, prev.length + 1));
      }, 100);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isLastMessage, messages]);

  return (
    <div className="w-[85%] mx-auto mb-2 text-sm text-gray-600 dark:text-gray-300 min-h-[20px]">
      {currentMessageIndex === messages.length - 1 ? (
        // Only show the final message when we reach it
        <>
          {displayText}
          <span className="animate-blink">|</span>
        </>
      ) : (
        // Show all completed steps plus current step
        <>
          {completedSteps.map((step, index) => (
            <div key={index} className="mb-1">
              {step}
            </div>
          ))}
          {displayText}
          <span className="animate-blink">|</span>
        </>
      )}
    </div>
  );
};

export default LoadingText; 