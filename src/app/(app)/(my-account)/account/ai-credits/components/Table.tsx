"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import toast from "react-hot-toast";
import { useSelector, shallowEqual } from "react-redux";
import { Loader } from "rizzui";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import ExampleCustomInput from "@/utils/components/filterFunction";
import CustomPagination from "@/components/coman/CustomPagination";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreditHistoryData } from "../utils/types";
import { RootState } from "@/reducer/store";
import { SupabaseClient } from "@supabase/supabase-js";
import { formatDate } from "@/utils/fetchApi";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import { fetchCreditHistoryByDate } from "@/apis/user";

interface TableProps { }
const CreditTable: React.FC<TableProps> = () => {
  const [products, setProducts] = useState<CreditHistoryData[]>([]);
  const [historyData, setHistoryData] = useState<CreditHistoryData[]>([]);
  const [openHistoryModel, setOpenHistoryModel] = useState(false);
  const [nextData, setNextData] = useState(false);
  const [currentPage, setCurrentPate] = useState(1);
  const [allDataCount, setAllDataCount] = useState<number>(0);
  const [firstLoader, setFirstLoader] = useState(false);
  const [secondLoader, setSecondLoader] = useState(false);
  const [startDate, setStartDate] = useState<any>();

  const supabase: SupabaseClient = createClient();
  const userData = useSelector((state: RootState) => state.user, shallowEqual);
  const perPageLimit = 10;

  const notifyAPI = async (payload: any) => {
    try {
      getCredit();
    } catch (error) {
      console.error("Error notifying API:", error);
    }
  };

  const subscribeToTableChanges = () => {
    const channel = supabase.channel("table-watcher");

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "credit_history" },
      async (payload) => {
        console.log("New record inserted:", payload);
        await notifyAPI(payload);
      }
    );

    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "credit_history" },
      async (payload) => {
        console.log("Record updated:", payload);
        await notifyAPI(payload);
      }
    );

    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "credit_history" },
      async (payload) => {
        console.log("Record deleted:", payload);
        await notifyAPI(payload);
      }
    );

    channel.subscribe();
  };

  const getCredit = async (page = 1, date: any | Date = null) => {
    setFirstLoader(true);
    setSecondLoader(true);
    setCurrentPate(page);
    try {
      const offset = (page - 1) * perPageLimit;

      let mainData;
      if (date || startDate) {
        const formattedDate = date
          ? date.toLocaleDateString("en-CA")
          : startDate.toLocaleDateString("en-CA");



        const countdata = await fetchCreditHistoryByDate({
          startDate: `${formattedDate}T00:00:00`,
          endDate: `${formattedDate}T23:59:59`
        }, true);
        setAllDataCount(countdata?.data?.count || 0);
        const data = await fetchCreditHistoryByDate({
          startDate: `${formattedDate}T00:00:00`,
          endDate: `${formattedDate}T23:59:59`,
          offset, perPageLimit
        })

        if (countdata?.data?.isSuccess === false || data?.data?.isSuccess === false) {
          console.error("Error updating questions:", countdata?.data?.message || data?.data?.message);
          toast.error("Failed to retrieve credit history.");
          return;
        } else {
          mainData = data?.data?.data;
        }
      } else {


        const countdata = await fetchCreditHistoryByDate({

        }, true);
        setAllDataCount(countdata?.data?.count || 0);
        const data = await fetchCreditHistoryByDate({
          offset, perPageLimit
        })
        if (data?.data?.isSuccess === false || countdata?.data?.isSuccess === false) {
          console.error("Error updating questions:", data?.data?.message || countdata?.data?.message);
          toast.error("Failed to retrieve credit history.");
          return;
        } else {
          mainData = data?.data?.data;
        }
      }
      if (mainData && mainData?.length > 0) {
        const formateData = mainData.map((value: any) => {
          const reformateDate = formatDate(value.created_at);
          return {
            name: value.activity,
            date: reformateDate,
            credit: value.credit_usage,
            id: value.id,
            ...(value.activity_details && {
              fileTitle: value.activity_details,
            }),
          };
        });
        page == 1 && setProducts(formateData.slice(0, 8));
        setHistoryData(formateData);

        if (mainData.length >= perPageLimit) {
          setNextData(true);
        } else {
          setNextData(false);
        }
      } else {
        console.error("No data returned from the update query.");
        setHistoryData([]);
      }
    } catch (err) {
      console.error("An unexpected error occurred.");
      console.error("Unexpected error in `addQuestion`:", err);
    }
    setFirstLoader(false);
    setSecondLoader(false);
  };

  const getData = async () => {
    subscribeToTableChanges();
    getCredit();
  };

  useEffect(() => {
    getData();
  }, [userData?.user?.user?.id]);

  const chatHistoryModel = () => {
    setOpenHistoryModel(!openHistoryModel);
  };

  const fetchNextData = () => {
    nextData && getCredit(currentPage + 1);
  };

  const fetchPreviousData = () => {
    currentPage !== 1 && getCredit(currentPage - 1);
  };

  const headerTemplate = (field: string, title: string) => (
    <div className="flex items-center justify-between">
      <span>{title}</span>
      <DatePicker
        selected={startDate}
        onChange={(date) => {
          setStartDate(date);
          setCurrentPate(1);
          getCredit(1, date);
        }}
        maxDate={new Date()}
        customInput={<ExampleCustomInput />}
      />
    </div>
  );
  const gotFileTitle = products.some((value) => value.fileTitle);
  const totalPages = Math.ceil(allDataCount / perPageLimit);

  return (
    <>
      <div className="border border-[#E5E5E5] dark:border-[#2B383E] rounded-md">
        <div className="flex justify-between p-4">
          <div className="text-[14px] text-[#333333] dark:text-[#CCCCCC] flex items-center font-medium">
            Credit Usage Breakdown
          </div>
          <button
            type="button"
            className="button-full"
            onClick={chatHistoryModel}
          >
            <OptimizedImage
              width={ImageSizes.icon.xs.width}
              height={ImageSizes.icon.xs.height}
              src={
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//history.png`
              }
              alt="history-icon"
            />
            <span> View History</span>
          </button>
        </div>
        <div className="card dark:bg-black">
          {firstLoader ? (
            <div className="flex items-center justify-center">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <DataTable
              value={products}
              className={`min-w-fit overflow-y-auto ${products.length > 0 ? "max-h-[200px]" : "h-auto"
                }`}
              emptyMessage="No data available"
            >
              <Column
                field="name"
                header="ACTIVITY"
                style={{ padding: "12px 15px", fontSize: "14px" }}
              ></Column>
              {gotFileTitle && (
                <Column
                  field="fileTitle"
                  header="FILE TITLE"
                  className="p-[12px_15px] text-[14px] max-w-[130px] mx-auto leading-[1] overflow-hidden text-ellipsis whitespace-nowrap "
                />
              )}
              <Column
                field="credit"
                header="CREDIT USAGE"
                style={{ padding: "12px 15px", fontSize: "14px" }}
              ></Column>
              <Column
                field="date"
                header="DATE"
                style={{ padding: "12px 15px", fontSize: "14px" }}
              ></Column>
            </DataTable>
          )}
        </div>
      </div>
      <Dialog open={openHistoryModel} onOpenChange={chatHistoryModel}>
        <DialogContent className="max-h-full  overflow-y-auto max-w-4xl">
          <DialogHeader>
            <DialogTitle>Credit History</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            <div className="border border-[#E5E5E5] dark:border-[#2B383E] rounded-md card dark:bg-black">
              <DataTable
                value={historyData}
                className="h-[500px] dark:bg-[#15252a] min-w-fit dark:custom-datatable"
                emptyMessage="No data available"
              >
                <Column
                  field="name"
                  header="ACTIVITY"
                  style={{ padding: "12px 15px", fontSize: "14px" }}
                  headerClassName="dark:bg-[#223036] dark:text-[#999999]"
                  bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"
                ></Column>
                {gotFileTitle && (
                  <Column
                    field="fileTitle"
                    header="FILE TITLE"
                    headerClassName="dark:bg-[#223036] dark:text-[#999999]"
                    className="dark:bg-[#15252a] dark:text-[#ccc] p-[12px_15px] text-[14px] max-w-[130px] mx-auto leading-[1] overflow-hidden text-ellipsis whitespace-nowrap "
                  />
                )}
                <Column
                  field="credit"
                  header="CREDIT USAGE"
                  style={{ padding: "12px 15px", fontSize: "14px" }}
                  headerClassName="dark:bg-[#223036] dark:text-[#999999]"
                  bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"
                ></Column>
                <Column
                  field="date"
                  header={headerTemplate("name", "DATE")}
                  style={{ padding: "12px 15px", fontSize: "14px" }}
                  headerClassName="dark:bg-[#223036] dark:text-[#999999]"
                  bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"
                ></Column>
              </DataTable>

              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page: any) => getCredit(page)}
              />
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};
const Table = React.memo(CreditTable);
export default Table;
