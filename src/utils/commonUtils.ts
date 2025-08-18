import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import {
  axiosFormDataInstancePrivate,
  axiosInstancePrivate,
} from "@/utils/request";

export const sanitizeFileName = (fileName: string): string => {
  const sanitizedFileName = fileName.replace(/\s+/g, "_");
  return `${sanitizedFileName.replace(/(.+)(\.[^.]+)$/, `$1_${uuidv4()}$2`)}`;
};

export const formatBytes = (bytes: number, decimals: number = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const formatDate = (inputDate: string): string => {
  const date = new Date(inputDate);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", options)?.format(date);
};

export const removeFilenameFromUrl = (url: string) => {
  if (!url || typeof url !== "string") {
    console.error("Invalid URL:", url);
    return "";
  }
  return url.substring(0, url.lastIndexOf("/") + 1);
};

export const formatExtractData = async (pdf: any) => {
  let extractedText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    extractedText += `\n\nPage ${i}:\n${pageText}`;
  }

  return extractedText;
};

export const extractFileData = (searchData: string) => {
  const cleanedJsonString = searchData.trim().replace(/^```json|```$/g, "");
  return JSON.parse(cleanedJsonString);
};

export const extractFileDataOver = (searchData: string) => {
  const cleanedJsonString = searchData
    .trim()
    .replace(/```json|```/g, "")
    .replace(/\n/g, "");

  try {
    return JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Invalid JSON format");
  }
};

export const isValidArray = (arr: string[] | string | undefined) => {
  return arr
    ? arr[0] == ""
      ? false
      : Array.isArray(arr)
      ? arr.length > 0
      : arr.length > 0
    : false;
};

export const isValidListArray = (arr: string[] | undefined): boolean => {
  if (Array.isArray(arr)) {
    return arr.length > 0 && arr.every((value) => value.length > 0);
  }

  return false;
};

export const isValidString = (input: string | undefined): boolean => {
  return typeof input === "string" && input.length > 0;
};

export const toPascalCase = (str: string) => {
  return str
    .split(/[\s,]+/)
    .map(
      (word: any) =>
        word?.charAt(0)?.toUpperCase() + word?.slice(1)?.toLowerCase()
    )
    .join("");
};

export const toPascalCaseWithUnderscore = (str: string) => {
  return str.replace(/\s+/g, "_");
};

export const toPascalCaseWithSpaces = (str: string) => {
  return str?.replace(/_/g, " ") || "";
};

export const modelSupportedLanguages = [
  "American English",
  "British English",
  "Australian English",
  "Canadian English",
  "European Spanish",
  "Latin American Spanish",
  "European French",
  "Canadian French",
  "German",
  "Italian",
  "European Portuguese",
  "Brazilian Portuguese",
  "Dutch",
  "Russian",
  "Simplified Chinese",
  "Traditional Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Turkish",
];

export const fetchPdfMetadata = async (
  templateMessage: string,
  pdfUrl: string[],
  model: string
) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_STRAICO_API}/v1/prompt/completion`,
      {
        models: [model],
        message: templateMessage,
        file_urls: pdfUrl,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAICO_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch PDF metadata`);
  }
};

