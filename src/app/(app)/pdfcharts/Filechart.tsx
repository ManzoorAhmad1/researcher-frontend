/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveSwarmPlot } from "@nivo/swarmplot";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next-nprogress-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { LoaderCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { getFilesByProject } from "@/apis/files";

type NodeType = {
  id: string;
  depth: number;
  data: any;
};

interface PdfMetadata {
  Top5Keywords: string[];
}
interface Pdf {
  id: number;
  pdf_search_data: PdfMetadata;
  file_name: string;
  size: number;
  tags: any;
  pdf_metadata: any;
}
interface GroupedPdfs {
  name: string;
  children: Pdf[];
}

export default function FileCharts() {
  const supabase: SupabaseClient = createClient();
  const router = useRouter();
  const pathName = usePathname();
  const slug_id = pathName?.replace("/explorer", "");
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any>([]);
  const [allKeyWord, setAllKeyWord] = useState<any>([]);
  const [dropdownValue, setDropdwonValue] = useState("Keyword");
  const [apiData, setApisData] = useState<any>([]);
  const [minAndMaxValues, setMinAndMaxValues] = useState<any>({
    minYear: 0,
    maxYear: 0,
  });
  const project_id = useSelector(
    (state: RootState) => state?.project?.project?.id
  );
  const { lightMode } = useSelector((state: RootState) => state.userUtils);

  const bytesToMB = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(3);
  };

  const processChartData = (data: any[], value: string) => {
    const chartData = groupPdfsByKeywords(data, value).filter(
      (item) => item?.children?.length > 1
    );

    const newChartData = chartData.flatMap((item) => item.children);

    const years = newChartData
      .map((item: any) => item.year)
      .filter((year) => !isNaN(year));

    if (years.length > 0) {
      setMinAndMaxValues({
        minYear: Math.min(...years),
        maxYear: Math.max(...years),
      });
    }

    setAllKeyWord(chartData.map((item) => item.name));
    setChartData(newChartData);
  };

  const groupPdfsByKeywords = (data: Pdf[], value: string): GroupedPdfs[] => {
    const grouped: { [key: string]: Pdf[] } = {};

    data.forEach((pdf) => {
      const allTags =
        pdf?.tags?.length > 0 ? pdf?.tags?.map((item: any) => item?.name?.toLowerCase()) : [];

      const keywords =
        value === "Keyword"
          ? pdf?.pdf_search_data?.Top5Keywords?.map((k) => k?.toLowerCase())
          : allTags;

      const pdfData = {
        ...pdf,
        name: pdf.file_name,
        loc: bytesToMB(pdf?.size),
      };

      keywords?.forEach((keyword: string) => {
        if (!keyword) return;

        if (!grouped[keyword]) {
          grouped[keyword] = [];
        }
        grouped[keyword].push(pdfData);
      });
    });

    return Object.keys(grouped).map((keyword) => ({
      name: keyword,
      id: uuidv4(),
      children: grouped[keyword]?.map((item) => ({
        ...item,
        year: Number(item?.pdf_metadata?.PublicationYear),
        group: keyword,
        volume: 18,
      })),
    }));
  };

  const fetchData = async () => {
    try {
     
      const response = await getFilesByProject(project_id);
      const data = response?.data?.files;

      if (data?.length > 0) {
        await processChartData(data, dropdownValue);
        setApisData(data);
      } else {
        setApisData([]);
        setChartData([]);
      }
    } catch (error) {
      console.error("🚀 ~ fetchData ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setDropdwonValue(value);
    setIsLoading(true);
    setChartData([]);

    setTimeout(() => {
      if (apiData?.length > 0) {
        processChartData(apiData, value);
      } else {
        setChartData([]);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleNodeClick = (node: any) => {
    router.push(`/info${slug_id}/${node?.data.id}`);
  };

  useEffect(() => {
    if (project_id) {
      fetchData();
    }
  }, [project_id]);

  return (
    <div className="file">
      <div className="flex justify-end">
        <div className="w-[150px]">
          <Select
            onValueChange={(value) => handleChange(value)}
            defaultValue={dropdownValue}
          >
            <SelectTrigger className="ring-0 focus:ring-0 focus:outline-none focus:ring-offset-[-2px]">
              <span>{dropdownValue}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Keyword">Keyword</SelectItem>
              <SelectItem value="Tags">Tags</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-[68vh]">
          <LoaderCircle className="animate-spin h-10 w-10 mx-auto" />
        </div>
      ) : (
        <>
          {chartData?.length > 0 ? (
            <div className="overflow-x-hidden w-full">
              <div className="relative min-w-[1200px] h-[600px]">
                <ResponsiveSwarmPlot
                  data={chartData}
                  useMesh={true}
                  tooltip={(node: any) => (
                    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                      <div>{node?.data?.pdf_search_data?.Title}</div>
                    </div>
                  )}
                  groups={allKeyWord}
                  value="year"
                  valueScale={{
                    type: "linear",
                    min: minAndMaxValues?.minYear,
                    max: minAndMaxValues?.maxYear,
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
                      return stringValue.includes(".") ? "" : Math.round(value);
                    },
                  }}
                  axisRight={{
                    format: (value) => {
                      const stringValue = value.toString();
                      return stringValue.includes(".") ? "" : Math.round(value);
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
                          fill={node?.color}
                          stroke="#000"
                          strokeWidth={1}
                          onClick={() => handleNodeClick(node)}
                          style={{ cursor: "pointer" }}
                        />
                      )),
                    "mesh",
                  ]}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center flex-col h-[70vh]">
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
                Oops! No data available.<br />
                Please upload PDF files or documents to get started.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
