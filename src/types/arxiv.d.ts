// ArXiv Types and Interfaces
export interface ArXivPaper {
  id: string;
  title: string;
  summary: string;
  authors: Array<{
    name: string;
  }>;
  published: string;
  updated: string;
  category: string;
  categories: string[];
  link: string;
  pdfUrl: string;
  doi?: string;
  journal?: string;
  // Mapped fields to match existing paper structure
  paperId: string;
  abstract: string;
  year: number;
  publicationDate: string;
  referenceCount: number;
  citationCount: number;
  openAccessPdf?: {
    url: string;
  } | null;
  publicationTypes: string[];
  source: 'arxiv';
  arxiv_id: string;
  arxiv_categories: string[];
}

export interface ArXivSearchFilters {
  category?: string;
  dateRange?: string;
  maxResults?: number;
  sortBy?: 'relevance' | 'lastUpdatedDate' | 'submittedDate';
  sortOrder?: 'ascending' | 'descending';
}

export interface ArXivCategory {
  id: string;
  name: string;
  arxivCode: string;
  description: string;
}

export interface ArXivSearchResponse {
  papers: ArXivPaper[];
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
}

export interface ArXivQueryBuilder {
  terms: string[];
  categories: string[];
  authors: string[];
  title?: string;
  abstract?: string;
}
