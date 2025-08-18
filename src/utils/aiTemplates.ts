import { toPascalCase, toPascalCaseWithUnderscore } from "@/utils/commonUtils";

export const defaultTemplate = `
Input: Text with academic article content

1. Extract Basic Information:
   - Title: <title>
   - Authors: <authors>
   - Publication Date: <publication_date>
   - Number of Pages: <number_of_pages>
   - Upload Date: <upload_date>
   - File Size: <file_size>

2. Extract Academic Content:
   - Abstract: <abstract>
   - Keywords: <keywords>
   - Overall Strengths and Weaknesses: <strengths_and_weaknesses>
   - Key Points and Findings: <key_points_and_findings>

3. Extract Research Details:
   - Research Approach: <research_approach> (e.g., Quantitative, Qualitative, Mixed Methods, Theoretical, Empirical, Experimental, Observational, Review, Original Research)
   - Data Type: <data_type> (e.g., Quantitative Data, Qualitative Data - Interviews, Surveys, Focus Groups)
   - Research Methods: <research_methods> (e.g., Surveys & Questionnaires, Interviews & Focus Groups, Case Studies, Experiments, Observational Studies, Text Analysis & Computational Methods)
   - Models and Frameworks: <models_and_frameworks> (e.g., Linear Regression, Structural Equation Modeling)
   - Statistical Approaches and Methods: <statistical_approaches> (e.g., ANOVA, Chi-Square Test)
   - Statistical Software Employed: <statistical_software> (e.g., SPSS, R)

4. Extract Quality Metrics:
   - Methodology: <methodology> (keywords and phrases suggesting specific research designs)
   - Validity: <validity> (indicators of strong evidence support)
   - Reliability: <reliability> (mentions of limitations, replicability discussions, and pilot studies)
   - Author Credibility: <author_credibility> (retrieved from Google Scholar API, including publication history)
   - Bias: <bias> (keywords and phrases indicating potential biases - sampling, researcher background, sponsor influence)
   - Confidence Scores: <confidence_scores> (generated for each quality aspect to indicate the certainty of AI assessments)

5. Extract Citation and Impact Metrics:
   - Citation Counts: <citation_counts>
   - Impact Factors: <impact_factors>
   - Related Works: <related_works>
   - Author Profiles: <author_profiles>

6. Extract Metadata for Searching and Filtering:
   - Keywords Extracted from the Text: <extracted_keywords>
   - Metadata Fields: <metadata_fields> (e.g., Journal Name, Abstract)

Process: Use natural language processing (NLP) and machine learning algorithms to analyze and extract information from the text file. Utilize text file processing libraries (e.g., Python's built-in functions, pandas) to extract and process text. Apply Named Entity Recognition (NER) and other NLP methods to structure and classify the data.

Output Format: Return the extracted information in JSON format with the following structure:

{
    "Basic Information": {
        "Title": "<title>",
        "Authors": "<authors>",
        "Publication Date": "<publication_date>",
        "Number of Pages": "<number_of_pages>",
        "Upload Date": "<upload_date>",
        "File Size": "<file_size>"
    },
    "Academic Content": {
        "Abstract": "<abstract>",
        "Keywords": "<keywords>",
        "Overall Strengths and Weaknesses": "<strengths_and_weaknesses>",
        "Key Points and Findings": "<key_points_and_findings>"
    },
    "Research Details": {
        "Research Approach": "<research_approach>",
        "Data Type": "<data_type>",
        "Research Methods": "<research_methods>",
        "Models and Frameworks": "<models_and_frameworks>",
        "Statistical Approaches and Methods": "<statistical_approaches>",
        "Statistical Software Employed": "<statistical_software>"
    },
    "Quality Metrics": {
        "Methodology": "<methodology>",
        "Validity": "<validity>",
        "Reliability": "<reliability>",
        "Author Credibility": "<author_credibility>",
        "Bias": "<bias>",
        "Confidence Scores": {
            "methodology": "<confidence_scores_methodology>",
            "validity": "<confidence_scores_validity>",
            "reliability": "<confidence_scores_reliability>",
            "author_credibility": "<confidence_scores_author_credibility>",
            "bias": "<confidence_scores_bias>"
        }
    },
    "Citation and Impact Metrics": {
        "Citation Counts": "<citation_counts>",
        "Impact Factors": "<impact_factors>",
        "Related Works": "<related_works>",
        "Author Profiles": "<author_profiles>"
    },
    "Metadata for Searching and Filtering": {
        "Keywords Extracted from the Text": "<extracted_keywords>",
        "Metadata Fields": "<metadata_fields>"
    }
}

Text Content:
`;

export const metadataDefaultTemplate = `
Input: Text with academic article content

1. Extract Basic Information:
   - Title: <title>
   - Authors: <authors>
   - Publication Date: <publication_date>
   - Number of Pages: <number_of_pages>
   - Upload Date: <upload_date>
   - File Size: <file_size>

2. Extract Academic Content:
   - Abstract: <abstract>
   - Keywords: <keywords>


Process: Use natural language processing (NLP) and machine learning algorithms to analyze and extract information from the text file. Utilize text file processing libraries (e.g., Python's built-in functions, pandas) to extract and process text. Apply Named Entity Recognition (NER) and other NLP methods to structure and classify the data.

Output Format: Return the extracted information in JSON format with the following structure:

{
    "Basic Information": {
        "Title": "<title>",
        "Authors": "<authors>",
        "Publication Date": "<publication_date>",
        "Number of Pages": "<number_of_pages>",
        "Upload Date": "<upload_date>",
        "File Size": "<file_size>"
    },
    "Academic Content": {
        "Abstract": "<abstract>",
        "Keywords": "<keywords>",
    },
}

Text Content:
`;

export const requestWithChatHistoryTemplate = `
Input: Text with extracted PDF data and user chat history

1. Extract Academic Content:
   - Abstract: <abstract>
   - Keywords: <keywords>

2. Include User Chat History:
    - Chat History (Last 5 Messages): [
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       }
     ]

3. User Question: <user_question>

Process: Use NLP and machine learning algorithms to analyze the provided text and chat history. Generate a single, clear response to the user question, without any introductory or extra text. Respond directly to the query using relevant context from the chat history and the PDF data.

Text Content:
`;

export const requestNewChatHistoryTemplate = `
Input: Text with extracted PDF data and user chat history

1. Extract PDF Metadata:
   - Title: <title>
   - Authors: <authors>
   - Publication Date: <publication_date>
   - Number of Pages: <number_of_pages>
   - Upload Date: <upload_date>
   - File Size: <file_size>

2. Extract Academic Content:
   - Abstract: <abstract>
   - Keywords: <keywords>

3. Include User Chat History:
   - Chat History (Last 5 Messages): [
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       }
     ]

4. User Question: <user_question>

Process: Use natural language processing (NLP) and machine learning algorithms to analyze the provided text and chat history. Generate a direct response to the user question without any introductory or extra text.

Text Content:
`;

export const requestStrongChatHistoryTemplate = `
Input: Detailed PDF data and user chat history

1. Extract PDF Metadata:
   - Title: <title>
   - Authors: <authors>
   - Publication Date: <publication_date>
   - Pages: <number_of_pages>
   - Upload Date: <upload_date>
   - File Size: <file_size>

2. Dive into the Academic Content:
   - Abstract: <abstract>
   - Keywords: <keywords>

3. User Chat History Highlights:
    - Recent Interactions (Last 5 Messages): [
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       }
     ]

4. User's Query: <user_question>

Process: Engage with the user by analyzing the provided text and chat history through advanced natural language processing (NLP) and machine learning. Craft a response that feels personalized and direct, without unnecessary formalities.
- For casual greetings or unrelated queries: "Hi there! How can I help you today?"
- If the question is vague or confusing: "Could you clarify that for me?"
- For all other questions: Provide a clear, concise answer, leveraging both the chat history and the extracted PDF content.

Text Content:
`;

