export interface TopicAnalysisBodyProps {
  topicAnalysis: any;
  singleTopicAnalysis: any;
}

export interface TopicAnalysisSidebarProps {
  topicAnalysis: any;
  isActive: number | undefined;
  setIsActive: (item) => void;
  addToNote: () => void;
  alreadyNoted: boolean;
  setSingleTopicAnalysis: (item) => void;
  inputValue: string;
}

export interface HistoryDialogProps {
  historyDialog: boolean;
  setHistoryDialog: (item) => void;
  handleSingleHistory: (item) => void;
}

export interface HistoryData {
  created_at: string;
  user_id: number;
  workspace_id: string;
  value: string;
  data: ApiRes[];
  save_in_notes: boolean;
  unique: boolean;
}

export interface ApiRes {
  entry_summaries: string[];
  expert_advice: ExpertAdvice[];
  research_topic: string;
  synthesis: string[];
}

export interface ExpertAdvice {
  title: string;
  opportunities: string;
  expert_insight: string;
  risks_challenges: string;
  guiding_questions: string;
  real_world_examples: string;
}
