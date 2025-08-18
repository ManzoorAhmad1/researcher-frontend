/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next-nprogress-bar";
import { usePathname } from "next/navigation";
import { FileData, GroupedPdfs, Link, ListViewProps } from "./utils/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Ban,
  CircleCheckBig,
  LoaderCircle,
  MessageSquare,
  MoreVertical,
  Move,
  Pencil,
  Loader as PendingLoader,
  Share2,
  Star,
  Tag,
  Trash,
} from "lucide-react";
import { Tooltip } from "rizzui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import DeleteDialog from "./DeleteDialog";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

const colors = [
  { color: "#E9222229", borderColor: "#E92222" },
  { color: "#F59B1429", borderColor: "#F59B14" },
  { color: "#F5DE1429", borderColor: "#F5DE14" },
  { color: "#079E2829", borderColor: "#079E28" },
  { color: "#D4157E29", borderColor: "#D4157E" },
  { color: "#0E70FF29", borderColor: "#0E70FF" },
  { color: "#8D17B529", borderColor: "#8D17B5" },
];

const ListView: React.FC<ListViewProps> = ({
  apiDatas,
  loading,
  fetchData,
}) => {
  const router = useRouter();
  const pathName = usePathname();
  const [dropdownValue, setDropdwonValue] = useState("Keyword");
  const [tableData, setTableData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [pdfInfo, setPdfInfo] = useState<{ id: string; title: string }>({
    id: "",
    title: "",
  });

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
          : value === "Ciation"
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

  const handleExpandClick = (paperId: string) => {
    setExpandedRows((prev) =>
      prev.includes(paperId)
        ? prev.filter((id) => id !== paperId)
        : [...prev, paperId]
    );
  };

  const compareColor: any = (color: any, per: any) => {
    const matchedColor = colors.find((c) => c.color === color);
    if (matchedColor) {
      return matchedColor?.borderColor;
    } else {
      return color.slice(0, -2);
    }
  };

  const handleNodeClick = (id: any) => {
    router.push(`/info/${id}`);
  };

  const handleNavigate = (id: string) => {
    router.push(`/info/${id}?tab=chat`);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setTableData([]);

    if (!loading) {
      setTimeout(() => {
        if (apiDatas?.length > 0) {
          const allTableData = groupPdfsByKeywords(
            apiDatas,
            dropdownValue
          ).filter((item) => item?.children?.length > 1);

          setTableData(allTableData);
          setIsLoading(false);
        } else {
          setTableData([]);
          setIsLoading(false);
        }
      }, 2000);
    }
  }, [apiDatas, dropdownValue]);

  return (
    <>
      <div className="flex justify-between mb-6">
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
                "Ciation",
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
        <Table className="overflow-hidden">
          <TableBody>
            {tableData?.length > 0 ? (
              tableData.map((paper: any, i: number) => (
                <>
                  <TableRow
                    key={paper?.paperId}
                    className={`${i !== 0 && "border-t"}`}
                  >
                    <TableCell
                      className="px-4 cursor-pointer select-none"
                      onClick={() => handleExpandClick(paper?.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex justify-center items-center gap-2  text-xs font-medium ms-2">
                          {paper?.name}
                        </div>
                        <span className="cursor-pointer">
                          {expandedRows?.includes(paper?.id) ? (
                            <FaChevronDown className="text-md" />
                          ) : (
                            <FaChevronRight className="text-md" />
                          )}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                  {expandedRows?.includes(paper?.id) && (
                    <div className="mx-5 my-3">
                      <Table className="overflow-hidden border border-[#DDDDDD]">
                        <TableHeader className="rounded-xl overflow-hidden">
                          <TableRow className="bg-[#F5F5F5] rounded-xl hover:bg-[none] dark:bg-[#3A474B]">
                            <TableHead>
                              <div className="ms-4">Title</div>
                            </TableHead>
                            <TableHead>Tage</TableHead>
                            <TableHead>Citation</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        {paper?.children?.map((pdf: any, i: number) => {
                          return (
                            <TableRow
                              key={paper?.paperId}
                              className={`border-t`}
                              onClick={() => handleNodeClick(pdf?.id)}
                            >
                              <TableCell className="px-4 cursor-pointer select-none">
                                <div className="flex items-center justify-between">
                                  <div className="flex justify-center items-center gap-2 text-xs font-medium ms-2">
                                    <span>
                                      <svg
                                        width="36"
                                        height="36"
                                        viewBox="0 0 40 40"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <rect
                                          x="0.5"
                                          y="0.5"
                                          width="39"
                                          height="39"
                                          rx="19.5"
                                          fill="#DCE1E8"
                                        />
                                        <rect
                                          x="0.5"
                                          y="0.5"
                                          width="39"
                                          height="39"
                                          rx="19.5"
                                          stroke="#143965"
                                        />
                                        <path
                                          fill-rule="evenodd"
                                          clip-rule="evenodd"
                                          d="M28.1868 17.7273C28.6208 17.7273 28.9998 18.0432 29 18.4773V29.0909C29 29.9951 28.6839 30.8622 28.1213 31.5015C27.5587 32.1408 26.7956 32.5 26 32.5H14C13.2044 32.5 12.4413 32.1408 11.8787 31.5015C11.3161 30.8622 11 29.9951 11 29.0909V10.9091C11 10.0049 11.3161 9.13783 11.8787 8.4985C12.4413 7.85917 13.2044 7.5 14 7.5H19.34C19.7271 7.50025 20 7.84572 20 8.23285V13.1818C20 14.3873 20.4214 15.5435 21.1716 16.3959C21.9217 17.2484 22.9391 17.7273 24 17.7273H28.1868ZM19 22.2727H15C14.7348 22.2727 14.4804 22.3925 14.2929 22.6056C14.1054 22.8187 14 23.1077 14 23.4091C14 23.7105 14.1054 23.9995 14.2929 24.2126C14.4804 24.4257 14.7348 24.5455 15 24.5455H19C19.2652 24.5455 19.5196 24.4257 19.7071 24.2126C19.8946 23.9995 20 23.7105 20 23.4091C20 23.1077 19.8946 22.8187 19.7071 22.6056C19.5196 22.3925 19.2652 22.2727 19 22.2727ZM14.2929 28.7581C14.4804 28.9712 14.7348 29.0909 15 29.0909H25C25.2652 29.0909 25.5196 28.9712 25.7071 28.7581C25.8946 28.545 26 28.2559 26 27.9545C26 27.6532 25.8946 27.3641 25.7071 27.151C25.5196 26.9379 25.2652 26.8182 25 26.8182H15C14.7348 26.8182 14.4804 26.9379 14.2929 27.151C14.1054 27.3641 14 27.6532 14 27.9545C14 28.2559 14.1054 28.545 14.2929 28.7581ZM22 8.29187V13.3289C22.0018 14.0367 22.2487 14.7148 22.6866 15.2153C23.1245 15.7158 23.7179 15.9979 24.3372 16H28.7058C28.8281 16 28.8936 15.865 28.813 15.773L22.1987 8.21369C22.1262 8.13092 22 8.1819 22 8.29187Z"
                                          fill="#143965"
                                        />
                                      </svg>
                                    </span>
                                    {pdf?.pdf_search_data?.Title}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="table-cell align-top">
                                {pdf.tags && pdf.tags.length > 0 ? (
                                  <div>
                                    <div className="flex">
                                      {pdf.tags
                                        .slice(0, 2)
                                        .map((tag: any, index: any) => (
                                          <div
                                            key={index}
                                            style={{
                                              backgroundColor:
                                                tag.color && tag.color,
                                              color: compareColor(tag.color),
                                            }}
                                            className="inline-block px-2 py-1 mx-1 my-1 text-sm rounded-lg cursor-pointer"
                                          >
                                            {tag.name}
                                          </div>
                                        ))}
                                    </div>

                                    {pdf.tags.length > 2 && (
                                      <div className="flex mt-1">
                                        <div
                                          style={{
                                            backgroundColor: pdf.tags[2].color,
                                            color: compareColor(
                                              pdf.tags[2].color
                                            ),
                                          }}
                                          className="inline-block px-2 py-1 mx-1 my-1 whitespace-nowrap text-sm rounded-lg cursor-pointer"
                                        >
                                          {pdf.tags[2].name}
                                        </div>

                                        {pdf.tags.length > 3 && (
                                          <Tooltip
                                            color="invert"
                                            content={
                                              <div className="flex space-x-2 ">
                                                {pdf.tags
                                                  .slice(3)
                                                  .map((t: any, index: any) => (
                                                    <div
                                                      key={index}
                                                      style={{
                                                        backgroundColor:
                                                          t.color,
                                                        color: compareColor(
                                                          t.color
                                                        ),
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
                                                {pdf.tags.length - 3} +
                                              </span>
                                            </div>
                                          </Tooltip>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground line-clamp-1">
                                    No Tag
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="align-top">
                                <div className="flex justify-center items-center">
                                  {pdf?.CitationCount}
                                </div>
                              </TableCell>
                              <TableCell className="hidden w-[fit-content] sm:table-cell align-top">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`flex items-center text-nowrap  gap-[6px] w-fit px-[10px] py-[7px] rounded-[7px] text-xs ${
                                      pdf.ai_status === "processing" ||
                                      pdf.ai_status === "Pending Upload"
                                        ? "bg-yellow-200 text-yellow-600"
                                        : pdf.ai_status === "completed"
                                        ? "bg-green-200 text-green-600"
                                        : "bg-red-200 text-red-600"
                                    }`}
                                  >
                                    {pdf.ai_status === "processing" ? (
                                      <OptimizedImage
                                        src={
                                          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//clockIcon.svg`
                                        }
                                        alt="clock"
                                        width={16}
                                        height={16}
                                        className="!h-4 !w-4"
                                      />
                                    ) : pdf.ai_status === "completed" ? (
                                      <CircleCheckBig width={16} height={16} />
                                    ) : pdf.ai_status === "Pending Upload" ? (
                                      <PendingLoader width={16} height={16} />
                                    ) : (
                                      <Ban width={16} height={16} />
                                    )}
                                    {pdf.ai_status === "processing"
                                      ? "Processing"
                                      : pdf.ai_status === "completed"
                                      ? "Completed"
                                      : pdf.ai_status === "Pending Upload"
                                      ? "Pending Upload"
                                      : "Failed"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 border-none  bg-transparent rounded-full focus:bg-[#0E70FF33]  transition duration-200 ease-in-out"
                                      onClick={handleDropdownClick}
                                    >
                                      <MoreVertical className=" opacity-30  h-[18px] w-[18px]" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    onClick={handleDropdownClick}
                                    className="p-4 bg-inputBackground "
                                  >
                                    <DropdownMenuItem
                                      onSelect={() => {
                                        setIsOpen(true);
                                        setPdfInfo({
                                          title: pdf?.pdf_search_data?.Title,
                                          id: pdf?.id,
                                        });
                                      }}
                                      className="gap-3 font-size-normal font-normal text-lightGray"
                                    >
                                      <Trash
                                        className="h-[18px] w-[18px]"
                                        color="#CCCCCC"
                                      />{" "}
                                      Delete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={() => handleNavigate(pdf?.id)}
                                      className="gap-3 cursor-pointer font-size-normal font-normal text-lightGray"
                                    >
                                      <MessageSquare
                                        className="h-[18px] w-[18px]"
                                        color="#CCCCCC"
                                      />{" "}
                                      AI Chat
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </Table>
                    </div>
                  )}
                </>
              ))
            ) : (
              <div className="flex justify-center items-center flex-col h-[70vh] bg-[#FAFAFA] dark:bg-[#020818]">
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
          </TableBody>
        </Table>
      )}

      <DeleteDialog
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(!isOpen)}
        pdfInfo={pdfInfo}
        fetchData={fetchData}
      />
    </>
  );
};

export default ListView;
