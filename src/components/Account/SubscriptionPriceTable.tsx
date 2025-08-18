import React, { useState } from "react";
import { FaCheck, FaMinus } from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { AiOutlineLoading, AiFillStar } from "react-icons/ai";
import { motion } from "framer-motion";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

interface PriceTableProps {
  onSelectPlan: (plan: string, discountPlan: string) => void;
  userData: any;
  loadingPlan: any;
  selectedPlan: string;
  setIsDialogOpen: (isOpen: boolean) => void;
}

interface PricingPlan {
  monthly: number;
  yearly: number;
}

const PRICING = {
  plus: {
    monthly: 14.99,
    yearly: 9.99,
  },
  pro: {
    monthly: 34.99,
    yearly: 19.99,
  },
} as const;

const SubscriptionPriceTable: React.FC<PriceTableProps> = ({
  onSelectPlan,
  userData,
  loadingPlan,
  selectedPlan,
  setIsDialogOpen,
}) => {
  const [isYearly, setIsYearly] = useState(false);

  const features = [
    {
      name: "Search across 250+ million papers",
      free: true,
      plus: true,
      pro: true,
    },
    {
      name: "AI Chat with Paper",
      free: true,
      plus: true,
      pro: true,
    },
    {
      name: "Summarize Paper",
      free: true,
      plus: true,
      pro: true,
    },
    {
      name: "Team Collaboration",
      free: true,
      plus: true,
      pro: true,
    },
    {
      name: "Topic Explorer",
      free: true,
      plus: true,
      pro: true,
    },
    {
      name: "Reference Management",
      free: true,
      plus: true,
      pro: true,
    },
    {
      name: "Import from Zotero / Mendeley",
      free: true,
      plus: true,
      pro: true,
    },
    {
      name: "Export Options",
      free: "RIS, CSV, BIB",
      plus: "RIS, CSV, BIB",
      pro: "RIS, CSV, BIB",
    },
    {
      name: "AI Model Access",
      free: "Latest AI Models (GPT, Claude, Llama, Perplexity)",
      plus: "Latest AI Models (GPT, Claude, Llama, Perplexity)",
      pro: "Latest AI Models (GPT, Claude, Llama, Perplexity)",
    },
    {
      name: "Notes and Bookmarks",
      free: "50 Notes, 50 Bookmarks",
      plus: "50 Notes, 50 Bookmarks",
      pro: "Unlimited Notes, Unlimited Bookmarks",
    },
    {
      name: "Storage",
      free: "15GB",
      plus: "15GB",
      pro: "70GB",
    },
    {
      name: "AI Credits",
      free: "6,000/month",
      plus: "6,000/month",
      pro: "25,000/month",
    },
    {
      name: "Workspaces",
      free: "2",
      plus: "2",
      pro: "5",
    },
    {
      name: "Projects",
      free: "6",
      plus: "6",
      pro: "12",
    },
    {
      name: "Custom Templates",
      free: "5",
      plus: "5",
      pro: "15",
    },
    {
      name: "Priority Support",
      free: false,
      plus: false,
      pro: true,
    },
  ];
  const getPrice = (plan: keyof typeof PRICING) => {
    return isYearly ? PRICING[plan].yearly : PRICING[plan].monthly;
  };

  const getPlanType = (basePlan: string) => {
    if (isYearly === true) {
      return basePlan === "pro-plan-stripe"
        ? "pro-plan-discount"
        : "plus-plan-discount";
    } else {
      return basePlan === "pro-plan-stripe"
        ? "pro-plan-stripe"
        : "plus-plan-stripe";
    }
  };
  const handleCancelSubscription = (plan: any, plans: any) => {
    onSelectPlan(plan, plans);
    plan === "cancel" && setIsDialogOpen(true);
  };
 
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <table className="w-full min-w-[768px] border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="h-[200px] p-4 font-medium text-gray-500 dark:text-gray-300 text-center items-center">
                <div className="mb-4 text-sm">
                  Choose Your
                  <span className="text-blue-500 font-semibold text-sm ml-1">
                    Payment Plans
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-600 p-2 rounded-full w-fit mx-auto shadow-md">
                  <motion.button
                    className={`px-3 py-2 text-xs rounded-full font-semibold transition-all ${
                      !isYearly
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                    onClick={() => setIsYearly(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Monthly
                  </motion.button>
                  <motion.button
                    className={`px-3 py-2 text-xs rounded-full font-semibold transition-all ${
                      isYearly
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                    onClick={() => setIsYearly(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Yearly
                  </motion.button>
                </div>
                {userData?.subscription?.billingCycleEndDate && (
                  <div className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                    <BiCalendar className="mb-4 h-4 w-4" />
                    <span className="text-xs">
                      {" "}
                      Your plan expires on: <br />{" "}
                      {new Date(
                        userData.subscription.billingCycleEndDate
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </th>
              <th className=" h-[200px]  p-0 text-center align-top">
                <motion.div
                  whileHover={
                    userData?.subscription?.has_used_free_plan
                      ? undefined
                      : { scale: 1.05 }
                  }
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`p-5 border-t-4 border-orange-500 relative ${
                    userData?.subscription?.subscription_plan === "free"
                      ? "bg-orange-100 dark:bg-orange-900/30 scale-[1.05] shadow-xl transform -translate-y-1"
                      : userData?.subscription?.has_used_free_plan
                      ? "bg-orange-50 dark:bg-orange-900/20 cursor-not-allowed"
                      : "bg-orange-50 dark:bg-orange-900/20 hover:shadow-lg"
                  } min-w-[200px] h-full flex flex-col justify-between transition-all duration-200`}
                >
                  {userData?.subscription?.subscription_plan === "free" && (
                    // <AiFillStar className="absolute top-2 right-2 text-yellow-400 text-xl" />
                    <p className="absolute top-0 mt-1.5 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-600 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap shadow-sm">
                      Your Active Plan
                    </p>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-orange-900 mt-2 dark:text-orange-100">
                      Free
                    </h3>
                    <div className="mt-2 text-3xl font-bold text-orange-900 dark:text-orange-100">
                      $0<span className="text-lg font-normal">/mo</span>
                    </div>
                    <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                      14 Days Free Trial
                    </p>
                  </div>
                  <div className="mt-4 pt-2 pb-1">
                    {userData?.subscription?.has_used_free_plan &&
                      userData?.subscription?.subscription_plan !== "free" && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center cursor-not-allowed">
                          Free trial already used
                        </div>
                      )}
                  </div>
                </motion.div>
              </th>
                <th className=" h-[200px]  p-0 text-center align-top">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`p-6 border-t-4 border-blue-500 relative ${
                  userData?.subscription?.subscription_plan ===
                  "plus-plan-stripe"
                    ? "bg-blue-100 dark:bg-blue-900/30 scale-[1.05] shadow-xl transform -translate-y-1"
                    : "bg-blue-50 dark:bg-blue-900/20 hover:shadow-lg"
                  } h-full flex flex-col justify-between`}
                >
                  {(userData?.subscription?.subscription_plan ===
                  "plus-plan-stripe" ||
                  userData?.subscription?.subscription_plan ===
                    "plus-plan-discount") && (
                  <p className="absolute top-0 mt-1.5 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-600 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap shadow-sm">
                    Your Active Plan
                  </p>
                  )}
                  <div>
                  <h3 className="text-xl font-semibold text-darkGray mt-2">
                    Plus
                  </h3>
                  <div className="mt-2 text-3xl font-bold text-darkGray">
                    ${getPrice("plus")}
                    <span className="text-lg font-normal">/mo</span>
                  </div>
                  <p className="mt-1 text-sm text-darkGray">
                    Billed {isYearly ? "yearly" : "monthly"}
                  </p>
                  </div>
                  <div className="mt-4 pt-2 pb-1">
                  {userData?.subscription?.subscription_plan ===
                  "plus-plan-stripe" || userData?.subscription?.subscription_plan ===
                  "plus-plan-discount"? (
                    <Button
                    onClick={() =>
                      handleCancelSubscription("cancel", "cancel")
                    }
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    >
                    Cancel Subscription
                    </Button>
                  ) : (
                    <Button
                    onClick={() =>
                      handleCancelSubscription(
                      "plus-plan-stripe",
                      getPlanType("plus-plan-stripe")
                      )
                    }
                    className={`w-full bg-blue-500 hover:bg-blue-600 text-white ${
                      (loadingPlan === "plus-plan-stripe" ||
                      userData?.subscription?.subscription_plan ===
                      "pro-plan-stripe" ||
                      userData?.subscription?.subscription_plan ===
                      "pro-plan-discount")
                      ? "cursor-not-allowed"
                      : ""
                    }`}
                    disabled={
                      loadingPlan === "plus-plan-stripe" ||
                      userData?.subscription?.subscription_plan ===
                      "pro-plan-stripe" ||
                      userData?.subscription?.subscription_plan ===
                      "pro-plan-discount"
                    }
                    >
                    {loadingPlan === "plus-plan-stripe" ? (
                      <AiOutlineLoading className="animate-spin" />
                    ) : (
                      "Buy Now"
                    )}
                    </Button>
                  )}
                  </div>
                </motion.div>
                </th>
              <th className=" h-[200px] p-0 text-center align-top">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`p-6 border-t-4 border-green-500 relative ${
                    userData?.subscription?.subscription_plan ===
                    "pro-plan-stripe"
                      ? "bg-green-100 dark:bg-green-900/30 scale-[1.05] shadow-xl transform -translate-y-1"
                      : "bg-green-50 dark:bg-green-900/20 hover:shadow-lg"
                  } h-full flex flex-col justify-between`}
                >
                  {(userData?.subscription?.subscription_plan ===
                    "pro-plan-stripe" ||
                    userData?.subscription?.subscription_plan ===
                      "pro-plan-discount") && (
                    // <AiFillStar className="absolute top-2 right-2 text-yellow-400 text-xl" />
                    <p className="absolute top-0 mt-1.5 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-600 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap shadow-sm">
                      Your Active Plan
                    </p>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-darkGray mt-2">
                      Professional
                    </h3>
                    <div className="mt-2 text-3xl font-bold text-darkGray">
                      ${getPrice("pro")}
                      <span className="text-lg font-normal">/mo</span>
                    </div>
                    <p className="mt-1 text-sm text-darkGray">
                      Billed {isYearly ? "yearly" : "monthly"}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 pb-1">
                    {userData?.subscription?.subscription_plan ===
                    "pro-plan-stripe" || userData?.subscription?.subscription_plan ==='pro-plan-discount'? (
                      <Button
                        onClick={() =>
                          handleCancelSubscription("cancel", "cancel")
                        }
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                      >
                        Cancel Subscription
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          handleCancelSubscription(
                            "pro-plan-stripe",
                            getPlanType("pro-plan-stripe")
                          )
                        }
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        disabled={loadingPlan === "pro-plan-stripe"}
                      >
                        {loadingPlan === "pro-plan-stripe" ? (
                          <AiOutlineLoading className="animate-spin" />
                        ) : (
                          "Buy Now"
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <motion.tr
                key={index}
                className="border-b border-borderColor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="p-4 text-darkGray">{feature.name}</td>
                <td className="p-4 text-center text-darkGray">
                  {typeof feature.free === "boolean" ? (
                    feature.free ? (
                      <IoMdCheckmarkCircleOutline className="mx-auto h-6 w-6 text-green-500" />
                    ) : (
                      <FaMinus className="mx-auto text-gray-400" />
                    )
                  ) : (
                    feature.free
                  )}
                </td>
                <td className="p-4 text-center text-darkGray">
                  {typeof feature.plus === "boolean" ? (
                    feature.plus ? (
                      <IoMdCheckmarkCircleOutline className="mx-auto h-6 w-6 text-green-500" />
                    ) : (
                      <FaMinus className="mx-auto text-gray-400" />
                    )
                  ) : (
                    feature.plus
                  )}
                </td>
                <td className="p-4 text-center text-darkGray">
                  {typeof feature.pro === "boolean" ? (
                    feature.pro ? (
                      <IoMdCheckmarkCircleOutline className="mx-auto h-6 w-6 text-green-500" />
                    ) : (
                      <FaMinus className="mx-auto text-gray-400" />
                    )
                  ) : (
                    feature.pro
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionPriceTable;
