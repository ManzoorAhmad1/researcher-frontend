"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { ApexOptions } from "apexcharts";
import toast from "react-hot-toast";
import { AppDispatch, RootState } from "@/reducer/store";
import {
  fetchSubscription,
  updateSubscription,
} from "@/reducer/services/subscriptionApi";
import AICreditChart from "@/components/Account/AICreditChart";
import { axiosInstancePrivate } from "@/utils/request";
import { Loader } from "rizzui";
import AICreditsCard from "./components/AICreditsCard";
import { usePathname, useRouter } from "next/navigation";
import OfferCard from "./components/OfferCard";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import Table from "./components/Table";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { CreditHistory } from "./utils/types";

import "./ai-credits.css";

import dynamic from "next/dynamic";
import { fetchCreditHistory } from "@/apis/user";
import { getSubscription } from "@/apis/subscription";
import Messages from "@/constant/Messages";
import { updateUserPlan } from "@/reducer/auth/authSlice";
import { triggerConfetti } from "@/components/Account/Subcription";
import AICreditsPurchaseSuccess from "@/components/Account/AICreditsPurchaseSuccess";
import { Popover } from "rizzui";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const AiCredits = () => {
  const [chartData, setChartData] = useState<any>({
    series: [],
    options: {
      plotOptions: {
        pie: {
          customScale: 1,
          expandOnClick: true,
          donut: {
            size: "65%",
          },
          dataLabels: {
            minAngleToShowLabel: 1,
          },
        },
      },
      chart: {
        type: "donut",

        zoom: {
          enabled: true,
          type: "xy",
          pan: {
            enabled: true,
            type: "xy",
            modifierKey: "shift",
          },
        },
      },
      stroke: {
        show: false,
        width: -2,
      },
      labels: ["AI Search", "Summarization", "Chatting", "Analysis", "Other"],
      states: {
        hover: {
          filter: {
            type: "none",
          },
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: "none",
          },
        },
      },
      tooltip: {
        enabled: false,
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: "right",
        horizontalAlign: "center",
        fontSize: "12px",
        itemMargin: {
          horizontal: 0,
          vertical: 0,
        },
        markers: {
          width: 1,
          height: 1,
        },
        labels: {
          useSeriesColors: false,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });
  const [creditUsageLoader, setCreditUsageLoader] = useState(false);
  const [creditUsageMonthLoader, setCreditUsageMonthLoader] = useState(false);
  const [creditHistoryData, setCreditHistoryData] = useState<CreditHistory[]>();
  const [allMonths, setAllMonths] = useState<string[]>([]);
  const [newAllMonths, setNewAllMonths] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [creditsPurchased, setCreditsPUrchased] = useState<number>(0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [seriesData, setSeriesData] = useState<
    { name: string; data: number[] | [] }[]
  >([{ name: "series1", data: [] }]);
  const [isDarkMode, setDarkMode] = React.useState<boolean>(
    document.body.classList.contains("dark")
  );
  const [firstLoader, setFirstLoader] = React.useState(false);
  const [newSeriesData, setNewSeriesData] = React.useState<
    { name: string; data: number[] | [] }[]
  >([{ name: "series1", data: [] }]);
  const dispatch: AppDispatch = useDispatch();
  const { subscriptionData } = useSelector(
    (state: RootState) => state.subscription,
    shallowEqual
  );
  const userData = useSelector((state: RootState) => state.user, shallowEqual);
  const supabase: SupabaseClient = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.body.classList.contains("dark"));
    };
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const callPortalStripe = async () => {
      try {
        const currentQuery = new URLSearchParams(window.location.search);
        const isSuccess = currentQuery.get("success") === "true";
        if (isSuccess) {
          toast.success(Messages.CREDIT_PURCHASE_SUCCESS);
          const data = await getSubscription();
          if (data?.data?.updatedUser) {
            const user = data?.data?.updatedUser;
            localStorage.setItem("user", JSON.stringify(user));
            dispatch(updateUserPlan(data?.data?.updatedUser));
            dispatch(updateSubscription(data?.data?.updatedUser?.subscription));
            setCreditsPUrchased(
              data?.data?.updatedUser?.subscription?.addOnCredits || 0
            );
            setShowSuccessModal(true);
            router.push("/account/ai-credits");
            setTimeout(triggerConfetti, 300);
          }
        }
      } catch (error) {
        console.error("Error processing subscription:", error);
      }
    };

    callPortalStripe();
  }, []);

  const notifyAPI = useCallback(async (payload: any) => {
    try {
      getData();
    } catch (error) {
      console.error("Error notifying API:", error);
    }
  }, []);

  const getData = useCallback(async () => {
    setCreditUsageLoader(true);
    setCreditUsageMonthLoader(true);
    await dispatch(fetchSubscription({ id: userData?.user?.user?.id }));
    try {
      const response = await fetchCreditHistory();

      if (response.data.isSuccess === false) {
        console.error("Error updating questions:", response.data.message);
        toast.error("Failed to retrieve credit history.");
        return;
      }

      if (response.data.isSuccess) {
        setCreditHistoryData(response?.data?.data);
        const groupedData = response?.data?.data?.reduce(
          (acc: { [key: string]: number }, item: any) => {
            const { credit_type, credit_usage } = item;
            if (!acc[credit_type]) {
              acc[credit_type] = 0;
            }
            acc[credit_type] += credit_usage;
            return acc;
          },
          {}
        );

        const series = Object.values(groupedData);
        const labels = Object.keys(groupedData);
        setChartData((prevData: any) => ({
          ...prevData,
          series: series.length ? series : [1],
          options: {
            ...prevData.options,
            labels: labels.length ? labels : ["none"],
          },
        }));

        const getMonthFromDate = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toLocaleString("default", { month: "short" });
        };

        const monthlyUsage = response?.data?.data.reduce((acc:any, entry:any) => {
          const month = getMonthFromDate(entry.created_at);
          if (acc[month]) {
            acc[month] += entry.credit_usage;
          } else {
            acc[month] = entry.credit_usage;
          }
          return acc;
        }, {});

        const months = Object.keys(monthlyUsage).sort();
        const firstMonth = months[0];
        const firstMonthDate = new Date(firstMonth + " 1");
        firstMonthDate.setMonth(firstMonthDate.getMonth() - 1);

        const previousMonth = firstMonthDate.toLocaleString("default", {
          month: "short",
        });
        months.unshift(previousMonth);
        const seriesData = [
          0,
          ...months.map((month) => monthlyUsage[month] || 0),
        ];
        setSeriesData([{ name: "series1", data: seriesData }]);
        setAllMonths(months);
      }
    } catch (err) {
      console.error("An unexpected error occurred.");
      console.error("Unexpected error in `addQuestion`:", err);
    }
    setCreditUsageLoader(false);
    setCreditUsageMonthLoader(false);
  }, [userData?.user?.user?.id, dispatch]);

  const getCreditAPI = useCallback(async () => {
    setFirstLoader(true);
    await dispatch(fetchSubscription({ id: userData?.user?.user?.id }));
    try {
      const { data } = await axiosInstancePrivate.post(`/users/aicredit-data`, {
        userID: userData?.user?.user?.id,
      });
      if (data.data) setNewSeriesData(data.data);
      if (data.dates) setNewAllMonths(data.dates);
    } catch (error: any) {
      console.error(
        `History Table API Error: ${error?.response?.data?.message}`
      );
    }
    setFirstLoader(false);
  }, [userData?.user?.user?.id, dispatch]);

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
  }, [userData?.user?.user?.id]);

  useEffect(() => {
    subscribeToTableChanges();
    getData();
    getCreditAPI();
  }, [userData?.user?.user?.id]);

  const options: ApexOptions = {
    tooltip: {
      enabled: false,
    },
    chart: {
      height: 260,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      colors: ["#3FAEC1"],
    },
    fill: {
      colors: ["transparent"],
      type: "solid",
    },

    xaxis: {
      type: "category",
      categories: allMonths,
      labels: {
        style: {
          colors: isDarkMode ? "#cccccc" : "black",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      min: 0,
      labels: {
        style: {
          colors: isDarkMode ? "#cccccc" : "black",
          fontSize: "12px",
        },
      },
    },
  };

  const clickToNavigate = () => {
    router.push("/account/subscriptions");
  };

  const subscribeToTableChanges = useCallback(() => {
    const channel = supabase.channel("table-watcher");

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "credit_history" },
      async (payload) => {
        console.log("New record inserted:", payload);
        await notifyAPI(payload);
      }
    );

    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "credit_history" },
      async (payload) => {
        console.log("Record updated:", payload);
        await notifyAPI(payload);
      }
    );

    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "credit_history" },
      async (payload) => {
        console.log("Record deleted:", payload);
        await notifyAPI(payload);
      }
    );

    channel.subscribe();
  }, [supabase, notifyAPI]);

  return (
    <div className="pe-4 account max-w-[calc(100%-32px)] mx-auto">
      <div className="flex lg:flex-wrap overflow-auto overflow-x-auto mb-4">
        <div className="flex-1 min-w-max lg:min-w-[23%] mr-3">
          <Popover isOpen={popoverOpen} setIsOpen={setPopoverOpen} placement="right">
            <Popover.Trigger>
              <div
                onMouseEnter={() => setPopoverOpen(true)}
                onMouseLeave={() => setPopoverOpen(false)}
              >
                <AICreditsCard
                  name="REMAINING BALANCE"
                  number={
                    Math.max(
                      0,
                      (subscriptionData?.data?.credit_limit ?? 0) +
                        (subscriptionData?.data?.bonusCredits ?? 0) +
                        (subscriptionData?.data?.refferal_credits ?? 0) +
                        (subscriptionData?.data?.addOnCredits ?? 0) -
                        (subscriptionData?.data?.credit ?? 0)
                    ) || 0
                  }
                />
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
                  <span>Referral  Credits:{' '}</span>
                  <span>{subscriptionData?.data?.refferal_credits ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Add-on Credits:{' '}</span>
                  <span>{subscriptionData?.data?.addOnCredits ?? 0}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Total Credits:{' '}</span>
                  <span>
                    {subscriptionData?.data?.credit_limit +
                      subscriptionData?.data?.addOnCredits +
                      subscriptionData?.data?.refferal_credits +
                      subscriptionData?.data?.bonusCredits}
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
        </div>
        <div className="flex-1 min-w-max lg:min-w-[23%] mr-3">
          <AICreditsCard
            name="USAGE THIS MONTH"
            number={subscriptionData.data.credit}
          />
        </div>
        <div className="flex-1 min-w-max lg:min-w-[48%] hidden lg:block">
          <OfferCard onClick={clickToNavigate} />
        </div>
      </div>

      <div className=" col-span-4 lg:col-span-2 block lg:hidden">
        <OfferCard onClick={clickToNavigate} />
      </div>
      <div className="col-span-4">
        <Table />
      </div>

      <div className="w-full flex flex-wrap xl:flex-nowrap items-center justify-center gap-4 mt-4">
        <div className="w-full  border border-borderColor rounded-lg h-auto lg:h-72 bg-bgGray">
          {firstLoader ? (
            <div className="flex items-center justify-center h-full">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <AICreditChart
              seriesData={newSeriesData && newSeriesData}
              allMonths={newAllMonths}
            />
          )}
        </div>
      </div>

      <div className="flex mt-4 gap-4 lg:gap-0 flex-wrap justify-between">
        <div className="w-full lg:w-[100%] xl:w-[40%] mr-1">
          <div className="border border-[#E5E5E5] dark:border-[#2B383E]  rounded-md p-4">
            <h5 className="px-8 mb-5 text-[#393939] dark:text-[#CCCCCC] font-semibold uppercase">
              credit usage by type
            </h5>
            <div className="donut-chart-container">
              {creditUsageLoader ? (
                <div className="flex items-center justify-center h-full">
                  <Loader variant="threeDot" size="lg" />
                </div>
              ) : (
                <ReactApexChart
                  options={chartData.options}
                  series={chartData.series}
                  type="donut"
                  height={220}
                />
              )}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-[100%] xl:w-[58%] ">
          <div className="border border-[#E5E5E5] dark:border-[#2B383E]  rounded-md p-4 pb-0">
            <h5 className="px-5 text-[#393939] dark:text-[#CCCCCC] font-semibold uppercase">
              Credit Usage by Month/ Year
            </h5>

            <div className="chart-container">
              {creditUsageMonthLoader ? (
                <div className="flex items-center justify-center h-full">
                  <Loader variant="threeDot" size="lg" />
                </div>
              ) : (
                <ReactApexChart
                  options={options}
                  series={seriesData}
                  type="area"
                  height={260}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <AICreditsPurchaseSuccess
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        creditsPurchased={creditsPurchased}
      />
    </div>
  );
};

export default React.memo(AiCredits);

