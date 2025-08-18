import React, { useEffect, useState } from "react";
import { FiActivity } from "react-icons/fi";
import { Text } from "rizzui";

const ActivityMap = ({ allActivities, loading }: any) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  const [data, setData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    if (!loading) {
      
      const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      
      const activityMap: Record<string, number> = {};
      allActivities&& allActivities?.forEach((activity: any) => {
        const date = new Date(activity.created_at);
        const dateStr = date.toISOString().split("T")[0];
        if (!activityMap[dateStr]) {
          activityMap[dateStr] = 0;
        }
        activityMap[dateStr] += 1;
      });
      
      const calendar: { date: string; count: number }[] = [];
      for (let i = 0; i < firstDayOfMonth; i++) {
        calendar.push({ date: "", count: 0 }); 
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        calendar.push({ date: dateStr, count: activityMap[dateStr] || 0 });
      }
      setData(calendar);
    }
  }, [selectedMonth, selectedYear, allActivities, loading]);

  const getColor = (count: number) => {
    if (count === 0) return "#F3ECE0";
    if (count === 1) return "#FFE6C0";
    if (count <= 3) return "#F6C170";
    return "#F59B14";
  };

  if (loading) {
    return (
      <div className="border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-5 mt-5">
        <div className="flex justify-between items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="text-[#8D17B5]">
              <FiActivity className="h-[15px] w-[15px]" />
            </div>
            <Text className="font-semibold font-size-normal text-primaryDark dark:text-[#cccccc]">
              ACTIVITY MAP
            </Text>
          </div>
          <div className="h-6 w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 ml-2 items-center justify-center w-auto">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          ))}
          {[...Array(30)].map((_, index) => (
            <div key={index} className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-5 mt-5">
      <div className="flex justify-between items-center gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="text-[#8D17B5]">
            <FiActivity className="h-[15px] w-[15px]" />
          </div>
          <Text className="font-semibold font-size-normal text-primaryDark dark:text-[#cccccc]">
            ACTIVITY MAP
          </Text>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="text-[13px] font-medium text-primaryDark dark:text-[#cccccc] bg-transparent border-none dark:bg-[#1F2E33] dark:border-gray-600"
        >
          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
            <option key={month} value={index} className="bg-white dark:bg-[#1F2E33] dark:text-[#cccccc]">
              {month}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-7 gap-1.5 ml-2 items-center justify-center w-auto">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="font-medium text-primaryDark dark:text-[#cccccc]">
            {day}
          </div>
        ))}
        {data?.map((activity, index) => (
          <div
            key={index}
            className={`h-[30px] w-auto rounded-lg ${activity?.date ? "" : "opacity-0"}`}
            style={{ backgroundColor: activity?.date ? getColor(activity?.count) : "transparent" }}
            title={activity?.date ? `Date: ${activity?.date}\npapers uploaded: ${activity?.count}` : ""}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ActivityMap;
