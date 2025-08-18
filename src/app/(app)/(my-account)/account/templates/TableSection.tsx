"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@/reducer/store";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import {
  TableBody,
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDebounce from "@/hooks/useDebounce";
import { Loader } from "rizzui";
import { ChevronDown, Copy, Dot, SquarePen, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import AddTemplatesDetailDialog from "./TemplatesDetailDialog";
import {
  deleteTemplate,
  getTemplates,
  updateTemplateStatus,
} from "@/apis/templates";
import moment from "moment";
import TableHeaderItem from "@/components/coman/TableHeaderItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/review-stage-select ";
import toast from "react-hot-toast";
import DeleteModal from "@/components/coman/DeleteModal";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Pagination from "@/components/coman/Pagination";

const TableSection = () => {
  const [templateData, setTemplateData] = useState<any[]>([]);
  const [pageNo, setPageNo] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalTemplates, setTotalTemplates] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpenAddTemplate, setIsOpenAddTemplate] = useState("");
  const [tableRowData, setTableRowData] = useState<any>(null);
  const [sortDirection, setSortDirection] = useState<string>("DESC");
  const [orderBy, setOrderBy] = useState<string>("created_at");
  const searchRef: any = useRef<HTMLInputElement>(null);
  const [fileId, setFileId] = useState<number | null>(null);
  const debouncedQuery = useDebounce<string>(searchQuery, 1000);
  const [isDeleteItem, setIsDeleteItem] = useState<any>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const { socket } = useSocket();
  const { user } = useSelector(
    (state: RootState) => state.user?.user || "",
    shallowEqual
  );
  const [loadingStatus, setLoadingStatus] = useState<{[key: number]: boolean}>({});
  const [previousStatus, setPreviousStatus] = useState<{[key: number]: string}>({});

  useEffect(() => {
    setPageNo(0);
    setLimit(10);
    handleGetTemplates();
  }, [debouncedQuery]);

  useEffect(() => {
    if (searchRef.current && !loading) {
      searchRef.current.focus();
    }
  }, [loading]);

  useEffect(() => {
    if (socket === null) {
      return;
    }
    if (socket) {
      socket.on("fileProcessing", (fileProcessing: any) => {
        handleGetTemplates(true);
      });

      socket.on("projectDeleted", (projectDeleted: any) => {
        handleGetTemplates(true);
      });
      socket.on("projectUpdated", (projectUpdated: any) => {
        handleGetTemplates(true);
      });

      socket.on("templateDeleted", (templateDeleted: any) => {
        handleGetTemplates(true);
      });

      socket.on("fileDeleted", (fileDeleted: any) => {
        handleGetTemplates(true);
      });

      return () => {
        socket.off("fileProcessing");
        socket.off("projectDeleted");
        socket.off("fileDeleted");
        socket.off("projectUpdated");
        socket.off("templateDeleted");
      };
    }
  }, [socket]);

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const filterData = async () => {
      const lastCheckTime = localStorage.getItem("lastCreditCheckTime");
      const currentTime = new Date().getTime();

      if (!lastCheckTime || currentTime - parseInt(lastCheckTime) > 3600000) {
        const { forward, message, mode } = (await verifyCreditApi(
          user?.id
        )) as { forward: boolean; message: string; mode: string };
        localStorage.setItem("lastCreditCheckTime", currentTime.toString());
      }
    };

    filterData();
  }, [user?.id]);

  const handleGetTemplates = async (restrictRefresh?: boolean) => {
    try {
      if (!restrictRefresh) {
        setLoading(true);
      }

      let response = await getTemplates({
        pageNo: pageNo,
        limit: limit,
        search: searchQuery,
        orderBy: orderBy,
        sortDirection: sortDirection,
      });

      setTemplateData(response?.data?.templates?.data || []);
      setTotalTemplates(response?.data?.templates?.count || 0);
    } catch (error: any) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetTemplates();
  }, [limit, pageNo, orderBy, sortDirection]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handelSorting = (orderBy: string) => {
    setPageNo(1);
    setLimit(10);
    setSortDirection((prev) => (prev === "DESC" ? "ASC" : "DESC"));
    setOrderBy(orderBy);
  };

  const handleFileStatus = async (status: string, id: number) => {
    setPreviousStatus(prev => ({...prev, [id]: templateData.find(t => t.id === id)?.status || ''}));
    setLoadingStatus(prev => ({...prev, [id]: true}));
    try {
      const response = await updateTemplateStatus({ status }, id);
      if (response) {
        await new Promise(resolve => setTimeout(resolve, 500));
        handleGetTemplates(true).then(() => {
          setLoadingStatus(prev => ({...prev, [id]: false}));
          setPreviousStatus(prev => ({...prev, [id]: ''}));
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "An error occurred");
      setLoadingStatus(prev => ({...prev, [id]: false}));
      setPreviousStatus(prev => ({...prev, [id]: ''}));
    }
  };
  const handleDeleteTemp = async () => {
    setIsDeleteLoading(true);

    try {
      let result: any;
      result = await deleteTemplate(isDeleteItem?.id);
      if (result) {
        toast.success(
          `Template "${isDeleteItem.template_name}" has been successfully deleted.`
        );
        setIsDeleteItem(null);
        handleGetTemplates();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPageNo(1);
  };

  return (
    <>
      <Card className="bg-secondaryBackground border-tableBorder px-4">
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Button
              onClick={() => setIsOpenAddTemplate("create_template")}
              className="rounded-[26px] btn dark:text-white"
            >
              + Create New Template
            </Button>
          </div>
        </CardHeader>
        <>
          <div className="overflow-x-auto max-w-[1500px]">
            <div className="flex items-center justify-between pb-1">
              <div className="flex py-1 max-w-sm gap-4">
                <div className="relative w-full">
                  <input
                    ref={searchRef}
                    autoFocus
                    disabled={loading}
                    type="text"
                    id="simple-search"
                    onChange={(e) => handleSearchChange(e)}
                    value={searchQuery}
                    className="bg-inputBackground border outline-none dark:text-white border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                    placeholder="Search Templates..."
                    required
                  />
                </div>
              </div>
            </div>

            <Table className="w-full px-0">
              <TableHeader className="relative">
                <TableRow>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"Template Name"}
                      handelSorting={handelSorting}
                      fieldName="template_name"
                    />
                  </TableHead>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"Created Date"}
                      handelSorting={handelSorting}
                      fieldName="created_at"
                    />
                  </TableHead>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"Type"}
                      handelSorting={handelSorting}
                      fieldName="type"
                    />
                  </TableHead>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"Status"}
                      handelSorting={handelSorting}
                      fieldName="status"
                    />
                  </TableHead>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"Projects Using"}
                      handelSorting={handelSorting}
                      fieldName="projects_using"
                    />
                  </TableHead>
                  <TableHead>
                    <TableHeaderItem
                      columnName={"Documents Using"}
                      handelSorting={handelSorting}
                      fieldName="total_files"
                    />
                  </TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <>
                {!loading && templateData.length > 0 ? (
                  <TableBody>
                    {templateData?.map((temp, index) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer font-normal"
                      >
                        <TableCell className="font-medium">
                          {temp?.template_name}
                        </TableCell>
                        <TableCell>
                          <div className="break-words text-justify overflow-hidden">
                            {moment(temp.updated_at).format("MMMM Do YYYY")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="">{temp?.type}</div>
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={temp.status}
                            onValueChange={(status: string) => {
                              handleFileStatus(status, temp.id);
                            }}
                          >
                            <SelectTrigger  className="w-max border-none bg-transparent focus:ring-0 focus:ring-offset-0">
                              {loadingStatus[temp.id] ? (
                                <Badge
                                  variant={
                                    previousStatus[temp.id] === "draft"
                                      ? "draft"
                                      : "live"
                                  }
                                >
                                  <Loader
                                    variant="threeDot"
                                    size="sm"
                                  />
                                </Badge>
                              ) : (
                                <>
                                  {temp?.status && (
                                    <Badge
                                      variant={
                                        temp?.status === "draft"
                                          ? "draft"
                                          : "live"
                                      }
                                    >
                                      <span className="capitalize">
                                        {temp.status}
                                      </span>
                                      <ChevronDown
                                        size={"12px"}
                                        className="ml-1"
                                      />
                                    </Badge>
                                  )}
                                </>
                              )}
                            </SelectTrigger>
                            <SelectContent className="bg-headerBackground">
                              <SelectItem value="live" className="text-xs">
                                Live
                              </SelectItem>
                              <SelectItem value="draft" className="text-xs">
                                Draft
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{temp?.projects_using}</span>
                              </TooltipTrigger>

                              {temp?.projects_using !== 0 && (
                                <TooltipContent className="border border-tableBorder text-left w-full max-w-[300px] max-h-[205px] overflow-y-auto font-size-small z-10 rounded-sm bg-headerBackground pl-1 pr-2 py-2 text-darkGray duration-200">
                                  <div className="flex flex-col ">
                                    {temp?.projects?.map(
                                      (project: any, index: number) => (
                                        <span
                                          className="break-words whitespace-normal flex place-items-start "
                                          key={index}
                                        >
                                          <Dot className="w-[18px] h-[18px] text-primary flex-shrink-0" />
                                          <span className="break-words">
                                            {project?.name}
                                          </span>
                                        </span>
                                      )
                                    )}
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{temp?.total_files}</span>
                              </TooltipTrigger>

                              {temp?.total_files !== 0 && (
                                <TooltipContent className="border border-tableBorder text-left w-full max-w-[300px] max-h-[205px] overflow-y-auto font-size-small z-10 rounded-sm bg-headerBackground pl-1 pr-2 py-2 text-darkGray duration-200">
                                  <div className="flex flex-col gap-1">
                                    {temp?.file_details?.map(
                                      (detail: any, detailIndex: number) =>
                                        detail.files?.map(
                                          (file: any, fileIndex: number) => (
                                            <span
                                              key={`${detailIndex}-${fileIndex}`}
                                              className="break-words whitespace-normal flex place-items-start"
                                            >
                                              <Dot className="w-[18px] h-[18px] text-primary flex-shrink-0" />
                                              <span className="break-words">
                                                {file.name}
                                              </span>
                                            </span>
                                          )
                                        )
                                    )}
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-4  flex-row ">
                            {temp.type !== "Standard" && (
                              <>
                                <SquarePen
                                  onClick={() => {
                                    setIsOpenAddTemplate("edit_template");
                                    setTableRowData(temp);
                                  }}
                                />

                                <Trash2
                                  color="red"
                                  className="order-3"
                                  onClick={() => setIsDeleteItem(temp)}
                                />
                              </>
                            )}
                            <Copy
                              onClick={(e) => {
                                setIsOpenAddTemplate("template_name");
                                setTableRowData(temp);
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                ) : (
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={7} className="h-64">
                        {loading ? (
                          <div className="flex justify-center items-center h-full">
                            <Loader variant="threeDot" size="lg" />
                          </div>
                        ) : (
                          <div className="flex justify-center items-center h-full">
                            <p className="text-center text-wrap lg:text-nowrap">
                              You have not created any template yet. Begin by creating one.
                            </p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </>
            </Table>

            {!loading && totalTemplates > 0 && (
              <div className="bg-secondaryBackground pb-3">
                <Pagination
                  totalPages={totalTemplates}
                  handlePagination={handlePageChange}
                  currentPage={pageNo}
                  perPageLimit={limit}
                  setPerPageLimit={handleLimitChange}
                />
              </div>
            )}
          </div>
        </>
        {isOpenAddTemplate && (
          <AddTemplatesDetailDialog
            template={tableRowData}
            isOpen={isOpenAddTemplate}
            handleGetTemplates={handleGetTemplates}
            onOpenChange={() => {
              setIsOpenAddTemplate("");
              setTableRowData(null);
            }}
          />
        )}

        <DeleteModal
          isDeleteItem={!!isDeleteItem}
          setIsDeleteItem={setIsDeleteItem}
          loading={isDeleteLoading}
          handleDelete={handleDeleteTemp}
          Title={"Delete Template"}
          heading={"Are you sure you want to delete this Template?"}
          subheading={
            isDeleteItem?.projects_using || isDeleteItem?.total_files
              ? `This template is associated with ${
                  isDeleteItem?.projects_using
                    ? `${isDeleteItem.projects_using} project${
                        isDeleteItem.projects_using > 1 ? "s" : ""
                      }`
                    : ""
                }${
                  isDeleteItem?.projects_using && isDeleteItem?.total_files
                    ? " and "
                    : ""
                }${
                  isDeleteItem?.total_files
                    ? `${isDeleteItem.total_files} document${
                        isDeleteItem.total_files > 1 ? "s" : ""
                      }`
                    : ""
                }.`
              : undefined
          }
          message={"This action cannot be undone."}
          isDeletable={!!isDeleteItem?.projects_using}
        />
      </Card>
    </>
  );
};

export default TableSection;
