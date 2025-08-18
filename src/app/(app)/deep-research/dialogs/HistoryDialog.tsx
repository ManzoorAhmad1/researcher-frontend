import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FaHistory } from "react-icons/fa";
import { timeAgo } from "@/components/coman/timeAgo";
import { Loader } from "rizzui";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useSelector } from "react-redux";
import { getResearchHistory } from "@/apis/research-assistant";
import { captureConsoleIntegration } from "@sentry/nextjs";

interface AIResearchAssistantHistoryDialogProps{
  historyDialog:boolean
  setHistoryDialog:(item:boolean)=>void
  setSteps:(item:any[])=>void
  setMainLoading:(item:boolean)=>void
  setMainProgress:(item:number)=>void
  setForm:(item:any)=>void
  setStartResearchDisabled:(item:boolean)=>void
}

const AIResearchAssistantHistoryDialog: React.FC<AIResearchAssistantHistoryDialogProps> = ({
  historyDialog,
  setHistoryDialog,
  setSteps,
  setMainLoading,
  setMainProgress,
  setForm,
  setStartResearchDisabled,
}) => {
   const supabase: SupabaseClient = createClient();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userData = useSelector((state: any) => state?.user?.user?.user);


  const fetchHistoryData = async () => {
    setIsHistoryLoading(true);
    setError(null);
    try {
      const response = await getResearchHistory()
     

      if (error) throw error;
      setHistoryData(response?.data || []);
    } catch (err: any) {
      setError("Failed to fetch history.");
      console.error(err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (historyDialog) {
      fetchHistoryData();
    }
  }, [historyDialog]);

  const handleClick = (historyData: any) => {
    if (historyDialog) {
      setSteps(historyData?.data)
      setMainLoading(historyData?.loading)
      setMainProgress(historyData?.main_progress)
      setForm({
        inputValue: historyData?.keywords,
        purposeValue: historyData?.purposeValue,
      })
      setStartResearchDisabled(historyData?.outline_generation_analysis)
    }
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
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : historyData?.length > 0 ? (
            historyData.map((historyData, i) => (
              <div
                onClick={() => handleClick(historyData)}
                key={i}
                style={{ transition: "all 0.2s ease-in-out" }}
                className={`flex justify-between py-2 items-center hover:bg-slate-100 dark:hover:bg-[#38464c] dark:text-[#999997] cursor-pointer px-2 rounded-md border-l-4 mb-2 ${
                  historyData?.unique ? "border-emerald-700" : "border-transparent"
                }`}
              >
                <div className="w-full">
                  <div className="flex items-center gap-2">
                    <FaHistory className="text-xl text-[#00000087] dark:text-[#999997]" />
                    <div className="line-clamp-1 w-full capitalize">
                      {historyData?.keywords}
                    </div>
                  </div>
                </div>
                <div className="w-32">
                  <div className="text-[12px] overflow-hidden text-end">
                    {timeAgo(historyData.created_at?.toString(), localTimeZone)}
                  </div>
                </div>
              </div>
            ))
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

export default AIResearchAssistantHistoryDialog;