export const requestWithMetadataExtractionTemplate = `
Input: Extracted PDF data and user chat history

1. Extract and Analyze PDF Content:
   - Abstract: <abstract>
   - Strengths and Weaknesses: <strengths_and_weaknesses>
   - Key Points and Findings: <key_points_and_findings>
   - Research Approach: <research_approach>
   - Data Type: <data_type>
   - Research Methods: <research_methods>
   - Models & Frameworks: <models_and_frameworks>
   - Statistical Approaches & Tools: <statistical_approaches_and_tools>
   - Citations & References: <citations_and_references>
   - Research Reliability (Limitations, Replicability, Pilot Studies): <research_reliability>
   - Publication Year, Authors, and Title: <publication_year_authors_title>

2. User Chat History Summary:
    - Recent Interactions (Last 5 Messages): [
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       }
     ]

3. User's Query: <user_question>

Process: Utilize advanced NLP and machine learning algorithms to analyze the extracted PDF content and user chat history. Provide a direct, personalized response to the user's query.
- If the query is a general greeting or unrelated to the PDF content: "Hi there! How can I assist you today?"
- If the query is unclear or confusing: "Could you clarify that for me?"
- For relevant queries: Provide a clear, concise answer, leveraging both the chat history and the extracted PDF content.

Text Content:
`;

export const requestChatPDFTemplate = `
Input: Extracted PDF data and user chat history

1. PDF Summary:
   - Abstract: [Insert Abstract Here]
   - Keywords: [Insert Keywords Here]
   - Key Findings: [Insert Key Findings Here]

2. Recent User Interactions:
   - Message 1: "[User1]: [Text]"
   - Message 2: "[User2]: [Text]"
   - Message 3: "[User1]: [Text]"
   - Message 4: "[User2]: [Text]"
   - Message 5: "[User1]: [Text]"

3. User Question: [Insert User Question Here]

Process:
- Analyze the PDF summary and user chat history.
- Provide a clear, direct answer to the user's question.

Expected Output:
- A single, direct answer to the user question, with no additional context or explanation.

`;

export const extractPDFDetailsTemplate = `
Input: PDF content and user question

1. Extract the following details from the provided PDF:
   - Abstract
   - Overall strengths and weaknesses
   - Key Points and Findings
   - Research Approach
   - Data Type
   - Research Methods
   - Models & Frameworks
   - Statistical Approach & Methods

2. User Question: <user_question>

Process: Use natural language processing (NLP) to extract the relevant details from the PDF and return the data in XML format.

Expected Output:
- An XML-formatted response containing the extracted details.
`;

export const requestPDFMetadataTemplate = `
Input: Text with extracted PDF data

1. Extract Metadata:
   - Abstract: <abstract>
   - Strengths and Weaknesses: <strengths_and_weaknesses>
   - Key Points and Findings: <key_points_and_findings>
   - Research Approach: <research_approach>
   - Data Type: <data_type>
   - Research Methods: <research_methods>
   - Models & Frameworks: <models_and_frameworks>
   - Statistical Approach & Methods: <statistical_approach_and_methods>

2. Additional Meta Information:
   - Citation Counts: <citation_counts>
   - Impact Factors: <impact_factors>
   - Related Works: <related_works>

3. User Question: <user_question>

Process: Use natural language processing (NLP) and machine learning algorithms to analyze the provided PDF content. Generate a clear and direct response to the user question without any introductory or extra text.

Text Content:
`;

export const requestAuthChatHistoryTemplate = `
Input: Detailed PDF data and user chat history

1. Extract PDF Metadata:
   - Title: <title>
   - Authors: <authors>
   - Publication Date: <publication_date>
   - Pages: <number_of_pages>

2. Dive into the Academic Content:
   - Abstract: <abstract>
   - Keywords: <keywords>

3. User Chat History Highlights:
    - Recent Interactions (Last 5 Messages): [
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       }
     ]

4. User's Query: <user_question>

Process: Provide a direct and concise response based solely on the user's query. Ignore any extra data and focus only on answering the specific question asked.
- Focus exclusively on answering the user's question. 

Text Content:
`;

export const requestAuthJSONChatHistoryTemplate = `
Input: Detailed PDF data and user chat history

1. Extract PDF Metadata:
   - Title: <title>
   - Authors: <authors>
   - Publication Date: <publication_date>
   - Pages: <number_of_pages>

2. Dive into the Academic Content:
   - Abstract: <abstract>
   - Keywords: <keywords>

3. User Chat History Highlights:
    - Recent Interactions (Last 5 Messages): [
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       },
       {
         "user": "<user>",
         "text": "<text>"
       }
     ]

4. User's Query: <user_question>

Process: Provide a direct and concise response based solely on the user's query. Ignore any extra data and focus only on answering the specific question asked.
- Focus exclusively on answering the user's question. 
- Provide a direct and concise response based solely on the user's query.
- Do not include any extra information or context.
- Return the extracted information in JSON format.

Text Content:
`;

export const requestJSONChatHistoryTemplate = `
{
  "document": "Uploaded PDF content",
  "queries": [
    {
      "query": "Extract the title of the publication.",
      "expected_response_format": {
        "type": "text"
      }
    },
    {
      "query": "Summarize the abstract of the publication in one sentence.",
      "expected_response_format": {
        "type": "text"
      }
    },
    {
      "query": "List the key findings from the research publication.",
      "expected_response_format": {
        "type": "text"
      }
    },
    {
      "query": "Identify the research approach used in this publication.",
      "expected_response_format": {
        "type": "select_one",
        "options": ["Quantitative", "Qualitative", "Mixed Methods", "Theoretical", "Empirical", "Experimental", "Observational", "Review", "Original Research"]
      }
    }
  ]
}  
  
Process:Return the extracted information in JSON format only
`;

export const requestResearchTemplateData = `
Extract the following information from docs:
{
  "Abstract": "string",
  "PublicationDate": "string",
  "Authors": "string",
  "NumberOfPages": number,
  "UploadDate": "string",
  "UserDefinedTags": ["string"],
  "Keywords": ["string"],
  "PublicationYear": "string",
  "JournalName": "string"
	"Strengths": "string",
	"Weaknesses": "string",
	"KeyPointsAndFindings": "string",
	"ResearchApproach": "string",
	"DataType": "string",
	"ResearchMethods": "string",
	"ModelsAndFrameworks": "string",
	"StatisticalApproachAndMethods": "string",
}

Ensure the following:
- Return the extracted information only in JSON format with the first letter of each key capitalized and formatted exactly as specified above.
- Do not include any additional text or metadata, just the JSON object.
- Ensure the key names in the JSON output match exactly as specified.
- if there is some error in any case then full response must been in json format not in normal.
- if there is data not present then not return null against value return blank string nothing else.
1. **Response Handling:** Validate that the response is in JSON format. The response must be an object with the required fields as described.
2. **Error Handling:** If the response is not in JSON format or is invalid, handle errors appropriately by throwing an exception.
3. **Data Validation:** Ensure that the returned JSON object contains all required fields and matches the expected structure. Perform validation checks and throw errors if the data does not meet the expected format.
4. **Logging:** Log any errors encountered during the fetching and processing stages for debugging purposes.
5. If any data is not available, use an empty string ("") for values of type string and an empty array ([]) for values of type ["string"].
- never start response with word json.
`;

export const requestSearchTemplateData = `
Extract the following information:
- Title
- Authors
- Publication Date
- Number of Pages
- Upload Date & File Size
- User-defined Tags
- Abstract
- Overall strengths and weaknesses of the research publication
- Key Points and Findings
- Research Approach (Quantitative, Qualitative, Mixed Methods, etc.)
- Data Type (Quantitative, Qualitative, etc.)
- Research Methods (Surveys, Interviews, Case Studies, etc.)
- Models & Frameworks (Statistical models, frameworks, etc.)
- Statistical Approach & Methods (ANOVA, Chi-Square, etc.)
Process: Return the extracted information only in JSON format with first letter capital keys.

Ensure the following:
1. **Response Handling:** Validate that the response is in JSON format. The response must be an object with the required fields as described.
2. **Error Handling:** If the response is not in JSON format or is invalid, handle errors appropriately by throwing an exception.
3. **Data Validation:** Ensure that the returned JSON object contains all required fields and matches the expected structure. Perform validation checks and throw errors if the data does not meet the expected format.
4. **Logging:** Log any errors encountered during the fetching and processing stages for debugging purposes.
`;

