/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { TableProperties } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Tooltip } from "rizzui";
import { ShowMoreDialog } from "./ShowMoreDialog";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

export function ContentInclutionTableDialogForAutoGen({
  sourceData,
  keyTitle
}: any) {
  const [open, setOpen] = useState(false);
  const [allData, setAllData] = useState(sourceData);
  const colors = [
    { color: "#E9222229", borderColor: "#E92222" },
    { color: "#F59B1429", borderColor: "#F59B14" },
    { color: "#F5DE1429", borderColor: "#F5AC14" },
    { color: "#079E2829", borderColor: "#079E28" },
    { color: "#D4157E29", borderColor: "#D4157E" },
    { color: "#0E70FF29", borderColor: "#0E70FF" },
    { color: "#8D17B529", borderColor: "#8D17B5" },
  ];

  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  useEffect(()=>{
    setAllData(sourceData)
  },[sourceData])

  const CapitalizeString = (i:string) => {
    return i.charAt(0).toUpperCase() + i.slice(1)
  }

  return (
    <>
      {/* <Layers
        onClick={() => setOpen(true)}
        className="text-sm font-normal cursor-pointer h-[15px]"
      /> */}
      <div className="flex" onClick={() => setOpen(true)}>
        <button
          className="flex items-center space-x-2 px-2 py-1 whitespace-nowrap text-xs cursor-pointer rounded-2xl border border-blue-400 text-blue-400"
          type="button"
        >
          <span>Relevancy Details</span>
          <span>{sourceData.length} Sources</span>
          <TableProperties
            className="text-sm font-normal cursor-pointer h-[15px]"
          />
        </button>
      </div>

      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false);
        }}
      >
        <DialogContent
          className="max-w-[900px] max-h-[600px] overflow-scroll"
          onFocusOutside={() => {
            setOpen(false);
          }}
        >
          <div>
            <DialogHeader className="mb-3 flex justify-center items-center text-2xl">
              Papers Evaluation Table
            </DialogHeader>
              <div className="max-h-[80vh] mt-5">
                {allData?.length > 0 ? (
                  <div className="rounded-md">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      {/* <thead className="sticky top-0 z-10"> */}
                      <thead className="">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">
                            #
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">
                            Type
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">
                            Title
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">
                            Relevance
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">
                            Key Points
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">
                            Show More
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {allData
                          ?.filter((item: any) => item?.extracted?.OCR)
                          ?.sort((a: any, b: any) => {
                            const getRank = (relevance: string) => {
                              switch (relevance?.toLowerCase()) {
                                case "high":
                                  return 0;
                                case "medium":
                                  return 1;
                                case "low":
                                  return 2;
                                default:
                                  return 3;
                              }
                            };
                            return (
                              getRank(a.extracted?.Relevance) -
                              getRank(b.extracted?.Relevance)
                            );
                          })
                          ?.map((paper: any, i: number) => (
                            <tr key={i} className="">
                              <td className="px-4 py-2">{i + 1}</td>
                              <td className="px-4 py-2">
                                {paper.type === "paper" ? (
                                  <div className="flex flex-col justify-center items-center gap-2 cursor-pointer">
                                    <DescriptionOutlinedIcon />
                                    {CapitalizeString(paper.type)}
                                  </div>
                                ) : (
                                  <div className="flex flex-col justify-center items-center gap-2 cursor-pointer">
                                    <PublicOutlinedIcon />
                                    {CapitalizeString(paper.type)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-2">
                                <a
                                  href={paper.extracted?.Link || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {paper.title}
                                </a>
                              </td>
                              <td className="px-4 py-2">
                                {paper.extracted?.Relevance || "N/A"}
                              </td>
                              <td className="px-4 py-2 whitespace-pre-line max-w-xs break-words">
                                {paper.extracted?.KeyPoints &&
                                  paper.extracted?.KeyPoints.length > 0 && (
                                    <div className="flex flex-wrap gap-1 max-w-full">
                                      {paper.extracted?.KeyPoints?.slice(
                                        0,
                                        3
                                      ).map((tag: any, index: number) => {
                                        const { color, borderColor } =
                                          getRandomColor();
                                        return (
                                          <div
                                            key={index}
                                            className="inline-block px-2 py-1 whitespace-nowrap text-xs rounded-sm cursor-pointer"
                                            style={{
                                              maxWidth: "150px",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              backgroundColor: color,
                                              // border: `1px solid ${borderColor}`,
                                              color: borderColor,
                                            }}
                                            title={tag}
                                          >
                                            {CapitalizeString(tag)}
                                          </div>
                                        );
                                      })}

                                      {paper.extracted?.KeyPoints.length >
                                        3 && (
                                        <Tooltip
                                          color="invert"
                                          content={
                                            <div className="flex flex-wrap gap-1 max-w-full">
                                              {paper.extracted?.KeyPoints?.slice(
                                                3
                                              ).map((t: any, index: number) => {
                                                const { color, borderColor } =
                                                  getRandomColor();
                                                return (
                                                  <div
                                                    key={index}
                                                    className="inline-block px-2 py-1 whitespace-nowrap text-xs rounded-sm cursor-pointer"
                                                    style={{
                                                      maxWidth: "150px",
                                                      overflow: "hidden",
                                                      textOverflow: "ellipsis",
                                                      backgroundColor: color,
                                                      // border: `1px solid ${borderColor}`,
                                                      color: borderColor,
                                                    }}
                                                    title={t}
                                                  >
                                                    {CapitalizeString(t)}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          }
                                          placement="top"
                                        >
                                          <div className="inline-block px-2 py-1 whitespace-nowrap text-xs cursor-pointer rounded-2xl border border-blue-400">
                                            <span className="text-blue-400">
                                              {paper.extracted?.KeyPoints
                                                .length - 3}{" "}
                                              +
                                            </span>
                                          </div>
                                        </Tooltip>
                                      )}
                                    </div>
                                  )}
                              </td>
                              <td className="px-4 py-2">
                                <ShowMoreDialog
                                  Reason={paper.extracted?.Reason ?? ""}
                                  Section={
                                    paper.extracted?.Section?.length > 0
                                      ? paper.extracted?.Section
                                      : []
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                        {allData
                          ?.filter((item: any) => !item?.extracted?.OCR)
                          ?.map((paper: any, i: number) => (
                            <tr key={i} className="">
                              <td className="px-4 py-2">
                                {allData?.filter(
                                  (item: any) => item?.extracted?.OCR
                                )?.length +
                                  i +
                                  1}
                              </td>
                              <td className="px-4 py-2">
                                <span className="mr-2">
                                  {paper.type === "paper" ? (
                                    <div className="flex flex-col justify-center items-center gap-2 cursor-pointer">
                                      <DescriptionOutlinedIcon />
                                      {CapitalizeString(paper.type)}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col justify-center items-center gap-2 cursor-pointer">
                                      <PublicOutlinedIcon />
                                      {CapitalizeString(paper.type)}
                                    </div>
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <a
                                  href={paper.extracted?.Link || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {paper.title}
                                </a>
                              </td>
                              <td className="px-4 py-2">
                                {paper.extracted?.Relevance || "N/A"}
                              </td>
                              <td className="px-4 py-2 whitespace-pre-line max-w-xs break-words">
                                {paper.extracted?.KeyPoints.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 max-w-full">
                                    {paper.extracted?.KeyPoints?.slice(
                                      0,
                                      3
                                    ).map((tag: any, index: number) => {
                                      const { color, borderColor } =
                                        getRandomColor();
                                      return (
                                        <div
                                          key={index}
                                          className="inline-block px-2 py-1 whitespace-nowrap text-xs rounded-sm cursor-pointer"
                                          style={{
                                            maxWidth: "150px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            backgroundColor: color,
                                            // border: `1px solid ${borderColor}`,
                                            color: borderColor,
                                          }}
                                          title={tag}
                                        >
                                          {CapitalizeString(tag)}
                                        </div>
                                      );
                                    })}

                                    {paper.extracted?.KeyPoints.length > 3 && (
                                      <Tooltip
                                        color="invert"
                                        content={
                                          <div className="flex flex-wrap gap-1 max-w-full">
                                            {paper.extracted?.KeyPoints?.slice(
                                              3
                                            ).map((t: any, index: number) => {
                                              const { color, borderColor } =
                                                getRandomColor();
                                              return (
                                                <div
                                                  key={index}
                                                  className="inline-block px-2 py-1 whitespace-nowrap text-xs rounded-sm cursor-pointer"
                                                  style={{
                                                    maxWidth: "150px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    backgroundColor: color,
                                                    // border: `1px solid ${borderColor}`,
                                                    color: borderColor,
                                                  }}
                                                  title={t}
                                                >
                                                  {CapitalizeString(t)}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        }
                                        placement="top"
                                      >
                                        <div className="inline-block px-2 py-1 whitespace-nowrap text-xs cursor-pointer rounded-2xl border border-blue-400">
                                          <span className="text-blue-400">
                                            {paper.extracted?.KeyPoints.length -
                                              3}{" "}
                                            +
                                          </span>
                                        </div>
                                      </Tooltip>
                                    )}
                                  </div>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="px-4 py-2">
                                {paper.extracted?.Reason ||
                                paper.extracted?.Section?.length > 0 ? (
                                  <ShowMoreDialog
                                    Reason={paper.extracted?.Reason ?? ""}
                                    Section={
                                      paper.extracted?.Section?.length > 0
                                        ? paper.extracted?.Section
                                        : []
                                    }
                                  />
                                ) : (
                                  "N/A"
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-40 grid place-content-center text-gray-500">
                    No papers to show.
                  </div>
                )}
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
