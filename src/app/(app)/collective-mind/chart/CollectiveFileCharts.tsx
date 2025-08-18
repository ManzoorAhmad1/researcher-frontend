/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveSwarmPlot } from "@nivo/swarmplot";
import { useRouter } from "next-nprogress-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDown, LoaderCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { CollectiveFileChartsProps, FileData } from "../utils/types";
import { AppDispatch, RootState } from "@/reducer/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import "./slider.css";
import {
  celarChartData,
  collectiveMindFetchSwarmplotData,
  setChartData,
} from "@/reducer/collective-mide/collectiveMindSlice";
import { values } from "lodash";
import { OptimizedImage } from "@/components/ui/optimized-image";

export const CollectiveFileCharts: React.FC<CollectiveFileChartsProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [dropdownValue, setDropdwonValue] = useState("Keyword");
  const [yearFilterValue, setYearFilterValue] = useState({
    label: "Select",
    value: "Select",
  });
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [allOption, setAllOption] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string[]>([]);
  const { lightMode } = useSelector((state: RootState) => state.userUtils);
  const user_id = useSelector((state: any) => state?.user?.user?.user?.id);
  const {
    swarmplotloading,
    swarmplotChartDataInfo,
    allSwarmplotChartData,
    swarmplotChartData,
  } = useSelector((state: any) => state.collectiveMind);
  const [value, setValue] = useState<[number, number]>([
    swarmplotChartDataInfo?.minYear,
    swarmplotChartDataInfo?.maxYear,
  ]);

  const data = [
    {
      color: "#079E2829",
      borderColor: "#079E28",
      name: "PDF",
    },
    {
      color: "#0E70FF29",
      borderColor: "#0E70FF",
      name: "Web source",
    },
    {
      color: "#8D17B529",
      borderColor: "#8D17B5",
      name: "Academic Papers",
    },
  ];
  const yearFilter = [
    { value: currentYear - 1, label: "Last year" },
    { value: currentYear - 2, label: "Last 2 year" },
    { value: currentYear - 3, label: "Last 3 year" },
    { value: currentYear - 5, label: "Last 5 year" },
  ];

  const handleNodeClick = (node: any) => {
    if (node?.data.type === "pdf") {
      router.push(`/info/${node?.data.id}`);
    } else {
      window.open(node?.data?.openAccessPdf?.url, "_blank");
    }
  };

  const handleChangeOption = (item: string) => {
    setSelectedOption((prev) => {
      const updatedOptions = prev.includes(item)
        ? prev.filter((option) => option !== item)
        : [...prev, item];

      const updatedChartData = allSwarmplotChartData?.filter((chartData: any) =>
        updatedOptions.includes(chartData?.group)
      );
      dispatch(setChartData(updatedChartData));

      return updatedOptions;
    });
  };

  const handleRangeChange = (value: [number, number]) => {
    setValue(value);
    const filtered = allSwarmplotChartData?.filter(
      (item: any) => item.year >= value[0] && item.year <= value[1]
    );
    dispatch(setChartData(filtered));
  };

  const handleYearChange = (item: { label: string; value: string }) => {
    if (yearFilterValue.value === item.value) {
      setYearFilterValue({ label: "Select", value: "Select" });
      dispatch(celarChartData());
    } else {
      const filtered = allSwarmplotChartData?.filter(
        (el: any) => el.year >= item.value
      );
      setYearFilterValue(item);
      dispatch(setChartData(filtered));
    }
  };

  useEffect(() => {
    if (user_id && allSwarmplotChartData?.length === 0) {
      dispatch(
        collectiveMindFetchSwarmplotData({ user_id, values: dropdownValue })
      );
    }
  }, [dispatch, user_id]);

  useEffect(() => {
    setValue([
      swarmplotChartDataInfo?.minYear,
      swarmplotChartDataInfo?.maxYear,
    ]);
    setAllOption(swarmplotChartDataInfo?.keywords);
    setSelectedOption(swarmplotChartDataInfo?.keywords);
  }, [allSwarmplotChartData?.length]);

  return (
    <div>
      <div className="fil flex w-full overflow-hidden">
        <div className="flex gap-2 p-4 bg-white rounded-md flex-col w-[250px] dark:bg-[#202E33] h-[100vh] overflow-y-auto overflow-x-hidden">
          <div />
          <label className="text-[12px] mt-3">Filter by:</label>
          <div className="w-full">
            <Select
              onValueChange={(value) => {
                setDropdwonValue(value);
                dispatch(
                  collectiveMindFetchSwarmplotData({ user_id, values: value })
                );
              }}
              defaultValue={dropdownValue}
            >
              <SelectTrigger className="ring-0 !w-full focus:ring-0 focus:outline-none focus:ring-offset-[-2px]">
                <span>{dropdownValue}</span>
              </SelectTrigger>
              <SelectContent>
                {[
                  "Keyword",
                  "Tags",
                  "Title",
                  "Author",
                  "Publication Year",
                  "Ciation",
                ]?.map((item, i) => (
                  <SelectItem key={i} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {allSwarmplotChartData?.length > 0 && (
            <>
              <div className="mt-4">
                <label className="text-[12px]">Publication Year Range</label>
                <RangeSlider
                  className="mt-3"
                  value={value}
                  onInput={handleRangeChange}
                  min={swarmplotChartDataInfo?.minYear}
                  max={swarmplotChartDataInfo?.maxYear}
                />
              </div>

              <div className="flex justify-between text-[12px]">
                <div>{swarmplotChartDataInfo?.minYear}</div>
                <div>{swarmplotChartDataInfo?.maxYear}</div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="dropdownMenuTrigger mt-3 justify-between  gap-2 items-center w-full flex h-10  rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 ring-0 focus:ring-0 focus:outline-none focus:ring-offset-[-2px]">
                  <div className="w-full flex justify-between">
                    <span>{yearFilterValue.label}</span>
                  </div>

                  <ChevronDown size={"12px"} color="#0E70FF" />
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent
                    className="dropdownMenu p-2 bg-inputBackground w-[200px]"
                    align="start"
                  >
                    {yearFilter?.map((item: any, i: number) => (
                      <DropdownMenuItem
                        key={i}
                        className="cursor-pointer px-2 py-1 flex gap-2"
                        onClick={() => handleYearChange(item)}
                      >
                        <Checkbox
                          checked={yearFilterValue?.value == item?.value}
                          aria-label="Select all"
                          style={{
                            width: "16px",
                            height: "16px",
                          }}
                        />
                        <span className="truncate">{item?.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="dropdownMenuTrigger mt-3 justify-between  gap-2 items-center w-full flex h-10  rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 ring-0 focus:ring-0 focus:outline-none focus:ring-offset-[-2px]">
                  <p className="text-xs font-normal flex justify-center items-center gap-1">
                    {selectedOption?.length > 0 ? (
                      <>
                        <span className="bg-[#D8E8FF] h-[20px] w-[20px] rounded-full flex justify-center items-center text-black">
                          {selectedOption?.length}
                        </span>{" "}
                        Selected{" "}
                      </>
                    ) : (
                      "Selected"
                    )}
                  </p>
                  <ChevronDown size={"12px"} color="#0E70FF" />
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent
                    className="dropdownMenu p-2 bg-inputBackground w-[200px]"
                    align="start"
                  >
                    {allOption?.map((item: any, i: number) => (
                      <DropdownMenuItem
                        key={i}
                        className="cursor-pointer px-2 py-1 flex gap-2"
                        onClick={() => handleChangeOption(item)}
                      >
                        <Checkbox
                          checked={selectedOption?.includes(item)}
                          aria-label="Select all"
                          style={{
                            width: "16px",
                            height: "16px",
                          }}
                        />
                        <span className="truncate">{item}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedOption?.length > 0 &&
                  selectedOption?.map((item: any, i: number) => {
                    return (
                      <div
                        key={i}
                        onClick={() => handleChangeOption(item)}
                        className="text-[12px] flex justify-center cursor-pointer items-center gap-1 bg-[#D8E8FF] rounded-3xl p-1 px-3"
                      >
                        <span className="text-black truncate max-w-[120px] overflow-hidden whitespace-nowrap">
                          {item}
                        </span>
                        <span className="text-red-600">x</span>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
        {swarmplotloading ? (
          <div className="flex justify-center items-center h-[68vh] w-full">
            <LoaderCircle className="animate-spin h-10 w-10 mx-auto" />
          </div>
        ) : (
          <>
            {swarmplotChartData?.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <div className="flex ms-10">
                  {data?.map((item: any) => {
                    return (
                      <div
                        key={item.color}
                        className="flex items-center gap-2 border p-2 ms-2 rounded-xl"
                      >
                        <div
                          style={{
                            background: item.color,
                            borderColor: item?.borderColor,
                          }}
                          className="h-[15px] w-[15px] rounded-full border"
                        />
                        <div>{item?.name}</div>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="relative w-[1200px] h-[700px]"
                  style={
                    swarmplotChartDataInfo?.longestKeyword?.length *
                      swarmplotChartDataInfo?.keywords?.length *
                      15 >
                    1200
                      ? {
                          width: `${
                            swarmplotChartDataInfo?.longestKeyword?.length *
                            swarmplotChartDataInfo?.keywords?.length *
                            15
                          }px`,
                        }
                      : { width: "100%" }
                  }
                >
                  <>
                    <ResponsiveSwarmPlot
                      data={swarmplotChartData}
                      useMesh={true}
                      tooltip={(node: any) => (
                        <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded-md shadow-md">
                          <div>{node?.data?.pdf_search_data?.Title}</div>
                        </div>
                      )}
                      groups={selectedOption}
                      value="year"
                      valueScale={{
                        type: "linear",
                        min: swarmplotChartDataInfo?.minYear,
                        max: swarmplotChartDataInfo?.maxYear,
                        reverse: false,
                      }}
                      size={{
                        key: "volume",
                        values: [4, 20],
                        sizes: [6, 20],
                      }}
                      forceStrength={4}
                      simulationIterations={100}
                      borderColor={{
                        from: "color",
                        modifiers: [
                          ["darker", 0.6],
                          ["opacity", 0.5],
                        ],
                      }}
                      margin={{ top: 80, right: 100, bottom: 80, left: 100 }}
                      theme={{
                        axis: {
                          ticks: {
                            text: {
                              fill: lightMode ? "#DDDDDD" : "black",
                            },
                          },
                          legend: {
                            text: {
                              fill: lightMode ? "#DDDDDD" : "black",
                            },
                          },
                        },
                      }}
                      axisLeft={{
                        format: (value) => {
                          const stringValue = value.toString();
                          return stringValue.includes(".")
                            ? ""
                            : Math.round(value);
                        },
                      }}
                      axisRight={{
                        format: (value) => {
                          const stringValue = value.toString();
                          return stringValue.includes(".")
                            ? ""
                            : Math.round(value);
                        },
                      }}
                      onClick={handleNodeClick}
                      layers={[
                        "grid",
                        "axes",
                        (props) =>
                          props.nodes.map((node: any) => (
                            <circle
                              key={node.id}
                              cx={node.x}
                              cy={node.y}
                              r={node.size / 2}
                              fill={node?.data?.color}
                              stroke={node.data.borderColor}
                              strokeWidth={1}
                              onClick={() => handleNodeClick(node)}
                              style={{ cursor: "pointer" }}
                            />
                          )),
                        "mesh",
                      ]}
                    />
                  </>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center flex-col h-[70vh] w-full">
                <OptimizedImage
                  src={
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//ai-robot.png`
                  }
                  alt=""
                  className="max-w-[750px]"
                  width={350}
                  height={350}
                />
                <div className="text-center text-xl font-semibold mt-8 dark:text-[#CCCCCC]">
                  Oops! No data available.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default CollectiveFileCharts;

interface CustomNodeProps {
  node: any;
  x: number;
  y: number;
  size: number;
  color: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}
const CustomNode: React.FC<CustomNodeProps> = ({
  node,
  x,
  y,
  size,
  color,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  return (
    <circle
      cx={x}
      cy={y}
      r={size / 2}
      fill={color}
      stroke="#000"
      strokeWidth={1}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    />
  );
};