export const requestSearchDashboardTemplateData = `
Extract the following information:
- Title
- Authors
- Publication  Date
- Number of Pages
- Upload Date 
- User-defined Tags
- Abstract
- Overall strengths and weaknesses
- research publication
- Key Points and Findings
- Research Approach (Quantitative, Qualitative, Mixed Methods, etc.)
- Data Type (Quantitative, Qualitative, etc.)
- Research Methods (Surveys, Interviews, Case Studies, etc.)
- Models & Frameworks (Statistical models, frameworks, etc.)
- Statistical Approach & Methods (ANOVA, Chi-Square, etc.)
- Statistical Tools Used
- Research Topic and Questions
- Research Data Used
- Limitations Shared by the Author
- Future Directions for Further Research
- Top 5 Keywords related to the paper
- Journal name

Process: Return the extracted information only in JSON format with first letter capital keys.
Extract the following information and ensure the response follows this format:

{
  "Title": "string",
  "Authors": "string",
  "PublicationDate": "string",
  "NumberOfPages": number,
  "UploadDate": "string",
  "UserDefinedTags": ["string"],
  "Abstract": "string",
  "OverallStrengthsAndWeaknesses": ["string"],
  "ResearchPublication": ["string"],
  "KeyPointsAndFindings": ["string"],
  "ResearchApproach": ["string"],
  "DataType": ["string"],
  "ResearchMethods": ["string"],
  "ModelsAndFrameworks": ["string"],
  "StatisticalApproachAndMethods": ["string"],
  "StatisticalToolsUsed": ["string"],
  "ResearchTopicAndQuestions": ["string"],
  "LimitationsSharedByTheAuthor": ["string"],
  "FutureDirectionsforFurtherResearch": ["string"],
  "Top5Keywords": ["string"],
  "JournalName": "string",
}

Ensure the following:
- Return the extracted information only in JSON format with the first letter of each key capitalized and formatted exactly as specified above.
- Do not include any additional text or metadata, just the JSON object.
- Ensure the key names in the JSON output match exactly as specified.
- if there is some error in any case then full response must been in json format not in normal.
- if there is data not present then not return null against value return blank string nothing else.
1. **Strict JSON Output:** The response must be in strict JSON format. Do not include any explanatory text or metadata outside of the JSON object.
2. **Response Handling:** Validate that the response is in JSON format. The response must be an object with the required fields as described.
3. **Error Handling:** If the response is not in JSON format or is invalid, handle errors appropriately by throwing an exception.
4. **Data Validation:** Ensure that the returned JSON object contains all required fields and matches the expected structure. Perform validation checks and throw errors if the data does not meet the expected format.
5. **Logging:** Log any errors encountered during the fetching and processing stages for debugging purposes.
6. **Detailed Extraction:** Extract additional contextual details as specified for each subheading, providing expanded descriptions where relevant.  If possible, provide a minimum of four sentences or points for each subheading, expanding as noted above.
7. If any data is not available, use an empty string ("") for values of type string and an empty array ([]) for values of type ["string"].
`;

export const generateIdeas = (keyword: string, dropdownValue: string) => {
  const selectedValue: any = {
    Topics: `Act as a senior researcher, thinking deeply and working step by step, using "${keyword}" keywords, 
    provide me with creative research topics that are related. Use the SCAMPER brainstorming method to come with 
    creative unique research topics. For each letter of SCAMPER provide the creative response. and please give me the working website link to the answer you gave me.

     Output Format: Return the extracted information in JSON format with the following structure:

   {
    "Substitute": {
        "topic": "<topic>",
        "description": "string",
        "references":"link"
    },
    "Combine": {
        "topic": "<topic>",
        "description": "string",
        "references":"link",
    },
    "Adapt": {
        "topic": "<topic>",
        "description": "string",
        "references":"link",
    },
    "Modify": {
        "topic": "<topic>",
        "description": "string",
        "references":"link",
    },
    "Put to other use": {
        "topic": "<topic>",
        "description": "string",
        "references":"link",
    },
    "Eliminate": {
        "topic": "<topic>",
        "description": "string",
        "references":"link",
    },
    "Rearrange": { 
        "topic": "<topic>",
        "description": "string",
        "references":"link",
    },

    Do not add any extra structure or information outside this format.
    note : the description should be only 35 words, no longer than 35 words.
    `,
    Questions: `Act as a senior researcher, thinking deeply and working step by step, using "${keyword}" question or keywords, provide me with creative 
    research questions that are related. Use the SCAMPER brainstorming method to come with creative unique research questions that 
    can be used for an academic paper. For each letter of SCAMPER provide the creative response. and please give me the working website link to the answer you gave me.
    
     Output Format: Return the extracted information in JSON format with the following structure:

   {
    "Substitute": {
        "question": "<question>",
        "references":"link"
    },
    "Combine": {
        "question": "<question>",
        "references":"link"
    },
    "Adapt": {
        "question": "<question>",
        "references":"link"
    },
    "Modify": {
        "question": "<question>",
        "references":"link"
    },
    "Put to other use": {
        "question": "<question>",
        "references":"link"
    },
    "Eliminate": {
        "question": "<question>",
        "references":"link"
    },
    "Rearrange": { 
        "question": "<question>",
        "references":"link"
    },

    Do not add any extra structure or information outside this format.
    note : the description should be only 35 words, no longer than 35 words.
    `,
  };
  return `${selectedValue?.[dropdownValue]}
  }`;
};

export const singlegenerateIdeas = (
  keyword: string,
  dropdownValue: string,
  topic: string
) => {
  const selectedValue: any = {
    Topics: `Act as a senior researcher, thinking deeply and working step by step, using "[${keyword}]" keywords, 
    provide me with creative research topics that are related. Use the SCAMPER brainstorming method to come with 
    creative only this one ${topic} unique research topic. and please give me the working website link to the answer you gave me.

     Output Format: Return the extracted information in JSON format with the following structure:
   {
    ${topic}: {
        "topic": "<topic>",
        "description": "string",
        "references":"link"
    },
         Do not add any extra structure or information outside this format.
         note : the description should be only 35 words, no longer than 35 words.
    `,
    Questions: `Act as a senior researcher, thinking deeply and working step by step, using "[${keyword}]" question or keywords, provide me with creative 
    research questions that are related. Use the SCAMPER brainstorming method to come with creative only this one ${topic} unique research question that 
    can be used for an academic paper. and please give me the working website link to the answer you gave me.
    
     Output Format: Return the extracted information in JSON format with the following structure:
   {
        ${topic}: {
       "question": "<question>"
       "references":"link"
    },
  }

    Do not add any extra structure or information outside this format.
    note : the description should be only 35 words, no longer than 35 words.
    `,
  };
  return `${selectedValue?.[dropdownValue]}
  }`;
};

export const generateWebSearch = (keyword: string) => {
  return `Research "[${keyword}]" and respond only with a valid JSON block. Please provide a comprehensive overview in the style of McKinsey research articles, as if it were short impactful article for a magazine with inline references to sources.  Sources at the end of the article needs to include the website link reference. Review sources carefully and the response before writing the overview. The article could include the elements, below are examples of what could be included, review, add or replace as appropriate for the topic and research:
      Engaging Introduction: Start with an interesting hook that introduces the topic and its significance.
      Key Statistics: Include relevant statistics that highlight the importance or impact of the topic. 
      Examples or Case Studies or useful data: Provide specific examples or case studies that illustrate the topic in action.
      Ideas or Notable Efforts or Solutions: Discuss any significant efforts or solutions related to the topic, such as initiatives, innovations, or research findings.
      Conclusion: Sum up the main points and reflect on the future implications of the topic. .
      Reference – Include recent, verifiable statistics from authoritative sources to emphasize the impact or importance of the topic.
      also the article must content a title as well with double hash(##) in start. because it need to be passed in markdown viewer.

      If the keyword is unclear, nonsensical, or lacks reliable information (e.g. "AAAA", "asdfg", "xyz123"), return a valid JSON with a generic message inside the "article" field explaining that no meaningful research can be conducted on the provided input.

      Also include a boolean field "makeSense" in the JSON output that should be true if the keyword is valid and meaningful, or false if the keyword is unclear, nonsensical, or lacks reliable information.

      And If "makeSense" is false, please add a short message explaining why it doesn't make sense by including a "reason" field.

        ⚠️ **Important Notes:**
      - don not add any References in article
      -If no reliable sources are available, state that instead of providing unverifiable information. Do not generate or assume sources. 
      -do not add links .
      -please do not add this sentence in response "style of McKinsey" and do not added additional information.
      
      Respond **strictly** in the following format:
      {
        "article": "<Insert the researched article here. Do not include sources or links inside this block.>",
        "keyWords": ["<Insert 5 relevant keywords based on the article content>"],
        "makeSense": true or false,
        "reason": "add if makeSense is false"
      }
      
      `;
};

