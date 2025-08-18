"use client";
import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Loader } from "rizzui";
import { Column } from "primereact/column";
import { useSelector } from "react-redux";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { axiosInstancePrivate } from "@/utils/request";
import { createClient } from "@/utils/supabase/client";
import CustomPagination from "@/components/coman/CustomPagination";
import ExampleCustomInput from "@/utils/components/filterFunction";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import history from "@/images/icons/creative-thinking-icons/history.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreditHistoryData } from "./types";
import { RootState } from "@/reducer/store";
import { SupabaseClient } from "@supabase/supabase-js";
import "./ai-credits.css";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface TableProps {}
const TopicTable: React.FC<TableProps> = () => {
  const [totalPages, setTotalPages] = useState<number>(0);
  const [products, setProducts] = useState<CreditHistoryData[]>([]);
  const [historyData, setHistoryData] = useState<CreditHistoryData[]>([]);
  const [openHistoryModel, setOpenHistoryModel] = useState(false);
  const [nextData, setNextData] = useState(false);
  const [currentPage, setCurrentPate] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<any>();
  const [firstLoader, setFirstLoader] = useState(false);

  const supabase: SupabaseClient = createClient();
  const userData = useSelector((state: RootState) => state.user);
  const perPageLimit = 10;

  const getCredit = async (page = 1, date: any | Date = null) => {
    setFirstLoader(true);
    setCurrentPate(page);
    try {
      const { data } = await axiosInstancePrivate.post(
        `/project/user-topic-data`,
        {
          data: {
            userid: userData?.user?.user?.id,
            page,
            perPageLimit,
            date,
            startDate,
          },
        }
      );

      if (data?.data?.length) {
        if (page === 1) {
          setProducts(data.data.slice(0, 8));
        }
        setHistoryData(data.data);
      } else {
        setHistoryData([]);
      }

      setTotalPages(data?.totalPages ?? 0);
    } catch (error: any) {
      console.error(`History Table API Error: ${error.response.data.message}`);
    }
    setFirstLoader(false);
  };

  const getData = async () => {
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

  return (
    <>
      <div className="border border-[#E5E5E5] dark:border-[#2B383E] rounded-md">
        <div className="flex justify-between p-4">
          <div className="text-[14px] text-[#333333] dark:text-[#CCCCCC] flex items-center font-medium">
            Topic Analysis History
          </div>
          <button
            type="button"
            className="button-full"
            onClick={chatHistoryModel}
          >
            <OptimizedImage
              src={
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//history.png`
              }
              alt="history-icon"
              width={ImageSizes.icon.xs.width}
              height={ImageSizes.icon.xs.height}
            />
            <span> View History</span>
          </button>
        </div>
        <div className="border border-[#E5E5E5] dark:border-[#2B383E] rounded-md card dark:bg-black">
          {firstLoader ? (
            <div className="flex items-center justify-center">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <DataTable
              value={products}
              className="min-w-fit dark:custom-datatable"
              emptyMessage="No data available"
              rowClassName={() =>
                "border-b border-gray-300 dark:border-gray-700"
              }
            >
              <Column
                field="topic"
                header="TOPIC TITLE"
                style={{ padding: "12px 15px", fontSize: "14px" }}
                headerClassName="dark:bg-[#223036] dark:text-[#999999]"
                bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"
              ></Column>
              <Column
                field="date"
                header="DATE"
                style={{ padding: "12px 15px", fontSize: "14px" }}
                headerClassName="dark:bg-[#223036] dark:text-[#999999]"
                bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"
              ></Column>
            </DataTable>
          )}
        </div>
      </div>

      <Dialog open={openHistoryModel} onOpenChange={chatHistoryModel}>
        <DialogContent className="max-h-full  overflow-y-auto max-w-4xl">
          <DialogHeader>
            <DialogTitle>Topic Analysis History</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            <div className="border border-[#E5E5E5] dark:border-[#2B383E] rounded-md card dark:bg-black">
              <DataTable
                value={historyData}
                className="h-[500px] dark:bg-[#15252a] min-w-fit dark:custom-datatable"
                emptyMessage={
                  <div className="flex dark:bg-[#15252a] items-center justify-center h-full w-full text-center">
                    No data available
                  </div>
                }
              >
                <Column
                  field="topic"
                  header="TOPIC TITLE"
                  style={{ padding: "12px 15px", fontSize: "14px" }}
                  headerClassName="dark:bg-[#223036] dark:text-[#999999]"
                  bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"
                ></Column>
                <Column
                  field="date"
                  header="DATE"
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
const Table = React.memo(TopicTable);
export default Table;
