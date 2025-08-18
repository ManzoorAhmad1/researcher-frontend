import { User as SupabaseUser } from '@supabase/supabase-js';

export interface Tag {
  id: Number;
  name: string;
  color: string;
}

export interface File {
  name: string;
  id: number;
  pages: number;
  size: string;
  dateProcessed: string;
  status: "Processed" | "In Processing";
  tags: Tag[];
}

export interface Folder {
  createdDate: string;
  size: string;
  subfolders: Folder[];
  files: File[];
  id: string;
  created_at: string;
  name: string;
  color: string;
  user_id: string;
}

export interface File {
  name: string;
  id: number;
  pages: number;
  size: string;
  dateProcessed: string;
  status: "Processed" | "In Processing";
  file_tags: Tag[];
}

export interface Folder {
  id: string;
  folder_name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;

  folder_size?: string;
  folder_path?: string;
}

export interface MockData {
  id: any;
  name: string;
  color: string;
  createdDate: string;
  size: string;
  subfolders: Folder[];
  files: File[];
}

export interface File {
  name: string;
  id: number;
  pages: number;
  size: string;
  dateProcessed: string;
  status: "Processed" | "In Processing";
  tags: Tag[];
}

export interface Folder {
  name: string;
  createdDate: string;
  size: string;
  subfolders: Folder[];
  files: File[];
}

export interface UserFile {
  id: string;
  user_id: string;
  folder_id: string | null;
  file_name: string;
  file_url: string;
  created_at: string;
  file_data: any[];

  path?: string;
  pages?: number;
  size?: string;
  status?: "Processed" | "In Processing";
  file_tags?: Tag[];
  author_email?: string;
}

export interface FolderWithFiles {
  id: string;
  folder_name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  files: UserFile[];
  folders: Folder[];
  subFolder: Folder[];
  size?: string;
  author_email?: string;
}
interface HighlightAreas {
  top: number;
  left: number;
  width: number;
  height: number;
  pageIndex: number;
}

interface Comment {
  user: string;
  comment: string;
}

interface NewNote {
  id: number;
  color: string;
  quote: string;
  content: string;
  comments: Comment[];
  newComment: string;
  highlightAreas: HighlightAreas[];
  isCommentDialogOpen: boolean;
}
export interface PdfSearchData {
  Title: string;
  Authors: string;
  PublicationDate: string;
  NumberOfPages: number;
  UploadDate: string;
  UserDefinedTags: string[];
  Abstract: string;
  OverallStrengthsAndWeaknesses: string[];
  ResearchPublication: string[];
  KeyPointsAndFindings: string[];
  ResearchApproach: string[];
  DataType: string[];
  ResearchMethods: string[];
  ModelsAndFrameworks: string[];
  StatisticalApproachAndMethods: string[];
  StatisticalToolsUsed: string[];
  ResearchTopicAndQuestions: string[];
  LimitationsSharedByTheAuthor: string[];
  FutureDirectionsforFurtherResearch: string[];
  Top5Keywords: string[];
  JournalName: string;
  Summary?: string;
  final_Top5Keywords?: string[];
}

export interface PdfQualityData {
  methodology: {
    research_design: string;
    data_collection_reliability: string;
    confidence_score: number;
  };
  validity: {
    language_analysis: string;
    internal_external_validity: string;
    conclusions_justification: string;
    confidence_score: number;
  };
  reliability: {
    limitations_discussions: string;
    confidence_score: number;
  };
  author_credibility: {
    author_information: string;
    expertise_reputation: string;
    confidence_score: number;
  };
  bias: {
    potential_biases: string;
    objectivity_assessment: string;
    confidence_score: number;
  };
  citation_analysis: {
    citation_count: string;
    quality_relevance_of_sources: string;
    confidence_score: number;
  };
  nlp_analysis: {
    keyword_extraction: string;
    named_entities: string;
    sentiment_analysis: string;
    confidence_score: number;
  };
  domain_specific_knowledge: {
    relevant_standards: string;
    confidence_score: number;
  };
  summary: {
    key_findings: string;
    strengths: string;
    weaknesses: string;
    overall_quality: string;
  };
}

export interface PdfMetadata {
  Abstract: string;
  PublicationDate: string;
  Authors: string;
  NumberOfPages: number;
  UploadDate: string;
  UserDefinedTags: string[];
  Keywords: string[];
  PublicationYear: string;
  JournalName: string;
  Strengths: string;
  Weaknesses: string;
  KeyPointsAndFindings: string;
  ResearchApproach: string;
  DataType: string;
  ResearchMethods: string;
  ModelsAndFrameworks: string;
  StatisticalApproachAndMethods: string;
  Volume: string;
}

interface HighlightArea {
  top: number;
  left: number;
  width: number;
  height: number;
  pageIndex: number;
}
interface Note {
  id: number;
  color: string;
  quote: string;
  content: string;
  comments: Comment[];
  newComment: string;
  highlightAreas: HighlightArea[];
  isCommentDialogOpen: boolean;
}

export interface pdfQuestions {
  question: string;
}

export interface PDFData {
  tags: any;
  id: number;
  created_at: string;
  note: Note[];
  file_link: string;
  file_name: string;
  file_updated_date: string;
  number_of_page: number;
  size: number;
  status: string;
  server: string;
  upload_user_name: string;
  upload_user_email: string;
  straico_file_url: string;
  last_update?: string;
  pdf_metadata?: PdfMetadata;
  pdf_category_data: any;
  pdf_search_data: PdfSearchData;
  pdf_quality_data: any;
  pdf_questions: null | pdfQuestions[];
  CitationCount: number;
  pdf_template_data: any;
  projects: any;
  file_status: string;
  ai_status?: string;
}

interface Pricing {
  coins: number;
  words: number;
}

interface ModelInfo {
  name: string;
  model: string;
  pricing: Pricing;
}

export type ModelList = ModelInfo[];

export type CustomNode = {
  id: number;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: any;
};

export type NodeChange = {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  dragging: boolean;
}[];

export type DimensionsChange = {
  id: string;
  type: string;
  dimensions: {
    width: number;
    height: number;
  };
}[];

export interface PromptQuestion {
  id: number;
  question?: string;
  selectModel?: any;
  position?: { x: number; y: number };
}

export interface EditPrompt {
  id: number;
  promptKey: string;
  type: string;
  promptQuestion: PromptQuestion[];
}

export interface PromptQuestionType {
  id: number;
  question?: string;
  position: { x: number; y: number };
}

export interface PromptQuestionNew {
  id: number;
  question: string;
}

export interface PromptDetail {
  id: number;
  promptKey: string;
  promptQuestion: PromptQuestionNew[] | [];
  type: string;
  conversionPromptKey: string;
}

export interface FormData {
  name: string;
  templates: string;
  id?: Number;
}

export interface Option {
  label: string;
  value: string;
  pricing: pricing;
}
export interface pricing {
  coins: number;
  words: number;
}

export interface multiModels {
  name: string;
  model?: string;
  pricing: pricing;
  max_output?: number;
  category?: string;
}

export interface GroupModel {
  label: string;
  options: Option[];
}

export interface FileSearcherType {
  currentTemp: string;
  selectKey: (value: any) => void;
  setCurrentState: (value: any) => void;
  main: string[];
  currentState: string[] | { value?: { name: string } }[] | { name: string }[];
}

export interface User extends SupabaseUser {
  profile_image?: string;
}
