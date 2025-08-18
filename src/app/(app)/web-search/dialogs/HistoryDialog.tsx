import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HistoryData, HistoryDialogProps } from "../utils/types";
import { FaHistory } from "react-icons/fa";
import { timeAgo } from "@/components/coman/timeAgo";
import { Loader } from "rizzui";

const HistoryDialog: React.FC<HistoryDialogProps> = ({
  setValue,
  setApiRes,
  historyDialog,
  setAlreadyNoted,
  setHistoryDialog,
  historyDatas,
  setSingleHistoryDatas,
  isHistoryLoading,
}) => {
  const handleClick = (historyData: HistoryData) => {
    setApiRes(historyData?.answer as string);
    setValue("search", historyData?.search_value);
    setAlreadyNoted(historyData?.save_in_notes);
    setSingleHistoryDatas(historyData);
    setHistoryDialog(false);
  };

  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Dialog open={historyDialog} onOpenChange={() => setHistoryDialog(false)}>
      <DialogContent className="max-w-[600px] max-h-[95vh] overflow-y-auto">
        <DialogTitle className="px-2">History</DialogTitle>
        <div className="mt-4">
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
                  className="flex justify-between py-2 items-center hover:bg-slate-100 dark:hover:bg-[#38464c] dark:text-[#999997] cursor-pointer px-2 rounded-md"
                >
                  <div className="w-full">
                    <div className="flex items-center gap-2">
                      <FaHistory className="text-xl text-[#00000087] dark:text-[#999997]" />
                      <span className=" line-clamp-1 w-full capitalize">
                        {historyData?.search_value}
                      </span>
                    </div>
                  </div>
                  <div className=" w-32">
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
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;
