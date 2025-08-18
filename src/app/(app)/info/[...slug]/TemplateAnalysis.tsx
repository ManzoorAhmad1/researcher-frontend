import React, { useMemo } from "react";
import { RxDotFilled } from "react-icons/rx";
import { isValidListArray, isValidString } from "@/utils/commonUtils";
import { overviewTag, overviewFieldLineColor } from "@/utils/commonUtils";

const formatCamelCase = (text: string): string => {
  return text.replace(/([A-Z])/g, " $1").trim();
};

// Enhanced data processing function to handle complex markdown content
const processTemplateDataForUI = (templateData: any): any => {
  if (!templateData || typeof templateData !== 'object') {
    return templateData;
  }

  const processedData = { ...templateData };

  for (const [key, value] of Object.entries(processedData)) {
    if (Array.isArray(value) && value.length > 0) {
      const processedArray: string[] = [];
      
      for (const item of value) {
        if (typeof item === 'string' && item.length > 0) {
          processedArray.push(item);
        } else {
          processedArray.push(String(item));
        }
      }
      
      processedData[key] = processedArray;
    } else if (typeof value === 'string' && value.length > 0) {
      // Handle string values that might contain complex markdown
      processedData[key] = [value];
    }
  }

  return processedData;
};

// Function to parse complex markdown content into structured sections
const parseComplexContent = (content: string): any[] => {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const sections: any[] = [];
  
  // Split by markdown headers (###)
  const parts = content.split(/(?=### )/);
  
  parts.forEach((part, index) => {
    if (part.trim()) {
      if (part.startsWith('### ')) {
        // This is a header section
        const lines = part.split('\n');
        const header = lines[0].replace(/^### /, '').trim();
        const content = lines.slice(1).join('\n').trim();
        
        if (content) {
          sections.push({
            type: 'section',
            title: header,
            content: content
          });
        }
      } else {
        // This is regular content
        sections.push({
          type: 'content',
          content: part.trim()
        });
      }
    }
  });

  return sections;
};

// Function to render markdown content with proper formatting
const renderMarkdownContent = (content: string): React.ReactNode => {
  if (!content) return null;

  // Split content into lines for processing
  const lines = content.split('\n');
  
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) return <br key={index} />;
    
    // Handle bold text
    if (trimmedLine.includes('**')) {
      const parts = trimmedLine.split(/(\*\*.*?\*\*)/);
      return (
        <div key={index} className="mb-2">
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={partIndex} className="font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </div>
      );
    }
    
    // Handle bullet points
    if (trimmedLine.startsWith('* ')) {
      return (
        <div key={index} className="flex items-start mb-1">
          <RxDotFilled className="text-gray-600 mt-1 mr-2 flex-shrink-0" />
          <span>{trimmedLine.slice(2)}</span>
        </div>
      );
    }
    
    // Handle horizontal rules
    if (trimmedLine === '---') {
      return <hr key={index} className="my-4 border-gray-300" />;
    }
    
    // Regular text
    return <div key={index} className="mb-2">{trimmedLine}</div>;
  });
};

interface TemplateAnalysisProps {
  data: any;
  hideSideView: boolean;
}

const TemplateAnalysis: React.FC<TemplateAnalysisProps> = ({
  data,
  hideSideView,
}) => {
  // Process the data for better UI display
  const processedData = useMemo(() => {
    return processTemplateDataForUI(data);
  }, [data]);

  const renderSection = (
    title: string,
    data: string | string[] | undefined,
    lineColor: string
  ) => {
    if (Array.isArray(data) && isValidListArray(data)) {
      return (
        <div className="flex">
          <div
            className={`bg-[lineColor] px-1 mr-6 mt-2 mb-2.5 ml-1 ${
              hideSideView ? "hidden" : "block"
            }`}
            style={{ backgroundColor: lineColor }}
          ></div>
          <div className="flex-1">
            <span className="font-poppins text-base font-medium leading-[25.5px] text-[#333333] dark:text-[#CCCCCC]">
              {formatCamelCase(title)}
            </span>
            <div className="mt-2">
              {data.map((value: string, index: number) => {
                if (!value || value.length === 0) return null;
                
                // Check if this is complex markdown content
                if (value.includes('###') || value.includes('**') || value.includes('---')) {
                  const sections = parseComplexContent(value);
                  
                  return (
                    <div key={index} className="mb-4">
                      {sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-3">
                          {section.type === 'section' && (
                            <div className="mb-2">
                              <h4 className="font-semibold text-[#333333] dark:text-[#CCCCCC] mb-2">
                                {section.title}
                              </h4>
                              <div className="pl-4 text-[14px] text-[#666666] dark:text-[#CCCCCC]">
                                {renderMarkdownContent(section.content)}
                              </div>
                            </div>
                          )}
                          {section.type === 'content' && (
                            <div className="text-[14px] text-[#666666] dark:text-[#CCCCCC]">
                              {renderMarkdownContent(section.content)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }
                
                // Simple content
                return (
                  <div key={index} className="flex mb-2">
                    <RxDotFilled
                      width="30px"
                      height="30px"
                      className="dark:text-[#CCCCCC] text-[#333333] mt-1 mr-2 flex-shrink-0"
                    />
                    <div className="text-[14px] dark:text-[#CCCCCC] flex-1">
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    } else if (typeof data === "string" && isValidString(data)) {
      return (
        <div className="flex">
          <div
            className={`bg-[lineColor] px-1 mr-6 mt-2 mb-3 ml-1 ${
              hideSideView ? "hidden" : "block"
            }`}
            style={{ backgroundColor: lineColor }}
          ></div>
          <div className="flex-1">
            <span className="font-poppins text-base font-medium leading-[25.5px] text-[#333333] dark:text-[#CCCCCC]">
              {formatCamelCase(title)}
            </span>
            <div className="mt-1">
              <div className="text-[14px] text-[#666666] dark:text-[#CCCCCC]">
                {renderMarkdownContent(data)}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!processedData || processedData === null) {
    return (
      <div className="pt-10 flex justify-center items-center h-full">
        No Data Available
      </div>
    );
  }

  return (
    <div className="p-6 text-sm h-full dark:bg-[#152428] w-full border border-1 rounded-lg overflow-hidden mb-12">
      <div className="grid gap-3 w-full">
        {Object.entries(processedData)
          ?.map(([key, values]: any) => ({ title: key, data: values }))
          .filter(
            (value: any) =>
              value.data !== "" &&
              value.data?.length > 0 &&
              value.data[0] !== ""
          )
          .map((item: any, index: number) => {
            const lineColor =
              overviewFieldLineColor[index % overviewFieldLineColor.length];
            return (
              <div className="flex" key={index}>
                <span
                  className={`text-2xl leading-[35px] font-poppins font-normal text-left pr-2 min-w-[45px] text-[28px] ${
                    hideSideView ? "hidden" : "block"
                  }`}
                >
                  {index + 1}
                </span>
                {renderSection(item?.title, item?.data, lineColor)}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default TemplateAnalysis;