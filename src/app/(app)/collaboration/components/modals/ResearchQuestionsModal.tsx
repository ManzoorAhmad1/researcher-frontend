import { Modal, Text, Empty } from "rizzui";
import { X } from "lucide-react";

interface ResearchQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectfile: any[];
  isLoading: boolean;
}

const ResearchQuestionsModal: React.FC<ResearchQuestionsModalProps> = ({
  isOpen,
  onClose,
  projectfile,
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
        <h2 className="text-lg font-semibold mb-4">Research Questions</h2>
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-6 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"
                ></div>
              ))}
            </div>
          ) : projectfile?.length ? (
            projectfile.map((project: any, projectIndex: number) => (
              <div key={projectIndex}>
                <Text className="text-sm font-medium text-[#4D4D4D] mb-4 dark:text-[#CCCCCC]">
                  From {project?.project?.name}
                </Text>
                <div className="grid grid-cols-1 gap-4">
                  {project?.files?.slice(4).map((file: any, index: number) => {
                    const hasContent =
                      file?.pdf_category_data?.ResearchQuestion ||
                      file?.pdf_quality_data?.methodology?.methods_assessment;

                    return (
                      hasContent && (
                        <div
                          key={index}
                          className="p-4 bg-[#E5E5E566] border border-blue-100 rounded-lg"
                        >
                          <p className="text-[#4D4D4D] mb-3 text-sm font-medium dark:text-[#CCCCCC]">
                            {file?.pdf_category_data?.ResearchQuestion ||
                              file?.pdf_quality_data?.methodology?.methods_assessment}
                          </p>
                          <div className="flex flex-wrap items-center justify-between">
                            <div className="flex gap-2 items-center">
                              <Text className="px-2 py-1 text-sm font-normal bg-blue-100 text-blue-800 rounded">
                                {file?.pdf_category_data?.Keywords?.[0] || "No Keywords"}
                              </Text>
                              <Text className="text-sm text-[#4D4D4D] dark:text-[#CCCCCC]">
                                {file.relatedPapers || 1} related papers
                              </Text>
                            </div>
                          </div>
                        </div>
                      )
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <Empty
              text="No found any search Questions"
              textClassName="text-gray-300 mt-2 text-sm sm:text-base"
              className="w-full mt-2"
              imageClassName="stroke-gray-200 fill-black"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ResearchQuestionsModal; 