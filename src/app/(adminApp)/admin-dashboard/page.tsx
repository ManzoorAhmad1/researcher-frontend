"use client";
import React, { useEffect, useState } from "react";
import WrapperBox from "@/components/ui/WrapperBox"
import { Label } from "@/components/ui/label";
import { FaUsers } from "react-icons/fa6";
import { ApexOptions } from "apexcharts";
import { IoMdArrowRoundUp } from "react-icons/io";
import { BsFillPersonCheckFill } from "react-icons/bs";
import { IoOpenOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchApi,fetchNewApi } from "@/utils/fetchApi";
import { AppDispatch } from "@/reducer/store";
import { DataTable } from "primereact/datatable";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Column } from "primereact/column";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IoIosDocument } from "react-icons/io";
import { BiChip } from "react-icons/bi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoMdArrowRoundDown } from "react-icons/io";
import { FaCode } from "react-icons/fa6";
import { FaUpload } from "react-icons/fa6";
import { HiUserAdd } from "react-icons/hi";
import { MdOutlineCreditScore } from "react-icons/md";
import { FaRobot } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import { HiServer } from "react-icons/hi";
import { FaDatabase } from "react-icons/fa6";
import { adminDashboardApi} from "@/apis/admin-user";
import { axiosInstancePublic, axiosInstancePrivate } from "@/utils/request";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import DashboardActivity from "./DashboardActivity";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
export interface AiCreditHistoryType {
  activity: string,
  activity_details: string,
  created_at: string,
  credit_type: string,
  credit_usage: number,
  id: number,
  user_id: number,
}

