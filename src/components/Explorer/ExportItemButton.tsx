"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CircleCheckBig, Ban } from "lucide-react";
import { Tooltip } from "rizzui";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  exportToBibTex,
  exportToCSV,
  exportToPDF,
  exportToPubMed,
  exportToRis,
} from "@/utils/zoteroImportAndExport";
import { Tags } from "@/app/(app)/knowledge-bank/utils/types";
import { OptimizedImage } from "../ui/optimized-image";

interface ExportItemButton {
  itemId: string | string[];
  itemName?: string;
  isOpen: boolean;
  data?: any;
  onOpenChange: (isOpen: boolean) => void;
}

export const ExportItemButton: React.FC<ExportItemButton> = ({
  itemId,
  itemName,
  isOpen,
  data,
  onOpenChange,
}) => {
  const [PDFData, setPDFData] = React.useState<any>({});
  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let query = supabase.from("filedocs").select("*");

        if (Array.isArray(itemId)) {
          query = query.in("id", itemId);
        } else {
          query = query.eq("id", itemId);
        }

        const { data, error } = await query;

        if (data) {
          setPDFData(data);
        } else {
          console.error("Error fetching data:", error);
        }
      } catch (error) {
        console.error("Unexpected error fetching data:", error);
      }
    };

    fetchData();
  }, [itemId]);

  let allTags: Tags[] = [];

  const matchingObject = data?.files?.find((file: any) => file?.id === itemId);

  const getFileNames = (data: any) => {
    const truncateFileName = (fileName: string) => {
      const words = fileName.split(" ");
      return words.length > 4 ? `${words.slice(0, 4).join(" ")}....` : fileName;
    };

    if (Array.isArray(data) && data.length > 0) {
      if (data.length === 1) {
        return truncateFileName(data[0].file_name);
      } else {
        return (
          <ul className="list-disc pl-5">
            {data.map((item: any, index: number) => (
              <li key={index}>{truncateFileName(item.file_name)}</li>
            ))}
          </ul>
        );
      }
    }
    return null;
  };

  const fileNames = getFileNames(PDFData);

  if (matchingObject && matchingObject.tags) {
    allTags = matchingObject?.tags?.map((tag: any) => ({
      name: tag?.name,
      color: tag?.color,
    }));
  }

  const colors = [
    { color: "#E9222229", borderColor: "#E92222" },
    { color: "#F59B1429", borderColor: "#F59B14" },
    { color: "#F5DE1429", borderColor: "#F5DE14" },
    { color: "#079E2829", borderColor: "#079E28" },
    { color: "#D4157E29", borderColor: "#D4157E" },
    { color: "#0E70FF29", borderColor: "#0E70FF" },
    { color: "#8D17B529", borderColor: "#8D17B5" },
  ];
  const compareColor: any = (color: any, per: any) => {
    const matchedColor = colors.find((c) => c.color === color);
    if (matchedColor) {
      return matchedColor?.borderColor;
    } else {
      return color.slice(0, -2);
    }
  };

  const getStatusForItem = (item: any) => {
    return item.ai_status || matchingObject?.ai_status || "failed";
  };

  const [selectedFormat, setSelectedFormat] = useState<string>("");

  const formats = [
    {
      label: "PubMed",
      handler: () => exportToPubMed(PDFData),
      imgSrc:
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//exportmega.svg`,
    },
    {
      label: "PDF",
      handler: () => exportToPDF(PDFData),
      imgSrc:
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//export%20pdf.svg`,
    },
    {
      label: "CSV",
      handler: () => exportToCSV(PDFData),
      imgSrc:
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//CSV.svg`,
    },
    {
      label: "Ris",
      handler: () => exportToRis(PDFData),
      imgSrc:
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//export%20ris.svg`,
    },
    {
      label: "BibTeX",
      handler: () => exportToBibTex(PDFData),
      imgSrc:
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//export%20bib.svg`,
    },
  ];

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
  };

  const exportData = () => {
    if (selectedFormat) {
      const selectedOption = formats.find(
        (format) => format.label === selectedFormat
      );
      if (selectedOption) {
        selectedOption.handler();
      } else {
        alert("Please select a format before exporting.");
      }
    } else {
      alert("Please select a format.");
    }
  };

  const renderStatusIndicator = (status: string) => {
    return (
      <span
        className={`flex items-center mt-1 gap-[6px] w-[fit-content] px-[10px] py-[7px] rounded-[7px] text-xs ${
          status === "processing"
            ? "bg-yellow-200 text-yellow-600"
            : status === "completed"
            ? "bg-green-200 text-green-600"
            : "bg-red-200 text-red-600"
        }`}
      >
        {status === "processing" ? (
          <OptimizedImage
            src={
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//clockIcon.svg`
            }
            alt="clock"
            width={16}
            height={16}
          />
        ) : status === "completed" ? (
          <CircleCheckBig width={16} height={16} />
        ) : (
          <Ban width={16} height={16} />
        )}
        {status === "processing"
          ? "Processing"
          : status === "completed"
          ? "Completed"
          : "Failed"}
      </span>
    );
  };

  return (
    <>
      {isOpen && (
        <>
          <div
            className="h-screen fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => onOpenChange(false)}
          ></div>

          <div
            className="w-[338px] bg-profileDropDown p-4 shadow-lg h-screen overflow-y-auto flex flex-col justify-start gap-y-2 fixed top-0 right-0 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-300 pb-2">
              <span className="text-sm font-size-large font-semibold text-lightGray">
                Export
              </span>
              <X
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
                color="#9A9A9A"
                width={20}
                height={20}
              />
            </div>

            <div className="flex items-start flex-col gap-y-2 mt-3 ">
              <label className="font-size-small font-semibold text-lightGray ">
                Name
              </label>
              <p className="font-size-large font-medium text-left text-darkBlue break-words whitespace-normal w-full ">
                {fileNames || "unknown Name"}
              </p>
            </div>

            <div className="flex flex-col items-start gap-y-2">
              {Object.keys(PDFData).length > 0 && (
                <>
                  <label
                    htmlFor="name"
                    className="font-size-small font-semibold mt-1 text-lightGray"
                  >
                    Tags
                  </label>
                  <div className="flex gap-x-2">
                    <div className="flex flex-wrap gap-2">
                      {allTags && allTags.length > 0 ? (
                        <div>
                          <div className="flex">
                            {allTags.slice(0, 2).map((tag, index) => (
                              <div
                                key={index}
                                style={{
                                  backgroundColor: tag.color,
                                  color: compareColor(tag.color),
                                }}
                                className="inline-block px-2 py-1 mx-1 my-1 whitespace-nowrap text-sm rounded-full cursor-pointer"
                              >
                                {tag.name}
                              </div>
                            ))}
                          </div>

                          {allTags?.length > 2 && (
                            <div className="flex mt-1">
                              <div
                                style={{
                                  backgroundColor: allTags[2].color,
                                  color: compareColor(allTags[2].color),
                                }}
                                className="inline-block px-2 py-1 mx-1 my-1 whitespace-nowrap text-sm rounded-full cursor-pointer"
                              >
                                {allTags[2].name}
                              </div>

                              {allTags?.length > 3 && (
                                <Tooltip
                                  color="invert"
                                  content={
                                    <div className="flex space-x-2">
                                      {allTags.slice(3).map((t, index) => (
                                        <div
                                          key={index}
                                          style={{
                                            backgroundColor: t.color,
                                            color: compareColor(t.color),
                                          }}
                                          className="px-2 py-1 my-1 text-sm rounded-lg"
                                        >
                                          {t.name}
                                        </div>
                                      ))}
                                    </div>
                                  }
                                  placement="top"
                                >
                                  <div className="inline-block px-2 py-1 mx-1 my-1 text-sm rounded-2xl border border-blue-400">
                                    <span className="text-blue-400">
                                      {allTags.length - 3} +
                                    </span>
                                  </div>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No Tag</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {Object.keys(PDFData).length > 0 && (
                <div className="flex flex-col items-start mt-2">
                  <label
                    htmlFor="name"
                    className="font-size-small font-semibold text-lightGray capitalize"
                  >
                    STATUS
                  </label>
                  {Array.isArray(PDFData)
                    ? PDFData.map((item, index) => (
                        <div key={index} className="mb-1">
                          {renderStatusIndicator(getStatusForItem(item))}
                        </div>
                      ))
                    : renderStatusIndicator(getStatusForItem(PDFData))}
                </div>
              )}
            </div>

            <div className="flex flex-col w-full mt-4">
              {formats.map((format) => (
                <div
                  onClick={() => handleFormatChange(format.label)}
                  key={format.label}
                  className="flex items-center border-b p-2 gap-x-2"
                >
                  <input
                    type="radio"
                    name="options"
                    className="radio-button"
                    onChange={() => handleFormatChange(format.label)}
                    checked={selectedFormat === format.label}
                  />
                  <OptimizedImage
                    src={format.imgSrc}
                    alt={format.label}
                    width={30}
                    height={30}
                  />
                  <span className="font-normal text-lightGray font-size-normal">
                    {format.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-x-4 pr-3 mt-3">
              <button
                onClick={() => onOpenChange(false)}
                className="bg-white border font-medium font-size-normal border-blue-600 px-3 py-1 text-blue-600 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={exportData}
                className="bg-blue-600 font-medium font-size-normal text-white rounded-full px-3 py-1 border-2 border-blue-500"
              >
                Export
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
