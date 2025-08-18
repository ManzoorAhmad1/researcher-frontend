import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HistoryData, HistoryDialogProps } from "../utils/types";
import { FaHistory } from "react-icons/fa";
import { dropdownOptions } from "../utils/const";
import { timeAgo } from "@/components/coman/timeAgo";
import { Loader } from "rizzui";

const HistoryDialog: React.FC<HistoryDialogProps> = ({
  setIsOptions,
  setFormData,
  setGenerateOutlineData,
  historyDialog,
  setHistoryDialog,
  historyDatas,
  setSingleHistoryDatas,
  setAlreadyNoted,
  isHistoryLoading,
}) => {
  const handleClick = (historyData: HistoryData) => {
    setSingleHistoryDatas(historyData);
    setIsOptions(dropdownOptions[historyData?.research_object?.type]);
    setGenerateOutlineData(historyData?.history);
    setFormData(historyData?.research_object);
    setAlreadyNoted(historyData?.save_in_notes);
    setHistoryDialog(false);
  };

  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Dialog open={historyDialog} onOpenChange={() => setHistoryDialog(false)}>
      <DialogContent className="max-w-[600px] max-h-[95vh] overflow-y-hidden">
        <DialogTitle className="px-2 dark:text-[#999997]">History</DialogTitle>
        <div className="mt-4 max-h-[42vh] overflow-y-auto">
          {isHistoryLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : historyDatas?.length > 0 ? (
            historyDatas?.map((historyData, i) => {
              return (
                <div
                  onClick={() => handleClick(historyData)}
                  key={i}
                  style={{ transition: "all 0.2s ease-in-out" }}
                  className={`flex justify-between py-2 items-center hover:bg-slate-100 dark:hover:bg-[#38464c] dark:text-[#999997] cursor-pointer px-2 rounded-md border-l-4 mb-2 ${
                    historyData?.unique
                      ? "border-emerald-700"
                      : "border-transparent"
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center gap-2">
                      <FaHistory className="text-xl text-[#00000087] dark:text-[#999997]" />
                      <div className="line-clamp-1 w-full capitalize">
                        {historyData?.research_object?.search}
                      </div>
                    </div>
                  </div>
                  <div className="w-32">
                    <div className="text-[12px] overflow-hidden text-end">
                      {timeAgo(
                        historyData.created_at?.toString(),
                        localTimeZone
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center pb-4">
              You do not have any history yet.
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white flex justify-end items-center gap-2 text-[14px] italic text-gray-500 dark:bg-[#162227]">
          <div className="h-4 w-4 bg-emerald-700 rounded"></div>Additional
          context provided
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;
