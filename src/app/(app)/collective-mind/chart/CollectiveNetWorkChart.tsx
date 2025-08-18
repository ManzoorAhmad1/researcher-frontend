/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveNetwork } from "@nivo/network";
import { v4 as uuidv4 } from "uuid";
import { LoaderCircle } from "lucide-react";
import aiRobot from "@/images/ai-robot.png";
import { useRouter } from "next-nprogress-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import {
  CollectiveNetWorkChartProps,
  FileData,
  GroupedPdfs,
  Link,
  Node,
} from "../utils/types";
import { OptimizedImage } from "@/components/ui/optimized-image";

const CollectiveNetWorkChart: React.FC<CollectiveNetWorkChartProps> = ({
  apiDatas,
  loading,
}) => {
  const router = useRouter();
  const [dropdownValue, setDropdwonValue] = useState("Keyword");
  const [chartData, setChartData] = useState<any>({});
  const [graphAnalysis, setGraphAnalysis] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bytesToMB = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(3);
  };

  const groupPdfsByKeywords = (
    data: FileData[],
    value: string
  ): GroupedPdfs[] => {
    const grouped: { [key: string]: FileData[] } = {};
    data.forEach((pdf) => {
      const allTages =
        pdf?.tags?.length > 0 ? pdf?.tags?.map((item: any) => item?.name) : [];
      const allTitle = [pdf?.file_name];

      const allAuthor =
        pdf?.pdf_category_data?.PublicationDetails?.AuthorAffiliations;

      const publicationYear = [
        pdf?.pdf_category_data?.PublicationDetails?.PublicationYear,
      ];

      const ciation = [pdf?.CitationCount];

      const keywords =
        value === "Keyword"
          ? pdf?.pdf_search_data?.Top5Keywords
          : value === "Title"
          ? allTitle
          : value === "Author"
          ? allAuthor
          : value === "Publication Year"
          ? publicationYear
          : value === "Citations"
          ? ciation
          : allTages;

      const pdfData = {
        ...pdf,
        name: pdf.file_name,
        loc: bytesToMB(pdf?.size),
      };

      keywords?.forEach((keyword: any) => {
        if (!grouped[keyword]) {
          grouped[keyword] = [];
        }
        grouped[keyword].push(pdfData);
      });
    });

    return Object.keys(grouped)?.map((keyword) => {
      const id = uuidv4();
      return {
        name: keyword,
        id: id,
        children: grouped[keyword]?.map((child) => ({
          ...child,
          parent_id: id,
        })),
      };
    });
  };

  function generateLinks(data: Node[]): Link[] {
    const links: Link[] = [];
    const nodeMap: Record<string, Node> = {};
    data.forEach((node) => {
      nodeMap[node.id] = node;
    });
    data.forEach((node) => {
      if (node.menu && nodeMap[node.menu]) {
        links.push({
          source: node.menu,
          target: node.id,
          distance: 80,
          color: "",
        });
      }
    });

    data.forEach((node: any) => {
      if (node.parent_id && nodeMap[node.parent_id]) {
        links.push({
          source: node.parent_id,
          target: node.id,
          distance: 80,
          color: node.borderColor,
        });
      }
    });

    const chartMap: Record<string, string[]> = {};

    data.forEach((node) => {
      if (node.chart_id) {
        if (!chartMap[node.chart_id]) {
          chartMap[node.chart_id] = [];
        }
        chartMap[node.chart_id].push(node.id);
      }
    });

    Object.values(chartMap).forEach((nodes) => {
      if (nodes.length > 1) {
        for (let i = 1; i < nodes.length; i++) {
          links.push({
            source: nodes[0],
            target: nodes[i],
            distance: 80,
            color: "pink",
          });
        }
      }
    });

    return links;
  }

  const handleNodeClick = (node: any) => {
    router.push(`/info/${node?.data.id?.split("/")?.[0]}`);
  };

  useEffect(() => {
    setIsLoading(true);
    setChartData([]);

    if (!loading) {
      setTimeout(() => {
        if (apiDatas?.length > 0) {
          const allChartData = groupPdfsByKeywords(
            apiDatas,
            dropdownValue
          ).filter((item) => item?.children?.length > 1);

          const allKeyWord = allChartData?.map((item, index) => ({
            label: item.name,
            parent_id: "0",
            id: item.id,
            height: 1,
            size: 24,
            color: "rgb(97, 205, 187)",
            borderColor: `hsl(${(index * 40) % 360}, 70%, 50%)`,
          }));

          if (allKeyWord?.length > 0) {
            const pdfAllData = allChartData.flatMap((item: any, index) => {
              return item.children?.flatMap((child: any) => ({
                id: `${child.id}/${child.parent_id}`,
                label: child?.file_name,
                parent_id: child.parent_id,
                height: 0,
                size: 18,
                color: "rgb(232, 193, 160)",
                borderColor: "gray",
              }));
            });

            const newChartData = [
              {
                label: "Root",
                id: "0",
                height: 4,
                size: 52,
                color: "rgb(244, 117, 96)",
              },
              ...allKeyWord,
              ...pdfAllData,
            ];
            setGraphAnalysis(allKeyWord);
            const link = generateLinks(newChartData);
            const finalChartData = { nodes: newChartData, links: link };
            setChartData(finalChartData);
            setIsLoading(false);
          } else {
            setChartData([]);
            setIsLoading(false);
          }
        } else {
          setChartData([]);
          setIsLoading(false);
        }
      }, 2000);
    }
  }, [apiDatas, dropdownValue]);

  return (
    <div style={{ height: "69vh", width: "100%" }} className="relative">
      <div className="flex justify-between">
        <div />

        <div className="w-[150px]">
          <Select
            onValueChange={(value) => setDropdwonValue(value)}
            defaultValue={dropdownValue}
          >
            <SelectTrigger className="ring-0 focus:ring-0 focus:outline-none focus:ring-offset-[-2px]">
              <span>{dropdownValue}</span>
            </SelectTrigger>
            <SelectContent>
              {[
                "Keyword",
                "Tags",
                "Title",
                "Author",
                "Publication Year",
                "Citations",
              ]?.map((item, i) => (
                <SelectItem key={i} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <LoaderCircle className="animate-spin h-10 w-10 mx-auto" />
        </div>
      ) : (
        <>
          {Object.values(chartData).length > 0 ? (
            <>
              <ResponsiveNetwork
                data={chartData}
                linkDistance={(e: any) => e.distance}
                centeringStrength={1.2}
                repulsivity={98}
                iterations={260}
                linkThickness={2}
                nodeSize={(n: any) => n.size}
                nodeColor={(e) => e.color}
                nodeBorderWidth={1}
                nodeBorderColor={{
                  from: "color",
                  modifiers: [["darker", 1.8]],
                }}
                linkColor={(link: any) => {
                  return link?.data.color;
                }}
                nodeTooltip={(item: any) => (
                  <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded-md shadow-md">
                    {item?.node.data.label}
                  </div>
                )}
                theme={{
                  tooltip: {
                    container: {
                      color: "black",
                      fontSize: "12px",
                      borderRadius: "4px",
                      padding: "8px",
                    },
                  },
                }}
                layers={[
                  "links",
                  "nodes",
                  (props) => (
                    <g>
                      {props.nodes.map((node) => {
                        return (
                          <text
                            key={node.id}
                            x={node.x}
                            y={node.y + 3}
                            textAnchor="middle"
                            fontSize={12}
                            style={{ pointerEvents: "none" }}
                            className="dark:fill-white fill-black"
                          >
                            {node.data.label.length > 10
                              ? `${node.data.label.substring(0, 10)}...`
                              : node.data.label}
                          </text>
                        );
                      })}
                    </g>
                  ),
                ]}
                onClick={handleNodeClick}
              />
              <div className="absolute bottom-0 border px-2 pt-2 border-black rounded-md">
                {graphAnalysis?.map((item: any, i: number) => (
                  <div key={i} className="mb-2 flex items-center gap-2">
                    <div
                      className=" w-[16px] h-[16px] rounded-sm"
                      style={{ backgroundColor: item.borderColor }}
                    />
                    <div className="text-[12px]">{item.label}</div>
                  </div>
                ))}
              </div>
            </>
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
                Oops! No data available.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CollectiveNetWorkChart;
