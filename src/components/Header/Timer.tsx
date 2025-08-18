import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { shallowEqual, useSelector } from "react-redux";
import Link from "next/link";
import { HiOutlineLightBulb, HiSparkles } from "react-icons/hi";

const Timer = () => {
  const router = useRouter();
  const [timer, setTimer] = useState("");
  const [closeBar, setCloseBar] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const storedEndDate = useSelector(
    (state: any) => state.user?.user?.user?.subscription?.billingCycleEndDate
  );

  const userData = useSelector(
    (state: any) => state?.user?.user?.user,
    shallowEqual
  );
  const currentPlan = useSelector(
    (state: any) => state.user?.user?.user?.subscription?.subscription_plan
  );

  const endDate = useSelector(
    (state: any) => state.user?.user?.user?.subscription?.billingCycleEndDate
  );

  const startDate = useSelector(
    (state: any) => state.user?.user?.user?.subscription?.billingCycleStartDate
  );

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = end.getTime() - start.getTime();

  useEffect(() => {
    const endDate = storedEndDate
      ? new Date(storedEndDate)
      : new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000);

    // Check if less than or equal to 10 days remaining
    const now = new Date();
    const daysRemaining = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    setShowTimer(daysRemaining <= 10);

    localStorage.setItem("timerEndDate", endDate.toString());
    sessionStorage.setItem("timerEndDate", endDate.toString());

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      let timeLeft = "";

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        timeLeft = `${days} ${hours}:${minutes}:${seconds}`;
      } else {
        timeLeft = "0 0:0:0";
      }

      return timeLeft;
    };

    const updateTimer = () => {
      setTimer(calculateTimeLeft());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [router, storedEndDate]);

  const accountType = useSelector(
    (state: any) => state.user?.user?.user?.account_type
  );

  const [timerShow, setTimerShow] = useState<boolean>(false);

  useEffect(() => {
    if (accountType === "owner") {
      setTimerShow(true);
    }
  }, [accountType]);

  const [days, hours, minutes, seconds] = timer.split(/[\s:]+/);
  return (
    <>
      {closeBar && timerShow && showTimer && currentPlan !== "free" ? (
        <div className="hidden lg:flex bg-[#FFE9D0] dark:bg-[#FF98392E] py-1 ml-2 text-[#666666] dark:text-[#CCCCCC] text-center justify-between items-center px-1 mx-0 h-full">
          <p className="flex items-center w-full">
            {currentPlan === "free" && (
              <span className="hidden lg:block text-xs font-semibold uppercase whitespace-nowrap">
                Trial Expires in
              </span>
            )}

            <div className="flex items-center ml-2 gap-x-1 w-auto">
              <div className="text-center flex flex-col justify-center items-center p-2 bg-[#FF9839] rounded-lg h-10 w-auto">
                <div className="text-white flex justify-center items-center font-bold text-sm">
                  {(days || "00").toString().padStart(2, "0")}
                </div>
                <div className="text-white font-semibold text-[8px] uppercase">
                  Days
                </div>
              </div>

              <div className="text-center flex flex-col justify-center items-center p-2 bg-[#FF9839] rounded-lg h-10 w-auto">
                <div className="text-white flex justify-center items-center font-bold text-sm">
                  {(hours || "00").toString().padStart(2, "0")}
                </div>
                <div className="text-white font-semibold text-[8px] uppercase">
                  Hours
                </div>
              </div>

              <div className="text-center flex flex-col justify-center items-center p-2 bg-[#FF9839] rounded-lg h-10 w-auto">
                <div className="text-white flex justify-center items-center font-bold text-sm">
                  {(minutes || "00").toString().padStart(2, "0")}
                </div>
                <div className="text-white font-semibold text-[7px] uppercase">
                  Minutes
                </div>
              </div>

              <div className="text-center flex flex-col justify-center items-center p-2 bg-[#FF9839] rounded-lg h-10 w-auto">
                <div className="text-white flex justify-center items-center font-bold text-sm">
                  <span>{(seconds || "00").toString().padStart(2, "0")}</span>
                </div>
                <p className="text-white font-semibold text-[6px] uppercase">
                  Seconds
                </p>
              </div>
            </div>
          </p>
        </div>
      ) : currentPlan === "free" ? (
        <div className="hidden lg:flex bg-[#FFE9D0] dark:bg-[#FF98392E] py-1 ml-2 text-[#666666] dark:text-[#CCCCCC] text-center justify-between items-center px-1 mx-0 h-full">
          <p className="flex items-center w-full">
            {currentPlan === "free" && (
              <span className="hidden lg:block text-xs font-semibold uppercase whitespace-nowrap">
                Trial Expires in
              </span>
            )}

            <div className="flex items-center ml-2 gap-x-1 w-auto">
              <div className="text-center flex flex-col justify-center items-center p-2 bg-[#FF9839] rounded-lg h-10 w-auto">
                <div className="text-white flex justify-center items-center font-bold text-sm">
                  {(days || "00").toString().padStart(2, "0")}
                </div>
                <div className="text-white font-semibold text-[8px] uppercase">
                  Days
                </div>
              </div>

              <div className="text-center flex flex-col justify-center items-center p-2 bg-[#FF9839] rounded-lg h-10 w-auto">
                <div className="text-white flex justify-center items-center font-bold text-sm">
                  {(hours || "00").toString().padStart(2, "0")}
                </div>
                <div className="text-white font-semibold text-[8px] uppercase">
                  Hours
                </div>
              </div>

              <div className="text-center flex flex-col justify-center items-center p-2 bg-[#FF9839] rounded-lg h-10 w-auto">
                <div className="text-white flex justify-center items-center font-bold text-sm">
                  {(minutes || "00").toString().padStart(2, "0")}
                </div>
                <div className="text-white font-semibold text-[7px] uppercase">
                  Minutes
                </div>
              </div>

              <div className="text-center flex flex-col justify-center items-center p-2 bg-[#FF9839] rounded-lg h-10 w-auto">
                <div className="text-white flex justify-center items-center font-bold text-sm">
                  <span>{(seconds || "00").toString().padStart(2, "0")}</span>
                </div>
                <p className="text-white font-semibold text-[6px] uppercase">
                  Seconds
                </p>
              </div>
            </div>
          </p>
          <Link href="/account/subscriptions" className="ms-2">
            <button className="border-2 border-blue-400 flex items-center justify-center gap-x-2 bg-blue-600 text-white px-2 py-1 rounded-full w-full font-medium text-xs whitespace-nowrap">
              <UpDateIcon /> Upgrade now
            </button>
          </Link>
        </div>
      ) : null}

      {currentPlan !== "free" && (
        <div className="flex items-center">
          <div className="flex items-center gap-2 ml-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Active Plan:
              <span className="ml-1 text-indigo-600 dark:text-indigo-400">
                {currentPlan &&
                  `${currentPlan?.split("-")[0].toUpperCase()}`}
              </span>
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default Timer;

export const UpDateIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_1755_172)">
      <path
        d="M17.961 0.0315C17.6513 0.0105 17.3482 0 17.0505 0C10.6005 0 6.92775 4.91775 5.592 8.87475L9.13725 12.42C13.2083 10.962 18 7.425 18 1.044C18 0.714 17.9872 0.3765 17.961 0.0315ZM9.50325 10.665L7.341 8.50275C8.25675 6.3585 10.8593 1.794 16.4902 1.51275C16.302 5.844 13.4595 8.96175 9.50325 10.665ZM13.6065 11.8185C13.1962 12.0983 12.789 12.351 12.3855 12.5767C12.2452 13.245 11.889 13.9583 11.3722 14.5658C11.3708 14.1337 11.2508 13.6988 11.04 13.2623C10.6687 13.431 10.3155 13.5758 9.9795 13.7032C10.4745 14.985 9.9705 15.9315 9.29325 16.8187C10.2653 16.7452 11.2852 16.2698 12.0892 15.465C12.9555 14.5988 13.5645 13.3478 13.6065 11.8185ZM4.7415 6.96675C4.30725 6.75675 3.873 6.63825 3.4425 6.636C4.04475 6.12525 4.7505 5.77125 5.412 5.62725C5.6475 5.21325 5.91225 4.8045 6.19125 4.4025C4.662 4.44375 3.41025 5.05275 2.54325 5.91975C1.74 6.723 1.26375 7.7445 1.19025 8.71575C2.07825 8.03775 3.02475 7.53375 4.3065 8.03025C4.43625 7.677 4.581 7.32225 4.7415 6.96675ZM10.545 7.464C10.2517 7.17075 10.2517 6.69675 10.545 6.4035C10.8383 6.11025 11.3123 6.11025 11.6055 6.4035C11.8988 6.6975 11.8988 7.1715 11.6055 7.46475C11.3123 7.758 10.8375 7.75725 10.545 7.464ZM14.2568 3.75075C13.6718 3.16575 12.7215 3.16575 12.1357 3.75075C11.55 4.3365 11.55 5.2875 12.1357 5.8725C12.7215 6.45825 13.6718 6.45825 14.2575 5.8725C14.8425 5.2875 14.8425 4.33725 14.2568 3.75075ZM12.8258 5.184C12.621 4.97925 12.621 4.6455 12.8258 4.4415C13.029 4.23675 13.3635 4.23675 13.5682 4.4415C13.7723 4.6455 13.7715 4.97925 13.5682 5.184C13.3628 5.388 13.0297 5.388 12.8258 5.184ZM7.7655 13.1715C6.6465 16.029 3.41325 17.8275 0 18C0.16425 14.7832 1.99275 11.493 4.98 10.3853L5.58375 10.9897C2.3355 13.056 2.094 14.9993 2.085 15.921C3.036 15.9098 5.1255 15.663 7.1685 12.573L7.7655 13.1715Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_1755_172">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