export const generateHandlingTemplate = (
  data: any[],
  templatePrompt?: string,
  responseType?: string
) => {
  let template = `
Extract the following information based on the provided structure:\n`;

  data.forEach((item) => {
    if (item.promptQuestion.length > 0) {
      template += `- ${item.promptKey} (process questions sequentially):\n`;
      item.promptQuestion.forEach((question: any, index: number) => {
        template += `  ${index + 1}. ${question.question}\n`;
      });
      template += `  Return the final response as the value for the "${item.promptKey}" key.\n`;
    } else {
      template += `- ${item.promptKey}\n`;
    }
  });

  const typeLine =
    responseType === "concise"
      ? `- responseType = "concise" → Provide a concise summary in 1 sentences or bullet points, focusing only on key points.`
      : responseType === "detailed"
      ? `- responseType = "detailed" → Provide a multi-point detailed response in the format: "ans": [{data:"..."}] — each 'data' field should contain a meaningful sentence.`
      : "";

  const typeAnswer =
    responseType === "concise"
      ? `"ans": "Give a brief response in 1 lines or bullet points, The main factors influencing cloud ERP adoption are organizational culture and supportive regulations, which enhance flexibility and decision-making."`
      : responseType === "detailed"
      ? `"ans": [{data: ""}] Provide a detailed and well-explained answer in at least 8-10 sentences. Include key context, supporting points, and any relevant insights that help understand the significance of the answer in relation to the research topic. give much more in-depth analysis, explanation, or extracted data compared to the standard one`
      : `"ans": "Provide a detailed response of at least three to four sentences, explaining the extracted answer with relevant context or elaboration. Ensure the answer is clear and informative."`;

  template += `
Process: Return the extracted information only in JSON format with first letter capital keys. please apply these custom instructions consistently across the entire template content and return the response after applying the conditions:-
${(templatePrompt ?? "").length > 0 ? `**Conditions:**${templatePrompt}` : ``}
Ensure the response follows this format: \n \n`;

  template += `{ \n`;

  data.forEach((item) => {
    if (item.promptQuestion.length > 0) {
      template += ` "${toPascalCase(
        item.promptKey
      )}": ["final response after processing all questions and      
       ### Response Behavior:
        ${typeLine}"]
         **Response Format:**
       {
       ${typeAnswer},
        } ,\n`;
    } else {
      template += ` "${toPascalCase(item.promptKey)}": ["string"],\n`;
    }
  });

  template += `}\n`;

  template += `
Follow these rules when raising objections:
- Process the Key Points questions in sequence, building on the answer of the previous question.
- If a key requires multiple answers, return them as an array in the format ["string", "string"].
- Return the extracted information only in JSON format with the first letter of each key capitalized and formatted exactly as specified above.
- Do not include any additional text or metadata, just the JSON object.
- Ensure the key names in the JSON output match exactly as specified.
- If there is missing data for any field, return an empty string for string values.
- If there is an error in any case, the full response must be in JSON format, not normal text.
- If data is not present, return an empty string for string values and an empty array for array values.
- **Strict JSON Output:** The response must be in strict JSON format. Do not include any explanatory text or metadata outside of the JSON object.
- **Response Handling:** Validate that the response is in JSON format. The response must be an object with the required fields as described."In addition to the above rules
- **Error Handling:** If the response is not in JSON format or is invalid, handle errors appropriately by throwing an exception.
- **Data Validation:** Ensure that the returned JSON object contains all required fields and matches the expected structure. Perform validation checks and throw errors if the data does not meet the expected format.
- **Logging:** Log any errors encountered during the fetching and processing stages for debugging purposes.
- If any data is not available, use an empty string ("") for values of type string and an empty array ([]) for values of type ["string"].\n`;

  return template;
};

export const requestTextHumanizationData = `\nTransform the provided text to sound more natural and human-like. Follow these steps:

STEP 1: Initial Analysis
1. Read the provided text completely.
2. Identify instances of:
   - Passive voice
   - Overly complex vocabulary
   - Repetitive sentence structures
   - Excessive formality

STEP 2: Structural Modifications
1. Convert passive voice to active voice:
   - BEFORE: "The solution was identified by the team"
   - AFTER: "The team identified the solution"
2. Break up sentences longer than 35 words.
3. Vary sentence structure:
   - Start sentences differently.
   - Mix simple and complex sentences.
   - Aim for 6-35 words per sentence.

STEP 3: Language Naturalization
1. Add contractions where appropriate:
   - Change "do not" to "don't."
   - Change "it is" to "it's."
2. Replace overly formal words with simpler alternatives:
   - "utilize" → "use"
   - "nevertheless" → "still"
   - "commence" → "start."
3. Insert natural transitions:
   - "Actually..."
   - "You know..."
   - "The thing is..."
4. Add personal pronouns:
   - Include "I", "you", "we" where appropriate.
   - Address the reader directly.

STEP 4: Engagement Enhancement
1. Add relevant examples or analogies.
2. Insert brief anecdotal elements where appropriate.
3. Include conversational phrases:
   - "Let me tell you..."
   - "Here's the interesting part..."
   - "You might be wondering..."

STEP 5: Final Refinement
1. Read aloud and adjust any unnatural phrasing.
2. Ensure variety in sentence length, vocabulary, and paragraph structure.
3. Add appropriate idioms or figures of speech.
4. Maintain the original meaning and information.

EXAMPLE TRANSFORMATION

Original: "The utilization of renewable energy sources has been implemented by numerous countries for the reduction of carbon emissions."
Transformed: "Many countries are switching to renewable energy to cut down on carbon emissions. It's a smart move, if you ask me - kind of like swapping out old lightbulbs for energy-efficient ones, but on a much bigger scale!"

Key changes:
- Converted passive to active voice
- Added contractions and personal perspective
- Included a relatable analogy
- Used more conversational language

REMEMBER:
The goal is to make the text sound like it was written by a thoughtful, friendly human while preserving all original information.
Please write the text to sound more natural and human-like.
Create a concise and informative response in one line.\n`;

export const questionsGenerate = `Generate exactly 4 questions based on the given paper, each with a word limit of 15 to 35 words.
Return the response in **JSON format only**, without any additional text, explanations, or markdown formatting.
 ### **Restriction**:
         - Return data **only** in the expected response format below. Do not include explanations, headers, or other text.
         - **STRICTLY** return data in the expected JSON format below. Do not include any explanations, comments, or additional text outside this format. 
         
Output Format (strict JSON format):
[
    { "question": "Your question here" },
    { "question": "Your question here" },
    { "question": "Your question here" },
    { "question": "Your question here" }
]
`;

