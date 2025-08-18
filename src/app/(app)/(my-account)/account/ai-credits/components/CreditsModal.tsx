import React, { useState, useRef } from "react";
import { RootState } from "@/reducer/store";
import { FaCoins } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

// Define TypeScript interfaces for the Dialog components
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

// Mock Dialog components since we don't have access to shadcn/ui
const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({
  className,
  children,
}) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4 relative ${
      className || ""
    }`}
  >
    {children}
  </div>
);

const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle: React.FC<DialogTitleProps> = ({ className, children }) => (
  <h2 className={`${className || ""} dark:text-gray-100`}>{children}</h2>
);

// Hover Popover component
interface HoverPopoverProps {
  children: [React.ReactNode, React.ReactNode]; // [Trigger, Content]
}

const HoverPopover: React.FC<HoverPopoverProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [triggerElement, contentElement] = React.Children.toArray(children);

  const showPopover = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const hidePopover = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };
  return (
    <div
      className="relative inline-block"
      onMouseEnter={showPopover}
      onMouseLeave={hidePopover}
    >
      {triggerElement}
      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
          {/* Arrow pointing up */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full w-4 h-4 overflow-hidden">
            <div className="rotate-45 transform origin-bottom-right bg-white dark:bg-gray-800 w-3 h-3 translate-x-[-50%] translate-y-1/2 border-l border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          {contentElement}
        </div>
      )}
    </div>
  );
};

interface CreditsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const CreditsModal: React.FC<CreditsModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [selectedCredits, setSelectedCredits] = useState("10000");
  const { subscriptionData } = useSelector(
    (state: RootState) => state?.subscription
  );
  const dispatch = useDispatch();

  const creditOptions = [
    { value: "10000", display: "10,000", price: "$10" },
    { value: "55000", display: "55,000", price: "$50" },
    { value: "130000", display: "130,000", price: "$100" },
    { value: "300000", display: "300,000", price: "$200" },
  ];

  const getCurrentPrice = () => {
    const selected = creditOptions.find(
      (option) => option.value === selectedCredits
    );
    return selected?.price || "";
  };

  const handleSelectCredits = (value: string) => {
    setSelectedCredits(value);
  };

  const contactSupportClick = () => {
    window.open("https://chat.cloud.board.support/969665972?ticket", "_blank");
  };
  const handlePurchaseCredits = () => {
    const redirectUrl =
      selectedCredits === "10000"
        ? "https://secure.researchcollab.ai/cart/add/PmvEAo0J"
        : selectedCredits === "55000"
        ? "https://secure.researchcollab.ai/cart/add/D8nvdR8n"
        : selectedCredits === "130000"
        ? "https://secure.researchcollab.ai/cart/add/M8qqGX8e"
        : "https://secure.researchcollab.ai/cart/add/V0jEeM4L";
    window.open(redirectUrl, "_blank");

  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-500 dark:text-gray-400"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-center">
            REMAINING CREDITS
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center mt-2 mb-4">
          <HoverPopover>
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-white text-3xl font-medium rounded-full px-8 py-2 flex items-center cursor-pointer">
              <span className="text-yellow-400 mr-2">
                <FaCoins />
              </span>{" "}
              {Math.max(
                0,
                (subscriptionData?.data?.credit_limit ?? 0) +
                  (subscriptionData?.data?.bonusCredits ?? 0) +
                  (subscriptionData?.data?.refferal_credits ?? 0) +
                  (subscriptionData?.data?.addOnCredits ?? 0) -
                  (subscriptionData?.data?.credit ?? 0)
              ) || 0}
            </div>
            <div className="w-64 p-3 bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-1">
                  <span>Subscription Credits:</span>
                  <span>{subscriptionData?.data?.credit_limit ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus Credits:</span>
                  <span>{subscriptionData?.data?.bonusCredits ?? 0}</span>
                </div>
                  <div className="flex justify-between">
                  <span>Referral Credits:</span>
                  <span>{subscriptionData?.data?.refferal_credits ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Add-on Credits:</span>
                  <span>{subscriptionData?.data?.addOnCredits ?? 0}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Total Credits:</span>
                  <span>
                    {subscriptionData?.data?.credit_limit +
                      subscriptionData?.data?.addOnCredits +
                      subscriptionData?.data?.refferal_credits +
                      subscriptionData?.data?.bonusCredits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Used Credits:</span>
                  <span>{subscriptionData?.data?.credit ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Credits:</span>
                  <span>
                    {Math.max(
                      0,
                      (subscriptionData?.data?.credit_limit ?? 0) +
                        (subscriptionData?.data?.bonusCredits ?? 0) +
                        (subscriptionData?.data?.refferal_credits ?? 0) +
                        (subscriptionData?.data?.addOnCredits ?? 0) -
                        (subscriptionData?.data?.credit ?? 0)
                    ) || 0}{" "}
                  </span>
                </div>
              </div>
            </div>
          </HoverPopover>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="font-medium text-lg mb-1 dark:text-gray-100">
            {/* Recharge your credit points */}
            Add-On AI Credits (Non-Expiring)
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Used only after your monthly and bonus credits are exhausted. Stay
            powered up with credits that never expire.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {creditOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectCredits(option.value)}
                className={`rounded-lg py-3 px-4 text-sm border transition-colors ${
                  selectedCredits === option.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500 hover:border-blue-300 dark:hover:border-blue-400"
                }`}
              >
                <div className="font-medium">{option.display}</div>
                <div className="text-xs opacity-80">{option.price}</div>
              </button>
            ))}
          </div>

          <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
            You will pay <span className="font-bold">{getCurrentPrice()}</span>{" "}
            for{" "}
            {creditOptions.find((o) => o.value === selectedCredits)?.display}{" "}
            credits
          </p>

          {/* <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            For more credits, please contact our{" "}
            <button  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
              support
            </button>
          </p> */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {/* For more credits, please contact our */}
            Need extra credits? <br /> Our support team got you —
            <a
              onClick={contactSupportClick}
              // href="https://mail.google.com/mail/?view=cm&fs=1&to=customercare@researchcollab.ai&su=Research%20Collab%20Support%20Request"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              Contact Us
            </a>
          </p>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchaseCredits}
            className=" btn text-white px-6 py-2 rounded-md  transition-colors"
          >
            Buy{" "}
            {creditOptions.find((o) => o.value === selectedCredits)?.display}{" "}
            Credits
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsModal;
