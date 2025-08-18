interface HistoryDatas {
  research_object: string;
  history: String;
  created_at: String;
  id: Number;
  search_value: String;
  user_id: Number;
}
interface HistoryDialogProps {
  setIsOptions:(data:any)=>void
  setFormData:(data:any)=>void
  setGenerateOutlineData:(data:any)=>void
  historyDialog: boolean;
  setHistoryDialog: (open: boolean) => void;
  historyDatas: HistoryData[];
  setSingleHistoryDatas:(data:any)=>void
  setAlreadyNoted:(data:boolean)=>void
  isHistoryLoading?:boolean
}
export { HistoryData,HistoryDialogProps  };
