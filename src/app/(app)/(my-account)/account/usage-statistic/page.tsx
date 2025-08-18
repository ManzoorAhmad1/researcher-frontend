"use client";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { ApexOptions } from "apexcharts";
import { getAccountDashboardAnalytics } from "@/apis/collaborates";
import { axiosInstancePrivate } from "@/utils/request";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { AppDispatch } from "@/reducer/store";
import TopicTable from "./TopicTable";
import MainTable from "./MainTable";
import { fetchSubscription } from "@/reducer/services/subscriptionApi";
import ExampleCustomInput from "@/utils/components/filterFunction";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import Table from "./Table";
import dynamic from "next/dynamic";
import "./ai-credits.css";
import { fetchCreditHistory } from "@/apis/user";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const UsageStatistic: any = () => {
  const [seriesData, setSeriesData] = React.useState<
    { name: string; data: number[] | [] }[]
  >([{ name: "series1", data: [] }]);

  const [isDarkMode, setDarkMode] = React.useState<boolean>(
    document.body.classList.contains("dark")
  );

  const [seriesDatas, setSeriesDatas] = React.useState<
    { name: string; data: number[] | [] }[]
  >([{ name: "series1", data: [] }]);

  const [accountDashboardAnalytics, setAccountDashboardAnalytics] =
    React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [allMonths, setAllMonths] = React.useState<string[]>([
    "11Feb",
    "3Mar",
    "6Mar",
  ]);
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
          colors: isDarkMode
            ? ["#cccccc", "#cccccc", "#cccccc", "#cccccc", "#cccccc", "#cccccc"]
            : ["#666", "#666", "#666", "#666", "#666", "#666"],
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
  const [firstLoader, setFirstLoader] = React.useState(false);
  const [secondLoader, setSecondLoader] = React.useState(false);
  const [products, setProducts] = React.useState([]);
  const [historyData, setHistoryData] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [startDate, setStartDate] = React.useState<any>();
  const perPageLimit = 10;
  const userData = useSelector(
    (state: any) => state?.user?.user?.user,
    shallowEqual
  );
  const projectId = useSelector(
    (state: any) => state?.project?.project?.id,
    shallowEqual
  );
  const dispatch: AppDispatch = useDispatch();
  const supabase: SupabaseClient = createClient();
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
  useEffect(() => {
    getCreativeThinkingData();
  }, [userData?.id]);

  const notifyAPI = async (payload: any) => {
    try {
      const fetchData = async () => {
        setLoading(true);
        const response = await getAccountDashboardAnalytics();
        setAccountDashboardAnalytics(response?.data?.data);
        setLoading(false);
      };
      fetchData();

      getChartData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error("Error notifying API:", error);
    }
  };

  const subscribeToTableChanges = () => {
    const channel = supabase.channel("table-watcher");

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "credit_history" },
      async (payload) => {
        console.log("New record inserted:", payload);
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
  };

  const getChartData = async () => {
    setSecondLoader(true);
    await dispatch(fetchSubscription({ id: userData?.id }));
    try {
        const response = await fetchCreditHistory();
  
      if (response?.data?.isSuccess === false) {
        console.error("Error updating questions:", response?.data?.message);
        toast.error("Failed to retrieve credit history.");
        return;
      }

      if (response?.data?.data && response?.data?.data?.length > 0) {
        const groupedData = response?.data?.data?.reduce(
          (acc: { [key: string]: number }, item:any) => {
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

        const monthlyUsage = response?.data?.data?.reduce((acc:any, entry:any) => {
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
        setSeriesDatas([
          {
            name: "series1",
            data: seriesData,
          },
        ]);
        setAllMonths(months);
      } else {
        console.error("No data returned from the update query.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "An error occurred");
      console.error("An unexpected error occurred.");
      console.error("Unexpected error in `addQuestion`:", err);
    }
    setSecondLoader(false);
  };
  const currentProjects = accountDashboardAnalytics?.filter(
    (item: any) => item?.projectId === projectId
  );
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

  const getCreativeThinkingData = async (page = 1, date: any | Date = null) => {
    setFirstLoader(true);
    setCurrentPage(page);
    try {
      const { data } = await axiosInstancePrivate.post(
        `/users/creative-thinking-data`,
        {
          data: {
            userid: userData?.id,
            page,
            perPageLimit,
            date,
            startDate,
          },
        }
      );

      if (data?.data?.length) {
        console.log("creative", data?.data);
        if (page === 1) {
          setProducts(data.data.slice(0, 8));
        }
        setHistoryData(data.data);
      } else {
        setHistoryData([]);
      }
      setTotalPages(data?.totalPages ?? 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      console.error(`History Table API Error: ${error.response.data.message}`);
    }
    setFirstLoader(false);
  };
  const headerTemplate = (field: string, title: string) => (
    <div className="flex items-center justify-between">
      <span>{title}</span>
      <DatePicker
        selected={startDate}
        onChange={(date) => {
          setStartDate(date);
          setCurrentPage(1);
          getCreativeThinkingData(1, date);
        }}
        maxDate={new Date()}
        customInput={<ExampleCustomInput />}
      />
    </div>
  );
  const tableDataField = [
    { id: 1, field: "keyword_type", header: "KEYWORD TYPE" },
    { id: 2, field: "keyword_name", header: "KEYWORD NAME" },
    { id: 2, field: "date", header: "DATE" },
  ];
  return (
    <div style={{ padding: "1rem" }}>
      <div className="col-span-4 mt-3">
        <TopicTable />
      </div>
      <div className="col-span-4 mt-3">
        <MainTable
          products={products}
          historyData={historyData}
          currentPage={currentPage}
          totalPages={totalPages}
          tableDataField={tableDataField}
          onPageChange={getCreativeThinkingData}
          smallTableName={"Creative Thinking History"}
          mainTableName={"Creative Thinking History"}
          headerTemplate={headerTemplate}
          firstLoader={firstLoader}
        />
      </div>
    </div>
  );
};
export default UsageStatistic;