export const recommendSectionsPrompt = `
Extract the following information based on the provided structure:\n

# Intelligent Research Paper Analysis Assistant
You are a sophisticated research assistant with expertise across academic, business, and technical fields. Your task is to analyze any uploaded document, intelligently determine its type and field, and provide a tailored, comprehensive analysis.

## Initial Analysis Protocol

1. First, examine the document to determine:
   
   ### Document Type
   - Academic Research Paper
   - Business White Paper
   - Technical Report
   - Case Study
   - Industry Analysis
   - Systematic Review
   - Meta-Analysis
   - Conference Proceedings
   - Thesis/Dissertation
   - Patent Application

   ### Primary Field(s)
   - Medical/Life Sciences
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
   - Interdisciplinary

2. Based on document structure, identify:
   - Presence of abstract
   - Methodology section
   - Data analysis
   - References/citations style
   - Use of technical jargon
   - Presence of financial data
   - Visual elements (graphs, charts, diagrams)

## Universal Analysis Framework

Provide these sections for all documents:

### Document Overview
- Title
- Author(s)/Organization
- Publication Year
- Publisher/Journal/Platform
- DOI/Identifier (if applicable)
- Document Type Classification
- Field Classification

### Executive Summary
- 3-4 sentence overview
- Primary objective/research question
- Target audience identification

### Key Findings/Arguments
- 3-5 main points
- Significance and implications
- Innovation or novelty factors

### Methodology Assessment
- Research/analysis approach
- Data sources and collection methods
- Analytical techniques employed

### Conclusions and Implications
- Main takeaways
- Practical applications
- Theoretical contributions

### Critical Evaluation
- Strengths and limitations
- Potential biases
- Generalizability
- Quality of evidence

## Field-Specific Analysis Sections

### For Medical/Life Sciences
- Patient/Sample Demographics
- Clinical Implications
- Safety and Efficacy Data
- Biological Mechanisms
- Therapeutic Potential
- Regulatory Considerations
- Public Health Impact

### For Business/Economics
- Market Analysis
- Financial Metrics
- ROI Calculations
- Competitive Landscape
- Business Model Implications
- Risk Assessment
- Industry Trends
- Stakeholder Impact

### For Technology/Engineering
- Technical Specifications
- Implementation Details
- Performance Metrics
- Scalability Analysis
- Security Considerations
- Integration Challenges
- Tech Stack/Tools Used
- Maintenance Requirements

### For Environmental Sciences
- Environmental Impact Assessment
- Sustainability Metrics
- Ecological Considerations
- Climate Change Implications
- Resource Management
- Policy Recommendations

### For Law/Legal Studies
- Legal Framework Analysis
- Precedent Cases
- Regulatory Implications
- Compliance Requirements
- Jurisdictional Considerations

### For Education
- Pedagogical Approaches
- Learning Outcomes
- Assessment Methods
- Educational Technology
- Curriculum Integration

## Special Document Types

### For Systematic Reviews/Meta-Analyses
- Search Strategy
- Inclusion/Exclusion Criteria
- Quality Assessment of Included Studies
- Synthesis Methods
- Heterogeneity Analysis

### For Business White Papers
- Industry Context
- Problem Statement
- Proposed Solution
- Implementation Roadmap
- Cost-Benefit Analysis
- Case Studies/Examples

### For Patents
- Technical Innovation
- Prior Art
- Claims Analysis
- Commercial Potential
- Implementation Feasibility

## Analysis Customization Protocol

1. Document Assessment:
   - Scan for unique structural elements
   - Identify field-specific terminology
   - Note any unconventional sections

2. Section Selection Logic:
   - Start with Universal Analysis Framework
   - Add field-specific sections based on primary field
   - Include relevant sections from other fields if interdisciplinary
   - Add special document type sections if applicable

3. Adaptation Considerations:
   - Adjust technical depth based on target audience
   - Scale detail level based on document complexity
   - Modify language for academic vs. business contexts

## Quality Assurance Checklist

Verify that your analysis:
- Is appropriate for the document type
- Addresses field-specific concerns
- Balances breadth and depth
- Highlights both strengths and limitations
- Provides actionable insights

## Output Formatting

1. Begin with a brief explanation of why you selected certain sections
2. Present analysis in a logical, hierarchical structure
3. Use bullet points for clarity and readability
4. Bold key terms and findings
5. Indicate confidence level for interpretations

## Limitations and Disclaimers

End your analysis by noting:
- Sections requiring specialized expertise
- Any assumptions made in the analysis
- Areas where the document lacked clarity
- Potential conflicts of interest identified
- Suggestions for additional analysis if needed

## Adaptation Examples

### Business Case Study
- Focus on methodology, market impact, and practical applications
- Emphasize ROI and business implications
- Include relevant industry context

### Technical Documentation
- Prioritize technical specifications and implementation details
- Include compatibility and integration considerations
- Assess technical feasibility and scalability

### Policy Paper
- Emphasize regulatory implications and compliance requirements
- Include stakeholder analysis and policy recommendations
- Consider broader societal impact

## Interactive Elements

If possible, suggest:
- Follow-up questions for deeper analysis
- Related documents or research to consult
- Potential applications in other fields
- Areas for future research or analysis

Process: Return the extracted information only in JSON format with first letter capital keys.
Ensure the response follows this format:

{
  "documentType": ["string"], 
  "primaryField": ["string"], 
  "documentStructure": ["string"],
  "documentOverview": {
    "title": ["string"],
    "author": ["string"],
    "publicationYear": ["string"],
    "journal": ["string"],
    "doi": ["string"]
  },
  "executiveSummary": {
    "overview": ["string"],
    "primaryObjective": ["string"],
    "targetAudience": ["string"]
  },
  "keyFindings": {
    "mainPoints": ["string"],
    "significance": ["string"],
    "innovation": ["string"]
  },
  "methodology": {
    "approach": ["string"],
    "dataSources": ["string"],
    "analyticalTechniques": ["string"]
  },
  "conclusions": {
    "mainTakeaways": ["string"],
    "practicalApplications": ["string"],
    "theoreticalContributions": ["string"]
  },
  "criticalEvaluation": {
    "strengths": ["string"],
    "limitations": ["string"],
    "biases": ["string"],
    "generalizability": ["string"],
    "qualityOfEvidence": ["string"]
  },
  "fieldSpecificAnalysis": {
    "medicalLifeSciences": {
      "patientSampleDemographics": ["string"],
      "clinicalImplications": ["string"],
      "safetyAndEfficacyData": ["string"],
      "biologicalMechanisms": ["string"],
      "therapeuticPotential": ["string"],
      "regulatoryConsiderations": ["string"],
      "publicHealthImpact": ["string"]
    },
    "businessEconomics": {
      "marketAnalysis": ["string"],
      "financialMetrics": ["string"],
      "roiCalculations": ["string"],
      "competitiveLandscape": ["string"],
      "businessModelImplications": ["string"],
      "riskAssessment": ["string"],
      "industryTrends": ["string"],
      "stakeholderImpact": ["string"]
    },
    "technologyEngineering": {
      "technicalSpecifications": ["string"],
      "implementationDetails": ["string"],
      "performanceMetrics": ["string"],
      "scalabilityAnalysis": ["string"],
      "securityConsiderations": ["string"],
      "integrationChallenges": ["string"],
      "techStackToolsUsed": ["string"],
      "maintenanceRequirements": ["string"]
    },
    "environmentalSciences": {
      "environmentalImpactAssessment": ["string"],
      "sustainabilityMetrics": ["string"],
      "ecologicalConsiderations": ["string"],
      "climateChangeImplications": ["string"],
      "resourceManagement": ["string"],
      "policyRecommendations": ["string"]
    },
    "lawLegalStudies": {
      "legalFrameworkAnalysis": ["string"],
      "precedentCases": ["string"],
      "regulatoryImplications": ["string"],
      "complianceRequirements": ["string"],
      "jurisdictionalConsiderations": ["string"]
    },
    "education": {
      "pedagogicalApproaches": ["string"],
      "learningOutcomes": ["string"],
      "assessmentMethods": ["string"],
      "educationalTechnology": ["string"],
      "curriculumIntegration": ["string"]
    }
  }
}

Follow these rules when raising objections:
1. Maintain objectivity throughout the analysis
2. Provide evidence-based assessments
3. Acknowledge limitations of your analysis
4. Use appropriate field-specific terminology
5. Balance technical depth with accessibility
- If a key requires multiple answers, return them as an array in the format ["string", "string"].
- Return the extracted information only in JSON format with the first letter of each key capitalized and formatted exactly as specified above.
- Do not include any additional text or metadata, just the JSON object.
- If there is missing data for any field, return an empty string for string values.
- **Strict JSON Output:** The response must be in strict JSON format. Do not include any explanatory text or metadata outside of the JSON object.
- **Response Handling:** Validate that the response is in JSON format. The response must be an object with the required fields as described.
- **Error Handling:** If the response is not in JSON format or is invalid, handle errors appropriately by throwing an exception.
- **Data Validation:** Ensure that the returned JSON object contains all required fields and matches the expected structure. Perform validation checks and throw errors if the data does not meet the expected format.
- **Logging:** Log any errors encountered during the fetching and processing stages for debugging purposes.
- If any data is not available, use an empty string ("") for values of type string and an empty array ([]) for values of type ["string"].\n
`;

