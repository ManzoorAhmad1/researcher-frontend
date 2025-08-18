import { ArXivPaper, ArXivSearchFilters, ArXivSearchResponse, ArXivQueryBuilder } from '@/types/arxiv';

// ArXiv Categories Configuration
export const ARXIV_CATEGORIES = [
  { id: 'econ', name: 'Economics', arxivCode: 'econ', description: 'Economics papers' },
  { id: 'cs', name: 'Computer Science', arxivCode: 'cs', description: 'Computer Science papers' },
  { id: 'physics', name: 'Physics', arxivCode: 'physics', description: 'Physics papers' },
  { id: 'math', name: 'Mathematics', arxivCode: 'math', description: 'Mathematics papers' },
  { id: 'stat', name: 'Statistics', arxivCode: 'stat', description: 'Statistics papers' },
  { id: 'q-bio', name: 'Quantitative Biology', arxivCode: 'q-bio', description: 'Quantitative Biology papers' },
  { id: 'q-fin', name: 'Quantitative Finance', arxivCode: 'q-fin', description: 'Quantitative Finance papers' },
];

// Build ArXiv API query string
export const buildArXivQuery = (
  searchTerms: string, 
  searchBy: string = 'Title',
  filters?: ArXivSearchFilters
): string => {
  const queryParts: string[] = [];
  
  if (searchTerms.trim()) {
    // Handle existing query format with operators
    let processedQuery = searchTerms;
    
    // Convert to ArXiv format based on searchBy type
    if (searchBy === 'Title') {
      processedQuery = processedQuery.replace(/"/g, '').split(/\s+(AND|OR|AND NOT)\s+/gi).map((part, index) => {
        if (!['AND', 'OR', 'AND NOT'].includes(part.toUpperCase())) {
          return `ti:"${part.trim()}"`;
        }
        return part;
      }).join(' ');
    } else if (searchBy === 'Author') {
      processedQuery = processedQuery.replace(/"/g, '').split(/\s+(AND|OR|AND NOT)\s+/gi).map((part, index) => {
        if (!['AND', 'OR', 'AND NOT'].includes(part.toUpperCase())) {
          return `au:"${part.trim()}"`;
        }
        return part;
      }).join(' ');
    } else {
      // General search in all fields
      processedQuery = processedQuery.replace(/"/g, '').split(/\s+(AND|OR|AND NOT)\s+/gi).map((part, index) => {
        if (!['AND', 'OR', 'AND NOT'].includes(part.toUpperCase())) {
          return `all:"${part.trim()}"`;
        }
        return part;
      }).join(' ');
    }
    
    queryParts.push(`(${processedQuery})`);
  }
  
  // Add category filter
  if (filters?.category && filters.category !== 'All') {
    queryParts.push(`cat:${filters.category}*`);
  }
  
  return queryParts.join(' AND ') || 'all:*';
};

// Parse ArXiv XML response to JSON
export const parseArXivXML = (xmlString: string): ArXivSearchResponse => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  const entries = xmlDoc.querySelectorAll('entry');
  const totalResults = parseInt(xmlDoc.querySelector('opensearch\\:totalResults, totalResults')?.textContent || '0');
  const startIndex = parseInt(xmlDoc.querySelector('opensearch\\:startIndex, startIndex')?.textContent || '0');
  const itemsPerPage = parseInt(xmlDoc.querySelector('opensearch\\:itemsPerPage, itemsPerPage')?.textContent || '0');
  
  const papers: ArXivPaper[] = Array.from(entries).map(entry => {
    const id = entry.querySelector('id')?.textContent?.split('/').pop() || '';
    const title = entry.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const summary = entry.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const published = entry.querySelector('published')?.textContent || '';
    const updated = entry.querySelector('updated')?.textContent || '';
    
    // Parse authors
    const authorElements = entry.querySelectorAll('author name');
    const authors = Array.from(authorElements).map(author => ({
      name: author.textContent?.trim() || ''
    }));
    
    // Parse categories
    const categoryElements = entry.querySelectorAll('category');
    const categories = Array.from(categoryElements).map(cat => 
      cat.getAttribute('term') || ''
    ).filter(Boolean);
    
    // Get links
    const links = entry.querySelectorAll('link');
    let link = '';
    let pdfUrl = '';
    
    Array.from(links).forEach(linkEl => {
      const rel = linkEl.getAttribute('rel');
      const type = linkEl.getAttribute('type');
      const href = linkEl.getAttribute('href') || '';
      
      if (rel === 'alternate') {
        link = href;
      } else if (type === 'application/pdf') {
        pdfUrl = href;
      }
    });
    
    const publishedDate = new Date(published);
    const year = publishedDate.getFullYear();
    
    return {
      id,
      title,
      summary,
      authors,
      published,
      updated,
      category: categories[0] || '',
      categories,
      link,
      pdfUrl,
      // Mapped fields for compatibility
      paperId: `arxiv:${id}`,
      abstract: summary,
      year,
      publicationDate: published,
      referenceCount: 0, // ArXiv doesn't provide this
      citationCount: 0, // ArXiv doesn't provide this
      openAccessPdf: pdfUrl ? { url: pdfUrl } : null,
      publicationTypes: ['Preprint'],
      source: 'arxiv' as const,
      arxiv_id: id,
      arxiv_categories: categories,
    };
  });
  
  return {
    papers,
    totalResults,
    startIndex,
    itemsPerPage,
  };
};

// Search ArXiv papers
export const searchArXivPapers = async (
  query: string,
  searchBy: string = 'Title',
  filters: ArXivSearchFilters = {}
): Promise<ArXivSearchResponse> => {
  const {
    maxResults = 50,
    sortBy = 'relevance',
    sortOrder = 'descending'
  } = filters;
  
  const arxivQuery = buildArXivQuery(query, searchBy, filters);
  const encodedQuery = encodeURIComponent(arxivQuery);
  
  // ArXiv API endpoint
  const baseUrl = 'https://export.arxiv.org/api/query';
  const params = new URLSearchParams({
    search_query: arxivQuery,
    start: '0',
    max_results: maxResults.toString(),
    sortBy: sortBy,
    sortOrder: sortOrder
  });
  
  const url = `${baseUrl}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ArXiv API error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    return parseArXivXML(xmlText);
  } catch (error) {
    console.error('Error fetching from ArXiv:', error);
    throw error;
  }
};

// Get recent ArXiv papers by category
export const getRecentArXivPapers = async (
  category?: string,
  maxResults: number = 20
): Promise<ArXivSearchResponse> => {
  const filters: ArXivSearchFilters = {
    category,
    maxResults,
    sortBy: 'submittedDate',
    sortOrder: 'descending'
  };
  
  return searchArXivPapers('*', 'Title', filters);
};

// Convert internal query format to ArXiv format
export const convertToArXivQuery = (internalQuery: string, searchBy: string): string => {
  return buildArXivQuery(internalQuery, searchBy);
};
