import { Modal, Text } from "rizzui";
import { X } from "lucide-react";

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProjectsFiles: any[];
  isLoading: boolean;
}

const AIInsightsModal: React.FC<AIInsightsModalProps> = ({
  isOpen,
  onClose,
  activeProjectsFiles,
  isLoading,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="p-6 bg-white dark:bg-[#1F2E33] rounded-lg shadow-lg max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4">AI Insights</h2>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
                ></div>
              ))}
            </div>
          ) : activeProjectsFiles?.length ? (
            activeProjectsFiles.slice(2).map((project: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <h3 className="text-sm font-medium text-[#4D4D4D] dark:text-[#CCCCCC]">
                  {project?.project?.name}
                </h3>
                <div className="mt-2 space-y-2">
                  {project?.files?.map((file: any, fileIndex: number) => {
                    const fileHasContent = 
                      file?.pdf_quality_data?.summary?.key_findings ||
                      file?.pdf_search_data?.Abstract ||
                      file?.pdf_metadata?.Strengths;
                    
                    return fileHasContent && (
                      <div key={fileIndex} className="pl-4 border-l-2 border-blue-200">
                        <p className="text-sm text-[#4D4D4D] dark:text-[#CCCCCC]">
                          {file?.pdf_quality_data?.summary?.key_findings ||
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
                            {file?.pdf_quality_data?.methodology?.confidence_score || 0}
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
            ))
          ) : (
            <div className="text-center text-gray-500">No AI insights available</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AIInsightsModal; 