export const generateHandlingRecommendSectionsTemplate = (data: any[]) => {
  let template = `
Extract the following information based on the provided structure:\n
# Intelligent Research Paper Analysis Assistant
You are a sophisticated research assistant with expertise across academic, business, and technical fields. Your task is to analyze any uploaded document, intelligently determine its type and field, and provide a tailored, comprehensive analysis.
\n`;

  data.forEach((item) => {
    if (item.promptQuestion.length > 0) {
      template += `### ${item.promptKey}:\n`;
      item.promptQuestion.forEach((question: any, index: number) => {
        template += `  ${question.question}\n`;
      });
    } else {
      template += `- ${item.promptKey}\n`;
    }
  });

  template += `
## Analysis Customization Protocol

1. Document Assessment:
   - Scan for unique structural elements
   - Identify field-specific terminology
   - Note any unconventional sections

2. Section Selection Logic:
   - Start with Universal Analysis Framework
   - Add field-specific sections based on primary field
   - Include relevant sections from other fields if interdisciplinary
   - Add special document type sections if applicable

3. Adaptation Considerations:
   - Adjust technical depth based on target audience
   - Scale detail level based on document complexity
   - Modify language for academic vs. business contexts

## Quality Assurance Checklist

Verify that your analysis:
- Is appropriate for the document type
- Addresses field-specific concerns
- Balances breadth and depth
- Highlights both strengths and limitations
- Provides actionable insights

## Output Formatting

1. Begin with a brief explanation of why you selected certain sections
2. Present analysis in a logical, hierarchical structure
3. Use bullet points for clarity and readability
4. Bold key terms and findings
5. Indicate confidence level for interpretations

## Limitations and Disclaimers

End your analysis by noting:
- Sections requiring specialized expertise
- Any assumptions made in the analysis
- Areas where the document lacked clarity
- Potential conflicts of interest identified
- Suggestions for additional analysis if needed

## Adaptation Examples

### Business Case Study
- Focus on methodology, market impact, and practical applications
- Emphasize ROI and business implications
- Include relevant industry context

### Technical Documentation
- Prioritize technical specifications and implementation details
- Include compatibility and integration considerations
- Assess technical feasibility and scalability

### Policy Paper
- Emphasize regulatory implications and compliance requirements
- Include stakeholder analysis and policy recommendations
- Consider broader societal impact
    `;

  template += `
Process: Return the extracted information only in JSON format with first letter capital keys.
Ensure the response follows this format: \n \n`;

  template += `{ \n`;

  data.forEach((item) => {
    if (item.promptQuestion.length > 0) {
      if (item.promptQuestion.length == 1) {
        item.promptQuestion.forEach((question: any, index: number) => {
          template += ` "${item.conversionPromptKey}": ["string"],\n`;
        });
      } else if (item.promptQuestion.length > 1) {
        item.promptQuestion.forEach((question: any, index: number) => {
          template += ` "${toPascalCaseWithUnderscore(
            question.question
          )}": ["final response after processing all questions"],\n`;
        });
      } else {
        template += ` "${item.conversionPromptKey}": ["final response after processing all questions"],\n`;
      }
    } else {
      template += ` "${item.conversionPromptKey}": ["string"],\n`;
    }
  });

  template += `}\n`;

  template += `

## Interactive Elements

If possible, suggest:
- Follow-up questions for deeper analysis
- Related documents or research to consult
- Potential applications in other fields
- Areas for future research or analysis

Follow these rules when raising objections:- 
- **In the returned JSON response, key names must remain exactly as specified, with no alterations to their formatting, punctuation, or underscores; any modifications will be considered an error.**
- Process the Key Points questions in sequence, building on the answer of the previous question.
- If a key requires multiple answers, return them as an array in the format ["string", "string"].
- Return the extracted information only in JSON format with the first letter of each key capitalized and formatted exactly as specified above.
- Do not include any additional text or metadata, just the JSON object.
- Ensure the key names in the JSON output match exactly as specified.
- If there is missing data for any field, return an empty string for string values.
- If there is an error in any case, the full response must be in JSON format, not normal text.
- If data is not present, return an empty string for string values and an empty array for array values.
- **Strict JSON Output:** The response must be in strict JSON format. Do not include any explanatory text or metadata outside of the JSON object.
- **Response Handling:** Validate that the response is in JSON format. The response must be an object with the required fields as described.
- **Error Handling:** If the response is not in JSON format or is invalid, handle errors appropriately by throwing an exception.
- **Data Validation:** Ensure that the returned JSON object contains all required fields and matches the expected structure. Perform validation checks and throw errors if the data does not meet the expected format.
- **Logging:** Log any errors encountered during the fetching and processing stages for debugging purposes.
- If any data is not available, use an empty string ("") for values of type string and an empty array ([]) for values of type ["string"].\n`;

  return template;
};

export const multipleQuestion = (title: string, question: string) => {
  return `Acting as a Senior Academic Researcher, work step by step, deeply and slowly. Analyze the research paper titled 
${title}” with the goal of '${question}'. Please provide a detailed analysisˀ`;
};

export const afterAns = (res: string, question: string) => {
  return `${res}"Based on the provided responses, review them all and check that the research goal ${question} has been answered, provide a summary whilst maintaining references to the the papers"`;
};

export const pdfInAiChat = (
  selectedText: string,
  selectValues: string | undefined,
  responseType?: string,
  responseLength?: number,
  checkResponseLength?: boolean
) => {
  const typeLine =
    responseType === "concise"
      ? `- responseType = "concise" → Provide a concise summary in 1 sentences or bullet points, focusing only on key points.`
      : responseType === "detailed"
      ? `- responseType = "detailed" → Provide a multi-point detailed response in the format: "ans": [{data:"..."}] — each 'data' field should contain a meaningful sentence.`
      : "";

  const typeAnswer =
    responseType === "concise"
      ? `"ans": "Give a brief response in 1 lines or bullet points, The main factors influencing cloud ERP adoption are organizational culture and supportive regulations, which enhance flexibility and decision-making."`
      : responseType === "detailed"
      ? `"ans": [{data: ""}] Provide a detailed and well-explained answer in at least 8-10 sentences. Include key context, supporting points, and any relevant insights that help understand the significance of the answer in relation to the research topic. give much more in-depth analysis, explanation, or extracted data compared to the standard one`
      : `"ans": "Provide a detailed response of at least three to four sentences, explaining the extracted answer with relevant context or elaboration. Ensure the answer is clear and informative."`;

  // const lengthLine = checkResponseLength
  //   ? `${responseType === "concise"?"":`- responseLength = ${responseLength} → STRICT word limit for the "ans" field — do not exceed this count.`}`
  //   : "";

  return `Acting as a senior researcher, use the text as context "${selectedText}". Now ${selectValues} the following text.
         • I am working with a PDF and need to extract both an answer and the index of the page it comes from within the PDF's array of pages (not the page number printed in the content). For example, if the PDF has 10 pages, and the answer is on the 4th page, I want the pageNumber field to be 3, representing the page's position in the array (0-based).
        **Ensure the following:**

        1. The response must strictly adhere to the JSON format provided below.
        2. Do not include additional information, explanations, or deviations from the format.
        3. If no answer can be found, return "ans" as an empty string and "pageNumber" as 1 (a number)…
        4. Provide a detailed and informative answer. Ensure the extracted text and page number are presented in separate parts for clarity.
       **Strict JSON Output:** The response must be in strict JSON format. Do not include any explanatory text or metadata outside of the JSON object.
        ### **Restriction**:
        - Return data **only** in the expected response format below. Do not include explanations, headers, or other text.


      ### Response Behavior:
         ${typeLine}

       **Response Format:**
        {
         ${typeAnswer},
         "pageNumber": 3
        }`;
};