export const fetchPdfMetadataAPI = async (
  templateMessage: string,
  pdfUrl: string[],
  model: string
) => {
  try {
    const response = await axiosInstancePrivate.post(`/straico-mdel/chat-pdf`, {
      models: [model],
      message: templateMessage,
      file_urls: pdfUrl,
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch PDF metadata`);
  }
};

export const researchPaperPrompt = [
  { id: 1, promptKey: "Title", promptQuestion: [], type: "detail" },
  {
    id: 2,
    promptKey: "Author(s)/Organization",
    promptQuestion: [],
    type: "detail",
  },
  { id: 3, promptKey: "Publication Date", promptQuestion: [], type: "detail" },
  {
    id: 4,
    promptKey: "Publisher/Journal/Platform",
    promptQuestion: [],
    type: "detail",
  },
  {
    id: 5,
    promptKey: "Document Type",
    promptQuestion: [
      {
        id: 1,
        question: `- Academic Research Paper 
                     - Business White Paper 
                     - Technical Report 
                     - Case Study 
                     - Industry Analysis 
                     - Systematic Review 
                     - Meta-Analysis 
                     - Conference Proceedings 
                     - Thesis/Dissertation 
                     - Patent Application`,
      },
    ],
    type: "contents",
  },
  {
    id: 6,
    promptKey: "Primary Fields",
    promptQuestion: [
      {
        id: 1,
        question: ` - Medical/Life Sciences
 - Physical Sciences
 - Social Sciences
 - Computer Science/Technology
 - Mathematics/Statistics
 - Engineering
 - Humanities
 - Business/Economics
 - Environmental Sciences
 - Law/Legal Studies
 - Education
 - Psychology
 - Interdisciplinary`,
      },
    ],
    type: "contents",
  },
  {
    id: 7,
    promptKey: "Based on document structure, identify",
    promptQuestion: [
      {
        id: 1,
        question: ` - Presence of abstract
 - Methodology section
 - Data analysis
 - References/citations style
 - Use of technical jargon
 - Presence of financial data
 - Visual elements (graphs, charts, diagrams)`,
      },
    ],
    type: "contents",
  },
  {
    id: 8,
    promptKey: "Document Overview",
    promptQuestion: [
      {
        id: 1,
        question: `DOI/Identifier (if applicable)`,
      },
      {
        id: 2,
        question: `Document Type Classification`,
      },
      {
        id: 3,
        question: `Field Classification`,
      },
    ],
    type: "contents",
  },
  {
    id: 9,
    promptKey: "Executive Summary",
    promptQuestion: [
      {
        id: 1,
        question: `3-4 sentence overview`,
      },
      {
        id: 2,
        question: `Primary objective/research question`,
      },
      {
        id: 3,
        question: `Target audience identification`,
      },
    ],
    type: "contents",
  },
  {
    id: 10,
    promptKey: "Key Findings/Arguments",
    promptQuestion: [
      {
        id: 1,
        question: `3-5 main points`,
      },
      {
        id: 2,
        question: `Significance and implications`,
      },
      {
        id: 3,
        question: `Innovation or novelty factors`,
      },
    ],
    type: "contents",
  },
  {
    id: 11,
    promptKey: "Methodology Assessment",
    promptQuestion: [
      {
        id: 1,
        question: `Research/analysis approach`,
      },
      {
        id: 2,
        question: `Data sources and collection methods`,
      },
      {
        id: 3,
        question: `Analytical techniques employed`,
      },
    ],
    type: "contents",
  },
  {
    id: 12,
    promptKey: "Conclusions and Implications",
    promptQuestion: [
      {
        id: 1,
        question: `Main takeaways`,
      },
      {
        id: 2,
        question: `Practical applications`,
      },
      {
        id: 3,
        question: `Theoretical contributions`,
      },
    ],
    type: "contents",
  },
  {
    id: 13,
    promptKey: "Critical Evaluation",
    promptQuestion: [
      {
        id: 1,
        question: `Strengths and limitations`,
      },
      {
        id: 2,
        question: `Potential biases`,
      },
      {
        id: 3,
        question: `Generalizability`,
      },
      {
        id: 4,
        question: `Quality of evidence`,
      },
    ],
    type: "contents",
  },
  {
    id: 14,
    promptKey: "For Medical/Life Sciences",
    promptQuestion: [
      {
        id: 1,
        question: `Patient/Sample Demographics`,
      },
      {
        id: 2,
        question: `Clinical Implications`,
      },
      {
        id: 3,
        question: `Safety and Efficacy Data`,
      },
      {
        id: 4,
        question: `Biological Mechanisms`,
      },
      {
        id: 5,
        question: `Therapeutic Potential`,
      },
      {
        id: 6,
        question: `Regulatory Considerations`,
      },
      {
        id: 7,
        question: `Public Health Impact`,
      },
    ],
    type: "contents",
  },
  {
    id: 15,
    promptKey: "For Business/Economics",
    promptQuestion: [
      {
        id: 1,
        question: `Market Analysis`,
      },
      {
        id: 2,
        question: `Financial Metrics`,
      },
      {
        id: 3,
        question: `ROI Calculations`,
      },
      {
        id: 4,
        question: `Competitive Landscape`,
      },
      {
        id: 5,
        question: `Business Model Implications`,
      },
      {
        id: 6,
        question: `Risk Assessment`,
      },
      {
        id: 7,
        question: `Industry Trends`,
      },
      {
        id: 8,
        question: `Stakeholder Impact`,
      },
    ],
    type: "contents",
  },
  {
    id: 16,
    promptKey: "For Technology/Engineering",
    promptQuestion: [
      {
        id: 1,
        question: `Technical Specifications`,
      },
      {
        id: 2,
        question: `Implementation Details`,
      },
      {
        id: 3,
        question: `Performance Metrics`,
      },
      {
        id: 4,
        question: `Scalability Analysis`,
      },
      {
        id: 5,
        question: `Security Considerations`,
      },
      {
        id: 6,
        question: `Integration Challenges`,
      },
      {
        id: 7,
        question: `Tech Stack/Tools Used`,
      },
      {
        id: 8,
        question: `Maintenance Requirements`,
      },
    ],
    type: "contents",
  },
  {
    id: 17,
    promptKey: "For Environmental Sciences",
    promptQuestion: [
      {
        id: 1,
        question: `Environmental Impact Assessment`,
      },
      {
        id: 2,
        question: `Sustainability Metrics`,
      },
      {
        id: 3,
        question: `Ecological Considerations`,
      },
      {
        id: 4,
        question: `Climate Change Implications`,
      },
      {
        id: 5,
        question: `Resource Management`,
      },
      {
        id: 6,
        question: `Policy Recommendations`,
      },
    ],
    type: "contents",
  },
  {
    id: 18,
    promptKey: "For Law/Legal Studies",
    promptQuestion: [
      {
        id: 1,
        question: `Legal Framework Analysis`,
      },
      {
        id: 2,
        question: `Precedent Cases`,
      },
      {
        id: 3,
        question: `Regulatory Implications`,
      },
      {
        id: 4,
        question: `Compliance Requirements`,
      },
      {
        id: 5,
        question: `Jurisdictional Considerations`,
      },
    ],
    type: "contents",
  },
  {
    id: 19,
    promptKey: "For Education",
    promptQuestion: [
      {
        id: 1,
        question: `Pedagogical Approaches`,
      },
      {
        id: 2,
        question: `Learning Outcomes`,
      },
      {
        id: 3,
        question: `Assessment Methods`,
      },
      {
        id: 4,
        question: `Educational Technology`,
      },
      {
        id: 5,
        question: `Curriculum Integration`,
      },
    ],
    type: "contents",
  },
  {
    id: 20,
    promptKey: "For Systematic Reviews/Meta-Analyses",
    promptQuestion: [
      {
        id: 1,
        question: `Search Strategy`,
      },
      {
        id: 2,
        question: `Inclusion/Exclusion Criteria`,
      },
      {
        id: 3,
        question: `Quality Assessment of Included Studies`,
      },
      {
        id: 4,
        question: `Synthesis Methods`,
      },
      {
        id: 5,
        question: `Heterogeneity Analysis`,
      },
    ],
    type: "contents",
  },
  {
    id: 21,
    promptKey: "For Business White Papers ",
    promptQuestion: [
      {
        id: 1,
        question: `Industry Context`,
      },
      {
        id: 2,
        question: `Problem Statement`,
      },
      {
        id: 3,
        question: `Proposed Solution`,
      },
      {
        id: 4,
        question: `Implementation Roadmap`,
      },
      {
        id: 5,
        question: `Cost-Benefit Analysis`,
      },
      {
        id: 6,
        question: `Case Studies/Examples`,
      },
    ],
    type: "contents",
  },
  {
    id: 22,
    promptKey: "For Patents",
    promptQuestion: [
      {
        id: 1,
        question: `Technical Innovation`,
      },
      {
        id: 2,
        question: `Prior Art`,
      },
      {
        id: 3,
        question: `Claims Analysis`,
      },
      {
        id: 4,
        question: `Commercial Potential`,
      },
      {
        id: 5,
        question: `Implementation Feasibility`,
      },
    ],
    type: "contents",
  },
];

export const newResearchPaperPrompt = [
  {
    id: 1,
    promptKey: "Title",
    promptQuestion: [
      {
        id: 1,
        question: `Extract the full title of the research paper.`,
      },
    ],
    type: "detail",
  },
  {
    id: 2,
    promptKey: "Authors",
    promptQuestion: [
      {
        id: 1,
        question: `List the names of the authors involved in the research.`,
      },
    ],
    type: "detail",
  },
  {
    id: 3,
    promptKey: "Journal Name",
    promptQuestion: [
      {
        id: 1,
        question: `Identify the name of the journal where the research was published.`,
      },
    ],
    type: "detail",
  },
  {
    id: 4,
    promptKey: "Publication Date",
    promptQuestion: [
      {
        id: 1,
        question: `Extract the exact date of publication of the paper.`,
      },
    ],
    type: "detail",
  },
  {
    id: 5,
    promptKey: "Sector",
    promptQuestion: [
      {
        id: 1,
        question: `Identify the industry or field the research targets.`,
      },
    ],
    type: "contents",
  },
  {
    id: 6,
    promptKey: "Country",
    promptQuestion: [
      {
        id: 1,
        question: `Determine the geographical focus of the study, if applicable.`,
      },
    ],
    type: "contents",
  },
  {
    id: 7,
    promptKey: "Sample Size",
    promptQuestion: [
      {
        id: 1,
        question: `Extract the size of the sample population used in the study.`,
      },
    ],
    type: "contents",
  },
  {
    id: 8,
    promptKey: "Summarized Abstract",
    promptQuestion: [
      {
        id: 1,
        question: `Provide a concise summary of the abstract in at least four sentences.`,
      },
    ],
    type: "contents",
  },
  {
    id: 9,
    promptKey: "Conclusions",
    promptQuestion: [
      {
        id: 1,
        question: `Summarize the key conclusions drawn from the research.`,
      },
    ],
    type: "contents",
  },
  {
    id: 10,
    promptKey: "Results",
    promptQuestion: [
      {
        id: 1,
        question: `Detail the major findings and results reported in the paper.`,
      },
    ],
    type: "contents",
  },
  {
    id: 11,
    promptKey: "Summarized Introduction",
    promptQuestion: [
      {
        id: 1,
        question: `Summarize the introduction, outlining the context and rationale of the research.`,
      },
    ],
    type: "contents",
  },
  {
    id: 12,
    promptKey: "Methods Used",
    promptQuestion: [
      {
        id: 1,
        question: `Describe the research methods and methodologies employed in the study.`,
      },
    ],
    type: "contents",
  },
  {
    id: 13,
    promptKey: "Literature Survey",
    promptQuestion: [
      {
        id: 1,
        question: `Extract details about the literature review conducted in the study.`,
      },
    ],
    type: "contents",
  },
  {
    id: 14,
    promptKey: "Limitations",
    promptQuestion: [
      {
        id: 1,
        question: `Identify any limitations or constraints of the study mentioned by the authors.`,
      },
    ],
    type: "contents",
  },
  {
    id: 15,
    promptKey: "Contributions",
    promptQuestion: [
      {
        id: 1,
        question: `List the main contributions of the research to its field.`,
      },
    ],
    type: "contents",
  },
  {
    id: 16,
    promptKey: "Practical Implications",
    promptQuestion: [
      {
        id: 1,
        question: `Highlight the practical implications of the research findings.`,
      },
    ],
    type: "contents",
  },
  {
    id: 17,
    promptKey: "Objectives",
    promptQuestion: [
      {
        id: 1,
        question: `Outline the primary objectives or aims of the research.`,
      },
    ],
    type: "contents",
  },
  {
    id: 18,
    promptKey: "Findings",
    promptQuestion: [
      {
        id: 1,
        question: `Summarize the significant findings of the research.`,
      },
    ],
    type: "contents",
  },
  {
    id: 19,
    promptKey: "Research Gap",
    promptQuestion: [
      {
        id: 1,
        question: ` Identify gaps in existing research that this study aims to address.`,
      },
    ],
    type: "contents",
  },
  {
    id: 20,
    promptKey: "Future Research",
    promptQuestion: [
      {
        id: 1,
        question: `Note any suggestions or directions for future research provided by the authors.`,
      },
    ],
    type: "contents",
  },
  {
    id: 21,
    promptKey: "Dependent Variables ",
    promptQuestion: [
      {
        id: 1,
        question: `List the dependent variables examined in the study.`,
      },
    ],
    type: "contents",
  },
  {
    id: 22,
    promptKey: "Independent Variables",
    promptQuestion: [
      {
        id: 1,
        question: `List the independent variables analyzed in the study.`,
      },
    ],
    type: "contents",
  },
  {
    id: 23,
    promptKey: "Dataset",
    promptQuestion: [
      {
        id: 1,
        question: `Provide details about the dataset used, if applicable.`,
      },
    ],
    type: "contents",
  },
  {
    id: 24,
    promptKey: "Population Sample",
    promptQuestion: [
      {
        id: 1,
        question: `Describe the characteristics of the sample population.`,
      },
    ],
    type: "contents",
  },
  {
    id: 25,
    promptKey: "Problem Statement",
    promptQuestion: [
      {
        id: 1,
        question: `Identify the core problem or question addressed in the research.`,
      },
    ],
    type: "contents",
  },
  {
    id: 26,
    promptKey: "Challenges",
    promptQuestion: [
      {
        id: 1,
        question: `List any challenges encountered during the research process.`,
      },
    ],
    type: "contents",
  },
  {
    id: 27,
    promptKey: "Applications",
    promptQuestion: [
      {
        id: 1,
        question: `Discuss the practical applications of the research findings.`,
      },
    ],
    type: "contents",
  },
];

const tempPrompt = ` {
  "Title": ["string"],
  "PublicationDate": ["string"],
  "Authors": ["string"],
  "JournalName": ["string"],
  "Sector": ["string"],
  "Country": ["string"],
  "SampleSize": ["string"],
  "SummarizedAbstract": ["string"],
  "Conclusions": ["string"],
  "Results": ["string"],
  "SummarizedIntroduction": ["string"],
  "MethodsUsed": ["string"],
  "LiteratureSurvey": ["string"],
  "Limitations": ["string"],
  "Contributions": ["string"],
  "PracticalImplications": ["string"],
  "Objectives": ["string"],
  "Findings": ["string"],
  "ResearchGap": ["string"],
  "FutureResearch": ["string"],
  "DependentVariables": ["string"],
  "IndependentVariables": ["string"],
  "Dataset": ["string"],
  "PopulationSample": ["string"],
  "ProblemStatement": ["string"],
  "Challenges": ["string"],
  "Applications": ["string"]
}`;
export const newPaperAnalysisTemplateData = () => {
  return `
  Extract the following information:
  - **Title**: Extract the full title of the research paper.
  - **Authors**: List the names of the authors involved in the research.
  - **Journal Name**: Identify the name of the journal where the research was published.
  - **Publication Date**: Extract the exact date of publication of the paper.
  - **Sector**: Identify the industry or field the research targets.
  - **Country**: Determine the geographical focus of the study, if applicable.
  - **Sample Size**: Extract the size of the sample population used in the study.
  - **Summarized Abstract**: Provide a concise summary of the abstract in at least four sentences.
  - **Conclusions**: Summarize the key conclusions drawn from the research.
  - **Results**: Detail the major findings and results reported in the paper.
  - **Summarized Introduction**: Summarize the introduction, outlining the context and rationale of the research.
  - **Methods Used**: Describe the research methods and methodologies employed in the study.
  - **Literature Survey**: Extract details about the literature review conducted in the study.
  - **Limitations**: Identify any limitations or constraints of the study mentioned by the authors.
  - **Contributions**: List the main contributions of the research to its field.
  - **Practical Implications**: Highlight the practical implications of the research findings.
  - **Objectives**: Outline the primary objectives or aims of the research.
  - **Findings**: Summarize the significant findings of the research.
  - **Research Gap**: Identify gaps in existing research that this study aims to address.
  - **Future Research**: Note any suggestions or directions for future research provided by the authors.
  - **Dependent Variables**: List the dependent variables examined in the study.
  - **Independent Variables**: List the independent variables analyzed in the study.
  - **Dataset**: Provide details about the dataset used, if applicable.
  - **Population Sample**: Describe the characteristics of the sample population.
  - **Problem Statement**: Identify the core problem or question addressed in the research.
  - **Challenges**: List any challenges encountered during the research process.
  - **Applications**: Discuss the practical applications of the research findings.
   ### Critical Fields Extraction Guidelines:
   
  - **Publication Date**: MANDATORY FIELD - MUST ALWAYS BE PROVIDED. Look for explicit dates near the title or in the header/footer of the paper. If not found, check for submission/acceptance dates or publication information sections. If still not available, use the most recent date mentioned in the document. If no exact date is available, use the year with an estimated month (e.g., "January 2023") or simply the year (e.g., "2023"). For preprints or manuscripts without dates, use submission date or the most recent reference year and add "Estimated" (e.g., "2023 (Estimated)"). NEVER return "unknown" or leave this field empty.
  
  - **Journal Name**: MANDATORY FIELD - MUST ALWAYS BE PROVIDED. Look for journal information typically found on the first page, in headers, logos, footers, or in the citation information. Check for phrases like "Published in", "Journal of", etc. If not explicitly stated, check for publisher information, DOI references, or copyright statements that may include journal names. If the document appears to be a conference paper, include the conference name. If it's a preprint, note the repository (e.g., "arXiv Preprint"). If the document is a thesis or dissertation, note the university. If none of these apply, classify by document type (e.g., "Academic Research Journal", "Technical Report", "White Paper", etc.). NEVER return "unknown" or leave this field empty.

  - **Volume**: MANDATORY FIELD - MUST ALWAYS BE PROVIDED. Look for volume information typically indicated near the journal name or in the header/footer using formats like "Vol. X", "Volume X", etc. Check for volume information in citations or references to the paper. If not explicitly stated, look for issue numbers which are often associated with volumes. If no volume information can be found after exhaustive search, provide "1" for preprints/drafts, or use contextual clues such as publication year (e.g., "2023 Series"). For conference proceedings, use the conference edition number or year. For books or monographs, use the edition number. NEVER return "unknown" or leave this field empty.

  - **Issue**: MANDATORY FIELD - MUST ALWAYS BE PROVIDED. Look for issue information typically indicated near the journal name, volume information, or in the header/footer using formats like "Issue X", "No. X", etc. If not explicitly stated, check for months or seasons that might indicate issues (e.g., "Summer 2023" would be "Summer" issue). If no issue information can be found, use "1" for single-volume works, or derive from publication timeframe (e.g., "Quarter 3" for papers published between July-September). For online-first articles, use "Online First" or "Advance Publication". NEVER return "unknown" or leave this field empty.

  - **Identifier**: MANDATORY FIELD - MUST ALWAYS BE PROVIDED. Look for any unique identifiers in the paper such as article numbers, manuscript IDs, or submission numbers. Search for alphanumeric codes labeled as "Article ID", "Manuscript Number", etc. If not explicitly stated, check for identifiers in the header/footer, URL parameters in electronic versions, or in citations. If no identifier can be found, generate a reasonable placeholder based on author surnames and year (e.g., "Smith2023" for single author, "SmithEtAl2023" for multiple authors). NEVER return "unknown" or leave this field empty.

  - **DOI**: Look for Digital Object Identifier typically formatted as "doi:10.xxxx/xxxxx" or "https://doi.org/10.xxxx/xxxxx". Check the first page, header/footer, or citation information. If not present, search for any URL that contains "doi.org". If no DOI is found, return a blank string. Unlike other fields, this can be empty if no DOI exists for the document.

  - **Institution**: MANDATORY FIELD - MUST ALWAYS BE PROVIDED. Look for institutional affiliations typically listed with author names or in footnotes/endnotes. Check for university names, research institutes, corporate entities, or government agencies associated with the authors. For working papers, technical reports, or white papers, identify the issuing organization. If not explicitly stated, check author email domains (e.g., @harvard.edu would indicate Harvard University) or correspondence addresses. If no institution is mentioned, infer from the context, publication series (e.g., "NBER Working Paper" would indicate National Bureau of Economic Research), or journal affiliation. NEVER return "unknown" or leave this field empty.
  
  Process: Return the extracted information only in JSON format with first letter capital keys.
  Analyse the uploaded PDF document to extract specific information related to a research paper. Perform the extraction step-by-step, ensuring that if any section or detail is not found, you proceed to the next without generating any fictitious data. Present the findings systematically according to the specified sections.
  
  ### Instructions for Extraction:
  1. **Mandatory Extraction**:
     - Extract and return meaningful information for every field.
     - If information is not directly available, infer from context logically.
     - Avoid leaving any fields empty or returning placeholders.
  
  2. **Strict JSON Output**:
     - Return the extracted information **only in JSON format**. Do not include any explanatory text or metadata outside of the JSON object.
     - Ensure the first letter of each key is capitalized and the key names match exactly as specified below.
  
  3. **Detailed and Expanded Descriptions**:
     - Use at least **4 sentences** or points for each section.
     - Provide logical, creative summaries when explicit data is missing.
  
  4. **Response Validation**:
     - Validate that the response is in strict JSON format.
     - Ensure the returned JSON object contains all required fields and matches the expected structure.
  
  5. **Detailed Extraction**:
     - Provide detailed and expanded descriptions where possible.
     - For each section, include a **minimum of four sentences or points** to ensure comprehensive data coverage.
  
  6. **Field Structure**:
     Return the extracted information in the following JSON structure:
${tempPrompt}

Ensure the following:
- Return the extracted information only in JSON format with the first letter of each key capitalized and formatted exactly as specified above.
- Do not include any additional text or metadata, just the JSON object.
- Ensure the key names in the JSON output match exactly as specified.
- if there is some error in any case then full response must been in json format not in normal.
- if there is data not present then not return null against value return blank string nothing else.
- Present the extracted information in a well-structured format, clearly labelled under each section heading as specified above.
1. **Strict JSON Output:** The response must be in strict JSON format. Do not include any explanatory text or metadata outside of the JSON object.
2. **Response Handling:** Validate that the response is in JSON format. The response must be an object with the required fields as described.
3. **Error Handling:** If the response is not in JSON format or is invalid, handle errors appropriately by throwing an exception.
4. **Data Validation:** Ensure that the returned JSON object contains all required fields and matches the expected structure. Perform validation checks and throw errors if the data does not meet the expected format.
5. **Logging:** Log any errors encountered during the fetching and processing stages for debugging purposes.
6. **Detailed Extraction:** Extract additional contextual details as specified for each subheading, providing expanded descriptions where relevant.  If possible, provide a minimum of four sentences or points for each subheading, expanding as noted above.
`;
};

export const overviewTag = [
  { bgColor: "#D559FF1C", color: "#AF00EA" },
  { bgColor: "#6AA8FF26", color: "#0E70FF" },
  { bgColor: "#FF0E7329", color: "#FF0E73" },
  { bgColor: "#079E2829", color: "#079E28" },
  { bgColor: "#E3990929", color: "#E39909" },
];

export const overviewFieldLineColor = [
  "#0E70FF",
  "#079E28",
  "#F59B14",
  "#8D17B5",
];

export const formatPaperDetailToCopyToClipboard = (PDFData: any) =>
  `
  Title: ${PDFData.pdf_search_data.Title}
  Authors: ${PDFData.pdf_search_data.Authors}
  Publication Date: ${PDFData.pdf_search_data.PublicationDate}
  Citation Count: ${PDFData.CitationCount}
  Journal: ${PDFData.pdf_category_data.PublicationDetails.JournalName} (${
    PDFData.pdf_category_data.PublicationDetails.PublicationYear
  })

  PAPER OVERVIEW

  Summary: ${PDFData.pdf_search_data.Summary}
  Research Methods:${PDFData?.pdf_search_data.ResearchMethods}

  PAPER CATEGORY

  Research Approach: ${PDFData.pdf_category_data.ResearchApproach}
  Data Type: ${PDFData.pdf_category_data?.DataType}
  Research Question: ${PDFData.pdf_category_data.ResearchQuestion}
  Author Affiliations: ${
    PDFData?.pdf_category_data?.PublicationDetails?.AuthorAffiliations
  }
  Citations Count: ${PDFData?.CitationCount?.toString()}
  Research Design: ${
    PDFData?.pdf_category_data?.ResearchDesign
      ? PDFData?.pdf_category_data?.ResearchDesign.Quantitative
        ? "Quantitative"
        : PDFData?.pdf_category_data?.ResearchDesign.Qualitative
        ? "Qualitative"
        : "Mixed Methods"
      : ""
  }
  Industry Application Context: ${
    PDFData?.pdf_category_data?.IndustryApplicationContext
  }
  Stakeholder Perspective: ${
    PDFData?.pdf_category_data?.StakeholderPerspective
      ? Object.keys(PDFData?.pdf_category_data?.StakeholderPerspective)
          .filter(
            (key) => PDFData?.pdf_category_data?.StakeholderPerspective[key]
          )
          .join(", ")
      : ""
  }
  Geographical Context: ${
    PDFData?.pdf_category_data?.GeographicalContext?.Region
  }
  Impact Assessment: ${
    PDFData?.pdf_category_data?.ImpactAssessment
      ? Object.keys(PDFData?.pdf_category_data?.ImpactAssessment)
          .filter((key) => PDFData?.pdf_category_data?.ImpactAssessment[key])
          .join(", ")
      : ""
  }
  Limitations: ${PDFData?.pdf_category_data?.Limitations}
  Future Directions: ${PDFData?.pdf_category_data?.FutureDirections}
  Keywords: ${PDFData.pdf_category_data.Keywords.join(", ")}
  
  PAPER EVALUATION

  Research Methodology (${
    PDFData.pdf_quality_data.methodology.confidence_score
  }/10):
  Research Design: ${PDFData.pdf_quality_data.methodology.research_design}
  Methods Assessment: ${PDFData.pdf_quality_data.methodology.methods_assessment}
  Data Collection Reliability: ${
    PDFData.pdf_quality_data.methodology.data_collection_reliability
  }
  Validity (${PDFData.pdf_quality_data.validity.confidence_score}/10):
  Language Analysis: ${PDFData.pdf_quality_data.validity.language_analysis}
  Internal/External Validity: ${
    PDFData.pdf_quality_data.validity.internal_external_validity
  }
  Conclusions Justification: ${
    PDFData.pdf_quality_data.validity.conclusions_justification
  }
  Reliability (${PDFData.pdf_quality_data.reliability.confidence_score}/10):
  Limitations Discussions: ${
    PDFData.pdf_quality_data.reliability.limitations_discussions
  }
  Consistency Reliability: ${
    PDFData.pdf_quality_data.reliability.consistency_reliability
  }
  Author Credibility (${
    PDFData.pdf_quality_data.author_credibility.confidence_score
  }/10):
  Author Information: ${
    PDFData.pdf_quality_data.author_credibility.author_information
  }
  Expertise/Reputation: ${
    PDFData.pdf_quality_data.author_credibility.expertise_reputation
  }
  Bias (${PDFData.pdf_quality_data.bias.confidence_score}/10):
  Potential Biases: ${PDFData.pdf_quality_data.bias.potential_biases}
  Objectivity Assessment: ${
    PDFData.pdf_quality_data.bias.objectivity_assessment
  }
  Citation Analysis (${
    PDFData.pdf_quality_data.citation_analysis.confidence_score
  }/10):
  Citation Count: ${PDFData.pdf_quality_data.citation_analysis.citation_count}
  Quality and Relevance of Sources: ${
    PDFData.pdf_quality_data.citation_analysis.quality_relevance_of_sources
  }
  NLP Analysis (${PDFData.pdf_quality_data.nlp_analysis.confidence_score}/10):
  Keyword Extraction: ${
    PDFData.pdf_quality_data.nlp_analysis.keyword_extraction
  }
  Sentiment Analysis: ${
    PDFData.pdf_quality_data.nlp_analysis.sentiment_analysis
  }
  Domain-Specific Knowledge (${
    PDFData.pdf_quality_data.domain_specific_knowledge.confidence_score
  }/10):
  Relevant Standards: ${
    PDFData.pdf_quality_data.domain_specific_knowledge.relevant_standards
  }
  Key Findings: ${PDFData.pdf_quality_data.summary.key_findings}
  Strengths: ${PDFData.pdf_quality_data.summary.strengths}
  Weaknesses: ${PDFData.pdf_quality_data.summary.weaknesses}
  Overall Quality: ${PDFData.pdf_quality_data.summary.overall_quality}
  Limitations: 
  ${PDFData.pdf_category_data.Limitations.join("\n  ")}
  Future Directions: 
  ${PDFData.pdf_category_data.FutureDirections.join("\n  ")}
`;
export const messageNodeBox = ["#0E70FF14", "#F59B1414"];
export const useMultipleModelsMsg =
  "Cross-check answers using multiple AI models for better accuracy. Enabling this option will use extra AI credits as it compares responses across models to ensure agreement. Please confirm if you'd like to proceed with this feature.";

export const FastAndCostEffectiveAI = [
  "OpenAI: GPT-4o mini",
  "Anthropic: Claude 3.5 Haiku",
  "Perplexity: Llama 3.1 Sonar 8B Online",
  "Perplexity: Llama 3.1 Sonar 70B Online",
  "Google: Gemma 2 27B",
];

export const SmartAI = [
  "OpenAI: GPT-4o - (Aug-06)",
  "OpenAI: GPT-4o - (Nov-20)",
  "Anthropic: Claude 3.5 Sonnet",
  "Perplexity: Llama 3.1 Sonar 405B Online",
  "Google: Gemini Pro 1.5",
];

export const ReasoningAI = [
  "OpenAI: o1-mini (Beta)",
  "OpenAI: o1-preview (Beta)",
];

export const modelPrompt =
  "Provide a summary of recent advancements in AI research and explain their impact.";

export const PrimaryModelResponse =
  "The field of AI has seen rapid advancements in areas like natural language processing (NLP), reinforcement learning, and computer vision. These technologies have broad applications, from self-driving cars to automated customer support.";

export const SecondaryModelResponse =
  " Llama-3.1 generated response: AI research has made great strides, particularly in deep learning and neural networks, which have led to breakthroughs in tasks like image recognition and autonomous vehicles.";

export const comparedBothAnswer =
  "Recent AI advancements, particularly in NLP and reinforcement learning, have propelled industries such as autonomous driving, customer service automation, and personalized content generation.";

export const roundCredit = (coins: number) => {
  const doubledCoins = Math.ceil(coins * 2);
  const normalizedCoins = Math.min(doubledCoins, 7);
  return normalizedCoins;
};

export const addSpaceBeforeCapitalWords = (inputString: string) => {
  return inputString.replace(/([a-z])([A-Z])/g, "$1 $2");
};

export const staticContent = [
  {
    id: 1, promptKey: "Paper Title", promptQuestion: [{
      id: 1,
      question: "Identify the title of the paper from the text.",
    }], type: "detail"
  },
  {
    id: 2, promptKey: "Authors", promptQuestion: [{
      id: 1,
      question: "Identify the authors mentioned in the paper.",
    }], type: "detail"
  },
  {
    id: 3,
    promptKey: "Publication Date",
    promptQuestion: [{
      id: 1,
      question: "Extract the publication date from the text.",
    }],
    type: "detail",
  },
  {
    id: 4, promptKey: "Journal Name", promptQuestion: [{
      id: 1,
      question: "Identify the journal in which the paper was published.",
    }], type: "detail"
  },
  {
    id: 5,
    promptKey: "5 Extracted Keywords",
    promptQuestion: [{
      id: 1,
      question: "Extract five important keywords from the text.",
    }],
    type: "detail",
  },
  {
    id: 6, promptKey: "Key Points", promptQuestion: [{
      id: 1,
      question: "Identify the key points discussed in the paper.",
    }], type: "contents"
  },
  {
    id: 7,
    promptKey: "Research Topic",
    promptQuestion: [{
      id: 1,
      question: "Identify the main research topic from the paper.",
    }],
    type: "contents",
  },
  {
    id: 8,
    promptKey: "Strengths and Weakness",
    promptQuestion: [{
      id: 1,
      question: "Identify the strengths and weaknesses of the study.",
    }],
    type: "contents",
  },
  {
    id: 9,
    promptKey: "Research Methods",
    promptQuestion: [{
      id: 1,
      question: "Identify the research methods used in the study.",
    }],
    type: "contents",
  },
  {
    id: 10,
    promptKey: "Statistical Methods",
    promptQuestion: [{
      id: 1,
      question: "Identify the statistical methods applied in the paper.",
    }],
    type: "contents",
  },
  {
    id: 11,
    promptKey: "Statistical Tools",
    promptQuestion: [{
      id: 1,
      question: "Identify the statistical tools or software used.",
    }],
    type: "contents",
  },
  {
    id: 12, promptKey: "Limitations", promptQuestion: [{
      id: 1,
      question: "Identify the limitations or constraints mentioned in the research.",
    }], type: "contents"
  },
  {
    id: 13,
    promptKey: "Future Directions",
    promptQuestion: [{
      id: 1,
      question: "Identify the suggested future research directions.",
    }],
    type: "contents",
  },
  {
    id: 14, promptKey: "Conclusions", promptQuestion: [{
      id: 1,
      question: "Identify the conclusions drawn from the research.",
    }], type: "contents"
  },
]

export const termAndCondition=[
  {title:'Ownership & Rights',
  points:['You confirm that the template you are submitting is your original work, or that you have the necessary rights and permissions to share it.',
  'You grant us a non-exclusive, royalty-free, worldwide license to display, distribute, and promote your template on our platform.']},
  {title:'Public Availability',
    points:['Once submitted as a Community Template, your template will be visible to all users and may be copied, reused, or adapted by others.',
    'You acknowledge that Community Templates cannot be made private later.']},
    {title:'Content Standards',
      points:['Templates must not contain sensitive, offensive, harmful, or copyrighted material without permission.',
      'Submissions that violate platform policies may be removed without notice.']},
      {title:'Category Tagging',
        points:['You may select up to two categories to help users discover your template.',
        'Misleading or irrelevant category selection may result in rejection or reclassification by moderators.']},
        {title:'Attribution (Optional)',
          points:['You may include your name or handle in the description if you wish to be credited.',
          'We may display your name as the original contributor unless you choose to remain anonymous.']},
          {title:'Platform Usage',
            points:['The template may be featured or used in platform demos, showcases, or marketing materials.']},
            {title:'Changes & Removal',
              points:['We reserve the right to edit, remove, or reclassify templates if they violate terms or harm the user experience.',
              'You may request removal by contacting support, but redistribution by others cannot be undone.']},

]