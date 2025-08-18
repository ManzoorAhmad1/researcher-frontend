interface FormData {
  search: string;
}

interface HistoryData {
  answer: String;
  created_at: String;
  id: number;
  search_value: String;
  user_id: number;
  created_at: String;
  save_in_notes: boolean;
}

interface HistoryDialogProps {
  setValue: Function;
  historyDialog: boolean;
  setApiRes: (data: string) => void;
  setHistoryDialog: (open: boolean) => void;
  setAlreadyNoted: (open: boolean) => void;
  setSingleHistoryDatas: (data: any) => void;
  historyDatas: HistoryData[];
  isHistoryLoading?: boolean;
}

interface ExploreResearchProps {
  aiExploreResearchData: {
    bgLightIconColor: string;
    cardDarkBg: string;
    cardLightBg: string;
    aiTopic: string;
  }[];
  setValue: Function;
  onSubmit: Function;
  handleSubmit: Function;
  setInputValue: Function;
}

export {
  FormData,
  Apibody,
  HistoryDialogProps,
  HistoryData,
  ExploreResearchProps,
};