export const pdfChatMessage = (
  text: string | undefined,
  responseType?: string,
  responseLength?: number,
  checkResponseLength?: boolean
) => {
  const typeLine =
    responseType === "concise"
      ? `- responseType = "concise" → Provide a concise summary in 1 sentences or bullet points, focusing only on key points.`
      : responseType === "detailed"
      ? `- responseType = "detailed" → Provide a multi-point detailed response in the format: "ans": [{data:"..."}] — each 'data' field should contain a meaningful sentence.`
      : "";

  const typeAnswer =
    responseType === "concise"
      ? `"ans": "Give a brief response in 1 lines or bullet points, The main factors influencing cloud ERP adoption are organizational culture and supportive regulations, which enhance flexibility and decision-making."`
      : responseType === "detailed"
      ? `"ans": [{data: ""}]`
      : `"ans": "Provide a detailed response of at least three to four sentences, explaining the extracted answer with relevant context or elaboration. Ensure the answer is clear and informative."`;

  // const lengthLine = checkResponseLength
  // ? `${responseType === "concise"?"":`- responseLength = ${responseLength} → STRICT word limit for the "ans" field — do not exceed this count.`}`
  // : "";

  return `Main Point: ${text}
    • I am working with a PDF and need to extract both an answer and the index of the page it comes from within the PDF's array of pages (not the printed page number). For example, if the PDF has 10 pages and the answer is on the 4th page, set "pageNumber": 3 (zero-based index).

     **Ensure the following:**
      1. The response must strictly adhere to the JSON format below.
      2. Do not include extra info, headings, explanations, or anything outside the format.
      3. If no answer is found, set "ans" as an empty string and "pageNumber": 1.
      4. Separate the answer text and the page number for clarity.

     ### Response Behavior:
     ${typeLine}

     **Response Format:**
      {
      ${typeAnswer},
      "pageNumber": 3
      }`;
};

export const messageRes = (
  allText: string | undefined,
  responseType?: string,
  responseLength?: number,
  checkResponseLength?: boolean
) => {
  const typeLine =
    responseType === "concise"
      ? `- responseType = "concise" → Provide a concise summary in 1 sentences or bullet points, focusing only on key points.`
      : responseType === "detailed"
      ? `- responseType = "detailed" → Provide a multi-point detailed response in the format: "ans": [{data:"..."}] — each 'data' field should contain a meaningful sentence.`
      : "";

  const typeAnswer =
    responseType === "concise"
      ? `"ans": "Give a brief response in 1 lines or bullet points, The main factors influencing cloud ERP adoption are organizational culture and supportive regulations, which enhance flexibility and decision-making."`
      : responseType === "detailed"
      ? `"ans": [{data: ""}] Provide a detailed and well-explained answer in at least 8-10 sentences. Include key context, supporting points, and any relevant insights that help understand the significance of the answer in relation to the research topic. give much more in-depth analysis, explanation, or extracted data compared to the standard one`
      : `"ans": "Provide a detailed response of at least three to four sentences, explaining the extracted answer with relevant context or elaboration. Ensure the answer is clear and informative."`;

  // const lengthLine = checkResponseLength
  // ? `${responseType === "concise"?"":`- responseLength = ${responseLength} → STRICT word limit for the "ans" field — do not exceed this count.`}`
  // : "";

  return `main point :-${allText}
        • I am working with a PDF and need to extract both an answer and the index of the page it comes from within the PDF's array of pages (not the page number printed in the content). For example, if the PDF has 10 pages, and the answer is on the 4th page, I want the pageNumber field to be 3, representing the page's position in the array (0-based).

        **Ensure the following:**

        1. The response must strictly adhere to the JSON format provided below.
        2. Do not include additional information, explanations, or deviations from the format.
        3. If no answer can be found, return "ans" as an empty string and "pageNumber" as 1 (a number)…
        4. Provide a detailed and informative answer. Ensure the extracted text and page number are presented in separate parts for clarity.
       **Strict JSON Output:** The response must be in strict JSON format. Do not include any explanatory text or metadata outside of the JSON object.
        ### **Restriction**:
        - Return data **only** in the expected response format below. Do not include explanations, headers, or other text.

      ### Response Behavior:
        ${typeLine}

      **Response Format:**
       {
       ${typeAnswer},
       "pageNumber": 3
        } // The page index in the PDF array
      }`;
};

// export const messageRes = (allText: string | undefined) => `main point :-${allText}

// You are assisting a researcher by analyzing a PDF. Extract key findings and insights in a clear and structured format.

// ### Output Requirements:
// - Return the answer as an array of point-wise responses.
// - Each point should be a detailed sentence or two, suitable for academic or research purposes.
// - Provide a **minimum of 3–6 strong points** if content permits.
// - Use **bullet points** (you can omit bullet characters; they'll be added in the UI).
// - Do not include the original question or page content in the answer.
// - Identify the **0-based index of the page** in the PDF where the answer was found.

// ### If no answer is found:
// - Return \`"ans": []\` (empty array)
// - Return \`"pageNumber": 1\`

// ### Strict Output JSON Format (No explanation, no markdown):
// {
//   "ans": [
//     { "data": "Point 1: Clearly explain a relevant insight for the question." },
//     { "data": "Point 2: Add more descriptive and useful information." },
//     { "data": "Point 3: Include supporting logic, context, or implications." }
//   ],
//   "pageNumber": 3
// }`;
export const aiTopic = (data: []) => {
  return `using the below interests, share 5 related research topics limited to 5 or 6 words per topic. 
  For example, related to topic energy, "technological advancements in renewable energy storage". 
  Here are the interests: ${data}. 
  JSON format with the following structure:[{data:""},{data:""}]
  ⚠️ **Important Notes:**
  - Do **not** include any structure or content outside of the JSON format.
  `;
};

export const outlineGenerator = (
  title: string,
  type: string,
  level: string
) => {
  return `📘 **Topic Title:** ${title}

You are to act as a **${type}**, creating an outline for a paper based on the topic above. Your writing should be tailored for a **${level}** audience.

📄 **Instructions:**
Write an outline for a paper titled "${title}". Use a ${type} tone and ensure the content is suitable for ${level} readers. The structure, language, style, and depth should match the expectations for a ${level} level paper.

✅ **Guidelines to follow (example for Consultant role and Strategic level – adjust if different):**
• Focus on strategic implications and actionable insights.  
• Include clear and concise subheadings.  
• Address potential disruptions, opportunities, and risks.  
• Offer recommendations for organizational adaptation and competitive advantage.  
• Consider ethical and policy implications.  
• Include potential use cases and examples.  
• Structure the paper with an executive summary, introduction, analysis, strategic responses, and a conclusion.  
• Suggest areas where ROI can be calculated.  

• Account for the rate of technological change.  
• Include potential case studies.

🧾 **Expected JSON Response Format:**

{
  "data": {
    "title": ["Section 1 Title", "Point A", "Point B"],
    "title": ["Section 2 Title", "Point A", "Point B"],
    "title": ["Section 3 Title", "Point A", "Point B"],
    "title": ["Section 4 Title", "Point A", "Point B"],
    "title": ["Section 5 Title", "Point A", "Point B"],
    "title": ["Section 6 Title", "Point A", "Point B"],
    "title": ["Section 7 Title", "Point A", "Point B"],
    "title": ["Section 8 Title", "Point A", "Point B"]
  }
}

⚠️ **Important Notes:**
- Do **not** include any structure or content outside of the JSON format.
- Every element in the arrays must be a **non-empty string**.
- Replace "title"  with actual section names. do not add extra info like numbers.
`;
};

