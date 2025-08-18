"use client";
import Image from "next/image";
import { X, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { Button, Loader, Text } from "rizzui";
import { useDispatch, useSelector } from "react-redux";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { updateUserPlan } from "@/reducer/auth/authSlice";
import { updateSubscription } from "@/reducer/services/subscriptionApi";
import { getUserReferral, redeemAwards } from "@/apis/user";
import toast from "react-hot-toast";
import { redeemAiCredits } from "@/apis/subscription";

const ReferralStats = () => {
  const { socket } = useSocket();
  const [isCopied, setIsCopied] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [earnAwardLoading, setEarnAwardLoading] = useState<boolean>(false);
  const userData = useSelector((state: any) => state?.user?.user?.user);
  const [referralUrl, setReferralUrl] = useState(userData?.reffral_link);
  const [reffralData, setReffralData] = useState<any>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [userReferralData, setUserReferralData] = useState<any>([]);

  const { subscriptionData } = useSelector(
    (state: any) => state.subscription ?? {}
  );

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [claimedStates, setClaimedStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [claimAllLoading, setClaimAllLoading] = useState(false);

  const dispatch = useDispatch();

  const toggleCustomModal = () => {
    setIsCustomModalOpen(!isCustomModalOpen);
  };

  const toggleRewardModal = async () => {
    if (!isRewardModalOpen) {
      setReffralData(userReferralData);
    }
    setIsRewardModalOpen(!isRewardModalOpen);
  };

  const handleEarnedRefferalReward = async () => {
    setIsLoading(true);

    try {
      const response: any = await redeemAwards("refferalReward");

      if (response) {
        dispatch(
          updateUserPlan({
            ...response?.data?.data,
            subscription: response?.data?.subscription,
          })
        );

        dispatch(updateSubscription(response?.data?.subscription));

        toast.success("Your plan has been successfully extended.");
        setIsCustomModalOpen(!isCustomModalOpen);
      }
    } catch (error) {
      console.error("Error redeeming award:", error);
      setIsCustomModalOpen(!isCustomModalOpen);
      toast.error("An error occurred while redeeming the award.");
    } finally {
      setIsLoading(false);
    }
  };
  const getUserReferralData = async () => {
    try {
      const response: any = await getUserReferral();
      setUserReferralData(response?.data?.data || []);

      if (response?.data) {
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    }
  };
  useEffect(() => {
    getUserReferralData();
  }, []);
  const reedemAiCreditsAward = async (referred_user_id: any) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [referred_user_id]: true }));

      let response = await redeemAiCredits(referred_user_id);
      const updateDiscriptionData = {
        ...userData,
        subscription: response?.data?.subscription,
      };
      dispatch(updateSubscription(updateDiscriptionData));
      dispatch(updateSubscription(response?.data?.subscription));

      if (response) {
        getUserReferralData();
        setLoadingStates((prev) => ({ ...prev, [referred_user_id]: false }));
        setClaimedStates((prev: any) => ({
          ...prev,
          [referred_user_id]: true,
        }));
        setIsRewardModalOpen(false);
        toast.success(
          response?.data?.message || "AI Credits redeemed successfully!"
        );
      }
    } catch (error) {
      setEarnAwardLoading(false);
      setLoadingStates((prev) => ({ ...prev, [referred_user_id]: false }));

      console.log(error, "some thing wrong");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    socket &&
      socket.on("updateLoyalityPoint", (data: any) => {
        let updatedData: any;
        if (data.loyality_point && data.referral_count) {
          updatedData = {
            ...userData,
            loyality_point: data.loyality_point && data.loyality_point,
            referral_count: data.referral_count && data.referral_count,
          };
          dispatch(updateUserPlan(updatedData));
        } else if (data.loyality_point) {
          updatedData = {
            ...userData,
            loyality_point: data.loyality_point && data.loyality_point,
          };
          dispatch(updateUserPlan(updatedData));
        } else if (data.referral_count) {
          updatedData = {
            ...userData,
            referral_count: data.referral_count && data.referral_count,
          };
          dispatch(updateUserPlan(updatedData));
        }
      });
  }, [socket]);

  return (
    <div>
      <div className="dark:bg-dropDown bg-[#F1F1F1] w-full h-[150px] flex flex-col gap-2 items-center justify-center">
        <p className="font-size-xlarge  font-medium text-lightGray">
          Referral Stats
        </p>
        <p className="font-size-medium font-normal text-darkGray">
          Discover the referral and their stats
        </p>
      </div>
      <div className="w-full max-w-[96%] mx-auto flex flex-col m-4 gap-3">
        <div className="w-full flex flex-wrap lg:flex-row gap-3 ">
          <div className="w-full lg:flex-1 flex flex-col h-auto md:h-[190px] border border-borderColor rounded-tl-xl rounded-br-lg px-2 py-3">
            <div className="w-full flex items-center justify-between mb-2 md;mb-0">
              <p className="font-size-md font-semibold text-darkGray">
                Referral Stats
              </p>
            </div>
            <div className="w-full flex h-full items-center justify-center gap-3">
              <div className="w-[248px] h-[100px] cards_bg bg-[#F59B1436]  rounded-md flex items-center pl-6 ">
                <div className="w-10 h-10 mr-4 flex items-center OrangeBoxShadow justify-center bg-orange rounded-full">
                  <Image
                    src={
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//totalReferalIcon.svg`
                    }
                    alt="Referral icon"
                    width={24}
                    height={24}
                    loading="lazy"
                    quality={75}
                    priority={false}
                  />
                </div>
                <div>
                  <p className="font-size-md font-semibold text-secondaryDark">
                    Total Referrals
                  </p>
                  <p className="font-size-2xlarge font-medium text-primaryDark mt-2">
                    {userData?.referral_count || 0}
                  </p>
                </div>
              </div>
              <div className="w-[248px] cards_bg h-[100px] bg-[#079E2836] rounded-md flex items-center pl-6">
                <div className="w-10 h-10 mr-4 blueBoxShadow flex items-center justify-center bg-primaryGreen rounded-full">
                  <Image
                    src={
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//loyalityPointIcon.svg`
                    }
                    alt="Loyalty points icon"
                    width={24}
                    height={24}
                    loading="lazy"
                    quality={75}
                    priority={false}
                  />
                </div>
                <div>
                  <p className="font-size-md font-semibold text-secondaryDark">
                    {" "}
                    Referral Award Earned{" "}
                  </p>
                  <p className="font-size-2xlarge font-medium text-primaryDark mt-2">
                    {subscriptionData?.data?.refferal_credits || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className=" flex-1 h-auto md:h-[190px] flex flex-col ">
            <div className=" h-full my-auto border border-borderColor p-4">
              <div>
                <p className="font-size-md font-semibold text-darkGray">
                  Your Referral Link
                </p>
              </div>
              <div className="dark:bg-dropDown w-full flex items-center justify-between pr-2 my-2 rounded-full border border-gray-200 dark:border dark:border-gray-700 relative">
                <Input
                  type="text"
                  placeholder={referralUrl}
                  className="font-size-normal font-normal bg-transparent text-darkGray my-1 mx-1 rounded-full border-transparent"
                  disabled
                />
                
                <Button
                  className="btn rounded-full px-4 text-white font-size-normal font-normal"
                  onClick={() => handleCopy(referralUrl)}
                >
                  {isCopied ? (
                    <CheckCircle className="text-green-500" />
                  ) : (
                    "Copy"
                  )}
                </Button>
                {isCopied && (
                  <div className="absolute top-[-30px] right-0 bg-black text-white text-xs rounded py-1 px-2">
                    Copied!
                  </div>
                )}

              </div>
              <Text className="my-2 font-size-medium font-normal text-darkGray">
                  Earn 200 bonus AI credits each when your friend signs up using your invite link.
                </Text>
              <div className="flex items-center gap-x-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    referralUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-borderColor rounded-md cursor-pointer w-10 h-10 flex items-center justify-center p-2 dark:bg-dropDown"
                >
                  <FaFacebookF className="text-blue-600 w-5 h-5" />
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${referralUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-borderColor rounded-md cursor-pointer w-10 h-10 flex items-center justify-center p-2 dark:bg-dropDown"
                >
                  <FaWhatsapp className="text-green-500 w-10 h-10" />
                </a>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=&su=&body=${referralUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-borderColor rounded-md cursor-pointer w-10 h-10 flex items-center justify-center p-2 dark:bg-dropDown"
                >
                  <SiGmail className="text-red-500 w-10 h-10" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-full flex flex-col sm:flex-row gap-3">
          <div className="w-full flex flex-col h-auto md:h-[184px] border border-borderColor rounded-tl-xl rounded-br-lg p-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0E70FFC7]">
              <Image
                src={
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//creditAwardIcon.svg`
                }
                alt="Credit award icon"
                width={24}
                height={24}
                loading="lazy"
                quality={75}
                priority={false}
              />
            </div>
            <div className="w-full flex  flex-col my-2  ">
              <p className="font-size-medium font-medium text-lightGray">
                {userReferralData?.length
                  ? `${userReferralData.length * 2000} AI Credits Bonus`
                  : "2000 AI Credits Bonus"}
              </p>
              <p className="font-size-medium font-normal text-darkGray mt-2">
                {userReferralData?.length > 0
                  ? userReferralData.length === 1
                    ? "You have earned 2,000 AI credits as your referral has completed their first subscription purchase."
                    : `You have earned ${
                        userReferralData.length * 2000
                      } AI credits as ${
                        userReferralData.length
                      } of your referrals have completed their first subscription purchase.`
                  : "Earn 2,000 AI credits for each referral who completes their first subscription purchase."}
              </p>
            </div>

            <div>
              <Button
                className={`btn rounded-full py-1 px-4 font-size-normal font-normal text-white whitespace-nowrap`}
                onClick={toggleRewardModal}
              >
                {aiLoading ? (
                  <Loader variant="threeDot" className="w-6 h-6 text-white" />
                ) : (
                  "Claim Reward"
                )}
              </Button>
              {isRewardModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div
                    className="absolute inset-0 bg-black opacity-70"
                    onClick={toggleRewardModal}
                  ></div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg z-10 w-auto relative max-h-[80vh] flex flex-col">
                    <h2 className="text-2xl font-bold mb-2 text-center text-black dark:text-white">
                      {userReferralData?.length
                        ? `${userReferralData.length * 2000} AI Credits Bonus`
                        : "2000 AI Credits Bonus"}
                    </h2>
                    {userReferralData?.length > 0 && (
                      <p className="text-lg text-center mb-4 text-black dark:text-white">
                        Claim Your Reward 🎉
                      </p>
                    )}
                    <div
                      className={`overflow-y-auto min-w-[350px] pr-2 ${
                        userReferralData.length >= 3 ? "max-h-[45vh]" : ""
                      }`}
                    >
                      {userReferralData?.length > 0 ? (
                        userReferralData.map((item: any, index: any) => (
                          <div
                            key={item?.id || index}
                            className="flex justify-between border p-2 rounded-lg border-gray-500 mb-4 dark:border-gray-600 items-center"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-black dark:text-white font-semibold">
                                {item.first_name} {item.last_name}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-white">
                                {item.email}
                              </span>
                              <span className="text-sm text-blue-700 dark:text-blue-300">
                                Eligible for 2,000 AI credits
                              </span>
                            </div>
                            <Button
                              className="btn rounded-full py-1 px-4 text-white bg-blue-600 hover:bg-blue-700 mt-2 ml-3 flex items-center justify-center min-w-[80px]"
                              disabled={
                                loadingStates[item?.id] || claimAllLoading
                              }
                              onClick={async () => {
                                // Set loading state for this item
                                setLoadingStates((prev: any) => ({
                                  ...prev,
                                  [item?.id]: true,
                                }));
                                await reedemAiCreditsAward([item?.id]);
                                // No need to set claimedStates, item will be removed from array after API call
                              }}
                            >
                              {loadingStates[item?.id] || claimAllLoading ? (
                                <Loader
                                  variant="threeDot"
                                  className="w-6 h-6 text-white"
                                />
                              ) : (
                                "Claim"
                              )}
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <p className="text-center text-gray-500 dark:text-gray-400">
                            None of your referrals have made their first
                            purchase yet.
                          </p>
                          <Button
                            className="btn rounded-full py-1 px-4 text-white bg-blue-600 hover:bg-blue-700 mt-2 ml-3"
                            onClick={() => setIsRewardModalOpen(false)}
                          >
                            CLOSE
                          </Button>
                        </div>
                      )}
                    </div>
                    {userReferralData?.length > 1 && (
                      <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 pt-4 pb-2 flex justify-end z-20 mt-2">
                        <Button
                          className="btn rounded-full py-1 px-6 text-white bg-green-600 hover:bg-green-700 font-semibold shadow-lg"
                          disabled={
                            userReferralData.every(
                              (item: any) =>
                                loadingStates[item.id] || claimAllLoading
                            ) || claimAllLoading
                          }
                          onClick={async () => {
                            setClaimAllLoading(true);
                            // Set all loading states to true for visible items
                            const allIds: string[] = [];
                            const loadingObj: any = {};
                            for (const item of userReferralData) {
                              if (!loadingStates[item.id]) {
                                loadingObj[item.id] = true;
                                allIds.push(item.id);
                              }
                            }
                            setLoadingStates((prev: any) => ({
                              ...prev,
                              ...loadingObj,
                            }));
                            await reedemAiCreditsAward(allIds);
                            setClaimAllLoading(false);
                          }}
                        >
                          {claimAllLoading ? (
                            <Loader
                              variant="threeDot"
                              className="w-6 h-6 text-white"
                            />
                          ) : (
                            "Claim All"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col h-auto md:h-[184px] border border-borderColor rounded-tl-xl rounded-br-lg p-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0E70FFC7]">
              <Image
                src={
                  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//creditAwardIcon.svg`
                }
                alt="Credit award icon"
                width={24}
                height={24}
                loading="lazy"
                quality={75}
                priority={false}
              />
            </div>
            <div className="w-full flex  flex-col my-2">
              <p className="font-size-medium font-medium text-lightGray">
                {" "}
                Referral Rewards
              </p>
              <p className="font-size-medium  font-normal text-darkGray mt-2">
                {" "}
                {userData?.subscription?.subscription_plan === "free"
                  ? userData?.referral_count >= 5
                    ? "Congratulations! You can now claim your 1-month subscription for referring 5 friends."
                    : "Refer 5 friends and unlock a 1-month subscription plan as a reward."
                  : userData?.referral_count >= 5
                  ? "You’ve earned 5,000 AI Credits! Enjoy your reward and keep referring to earn more."
                  : "Refer 5 friends and get 5,000 AI Credits as a reward!"}
              </p>
            </div>
            <div>
              <Button
                className="btn rounded-full py-1 px-4  font-size-normal font-normal text-white whitespace-nowrap"
                onClick={toggleCustomModal}
              >
                View Details
              </Button>
              {isCustomModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div
                    className="absolute inset-0 bg-black opacity-70"
                    onClick={toggleCustomModal}
                  ></div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg z-10">
                    <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
                      Referral Rewards Details
                    </h2>
                    <p className="mb-4 text-black dark:text-white">
                      {userData?.subscription?.subscription_plan === "free"
                        ? userData?.referral_count >= 5
                          ? "Congratulations! You can now claim your 1-month subscription for referring 5 friends."
                          : "Refer 5 friends and unlock a 1-month subscription plan as a reward."
                        : userData?.referral_count >= 5
                        ? "You’ve earned 5,000 AI Credits! Enjoy your reward and keep referring to earn more."
                        : "Refer 5 friends and get 5,000 AI Credits as a reward!"}
                    </p>
                    {userData?.referral_count >= 5 ? (
                      <div className="flex flex-row justify-between items-center gap-2 mt-4">
                        <Button
                          className="btn rounded-full py-1 px-4 text-white bg-blue-600 hover:bg-blue-700"
                          onClick={toggleCustomModal}
                        >
                          Close
                        </Button>
                        <Button
                          className="btn rounded-full py-1 px-4 font-size-normal font-normal text-white"
                          onClick={handleEarnedRefferalReward}
                        >
                          {isLoading ? (
                            <Loader
                              variant="threeDot"
                              className="w-6 h-6 text-white"
                            />
                          ) : (
                            "Claim Reward"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-row justify-end mt-4">
                        <Button
                          className="btn rounded-full py-1 px-4 text-white bg-blue-600 hover:bg-blue-700"
                          onClick={toggleCustomModal}
                        >
                          Close
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralStats;
