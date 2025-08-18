type PdfMetadata = {
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
  CitationCount: number;
};

type PdfSearchData = {
  Title: string;
  Authors: string;
  PublicationDate: string;
  NumberOfPages: number;
  UploadDate: string;
  UserDefinedTags: string[];
  Abstract: string;
  OverallStrengthsAndWeaknesses: string[];
  KeyPointsAndFindings: string[];
  ResearchApproach: string;
  DataType: string;
  ResearchMethods: string[];
  ModelsAndFrameworks: string[];
  StatisticalApproachAndMethods: string;
  ResearchTopicAndQuestions: string[];
  ResearchDataUsed: string;
  LimitationsSharedByTheAuthor: string[];
  FutureDirectionsforFurtherResearch: string[];
  Top5Keywords: string[];
  JournalName: string;
  Summary: string;
};

type PdfCategoryData = {
  Metrics: {
    HIndex: string;
    ImpactFactor: string;
  };
  DataType: string;
  Keywords: string[];
  Citations: {
    References: string[];
    CitationCount: number;
  };
  Limitations: string[];
  ResearchDesign: {
    Qualitative: boolean;
    MixedMethods: boolean;
    Quantitative: boolean;
  };
  FutureDirections: string[];
  ImpactAssessment: {
    PolicyImplications: boolean;
    PracticalApplications: boolean;
  };
  ResearchApproach: string;
  ResearchQuestion: string;
  PublicationDetails: {
    JournalName: string;
    PublicationYear: string;
    AuthorAffiliations: string[];
  };
  GeographicalContext: {
    Region: string;
    ComparativeStudies: boolean;
  };
  TheoreticalFramework: string[];
  StakeholderPerspective: {
    EndUsers: boolean;
    Practitioners: boolean;
    DecisionMakers: boolean;
  };
  IndustryApplicationContext: string[];
};

type PdfQualityData = {
  methodology: {
    research_design: string;
    methods_assessment: string;
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
    consistency_reliability: string;
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
    citation_count: number;
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
};

type PdfQuestions = {
  question: string;
}[];

export type FileData = {
  id: number;
  tags: any[];
  created_at: string;
  note: any[];
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
  last_update: string;
  pdf_metadata: PdfMetadata;
  pdf_search_data: PdfSearchData;
  pdf_category_data: PdfCategoryData;
  workspace_id: string | null;
  project_id: string;
  usage_view: string | null;
  pdf_quality_data: PdfQualityData;
  pdf_questions: PdfQuestions;
  file_status: string;
  pdf_template_data: any;
  subscription_start_time: string;
  file_original_name: string;
  analysis_retry: number;
  CitationCount: string | number;
};

export interface CollectiveNetWorkChartProps {
  apiDatas: FileData[];
  loading: boolean;
}

export interface CollectiveFileChartsProps {
  apiDatas: FileData[];
  loading: boolean;
}

export interface GroupedPdfs {
  name: string;
  id: string;
  children: FileData[];
}

export interface Node {
  id: string;
  menu?: string;
  chart_id?: string;
  height: number;
  size: number;
  color: string;
}

export interface Link {
  source: string;
  target: string;
  distance: number;
  color: string;
}

export interface ListViewProps{
  apiDatas: FileData[];
  loading: boolean;
  fetchData:Function
}