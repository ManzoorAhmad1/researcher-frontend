import React, { useState, useEffect } from "react";
import { RiDatabaseLine } from "react-icons/ri";
import { CreditCard } from "lucide-react";
import { Text, Popover } from "rizzui";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import moment from "moment";

const SkeletonLoader = () => (
  <div className="animate-pulse p-4 bg-gray-200 dark:bg-gray-700 rounded-lg h-[225px] w-auto">
    <div className="h-6 w-1/3 bg-gray-400 rounded mb-4"></div>
    <div className="h-[59px] bg-gray-400 rounded-full mb-4"></div>
    <div className="h-4 w-2/3 bg-gray-400 rounded mb-4"></div>
    <div className="h-4 w-1/2 bg-gray-400 rounded"></div>
  </div>
);

const RemainingCredits = ({ userStorage }: any) => {
  const [loading, setLoading] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const userData = useSelector((state: any) => state?.user?.user?.user);
  const { subscriptionData } = useSelector(
    (state: RootState) => state?.subscription
  );

  useEffect(() => {
    const fetchData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
      setLoading(false);
    };
    fetchData();
  }, []);

  const storage = userStorage ||  0;
  
  const data = [
    {
      title: "REMAINING CREDITS",
      credits: 1244,
      refillDate: `Next Refill On ${moment(
        userData?.subscription?.billingCycleEndDate
      ).format("DD-MM-YYYY")}`,
      storage: `${
        Math.floor(storage ) >= 1024
          ? (Math.floor(storage) / 1024).toFixed(2) + ' GB'
          : Math.floor(storage) + ' MB'
      } used from ${
        userData?.subscription_plan === "free"
          ? "15"
          : userData?.subscription_plan === "pro-plan-stripe" ||
            userData?.subscription_plan === "pro-plan-discount"
          ? "70"
          : "15"
      } GB`,
    },
  ];




  return (
    <div className="p-4 bg-[linear-gradient(139.66deg,#F59B14_22.96%,#D6600C_126.62%)] h-auto w-auto rounded-lg">
      {loading ? (
        <SkeletonLoader />
      ) : (
        data.map((item, index) => (
          <React.Fragment key={index}>
            <Text className="py-4 text-white dark:text-white text-sm font-semibold">
              {item?.title}
            </Text>
            <Popover placement="bottom" isOpen={popoverOpen} setIsOpen={setPopoverOpen}>
              <Popover.Trigger>
                <div
                  className="flex justify-between w-full h-[59px] bg-[#FFFFFF21] items-center rounded-full text-white"
                  onMouseEnter={() => setPopoverOpen(true)}
                  onMouseLeave={() => setPopoverOpen(false)}
                >
                  <div className="flex items-center ml-10 gap-2">
                    <CreditCard className="h-[20px] w-[20px] dark:text-white" />
                    <div>
                      <Text className="font-semibold dark:text-white text-sm">
                        {Math.max(
                          0,
                          (subscriptionData?.data?.credit_limit ?? 0) + (subscriptionData?.data?.bonusCredits ?? 0)+(subscriptionData?.data?.refferal_credits ?? 0) + (subscriptionData?.data?.addOnCredits ?? 0) - (subscriptionData?.data?.credit ?? 0)
                        ) || 0}
                      </Text>
                      <Text className="font-normal dark:text-white text-xs">
                        {item?.refillDate}
                      </Text>
                    </div>
                  </div>
                  <Link href="/account/ai-credits">
                    <div className="w-[44px] h-[44px] bg-[#FFFFFF73] mr-1 p-6 rounded-full shadow-[#0000001F] flex justify-center items-center cursor-pointer">
                      <Text className="text-2xl">+</Text>
                    </div>
                  </Link>
                </div>
              </Popover.Trigger>
              <Popover.Content>
                <div className="space-y-2 text-sm popover-arrow-white">
                  <div className="flex justify-between gap-1">
                    <span>Subscription Credits:{' '}</span>
                    <span>{' '}{subscriptionData?.data?.credit_limit ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus Credits:{' '}</span>
                    <span>{subscriptionData?.data?.bonusCredits ?? 0}</span>
                  </div>
                   <div className="flex justify-between">
                    <span>Referral Credits:{' '}</span>
                    <span>{subscriptionData?.data?.refferal_credits ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Add-on Credits:{' '}</span>
                    <span>{subscriptionData?.data?.addOnCredits ?? 0}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Total Credits:{' '}</span>
                    <span>
                      {(subscriptionData?.data?.credit_limit ?? 0) +
                        (subscriptionData?.data?.addOnCredits ?? 0) +
                        (subscriptionData?.data?.refferal_credits ?? 0) +
                        (subscriptionData?.data?.bonusCredits ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used Credits:{' '}</span>
                    <span>{subscriptionData?.data?.credit ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining Credits:{' '}</span>
                    <span>
                      {Math.max(
                        0,
                        (subscriptionData?.data?.credit_limit ?? 0) +
                          (subscriptionData?.data?.bonusCredits ?? 0) +
                          (subscriptionData?.data?.refferal_credits ?? 0) +
                          (subscriptionData?.data?.addOnCredits ?? 0) -
                          (subscriptionData?.data?.credit ?? 0)
                      ) || 0} {" "}
                    </span>
                  </div>
                </div>
              </Popover.Content>
            </Popover>
            <div className="w-auto mx-8 mt-6 border border-[#FFFFFF21] rounded-lg"></div>
            <div className="relative p-2 rounded-full bg-[#FFFFFF21] mt-6">
              <div 
              className="bg-white absolute left-0 top-0 rounded-full p-2"
              style={{
                width: `${Math.min(
                ((Math.floor(userStorage) || 0) /
                  (userData?.subscription_plan === "free"
                  ? 15000
                  : userData?.subscription_plan === "pro-plan-stripe" ||
                    userData?.subscription_plan === "pro-plan-discount"
                  ? 70000
                  : 15000)) *
                100,
                100
                )}%`
              }}
              ></div>
            </div>
            <div className="flex justify-between mt-6 text-white">
              <div className="flex gap-2">
                <RiDatabaseLine className="h-[18px] w-[18px] text-[#FFFFFF]" />
                <Text className="font-semibold text-sm">Storage</Text>
              </div>
              <div>
                <Text className="font-semibold dark:text-white text-sm">
                  {item?.storage}
                </Text>
              </div>
            </div>
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default RemainingCredits;

