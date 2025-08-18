"use client";
import React, { useEffect } from "react";
import DashboardActivity from "@/components/Account/DashboardActivity";
import SearchIcon from "@/images/userProfileIcon/searchIcon";
import { FaChevronLeft } from "react-icons/fa6";
import TeamMember from "@/images/userProfileIcon/teamMember";
import { useRouter } from "next/navigation";
import { ApexOptions } from "apexcharts";
import Table from "./Table";
import AICreditChart from "@/components/Account/AICreditChart";
import { axiosInstancePublic } from "@/utils/request";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
interface PageProps {
  params: { slug: string[] };
}
const UserView = ({ params }: PageProps) => {
  const [seriesData, setSeriesData] = React.useState<
    { name: string; data: number[] | [] }[]
  >([
    { name: "series1", data: [] },
    {
      name: "series2",
      data: [],
    },
  ]);
  const [activityData, setActivityData] = React.useState<
    {
      id: string;
      user_id: number;
      project_id: string;
      type: string;
      activity: string;
      created_at: string;
      file_id: null | string;
    }[]
  >([]);
  const [seriesDatas, setSeriesDatas] = React.useState<
    { name: string; data: number[] | []; group: string }[]
  >([{ name: "series1", data: [], group: "apexcharts-axis-0" }]);
  const [allMonths, setAllMonths] = React.useState<string[]>([]);
  const [allCreditMonths, setAllCreditMonths] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [newActivity, setNewActivity] = React.useState<string[]>([]);
  const [newMember, setNewMember] = React.useState<string[]>([]);

  const { slug }: any = params;
  const router = useRouter();
  const [chartData, setChartData] = React.useState<any>({
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
      labels: [],
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
        enabled: true,
        y: {
          formatter: function (val: number) {
            return `${val} uses`;
          },
        },
        theme: "light",
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
          colors: ["#666", "#666", "#666", "#666", "#666", "#666"],
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
    },
    yaxis: {
      min: 0,
    },
  };

  const getUsersData = async () => {
    try {
      setLoading(true);

      const { data } = await axiosInstancePublic.get(
        `/admin/admin-user-view-data?userid=${slug?.[0]}`
      );

      if (!data?.isSuccess) {
        console.error("Error:", data?.message || "Unknown error");
        return;
      }

      setActivityData(data?.formateActivityData ?? []);

      setSeriesData([
        { name: "series1", data: data?.aiCredit?.using ?? [] },
        { name: "series2", data: data?.aiCredit?.buying ?? [] },
      ]);

      setAllCreditMonths(data?.aiCredit?.allDates ?? []);

      setSeriesDatas([
        {
          name: "series1",
          data: data?.aiUsage?.seriesData ?? [],
          group: "apexcharts-axis-0",
        },
      ]);

      setAllMonths(data?.aiUsage?.months ?? []);

      setChartData((prevData: any) => ({
        ...prevData,
        series: data?.creditTypeUsage?.series?.length
          ? data.creditTypeUsage.series
          : [1],
        options: {
          ...prevData?.options,
          labels: data?.creditTypeUsage?.labels?.length
            ? data.creditTypeUsage.labels
            : ["none"],
        },
      }));
    } catch (error: any) {
      console.error("Dashboard API Error:", error?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getUserBoxData = async () => {
    try {
      setLoading(true);

      const res = await axiosInstancePublic.get(
        `/admin/admin-user-box-data?userid=${slug?.[0]}`
      );

      if (res.data?.isSuccess) {
        setNewMember(res.data.members ?? []);
        setNewActivity(res.data.activities ?? []);
      } else {
        console.error("Error:", res.data?.message || "Unknown error");
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug[0].length) {
      getUsersData();
      getUserBoxData();
    }
  }, []);

  const backScreen = () => {
    router.back();
  };

  return (
    <>
      {" "}
      <div style={{ padding: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            width: "max-content",
          }}
          className="p-2 pl-0"
          onClick={backScreen}
        >
          <FaChevronLeft /> &nbsp;Back
        </div>
        <div style={{ display: "flex" }}>
          <div
            className="flex flex-col gap-3"
            style={{ width: "max-content", paddingRight: "0.5rem" }}
          >
            <div className="w-[248px] h-[117px] cards_bg bg-[#079E2833] rounded-md flex gap-6 items-center justify-center">
              <div className="w-10 h-10 mr-4 flex items-center bg-primaryBlue greenBoxShadow justify-center  rounded-full">
                <SearchIcon dashboardSarchIcon />
              </div>
              <div>
                <p className="font-size-md font-semibold text-secondaryDark">
                  {" "}
                  RECENT RESEARCH
                </p>
                <p className="font-size-extra-larg font-medium text-primaryDark mt-2">
                  {newActivity.length}
                </p>
              </div>
            </div>
            <div className="w-[248px] h-[117px] cards_bg bg-[#AF2FEC33] rounded-md flex gap-6 items-center justify-center">
              <div className="w-10 h-10 mr-4 flex items-center bg-primaryPurple purpleBoxShadow justify-center  rounded-full">
                <TeamMember />
              </div>
              <div>
                <p className="font-size-md font-semibold text-secondaryDark">
                  TEAM MEMBERS
                </p>
                <p className="font-size-extra-larg font-medium text-primaryDark mt-2">
                  {newMember.length}
                </p>
              </div>
            </div>
          </div>
          <div
            className="w-full max-h-[246px] border border-borderColor rounded-lg  bg-bgGray m-1 overflow-y-auto"
            style={{ paddingRight: "1rem" }}
          >
            <DashboardActivity
              filterActivities={activityData}
              loading={loading}
            />
          </div>
        </div>
        <div className="col-span-4 mt-3">
          <Table />
        </div>

        <div className="w-full flex flex-wrap xl:flex-nowrap items-center justify-center gap-4 mt-4">
          <div className="w-full  border border-borderColor rounded-lg h-auto lg:h-72 bg-bgGray">
            <AICreditChart
              seriesData={seriesData && seriesData}
              allMonths={allCreditMonths}
            />
          </div>
        </div>

        <div className="flex mt-4 gap-4 lg:gap-0 flex-wrap justify-between">
          <div
            className="w-full lg:w-[100%] xl:w-[40%] mr-1"
            style={{ backgroundColor: "white" }}
          >
            <div className="border border-[#E5E5E5] dark:border-[#2B383E]  rounded-md p-4">
              <h5 className="px-8 mb-5 text-[#393939] darkt-[#CCCCCC] font-semibold uppercase">
                credit usage by type
              </h5>
              <div className="donut-chart-container">
                <ReactApexChart
                  options={chartData.options}
                  series={chartData.series}
                  type="donut"
                  height={220}
                />
              </div>
            </div>
          </div>
          <div
            className="w-full lg:w-[100%] xl:w-[58%] "
            style={{ backgroundColor: "white" }}
          >
            <div className="border border-[#E5E5E5] dark:border-[#2B383E]  rounded-md p-4 pb-0">
              <h5 className="px-5 text-[#393939] dark:text-[#CCCCCC] font-semibold uppercase">
                AI usage
              </h5>

              <div className="chart-container">
                <ReactApexChart
                  options={options}
                  series={seriesDatas}
                  type="area"
                  height={260}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default UserView;
