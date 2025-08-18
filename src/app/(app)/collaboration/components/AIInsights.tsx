import { Text, Empty } from "rizzui";

interface AIInsightsProps {
  isLoading: boolean;
  activeProjectsFiles: any
  onShowMore: () => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  isLoading,
  activeProjectsFiles,
  onShowMore,
}) => {
  return (
    <div className="border border-gray-200 bg-white dark:bg-[#1F2E33] rounded-lg shadow p-6">
      <div className="w-full flex items-center justify-between">
        <Text className="flex gap-2 dark:text-[#CCCCCC] font-semibold text-[13px] text-[#4D4D4D]">
          <span>
          <svg
                width="14"
                height="16"
                viewBox="0 0 14 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.25 2H1.75V14H12.25V5H9.25V2ZM0.25 1.24385C0.25 0.833037 0.585618 0.5 0.998875 0.5H10L13.7498 4.25L13.75 14.7444C13.75 15.1617 13.4163 15.5 13.0049 15.5H0.99505C0.58357 15.5 0.25 15.1585 0.25 14.7561V1.24385ZM8.14675 9.8348C6.99633 10.5143 5.48975 10.3598 4.50129 9.3713C3.32973 8.19972 3.32973 6.30025 4.50129 5.12868C5.67288 3.95711 7.57233 3.95711 8.7439 5.12868C9.7324 6.11713 9.8869 7.62372 9.2074 8.77415L10.8653 10.4319L9.80462 11.4927L8.14675 9.8348ZM7.68325 8.31065C8.26908 7.7249 8.26908 6.7751 7.68325 6.18934C7.0975 5.60355 6.14777 5.60355 5.56195 6.18934C4.97617 6.7751 4.97617 7.7249 5.56195 8.31065C6.14777 8.89647 7.0975 8.89647 7.68325 8.31065Z"
                  fill="#0E70FF"
                />
              </svg>
          </span>
          AI INSIGHTS
        </Text>
        {activeProjectsFiles?.length > 2 && (
          <Text className="text-blue-500 cursor-pointer" onClick={onShowMore}>
            Show More
          </Text>
        )}
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
      ) : activeProjectsFiles?.some((project: { files?: any[] }) => project?.files && project.files.length > 0) ? (
        <div className="mt-4 space-y-4">
          {activeProjectsFiles?.slice(0, 2).map((project: any, index: number) => {
            const hasContent = project?.files?.some((file: any) => 
              file?.pdf_category_data?.ResearchQuestion ||
              file?.pdf_quality_data?.methodology?.methods_assessment ||
              file?.pdf_quality_data?.summary?.key_findings ||
              file?.pdf_search_data?.Abstract ||
              file?.pdf_metadata?.Strengths
            );
            
            return hasContent && project?.files?.length > 0 && (
              <div
                key={index}
                className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <h3 className="text-sm font-medium dark:text-[#CCCCCC] text-[#4D4D4D]">
                  {project?.project?.name}
                </h3>
                <div className="mt-2 space-y-2">
                  {project?.files?.slice(0, 3).map((file: any, fileIndex: number) => {
                    const fileHasContent = 
                      file?.pdf_quality_data?.summary?.key_findings ||
                      file?.pdf_search_data?.Abstract ||
                      file?.pdf_metadata?.Strengths;
                    
                    return fileHasContent && (
                      <div key={fileIndex} className="pl-4 border-l-2 border-blue-200">
                        <p className="text-sm text-[#4D4D4D] dark:text-[#CCCCCC]">
                          {  
                            file?.pdf_quality_data?.summary?.key_findings ||
                            file?.pdf_search_data?.Abstract ||
                            file?.pdf_metadata?.Strengths}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="px-2 py-1 text-sm font-normal bg-blue-100 text-blue-800 rounded">
                            {file?.pdf_category_data?.Keywords?.[0] || "No Keywords"}
                          </span>
                          {file?.pdf_category_data?.Keywords?.[1] && (
                            <span className="px-2 py-1 text-sm font-normal bg-blue-100 text-blue-800 rounded">
                              {file?.pdf_category_data?.Keywords[1]}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Confidence{" "}
                            {file?.pdf_quality_data?.methodology?.confidence_score+'.0' || 0}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(file?.created_at || Date.now()).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty
          text="No AI insights available"
          textClassName="text-gray-300 mt-2"
          className="w-full mt-2"
          imageClassName="stroke-gray-200 fill-black"
        />
      )}
    </div>
  );
};

export default AIInsights; 