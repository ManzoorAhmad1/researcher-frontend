"use client";
import React, { useState } from "react";
import { Loader } from "rizzui";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import CustomPagination from "@/components/coman/CustomPagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import "./ai-credits.css";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";

interface TableProps {
  products: any[];
  historyData: any[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  tableDataField: any[];
  smallTableName: string;
  mainTableName: string;
  headerTemplate: (field: string, title: string) => void;
  firstLoader?: boolean;
}

const MainTable: React.FC<TableProps> = ({
  products = [],
  historyData = [],
  currentPage = 1,
  totalPages = 0,
  onPageChange,
  tableDataField = [],
  smallTableName = "",
  mainTableName = "",
  headerTemplate,
  firstLoader = false,
}) => {
  const [openHistoryModel, setOpenHistoryModel] = useState(false);

  const chatHistoryModel = () => {
    setOpenHistoryModel(!openHistoryModel);
  };

  return (
    <>
      <div className="border border-[#E5E5E5] dark:border-[#2B383E] rounded-md">
        <div className="flex justify-between p-4">
          <div className="text-[14px] text-[#333333] dark:text-[#CCCCCC] flex items-center font-medium">
            {smallTableName}
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
        <div className="border border-[#E5E5E5] dark:border-[#2B383E] rounded-md card dark:bg-black">
          {firstLoader ? (
            <div className="flex items-center justify-center">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : (
            <DataTable
              value={products}
              className="min-w-fit dark:custom-datatable dark:bg-[#15252a]"
              emptyMessage="No data available"
              rowClassName={() =>
                "border-b border-gray-300 dark:border-gray-700"
              }
            >
              {tableDataField.map((value, index) => {
                return (
                  <Column
                    key={index}
                    field={value?.field}
                    header={value?.header}
                    style={{ padding: "12px 15px", fontSize: "14px" }}
                    headerClassName="dark:bg-[#223036] dark:text-[#999999]"
                    bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"
                  />
                );
              })}
            </DataTable>
          )}
        </div>
      </div>

      <Dialog open={openHistoryModel} onOpenChange={chatHistoryModel}>
        <DialogContent className="max-h-full overflow-y-auto max-w-4xl">
          <DialogHeader>
            <DialogTitle>{mainTableName}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="border border-[#E5E5E5] dark:border-[#2B383E] rounded-md card dark:bg-black">
              <DataTable
                value={historyData}
                className="h-[500px] dark:bg-[#15252a] min-w-fit dark:custom-datatable"
                emptyMessage="No data available"
              >
                {tableDataField.map((value, index) => {
                  return (
                    <Column
                      key={index}
                      field={value?.field}
                      header={
                        value.filter
                          ? headerTemplate("name", value?.header)
                          : value?.header
                      }
                      style={{ padding: "12px 15px", fontSize: "14px" }}
                      headerClassName="dark:bg-[#223036] dark:text-[#999999]"
                      bodyClassName="dark:bg-[#15252a] dark:text-[#cccccc]"
                    />
                  );
                })}
              </DataTable>

              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(MainTable);
