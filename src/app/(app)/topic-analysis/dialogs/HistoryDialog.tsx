/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FaHistory } from "react-icons/fa";
import { timeAgo } from "@/components/coman/timeAgo";
import { HistoryData, HistoryDialogProps } from "../utils/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { Loader } from "rizzui";
import { getUserUserHistory } from "@/apis/topic-explorer";

const HistoryDialog: React.FC<HistoryDialogProps> = ({
  historyDialog,
  setHistoryDialog,
  handleSingleHistory,
}) => {
  const supabase: SupabaseClient = createClient();
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const userData: string | null =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const userInfo = userData ? JSON.parse(userData) : "";
  const { workspace } = useSelector((state: RootState) => state.workspace);

  const handleClick = (historyData: HistoryData) => {
    handleSingleHistory(historyData);
  };

  const history = async () => {
    try {
      const response = await getUserUserHistory(userInfo?.id, workspace?.id)
      

      setHistoryData(response?.data?.length > 0 ? response?.data  : []);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (historyDialog) {
      history();
    }
  }, [historyDialog, workspace?.id]);

  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Dialog open={historyDialog} onOpenChange={() => setHistoryDialog(false)}>
      <DialogContent className="max-w-[600px] max-h-[95vh] overflow-y-hidden">
        <DialogTitle className="px-2">History</DialogTitle>
        <div className="mt-4  max-h-[42vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader variant="threeDot" size="lg" />
            </div>
          ) : historyData?.length > 0 ? (
            historyData?.map((historyData, i) => {
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
                        {historyData?.value}
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
