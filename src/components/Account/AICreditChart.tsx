import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const AIChart = ({ seriesData, allMonths }: any) => {
  const [isDarkMode, setDarkMode] = useState<boolean>(
    typeof document !== "undefined" && document.body.classList.contains("dark")
  );

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

  // Transform data for proper display
  const processedSeriesData = [
    {
      name: "Usage",
      data: seriesData[0]?.data ? [0, ...seriesData[0]?.data] : [0],
      type: "line",
    },
    {
      name: "Total Monthly Credits",
      data: seriesData[1]?.data
        ? [
            0,
            ...Array(seriesData[0]?.data?.length || 0).fill(
              seriesData[1]?.data[0] || 25000
            ),
          ]
        : [0, 25000],
      type: "line",
    },
    {
      name: "Remaining Credits",
      data: seriesData[2]?.data ? [0, ...seriesData[2]?.data] : [0],
      type: "line",
    },
  ];

  // Append '0' to the beginning of months
  const processedMonths = ["0", ...(allMonths || [])];

  return (
    <div className={`p-4 h-full w-full `}>
      <div className="w-full flex items-center justify-between">
        <div>
          <h2
            className={`font-size-normal font-medium ${
              isDarkMode ? "text-white" : "text-primaryDark"
            }`}
          >
            AI Credit
          </h2>
        </div>
        <div className="flex gap-4">
          <p className="font-size-small font-medium text-darkGray">
            <span className="inline-block mr-2 w-2 h-2 rounded-full bg-[#F59B14]"></span>
            Usage
          </p>
          <p className="font-size-small font-medium text-darkGray">
            <span className="inline-block mr-2 w-2 h-2 rounded-full bg-[#3b82f6]"></span>
            Total Monthly Credits
          </p>
          <p className="font-size-small font-medium text-darkGray">
            <span className="inline-block mr-2 w-2 h-2 rounded-full bg-[#22c55e]"></span>
            Remaining Credits
          </p>
        </div>
      </div>
      <div className="h-full w-full pb-[11px]">
        <ReactApexChart
          options={{
            tooltip: {
              enabled: true,
              shared: true,
              intersect: false,
              theme: isDarkMode ? "dark" : "light",
              y: {
                formatter: (value: any) => {
                  return value !== undefined ? value.toLocaleString() : value;
                },
              },
            },
            chart: {
              height: 250,
              type: "line",
              toolbar: {
                show: false,
              },
              animations: {
                enabled: true,
                speed: 800,
                animateGradually: {
                  enabled: true,
                  delay: 150,
                },
                dynamicAnimation: {
                  enabled: true,
                  speed: 350,
                },
              },
            },
            stroke: {
              curve: "straight",
              width: [3, 3, 3],
              dashArray: [0, 0, 0],
            },
            colors: ["#F59B14", "#3b82f6", "#22c55e"],
            dataLabels: {
              enabled: false,
            },
            fill: {
              type: ["solid", "solid", "solid"],
            },
            legend: {
              show: false,
            },
            xaxis: {
              type: "category",
              categories: processedMonths,
              labels: {
                style: {
                  fontSize: "11px",
                  colors: isDarkMode ? "#cccccc" : "#666666",
                },
              },
              axisBorder: {
                show: false,
              },
              tickAmount: processedMonths.length - 1,
            },
            yaxis: {
              min: 0,
              max: seriesData[1]?.data?.length && seriesData[1]?.data[0],
              labels: {
                formatter: (value: any) => {
                  if (value < 1000) {
                    return `${Math.round(value)}`;
                  }
                  return `${Math.round(value / 1000)}k`;
                },
                style: {
                  colors: isDarkMode ? "#cccccc" : "#666666",
                },
              },
            },
            grid: {
              show: true,
              borderColor: isDarkMode ? "#303c40" : "#e5e5e5",
              xaxis: {
                lines: {
                  show: false,
                },
              },
            },
            markers: {
              size: 0,
            },
          }}
          series={processedSeriesData}
          type="line"
          height={250}
        />
      </div>
    </div>
  );
};

export default AIChart;
