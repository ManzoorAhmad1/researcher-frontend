import React, { useState } from "react";
import { redeemAwards } from "@/apis/user";
import { Button, Loader, Text } from "rizzui";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { IoIosWarning } from "react-icons/io";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useDispatch } from "react-redux";
import { updateUserPlan } from "@/reducer/auth/authSlice";
interface ModalProps {
  activeDiv: number;
  setActiveDiv: React.Dispatch<React.SetStateAction<number>>;
  userData?: any;
  setModalIsOpen?: any;
  modalIsOpen?: any;
}

export const Modal: React.FC<ModalProps> = ({
  activeDiv,
  setActiveDiv,
  userData,
  setModalIsOpen,
  modalIsOpen,
}) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const dispatch = useDispatch();
  const handleRedeem = async () => {
    if (userData?.loyality_point < 1000) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <IoIosWarning className="text-yellow-500 text-md" />
              </div>
              <div className="ml-3 flex-1">
                <Text className="dark:text-gray-100">
                  You do not have enough loyalty points to claim this reward.
                </Text>
              </div>
            </div>
          </div>
        </div>
      ));

      return;
    }
    setIsRedeeming(true);
    const awardType = activeDiv === 1 ? "ai-credits" : "storage";

    try {
      const response: any = await redeemAwards(awardType);
      if (response) {
        dispatch(
          updateUserPlan({
            ...response?.data?.data,
            subscription: response?.data?.subscription,
          })
        );
        toast.success(`Successfully redeemed ${awardType}`);
        setModalIsOpen(false);
      }
    } catch (error) {
      console.error("Error redeeming award:", error);
      toast.error("An error occurred while redeeming the award.");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <>
      <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
        <DialogContent className="max-h-[500px] max-w-xl referralmodal referralbox1 shadow-lg dark:bg-gray-800">
          <div className="mt-4 gap-y-3 flex flex-col justify-center items-center">
            <div className="font-medium font-size-xlarge text-black dark:text-white">
              Convert Loyalty Points
            </div>
            <div className="font-medium font-size-medium text-black dark:text-gray-300">
              Available Points
            </div>
            <div className="font-semibold font-size-3xlarge text-blue-600 dark:text-blue-400">
              {userData?.loyality_point || 0}
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <div
              className={`flex cursor-pointer justify-around items-center py-6 rounded-md z-50 ${
                activeDiv === 1
                  ? "referralgrdient text-white"
                  : "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 referralgradient-border"
              }`}
              onClick={() => setActiveDiv(1)}
            >
              <div className="flex items-center justify-center">
                {activeDiv === 1 ? (
                  <OptimizedImage
                    src={
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//refercredit.svg`
                    }
                    alt="Referral credit icon"
                    width={56}
                    height={64}
                    className="h-16 w-14"
                    loading="lazy"
                    quality={75}
                    priority={false}
                  />
                ) : (
                  <OptimizedImage
                    width={56}
                    height={64}
                    src={
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//claim2.svg`
                    }
                    alt="Claim icon"
                    className="h-16 w-14"
                    loading="lazy"
                    quality={75}
                    priority={false}
                  />
                )}
              </div>
              <div className="flex flex-col space-y-2 justify-center items-center">
                <div className="font-medium font-size-bold1 dark:text-gray-100">
                  500 AI Credits for
                </div>
                <div className="font-medium font-size-bold1 dark:text-gray-100">
                  1000 points
                </div>
              </div>
            </div>

            <div
              className={`flex cursor-pointer justify-around items-center py-6 rounded-md z-50 ${
                activeDiv === 2
                  ? "referralgrdient text-white"
                  : "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 referralgradient-border"
              }`}
              onClick={() => setActiveDiv(2)}
            >
              <div className="flex items-center justify-center">
                {activeDiv === 2 ? (
                  <OptimizedImage
                    width={56}
                    height={64}
                    src={
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//claim1.svg`
                    }
                    alt="Claim icon"
                    className="h-16 w-14"
                    loading="lazy"
                    quality={75}
                    priority={false}
                  />
                ) : (
                  <OptimizedImage
                    width={56}
                    height={64}
                    src={
                      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//referchip.svg`
                    }
                    alt="Referral chip icon"
                    className="h-16 w-14"
                    loading="lazy"
                    quality={75}
                    priority={false}
                  />
                )}
              </div>
              <div className="flex flex-col space-y-2 justify-center items-center">
                <div className="font-medium font-size-bold1 dark:text-gray-100">
                  5 GBs of storage for
                </div>
                <div className="font-medium font-size-bold1 dark:text-gray-100">
                  1000 points
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <Button
              className="w-full z-50 btnbg font-size-normal btn text-white font-medium py-3 rounded-[26px]"
              onClick={handleRedeem}
              disabled={isRedeeming === true}
            >
              {isRedeeming ? (
                <div className="flex justify-center items-center">
                  <Loader variant="threeDot" className="w-6 h-6 text-white" />
                </div>
              ) : (
                "Redeem Points"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
