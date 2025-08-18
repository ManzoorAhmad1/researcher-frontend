import { Text, Empty } from "rizzui";

interface ResearchQuestionsProps {
  isLoading: boolean;
  projectfile: any[];
  onShowMore: () => void;
}

const ResearchQuestions: React.FC<ResearchQuestionsProps> = ({
  isLoading,
  projectfile,
  onShowMore,
}) => {
  return (
    <div className="mx-auto mt-6 sm:mt-8 md:mt-10 p-4 sm:p-6 border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <Text className="flex gap-2 text-[#4D4D4D] mb-2 sm:mb-4 dark:text-[#CCCCCC] font-semibold text-[12px] sm:text-[13px]">
          <span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.06828 6.87106L11.955 0.984375L13.0156 2.04503L11.955 3.10569L13.8111 4.96185L12.7505 6.02251L10.8943 4.16636L9.83365 5.22701L11.4246 6.81803L10.364 7.87868L8.773 6.28771L7.12893 7.93171C8.09358 9.38776 7.9345 11.3688 6.65163 12.6516C5.18718 14.1161 2.81282 14.1161 1.34835 12.6516C-0.116118 11.1872 -0.116118 8.81281 1.34835 7.34836C2.6312 6.06548 4.61225 5.90641 6.06828 6.87106ZM5.59098 11.591C6.46968 10.7123 6.46968 9.28771 5.59098 8.40901C4.71231 7.53031 3.28769 7.53031 2.40901 8.40901C1.53033 9.28771 1.53033 10.7123 2.40901 11.591C3.28769 12.4697 4.71231 12.4697 5.59098 11.591Z"
                fill="#079E28"
              />
            </svg>
          </span>
          KEY RESEARCH QUESTION
        </Text>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 mt-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
            ></div>
          ))}
        </div>
      ) : projectfile[0]?.files?.length > 0 ? (
        projectfile.map((project: any, projectIndex: number) => {
          const hasProjectContent = project?.files?.some((file: any) => 
            (file?.pdf_category_data?.ResearchQuestion ||
            file?.pdf_quality_data?.methodology?.methods_assessment) &&
            project?.project?.name
          );

          return hasProjectContent && (
            <div key={projectIndex}>
              <Text className="text-sm font-medium text-[#4D4D4D] mb-3 sm:mb-4 dark:text-[#CCCCCC]">
                From {project?.project?.name}
              </Text>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {project?.files?.length &&
                  project?.files?.slice(0, 4).map((file: any, index: number) => {
                    const hasContent =
                      (file?.pdf_category_data?.ResearchQuestion ||
                      file?.pdf_quality_data?.methodology?.methods_assessment) &&
                      project?.project?.name &&
                      file?.pdf_category_data?.Keywords?.[0];

                    return (
                      hasContent && (
                        <div
                          key={index}
                          className="p-3 sm:p-4 bg-[#E5E5E566] border border-blue-100 rounded-lg hover:shadow-lg transition-shadow"
                        >
                          <p className="text-[#4D4D4D] mb-2 sm:mb-3 text-sm font-sm dark:text-[#CCCCCC] sm:text-base break-words">
                            {file?.pdf_category_data?.ResearchQuestion ||
                              file?.pdf_quality_data?.methodology?.methods_assessment}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-2 items-center">
                              <Text className="whitespace-nowrap px-2 py-1 h-[26px] text-xs sm:text-sm font-normal bg-blue-100 text-center text-blue-800 rounded">
                                {file?.pdf_category_data?.Keywords?.[0] || "No Keywords"}
                              </Text>
                              <Text className="text-xs sm:text-sm font-normal text-[#4D4D4D] dark:text-[#CCCCCC]">
                                {file.relatedPapers || 1} related papers
                              </Text>
                            </div>
                            <div>
                              <Text className="text-xs sm:text-sm font-medium text-[#4D4D4D] dark:text-[#CCCCCC]">
                                {project?.projectName}
                              </Text>
                            </div>
                          </div>
                        </div>
                      )
                    );
                  })}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center mt-4 sm:mt-6">
          <Empty
            text="No found any search Questions"
            textClassName="text-gray-300 mt-2 text-sm sm:text-base"
            className="w-full mt-2"
            imageClassName="stroke-gray-200 fill-black"
          />
        </div>
      )}
    </div>
  );
};

export default ResearchQuestions; 