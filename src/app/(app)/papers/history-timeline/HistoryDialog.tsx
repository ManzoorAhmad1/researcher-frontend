import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { Empty, Loader, Text } from "rizzui";
import { FaCaretRight, FaCaretDown } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import { createPaperPdf } from "@/apis/explore";
import { useSelector } from "react-redux";
import { FaCheck } from "react-icons/fa6";
import FileRenderer from "../pdfviewer";
import Pagination from "@/utils/components/pagination";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/reducer/store";
import { papersQuestion } from "@/reducer/services/papersSlice";
import { LuRefreshCw } from "react-icons/lu";
import { useRouter } from "next-nprogress-bar";
import { IoIosWarning } from "react-icons/io";
import { getFileHistory } from "@/apis/files";
interface HistoryDialogProps {
  historyDialog: boolean;
  question: string;
  setHistoryDialog: (open: boolean) => void;
  papersDatas: any[];
}

const HistoryDialog: React.FC<HistoryDialogProps> = ({
  question,
  papersDatas,
  historyDialog,
  setHistoryDialog,
}) => {
  const route = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const supabase: SupabaseClient = createClient();
  const userData: string | null = localStorage.getItem("user");
  const userInfo = userData ? JSON.parse(userData) : "";
  const currentWorkspace = useSelector((state: any) => state?.workspace);
  const currentProject = useSelector((state: any) => state?.project);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [selectedPaperUrl, setSelectedPaperUrl] = useState<string>("");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [isAdded, setIsAdded] = useState<{ [key: string]: boolean }>({});
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [pageNo, setPageNo] = useState<number>(1);
  const papersPerPage = 10;

  const handleExpandClick = (paperId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [paperId]: !prev[paperId],
    }));
  };

  const handlePreviewClick = async (url: string) => {
    if (!url) {
      toast.error("No URL available for preview.");
      return;
    }
    try {
      const response = await axios.get(url, {
        responseType: "stream",
        maxRedirects: 10,
      });

      const contentType = response.headers["content-type"];
      const isPdf = contentType.includes("application/pdf");

      if (isPdf) {
        setSelectedPaperUrl(url);
        setTemplateModalOpen(true);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const historyGet = async () => {
    setLoading(true);
    const response = await getFileHistory(userInfo?.id);
    if (response?.data?.data && response?.data?.data?.length > 0) {
      setLoading(false);
    }

    setLoading(false);
  };

  const handleFavourite = async (
    paperId: string,
    url: any,
    title: string,
    citationCount: number
  ) => {
    try {
      setIsLoading((prev: any) => ({
        ...prev,
        [paperId]: true,
      }));

      let response: any = await createPaperPdf({
        title,
        url,
        workspace_id: currentWorkspace?.workspace?.id,
        project_id: currentProject?.project?.id,
        citationCount,
      });

      if (response.status === 200) {
        setIsAdded((prev: any) => ({
          ...prev,
          [paperId]: true,
        }));
        toast.success(response?.data?.message);
      } else {
        toast.error("Some error occurred. Try again!");
      }
    } catch (error: any) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 p-4">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 pt-0.5">
                <IoIosWarning className="text-yellow-500 text-md" />
              </div>
              <div className="flex-1">
                <Text className="text-gray-900 dark:text-gray-100 text-sm whitespace-normal break-words">
                  {error?.response?.data?.message || "An error occurred"}
                </Text>
              </div>
            </div>
          </div>
        </div>
      ));
    } finally {
      setIsLoading((prev: any) => ({
        ...prev,
        [paperId]: false,
      }));
    }
  };

  const handlePageChange = (newPage: number) => {
    setPageNo(newPage);
  };

  const handleRefresh = () => {
    route.push("/papers");
    dispatch(papersQuestion(question));
  };

  const filteredPapers =
    selectedYear && selectedYear !== "All"
      ? papersDatas?.filter((paper) => paper?.year === selectedYear)
      : papersDatas;

  const sortedFilteredPapers = filteredPapers?.sort((a, b) => {
    const aHasPdf = a.openAccessPdf !== null;
    const bHasPdf = b.openAccessPdf !== null;
    if (aHasPdf && !bHasPdf) return -1;
    if (!aHasPdf && bHasPdf) return 1;
    return 0;
  });

  const currentPagePapers = sortedFilteredPapers?.slice(
    (pageNo - 1) * papersPerPage,
    pageNo * papersPerPage
  );

  useEffect(() => {
    historyGet();
  }, []);

  return (
    <div className="flex justify-end">
      <Dialog open={historyDialog} onOpenChange={() => setHistoryDialog(false)}>
        <DialogContent className="fixed left-1/2 top-1/2 z-50 grid w-[90vw] max-w-[1200px] -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg dark:bg-[#202E33] sm:rounded-lg md:w-full max-h-[90vh] overflow-y-auto">
          <DialogTitle className="px-2 dark:text-[#999997] flex justify-between">
            History
            <LuRefreshCw
              className="me-8 text-xl cursor-pointer"
              onClick={handleRefresh}
            />
          </DialogTitle>
          <DialogDescription>
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader variant="threeDot" size="lg" className="ms-1" />
              </div>
            ) : currentPagePapers?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className=" px-4 py-2 ">Title</TableHead>
                    <TableHead className=" px-4 py-2 text-center">
                      Year
                    </TableHead>
                    <TableHead className=" px-4 py-2 text-center">
                      Authors
                    </TableHead>
                    <TableHead className=" px-4 py-2 text-center">
                      Reference Count
                    </TableHead>
                    <TableHead className=" px-4 py-2 text-center">
                      Citation Count
                    </TableHead>
                    <TableHead className=" px-4 py-2 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPagePapers?.map((paper: any) => (
                    <>
                      <TableRow key={paper?.paperId} className="border-t">
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium">
                            <span className="ml-1">
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
                            {paper?.title}
                            <span
                              className="cursor-pointer"
                              onClick={() => handleExpandClick(paper?.paperId)}
                            >
                              {expandedRows[paper?.paperId] ? (
                                <FaCaretDown className="text-xl" />
                              ) : (
                                <FaCaretRight className="text-xl" />
                              )}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className=" px-4 py-2 text-center">
                          <p className="text-sm">{paper?.year}</p>
                        </TableCell>

                        <TableCell className=" px-4 py-2 text-center">
                          <p className="text-sm">
                            {paper?.authors?.length > 0
                              ? paper.authors.map((author: any, index: any) => (
                                  <span key={index}>
                                    {author.name}
                                    {index < paper.authors.length - 1 && ", "}
                                  </span>
                                ))
                              : "No authors available publicly"}
                          </p>
                        </TableCell>

                        <TableCell className=" px-4 py-2 text-center">
                          <p className="text-sm">{paper?.referenceCount}</p>
                        </TableCell>
                        <TableCell className=" px-4 py-2 text-center">
                          <p className="text-sm">{paper?.citationCount}</p>
                        </TableCell>

                        <TableCell className="px-4 py-2 text-center">
                          {paper?.openAccessPdf?.url ? (
                            <>
                              <div className="flex justify-center gap-2 mt-2">
                                <Button
                                  className="h-8 button-full"
                                  variant="outline"
                                  onClick={() => {
                                    handlePreviewClick(
                                      paper?.openAccessPdf?.url
                                    );
                                  }}
                                >
                                  Preview
                                </Button>

                                <Button
                                  className="h-8 bg-blueTh min-w-40 text-black font-semibold flex items-center justify-center bg-[#E2EEFF] rounded-full"
                                  variant="secondary"
                                  onClick={() =>
                                    handleFavourite(
                                      paper?.paperId,
                                      paper?.openAccessPdf?.url,
                                      paper?.title,
                                      paper?.citationCount
                                    )
                                  }
                                  disabled={
                                    isLoading[paper.paperId] ||
                                    isAdded[paper.paperId] ||
                                    paper.is_disable_url
                                  }
                                >
                                  {!paper?.is_disable_url ? (
                                    isLoading[paper?.paperId] ? (
                                      <Loader variant="threeDot" size="sm" />
                                    ) : isAdded[paper.paperId] ? (
                                      <FaCheck className="text-green-500 h-5 w-5" />
                                    ) : (
                                      "Add to My Papers"
                                    )
                                  ) : (
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <line
                                        x1="4"
                                        y1="20"
                                        x2="20"
                                        y2="4"
                                        stroke="red"
                                        stroke-width="4"
                                      />
                                      <line
                                        x1="4"
                                        y1="4"
                                        x2="20"
                                        y2="20"
                                        stroke="red"
                                        stroke-width="4"
                                      />
                                    </svg>
                                  )}
                                </Button>
                              </div>

                              <FileRenderer
                                templateModalOpen={templateModalOpen}
                                setTemplateModalOpen={setTemplateModalOpen}
                                url={selectedPaperUrl}
                              />
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No PDF available
                            </p>
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Expanded Abstract Row */}
                      {expandedRows[paper?.paperId] && (
                        <TableRow
                          key={`abstract-${paper?.paperId}`}
                          className="border-t bg-gray-50"
                        >
                          <TableCell colSpan={6} className="px-4 py-2">
                            <div className="text-sm w-full font-light whitespace-pre-wrap px-4">
                              {paper?.abstract || "No abstract available."}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex justify-center items-center mt-5">
                <Empty
                  text="NO HISTORY FOUND"
                  textClassName="text-gray-300 mt-2"
                  className="w-full mt-2"
                  imageClassName="stroke-gray-200 fill-black"
                />
              </div>
            )}
            {filteredPapers?.length > 10 && (
              <div className="mt-8 flex justify-end px-4 sm:px-6 ">
                <Pagination
                  total={filteredPapers?.length}
                  defaultCurrent={pageNo}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoryDialog;