const Dashboard = () => {
  const [seriesDatas, setSeriesDatas] = React.useState<{ name: string; data: number[] | [], group: string }[]>([{ name: "series1", data: [0, 0, 115, 83], group: "apexcharts-axis-0" }]);
  const [seriesData, setSeriesData] = useState<{ name: string, data: number[] | [] }[]>([{ name: "series1", data: [] }])
  const [userTrendSeriesData, setUserTrendSeriesData] = useState<{ name: string, data: number[] | [] }[]>([{ name: "series1", data: [] }])
  const [aiSeriesData, setAiSeriesData] = useState<{ name: string, data: number[] | [] }[]>([ {name: "series1",data: [ ]}])
  const [allDates, setAllDates] = useState<string[]>([]);
  const [userTrendAllDates, setUserTrendAllDates] = useState<string[]>([]);
  const [aiModelHistoryModel, setAIModelHistoryModel] = useState(false)
  const [remainingCredit, setRemainingCredit] = useState<number>(0);
  const [selectedView, setSelectedView] =useState<string>("Day");
  const [selectedTrendView, setSelectedTrendView] =useState<string>("Day");
  const [chartData,setChartData]=useState<any>( {
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
          fontSize: "19px",
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
    })
  const [aiCreditHistoryData,setAiCreditHistoryData]=React.useState<AiCreditHistoryType[]>()
  const [dashboardData, setDashboardData] = useState<{
    totalUsers: number;
    activeUsersCount: number;
    documentCount: number;
    totalCreditUsage: number;
    recentActivityData:any;
    apiRequests:number;
  } >({
    totalUsers: 0,
    activeUsersCount: 0,
    documentCount: 0,
    totalCreditUsage: 0,
    recentActivityData:[],
    apiRequests:0,
  });
  const [allDataGrowth,setAllDataGrowth]=React.useState<any>({
    totalUsersGrowth:{growth:'',percentage:''},
    activeUsersGrowth:{growth:'',percentage:''},
    documentGrowth:{growth:'',percentage:''},
    totalCreditUsageGrowth:{growth:'',percentage:''},
    apiRequestsGrowth:{growth:'',percentage:''},
  });
  const [allModelStatus,setAllModelStatus]=React.useState<any>({})
  const dispatch = useDispatch<AppDispatch>();
  const supabase: SupabaseClient = createClient();

  const notifyRecentActivityAPI = async (payload: any) => {
    try {
      getDashboardData()
    } catch (error) {
      console.error('Error notifying API:', error);
    }
  };
  const notifyUsersAPI = async (payload: any) => {
    try {
      getDashboardTotalUsersData()
      getDashboardActiveUsersCountData()
      getActiveUserTrendData()
    } catch (error) {
      console.error('Error notifying API:', error);
    }
  };
  const notifyFiledocsAPI = async (payload: any) => {
    try {
      getDashboardDocumentCountData()
    } catch (error) {
      console.error('Error notifying API:', error);
    }
  };
  const notifyCreditHistoryAPI = async (payload: any) => {
    try {
      getDashboardTotalCreditUsageData()
      getRemainingCredits()
    } catch (error) {
      console.error('Error notifying API:', error);
    }
  };

  const subscribeToRecentActivityTableChanges = () => {
    const channel = supabase.channel('table-watcher-activity');
  
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'recent_activity' },
      async (payload) => {
        await notifyRecentActivityAPI(payload);
      }
    );
  
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'recent_activity' },
      async (payload) => {
        await notifyRecentActivityAPI(payload);
      }
    );
  
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'recent_activity' },
      async (payload) => {
        await notifyRecentActivityAPI(payload);
      }
    );
  
    channel.subscribe();
  };

  const subscribeToUsersTableChanges = () => {
    const channel = supabase.channel('table-watcher-usertable');
  
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'users' },
      async (payload) => {
        await notifyUsersAPI(payload);
      }
    );
  
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'users' },
      async (payload) => {
        await notifyUsersAPI(payload);
      }
    );
  
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'users' },
      async (payload) => {
        await notifyUsersAPI(payload);
      }
    );
  
    channel.subscribe();
  };

  const subscribeToFiledocsChanges = () => {
    const channel = supabase.channel('table-watcher-filedocs');
  
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'filedocs' },
      async (payload) => {
        await notifyFiledocsAPI(payload);
      }
    );
  
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'filedocs' },
      async (payload) => {
        await notifyFiledocsAPI(payload);
      }
    );
  
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'filedocs' },
      async (payload) => {
        await notifyFiledocsAPI(payload);
      }
    );
  
    channel.subscribe();
  };

  const subscribeToCreditHistoryChanges = () => {
    const channel = supabase.channel('table-watcher-credit');
  
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'credit_history' },
      async (payload) => {
        await notifyCreditHistoryAPI(payload);
      }
    );
  
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'credit_history' },
      async (payload) => {
        await notifyCreditHistoryAPI(payload);
      }
    );
  
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'credit_history' },
      async (payload) => {
        await notifyCreditHistoryAPI(payload);
      }
    );
  
    channel.subscribe();
  };
  const notifyModelAPI = async (payload: any) => {
    try {
      manageAIModel();
    } catch (error) {
      console.error("Error notifying API:", error);
    }
  };

   const subscribeToMultipleModelChanges = () => {
      const channel = supabase.channel("table-admin-ai-model");
  
      channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "manage_ai_model" },
        async (payload) => {
          await notifyModelAPI(payload);
        }
      );
  
      channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "manage_ai_model" },
        async (payload) => {
          await notifyModelAPI(payload);
        }
      );
  
      channel.on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "manage_ai_model" },
        async (payload) => {
          await notifyModelAPI(payload);
        }
      );
  
      channel.subscribe();
    };
  
    const manageAIModel = async () => {
      try {
        const {data} = await axiosInstancePublic.get("/admin/get-model");
        if (data.data[0]) {
          setAllModelStatus(data.data[0])
        }
      } catch (error: any) {
        console.error(`Model Table API Error: ${error}`);
      }
    };
    const getCurrentModel = () => {
      manageAIModel();
      subscribeToMultipleModelChanges();
    };

  const getDashboardData = async () => {
    try {
      const res = await axiosInstancePublic.get("/admin/admin-dashboard-recentactivity");
  
      if (res.data.isSuccess) {
        const formateActivityData=res.data.data.map((value:any)=>{
          return{   activity: value.activity + " Using Semantic Scholar", 
            created_at: value.created_at,
            file_id: value.file_id,
            id: value.id,
            project_id: value.project_id,
            type: value.type,
            user_id: value.user_id,}
        })
    
        setDashboardData((prev: any) =>({...prev, recentActivityData:formateActivityData}));
      } else {
        console.error("Error:", res.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  };

  const getBoxData = async () => {
    try {
      const res = await axiosInstancePublic.get("/admin/admin-dashboard-boxdata");
  
      if (res.data.isSuccess) {
        setAllDataGrowth((prev: any) => ({ ...prev, totalUsersGrowth: {growth: res.data.data.percentage_change == 'N/A' ? 'N/A' :res.data.data.percentage_change.includes('-')?'Down':'Up',percentage: res.data.data.percentage_change == 'N/A' ? 'N/A' :res.data.data.percentage_change} }))
      } else {
        console.error("Error:", res.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  };
  const getDocBoxData = async () => {
    try {
      const res = await axiosInstancePublic.get("/admin/admin-dashboard-boxdocdata");
  
      if (res.data.isSuccess) {
        setAllDataGrowth((prev: any) => ({ ...prev,  documentGrowth:{growth:res.data.data.percentage_change == 'N/A' ? 'N/A' :res.data.data.percentage_change.includes('-')?'Down':'Up',percentage:res.data.data.percentage_change == 'N/A' ? 'N/A' :res.data.data.percentage_change}, }))

      } else {
        console.error("Error:", res.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  };


  const geAIAPIRequestsBoxData = async () => {
    try {
      const res = await axiosInstancePublic.get("/admin/admin-dashboard-AIAPIRequestsData");
  
      if (res.data.isSuccess) {

        setAllDataGrowth((prev: any) => ({ ...prev,  apiRequestsGrowth:{growth:res.data.data.percentage_change == 'N/A' ? 'N/A' :res.data.data.percentage_change.includes('-')?'Down':'Up',percentage:res.data.data.percentage_change == 'N/A' ? 'N/A' :res.data.data.percentage_change}, }))
   
      } else {
        console.error("Error:", res.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  };
  const getDashboardTotalUsersData = async () => {
    try {
      const res = await axiosInstancePublic.get("/admin/admin-dashboard-totalusers");
      if (res.data.isSuccess) {
        setDashboardData((prev: any) => ({ ...prev, totalUsers: res.data.data.totalUsers, }));
        // const result = calculateMonthlyUserChange( res.data.data.users);
        // setAllDataGrowth((prev: any) => ({ ...prev, totalUsersGrowth: result }))
      } else {
        console.error("Error:", res.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  };
  const getDashboardActiveUsersCountData = async () => {
    try {
      const res = await axiosInstancePublic.get("/admin/admin-dashboard-userscount");
      if (res.data.isSuccess) {
        setDashboardData((prev: any) => ({ ...prev, activeUsersCount: res.data.data, }));
        setAllDataGrowth((prev: any) => ({ ...prev, activeUsersGrowth: { growth: res.data.usersData.percentage_change == 'N/A' ? 'N/A' : res.data.usersData.percentage_change.includes('-') ? 'Down' : 'Up', percentage: res.data.usersData.percentage_change == 'N/A' ? 'N/A' : res.data.usersData.percentage_change }, }))
      } else {
        console.error("Error:", res.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  };

  const getActiveUserTrendData=async(view=selectedTrendView)=>{
    try {
      const res = await axiosInstancePublic.get(`/admin/admin-dashboard-userstrend?view=${view}`);

      if (res.data.isSuccess) {
        setUserTrendSeriesData([
          {
            name: "AI Credit Usage",
            data: res.data.data.seriesData,
          },
        ])
        setUserTrendAllDates(res.data.data.categories)
          } else {
        console.error("Error:", res.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  }

  const getDashboardDocumentCountData = async () => {
    try {
      const res = await axiosInstancePublic.get("/admin/admin-dashboard-documentcount");
      if (res.data.isSuccess) {
        setDashboardData((prev: any) => ({...prev, documentCount: res.data.data,  }));

      } else {
        console.error("Error:", res.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  };

  const getDashboardTotalCreditUsageData = async () => {
    try {
      const res = await axiosInstancePublic.get("/admin/admin-dashboard-totalcredit");
      const totalCreditUsage = res.data.data?.reduce(
        (sum:number, record:{credit_usage:number}) => sum + (record.credit_usage || 0),
        0
      );

      if (res.data.isSuccess) {
        setDashboardData((prev: any) => ({ ...prev, totalCreditUsage: totalCreditUsage,apiRequests: res.data.data.length}));
        setAllDataGrowth((prev: any) => ({ ...prev,  totalCreditUsageGrowth:{growth:res.data.percentage_change == 'N/A' ? 'N/A' :res.data.percentage_change.includes('-')?'Down':'Up',percentage:res.data.percentage_change == 'N/A' ? 'N/A':res.data.percentage_change}, }))
        calculateUsage(res.data.data)
      } else {
        console.error("Error:", res.data.message);
      }
    } catch (error: any) {
      console.error("Dashboard API Error:", error.message);
    }
  };


  const calculateUsage = (data:AiCreditHistoryType[]) => {

    const groupedData = data.reduce((acc: { [key: string]: number }, item) => {
      const { credit_type, credit_usage } = item;
      if (!acc[credit_type]) {
        acc[credit_type] = 0;
      }
      acc[credit_type] += credit_usage;
      return acc;
    }, {});

    const series = Object.values(groupedData);
    const labels = Object.keys(groupedData);
    setAiSeriesData([ {name: "series1",data:series.length ? series : [1]}])
    setChartData((prevData: any) => ({
      ...prevData,
      series: series.length ? series : [1],
      options: {
        ...prevData.options,
        labels: labels.length ? labels : ['none'],
      },
    }));


    const getDateFromDateStr = (dateStr: string) => {
      return new Date(dateStr).toISOString().split("T")[0];
    };
    const dailyUsage = data.reduce((acc: { [key: string]: number }, entry) => {
      const date = getDateFromDateStr(entry.created_at);
      acc[date] = (acc[date] || 0) + entry.credit_usage;
      return acc;
    }, {});
    const allDates = Object.keys(dailyUsage).sort();
    const seriesData = allDates.map(date => dailyUsage[date]);

    const { categories:newCategories, seriesData:newSeriesData } = processData(data, selectedView);
    setSeriesData([
      {
        name: "AI Credit Usage",
        data: newSeriesData,
      },
    ]);
    setAllDates(newCategories);

    setAiCreditHistoryData(data);
  }

  const getInitialData=()=>{
    getBoxData()
    getDocBoxData()
    getDashboardData()
    geAIAPIRequestsBoxData()
    getActiveUserTrendData()
    getDashboardTotalUsersData()
    getDashboardActiveUsersCountData()
    getDashboardDocumentCountData()
    getDashboardTotalCreditUsageData()
    // getDashboardActiveUsersGraphData()
    getRemainingCredits()
    getCurrentModel()
  }
  useEffect(() => {
    getInitialData()
    subscribeToRecentActivityTableChanges()
    subscribeToUsersTableChanges()
    subscribeToFiledocsChanges()
    subscribeToCreditHistoryChanges()
  },[])

  const formatIndianNumber = (number: number) => {
    return  number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const options: ApexOptions = {
    tooltip: {
      enabled: false,
    },
    chart: {
      height: 360,
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
      categories: allDates,
    },
    yaxis: {
      min: 0,
    },
  };
  const userTrendOptions: ApexOptions = {
    tooltip: {
      enabled: false,
    },
    chart: {
      height: 360,
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
      categories: userTrendAllDates,
    },
    yaxis: {
      min: 0,
    },
  };
  const aiOptions: ApexOptions = 
    {
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top" 
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return Number(val).toLocaleString();
        },
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"]
        }
      },
      xaxis: {
        categories: ["AI Search", "Summarization", "Chatting", "Analysis", "Other"],
        position: "bottom",
        labels: {
          offsetY: 0
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        tooltip: {
          enabled: false,
          offsetY: -35
        }
      },
      fill: {
        gradient: {
          shade: "light",
          type: "horizontal",
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [50, 0, 100, 100]
        }
      },
      yaxis: {
        axisBorder: {
          show: true
        },
        axisTicks: {
          show: true
        },
        labels: {
          show: true,
          formatter: function(val) {
            return Number(val).toLocaleString();
          }
        }
      },
      title: {
        text: "",
        floating: false,
        offsetY: 0,
        align: "center",
        style: {
          color: "#444"
        }
      },
      chart: {
        animations: {
          enabled: false
        },
        toolbar: {
          show: false,
        },
      }
  };
const getRemainingCredits = async () => {
  const apiRes = await fetchNewApi(
    `${process.env.NEXT_PUBLIC_STRAICO_API}/v0/user`,
    {method: "GET"}
  );

  apiRes && setRemainingCredit(apiRes.data.coins)
};
const getDateFromDateStr = (dateStr: string) => new Date(dateStr);

const userProcessData = (data: any[], view: string) => {
  const today = new Date();
  let filteredData: any[];

  if (view === "Day") {
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);
    filteredData = data.filter(entry => new Date(entry.login_date) >= past30Days);

    const dailyLogins = filteredData.reduce((acc: { [key: string]: number }, entry) => {
      const date = new Date(entry.login_date).toISOString().split("T")[0]; 
      acc[date] = (acc[date] || 0) + 1; 
      return acc;
    }, {});

    return {
      categories: Object.keys(dailyLogins).sort(),
      seriesData: Object.values(dailyLogins),
    };
  } 

  else if (view === "Month") {
    const past12Months = new Date();
    past12Months.setMonth(today.getMonth() - 12);
    filteredData = data.filter(entry => new Date(entry.login_date) >= past12Months);

    const monthlyLogins = filteredData.reduce((acc: { [key: string]: number }, entry) => {
      const date = new Date(entry.login_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    return {
      categories: Object.keys(monthlyLogins).sort(),
      seriesData: Object.values(monthlyLogins),
    };
  } 
  
  else if (view === "Year") {
    filteredData = data;

    const yearlyLogins = filteredData.reduce((acc: { [key: string]: number }, entry) => {
      const year = new Date(entry.login_date).getFullYear().toString();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    return {
      categories: Object.keys(yearlyLogins).sort(),
      seriesData: Object.values(yearlyLogins),
    };
  }

  return { categories: [], seriesData: [] };
};


const processData = (data: AiCreditHistoryType[], view: string) => {
  const today = new Date();
  let filteredData: any[];

  if (view === "Day") {

    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);
    filteredData = data.filter(entry => getDateFromDateStr(entry.created_at) >= past30Days);

    const dailyUsage = filteredData.reduce((acc: { [key: string]: number }, entry) => {
      const date = getDateFromDateStr(entry.created_at).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + entry.credit_usage;
      return acc;
    }, {});

    return {
      categories: Object.keys(dailyUsage).sort(),
      seriesData: Object.values(dailyUsage),
    };
  } 
  
  else if (view === "Month") {
    const past12Months = new Date();
    past12Months.setMonth(today.getMonth() - 12);
    filteredData = data.filter(entry => getDateFromDateStr(entry.created_at) >= past12Months);

    const monthlyUsage = filteredData.reduce((acc: { [key: string]: number }, entry) => {
      const date = getDateFromDateStr(entry.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      acc[monthYear] = (acc[monthYear] || 0) + entry.credit_usage;
      return acc;
    }, {});

    return {
      categories: Object.keys(monthlyUsage).sort(),
      seriesData: Object.values(monthlyUsage),
    };
  } 
  
  else if (view === "Year") {
    filteredData = data;

    const yearlyUsage = filteredData.reduce((acc: { [key: string]: number }, entry) => {
      const date = getDateFromDateStr(entry.created_at);
      const year = date.getFullYear().toString();
      acc[year] = (acc[year] || 0) + entry.credit_usage;
      return acc;
    }, {});

    return {
      categories: Object.keys(yearlyUsage).sort(),
      seriesData: Object.values(yearlyUsage),
    };
  }

  return { categories: [], seriesData: [] };
};
  const selectViewPoint = (value: any) => {

    if (aiCreditHistoryData) {
      const { categories: categories, seriesData: seriesData } = processData(aiCreditHistoryData, value);
      setSeriesData([
        {
          name: "AI Credit Usage",
          data: seriesData,
        },
      ]);
      setAllDates(categories);
    }
    setSelectedView(value)
  }

  const selectTrendViewPoint = (value: any) => {

    getActiveUserTrendData(value)

    setSelectedTrendView(value)
  }

  const showMonthData = (growth: string, percentage: string) => {
    return (<div className={`${growth == 'N/A'?'text-[#000000]':growth == 'Down' ? 'text-[#ff6f81]' : 'text-[#27b67d]'} text-base font-medium flex items-center mb-[1rem]`}>
      {growth == 'N/A'?'':growth == 'Down' ? <IoMdArrowRoundDown className="text-[#ff6f81] text-lg" /> : <IoMdArrowRoundUp className="text-[#27b67d] text-lg" />}
      <span className={``}> {percentage == 'N/A'?'N/A':percentage} this month</span>
    </div>)
  }

  const openModelOption = (service: { name: string, uptime: string }) => {
    if (service.name === "AI Services") {
      return <span className="flex items-center">{service.uptime} &nbsp;<IoOpenOutline className="text-[#0e70ff] cursor-pointer" onClick={manageModel}/></span>
    }
    else {
      return <>{service.uptime}</>
    }
  }

  const manageModel=()=>{
    setAIModelHistoryModel(!aiModelHistoryModel)
  }

  return (<WrapperBox>
    <div >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 ">
        <div className="bg-white p-4 rounded-lg flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-[#495360d6] text-lg font-semibold">Total Users</Label>
            <FaUsers className="text-[#508de9] text-xl" />
          </div>
          <Label className="text-2xl font-semibold leading-[3rem]">{formatIndianNumber(dashboardData.totalUsers)}</Label>
          {showMonthData(allDataGrowth.totalUsersGrowth.growth,allDataGrowth.totalUsersGrowth.percentage)}
        </div>

        <div className="bg-white p-4 rounded-lg flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-[#495360d6] text-lg font-semibold">Active Users</Label>
            <BsFillPersonCheckFill className="text-[#27b67d] text-xl" />
          </div>
          <Label className="text-2xl font-semibold leading-[3rem]">{formatIndianNumber(dashboardData.activeUsersCount)}</Label>
          {showMonthData(allDataGrowth.activeUsersGrowth.growth,allDataGrowth.activeUsersGrowth.percentage)}
        </div>

        <div className="bg-white p-4 rounded-lg flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-[#495360d6] text-lg font-semibold">Documents</Label>
            <IoIosDocument className="text-[#8a60f0] text-xl" />
          </div>
          <Label className="text-2xl font-semibold leading-[3rem]">{formatIndianNumber(dashboardData?.documentCount)}</Label>
          {showMonthData(allDataGrowth.documentGrowth.growth,allDataGrowth.documentGrowth.percentage)}
        </div>

        <div className="bg-white p-4 rounded-lg flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-[#495360d6] text-lg font-semibold">AI Credits Used</Label>
            <BiChip className="text-[#f34c20] text-xl" />
          </div>
          <Label className="text-2xl font-semibold leading-[3rem]">{formatIndianNumber(dashboardData.totalCreditUsage)}</Label>
          {showMonthData(allDataGrowth.totalCreditUsageGrowth.growth,allDataGrowth.totalCreditUsageGrowth.percentage)}
        </div>

        <div className="bg-white p-4 rounded-lg flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-[#495360d6] text-lg font-semibold">API Requests</Label>
            <FaCode className="text-[#6e75ec] text-xl" />
          </div>
          <Label className="text-2xl font-semibold leading-[3rem]">{formatIndianNumber(dashboardData.apiRequests)}</Label>
          {showMonthData(allDataGrowth.apiRequestsGrowth.growth,allDataGrowth.apiRequestsGrowth.percentage)}
        </div>

        <div className="bg-white p-4 rounded-lg flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Label className="text-[#495360d6] text-lg font-semibold">Remaining Credits</Label>
            <MdOutlineCreditScore className="text-[#6e75ec] text-xl" />
          </div>
          <Label className="text-2xl font-semibold leading-[3rem]">{formatIndianNumber(remainingCredit)}</Label>
        </div>

      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-5 py-4">

        <div className="bg-white p-4 rounded-lg flex flex-col gap-2">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}> <Label className="text-lg font-semibold py-1">AI Credit Usage</Label>
            <span style={{ width: '150px' }}>   <Select onValueChange={selectViewPoint} value={selectedView} defaultValue={'openai/gpt-4o-mini'}>
              <SelectTrigger
                id="model"
                className="items-start [&_[data-description]]:hidden"
              >
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {[{ model: 'Day', name: 'Day' }, { model: 'Month', name: 'Month' }, { model: 'Year', name: 'Year' }]?.map((value, index) => {
                  return (
                    <SelectItem value={value.model} key={index}>
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <div className="grid gap-0.5">
                          <p>
                            <span className="font-medium text-foreground">{value.name}</span>
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            </span>
          </div>
          <div className="bg-[#f6f6f6] h-[400px] rounded-lg" >
            <ReactApexChart
              options={options}
              series={seriesData}
              type="area"
              height={410}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg flex flex-col gap-2">
          <Label className="text-lg font-semibold py-1">
          Credit Distribution By Type
            {/* Active Users Trend */}
            </Label>
          <div className="bg-[#f6f6f6] h-[400px] rounded-lg" >
          <ReactApexChart
                options={chartData.options}
                series={chartData.series}
                type="donut"
                height={370}
              />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg flex flex-col gap-2">
          <div> <Label className="text-lg font-semibold py-1"> Credit Usage By Type</Label>
          </div>
          <div className="bg-[#f6f6f6] h-[400px] rounded-lg" >
            <ReactApexChart
              options={aiOptions}
              series={aiSeriesData}
                type="bar"
              height={410}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg flex flex-col gap-2">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}> <Label className="text-lg font-semibold py-1">Active Users Trend</Label>
            <span style={{ width: '150px' }}>   <Select onValueChange={selectTrendViewPoint} value={selectedTrendView} defaultValue={'Day'}>
              <SelectTrigger
                id="model"
                className="items-start [&_[data-description]]:hidden"
              >
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {[{ model: 'Day', name: 'Day' }, { model: 'Month', name: 'Month' }, { model: 'Year', name: 'Year' }]?.map((value, index) => {
                  return (
                    <SelectItem value={value.model} key={index}>
                      <div className="flex items-start gap-3 text-muted-foreground">
                        <div className="grid gap-0.5">
                          <p>
                            <span className="font-medium text-foreground">{value.name}</span>
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            </span>
          </div>
          <div className="bg-[#f6f6f6] h-[400px] rounded-lg" >
            <ReactApexChart
              options={userTrendOptions}
              series={userTrendSeriesData}
              type="area"
              height={410}
            />
          </div>
        </div>
        
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-5 py-4">
        <div className="bg-white p-4 rounded-lg flex flex-col gap-[0.8rem]">
          
          <DashboardActivity
              filterActivities={dashboardData.recentActivityData}
              loading={false}
            />
        </div>

        <div className="bg-white p-[1rem] rounded-[0.5rem] flex flex-col gap-[0.5rem]">
          <div className="flex justify-between">
            <Label className="text-[1.125rem] font-[600] py-[0.25rem]">System Health</Label>
            <Label
              className="text-[#27b67d] flex items-center font-[600] py-[0.25rem]"
              style={{ fontSize: "0.9rem" }}
            >
              <GoDotFill className="text-[#27b67d]" /> All Systems Operational
            </Label>
          </div>

          {[
            { name: "API Server", uptime: "N/A" },
            { name: "Database", uptime: "N/A" },
            { name: "AI Services", uptime:
              allModelStatus?.current_model || "N/A" },
          ].map((service, index) => (
            <div
              key={index}
              className="bg-[#f6f6f6] rounded-[0.5rem] p-[0.5rem] flex justify-between items-center"
            >
              <Label className="text-[1rem] font-[500] flex items-center py-[0.25rem]">
                <div className="w-max p-[0.5rem] rounded-[1rem]">
                    {  service.name === "API Server" &&<HiServer className="text-[#3684fa] text-[1rem]" />}
                    {  service.name === "Database" && <FaDatabase className="text-[#3684fa] text-[1rem]" />}
                    {  service.name === "AI Services" &&<BiChip className="text-[#3684fa] text-[1rem]" />}
                </div>
                {service.name}
              </Label>
              <Label className="text-[1rem] font-[500] text-[#27b67d] py-[0.25rem]">
                {openModelOption(service)}
              </Label>
            </div>
          ))}
        </div>

      </div>
    </div>
     <Dialog open={aiModelHistoryModel}onOpenChange={manageModel}>
            <DialogContent className="max-h-full  overflow-y-auto max-w-4xl">
              <DialogHeader>
                <DialogTitle>AI Model Details</DialogTitle>
              </DialogHeader>
              <DialogDescription>
              <div className="border border-[#E5E5E5] dark:border-[#2B383E] rounded-md card dark:bg-black">
                <DataTable value={allModelStatus?.model_status?.map((value:{status:boolean}) => ({...value,status: value.status ? 'UP' : 'DOWN',}))} className="min-w-fit dark:custom-datatable" emptyMessage="No data available">
                  <Column field="model" header="MODEL NAME" style={{ padding: "12px 15px", fontSize: '14px' }}  headerClassName="dark:bg-[#223036] dark:text-[#999999]"  bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"></Column>
                  <Column field="modelVersion" header="MODEL VERSION" style={{ padding: "12px 15px", fontSize: '14px' }}headerClassName="dark:bg-[#223036] dark:text-[#999999]"  bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"></Column>
                  <Column field="status" header="MODEL STATUS" style={{ padding: "12px 15px", fontSize: '14px' }}headerClassName="dark:bg-[#223036] dark:text-[#999999]"  bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"
                 body={(rowData) => (
                  <span
                    className={`font-bold  text-base ${
                      rowData?.status === 'UP' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {rowData?.status}
                  </span>
                )}
                  ></Column>
                </DataTable>
              </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
  </WrapperBox>);
};

export default Dashboard;