export const multipleModelsTemplate = (
  question: string,
  answer1: string,
  answer2: string
) => {
  return `
          You have been provided with a question and answers from two different models. Your task is to compare the answers and provide a final, corrected version of Answer 1 if there are discrepancies between the two.

          **Question:** 
          ${question}

          **Answer 1:** 
          ${answer1}

          **Answer 2:** 
          ${answer2}

          Instructions for AI model:  
          1. If the answers are the same, return the same response as Answer 1.
          2. If the answers differ, compare the two answers, analyze the discrepancies, and provide a corrected version of Answer 1 based on the context provided by Answer 2.
          3. If the answers differ, analyze the discrepancies and provide a corrected version of Answer 1. Use the context from Answer 2 to improve the accuracy of the response.  
          
         **Ensure the following:**  
         - Validate the question requirements and return the response strictly in the format provided within the question.  
         - Do not deviate from the response format specified in the question.  
         - If discrepancies exist, ensure that corrections align with the question's context and format requirements.  
         - Do not include explanations, comments, or metadata outside of the required format.  
         - The response must strictly adhere to the JSON format provided below.
         - Do not include additional information, explanations, or deviations from the format.
         - If no answer can be found, return "ans" as an empty string and "pageNumber" as 1 (a number)…
         - Provide a detailed and informative answer. Ensure the extracted text and page number are presented in separate parts for clarity.
        ### **Restriction**:
         - Return data **only** in the expected response format below. Do not include explanations, headers, or other text.
         - **STRICTLY** return data in the expected JSON format below. Do not include any explanations, comments, or additional text outside this format.  
         ### **Mandatory Restrictions:**
         - **Do NOT** include explanations, introductions, or headers.  
         - **Do NOT** add comments, metadata, or extra information.  
         - **ONLY** return a valid JSON object in the exact format below.  

       ---

         ### **Required JSON Format (STRICTLY FOLLOW THIS):**  
             \`\`\`json
             {            
               "ans": "Provide a detailed response of at least three to four sentences, explaining the extracted answer with relevant context or elaboration. Ensure the answer is clear and informative.",
                "pageNumber": 3
             }
             \`\`\`

       ---

            ⚠ **IMPORTANT**:  
           - Any response outside of this JSON format is invalid.  
           - If no valid answer can be generated, return:  
            \`\`\`json
               {
             "ans": "i havent find answer",
            "pageNumber": 1
               }
            \`\`\`
          - Do not return any extra words, explanations, or formatting beyond this JSON object.  

      ---
           Now, generate the final JSON response strictly in the required format.
        `;
};

export const requestPaperAnalysisTemplateData = () => {
  return `
  Extract the following information:
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
  
  Process: Return the extracted information only in JSON format with first letter capital keys.
  Analyse the uploaded PDF document to extract specific information related to a research paper. Perform the extraction step-by-step, ensuring that if any section or detail is not found, you proceed to the next without generating any fictitious data. Present the findings systematically according to the specified sections.
  
  ### Instructions for Extraction:
  1. **Strict JSON Output**:
     - Return the extracted information **only in JSON format**. Do not include any explanatory text or metadata outside of the JSON object.
     - Ensure the first letter of each key is capitalized and the key names match exactly as specified below.
  
  2. **Error Handling**:
     - If the response cannot extract information due to missing data, include an empty string for string-type values and an empty array ([]) for values of type ["string"].
     - If an error occurs, return a structured JSON object containing the following format:
  
  3. **Response Validation**:
     - Validate that the response is in strict JSON format.
     - Ensure the returned JSON object contains all required fields and matches the expected structure.
  
  4. **Detailed Extraction**:
     - Provide detailed and expanded descriptions where possible.
     - For each section, include a **minimum of four sentences or points** to ensure comprehensive data coverage.
  
  5. **Field Structure**:
     Return the extracted information in the following JSON structure:
     {
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
     }
  6. If any data is not available, use an empty string ("") for values of type string and an empty array ([]) for values of type ["string"].
  

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
7. If any data is not available, use an empty string ("") for values of type string and an empty array ([]) for values of type ["string"].
`;
};

export const chatWithAIPDFPrompt = (content: string, message: string) => {
  return `You are acting as a Senior Academic Researcher. Thoroughly and systematically analyze the provided content: "${content}". Address the query or objective: "${message}". Provide a comprehensive and detailed analysis based on the content. Ensure that the response directly addresses the query, includes well-referenced points, and offers a concise summary while maintaining relevance to the content.`;
};

export const chatWithPDFPrompt = (context: string, message: string) => {
  return `You are an expert research assistant engaging in an interactive chat. Analyze the provided content based on the following context: "${context}". Respond to the message: "${message}" by extracting relevant data step by step. Structure your responses to ensure clarity, accuracy, and comprehensiveness, while referring directly to the content. Summarize your findings and include any insights or additional observations that may be helpful. Maintain a conversational tone throughout.`;
};

export const topicAnalysisPrompt = (text: string) => {
  return `PROMPT FOR SUBJECT-MATTER-FOCUSED DOCTORAL-LEVEL GUIDANCE

(With Emphasis on Thoughtful, Reflective Responses)


OBJECTIVE:

For the research topic "${text}"," guide AI Analysis to provide deep, doctoral-level insights and reflections with minimal emphasis on process or methodology. Instead, instruct it to devote extended time to consider multiple perspectives, cross-check facts, and systematically develop coherent, expert-level responses. All content must be presented in English, unless the user specifically requests otherwise. Additionally provide a synthesis of all the analysis gathered, after completing the entire process and analysis.


EXPECTATIONS FOR AI Analysis:


Take Sufficient Time:
• Slow down and think in-depth about each answer.
• Verify relevant details, facts, and examples thoroughly.
• Reflect on alternative viewpoints or debates within the field.

Maintain Expert-Level Depth:
• Offer subject-matter insights expected from a doctoral professor.
• Use field-specific terminology and references where relevant.
• Provide historical context, existing frameworks, or theories.

Double-Check Responses:
• Conduct an internal review to detect inconsistencies or missing links.
• Ensure each statement is as accurate as possible, referencing known research, published studies, or expert consensus when applicable.
• Reassess the logical flow, coherence, and completeness of each response.

Focus:
• Spend minimal time explaining primary research methods or step-by-step processes.
• Concentrate on potential opportunities, challenges, thought leadership, and advanced critical perspectives on the topic.
• Encourage the user to explore tangential or emerging subtopics that might be pivotal for a doctoral dissertation or advanced project.

Language and Clarity:
• Respond in English by default.
• Articulate with clarity, structure, and professional tone.
• Avoid jargon unless necessary for precision.
• Keep the language easy for someone to understand, ensure explanations are provided.


OUTPUT FORMAT:

Present the final output in JSON format containing an array of entries. Each entry should capture a high-level thematic point about the research topic and follow the structure below:


• title


A concise label summarising the key insight or thematic area.

• expert_insight


A detailed discussion from a doctoral vantage point. Incorporate relevant theories, major debates, or authoritative references that validate your points.

• opportunities


Identify tangible or emerging upsides and innovative pathways for exploration or application.

• risks_challenges


Address risks, obstacles, or ethical dilemmas that may arise. Discuss potential unintended consequences or controversies.

• real_world_examples


Provide actual or hypothetical (yet plausible) case studies illustrating applications or issues. Cite established projects, known success stories, or widely recognised shortcomings.

• guiding_questions


Conclude with reflective or probing questions that encourage further inquiry, critical thinking, or advanced research directions.

CONTENT REQUIREMENTS:

• Generate 5 to 7 JSON entries, ensuring a wide variety of angles on the research topic, showing the depth of thinking.

• Conduct ample internal reflection and cross-verification before finalising.

• Conduct quality check to ensure there are no spelling mistakes or grammar mistakes. Fix before adding to the output.

• Offer in-depth, subject-centred commentary rather than focusing on research steps, data-collection methods, or general process guidelines.

SYNTHESIS:

• In several bullet points, provide a concise synthesis of all the analysis gathered, after completing the entire process and analysis.

• Based on the analysis conducted, provide a formatted list containing what each of the JSON entries is about in one bullet point each. 


EXAMPLE (SIMPLE ILLUSTRATION ONLY):


{

"research_topic": "{insert research topic}",

"expert_advice": [

{

"title": "Technological Disruption and Policy",

"expert_insight": "A historical perspective on ...",

"opportunities": "Global knowledge sharing ...",

"risks_challenges": "Potential licensing conflicts ...",

"real_world_examples": "Current pilot projects in ...",

"guiding_questions": "How can emerging tech ...?"

},

...

],
synthesis:["","","",...],
entry_summaries:["","","",...]
}

Use this expanded prompt to ensure AI Analysis adopts a contemplative, expert mindset—spending sufficient time researching, synthesising, and evaluating all relevant aspects before producing reasoned, doctoral-level insights.

Do not add any extra structure or information outside this format.
`;
};
