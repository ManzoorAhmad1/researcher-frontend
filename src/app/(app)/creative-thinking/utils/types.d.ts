interface scamperDataType {
  title: string;
  question: string;
  ans: string;
  id: number;
  interested: boolean;
  icon: string;
  references: string;
}
interface SwipeableCardsDialogProps {
  selectedValue: string;
  swipeableCardsDialog: boolean;
  setSwipeableCardsDialog: (open: boolean) => void;
  isScamperData: scamperDataType[];
  setIsScamperData: Dispatch<SetStateAction<scamperDataType[]>>;
  scamperDataId: number;
}
interface SingleSwipeableCardProps {
  swipeableCardsDialog: boolean;
  setSwipeableCardsDialog: (open: boolean) => void;
  singleScamperData: scamperDataType[];
  isScamperData: scamperDataType[];
  scamperDataId: number;
  totalCards: number;
  setIsScamperData: Dispatch<SetStateAction<scamperDataType[]>>;
}

interface CardProps {
  zIndex?: number;
  cards?: any;
  reamingCard: any;
  totalCards?: number;
}

interface ScamperCardsProps {
  scamperDataId: numbe;
  inputValue: string;
  isTopicValue: string;
  isScamperData: scamperDataType[];
  interested?: boolean[];
  setIsScamperData: Dispatch<SetStateAction<scamperDataType[]>>;
}
interface DataType {
  id: number;
  created_at: string;
  keyword_type: string;
  user_id: number;
  keyword_name: string;
  scamper_datas: ScamperData[];
  icon: any;
}
interface HistoryDialogProps {
  keywordType: string;
  historyDialog: boolean;
  setHistoryDialog: (open: boolean) => void;
  scamperDatas: ScamperData[];
}
interface SwipeableCardsProps {
  cards: Array;
  totalCards?: number;
  handleInterested: (data: string) => void;
  remove: () => void;
}

export {
  scamperDataType,
  SwipeableCardsProps,
  CardProps,
  DataType,
  ScamperCardsProps,
  HistoryDialogProps,
  ScamperItem,
  SingleSwipeableCardProps,
  SwipeableCardsDialogProps,
};
