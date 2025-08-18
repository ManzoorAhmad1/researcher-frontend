import { Modal, Text } from "rizzui";
import { X } from "lucide-react";

interface KnowledgeBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  notesAndBookmarks: any;
}

const KnowledgeBankModal: React.FC<KnowledgeBankModalProps> = ({
  isOpen,
  onClose,
  notesAndBookmarks,
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
        <h2 className="text-lg font-semibold mb-4">Knowledge Bank</h2>
        <div className="space-y-4">
          {notesAndBookmarks?.data?.slice(2).map((idea: any, index: number) => (
            <div
              key={index}
              className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="text-sm font-medium text-[#4D4D4D] dark:text-[#CCCCCC]">
                {idea.title}
              </h3>
              <p className="text-sm text-[#4D4D4D] mt-2 dark:text-[#CCCCCC]">
                {idea?.description
                 ?.replace(/<[^>]*>/g, "")
                 ?.replace(/\s+/g, " ")
                 ?.trim()
                 ?.split(".")
                 ?.length > 0
                 ? (idea?.description
                     ?.replace(/<[^>]*>/g, "")
                     ?.replace(/\s+/g, " ")
                     ?.trim()
                     ?.split(".")
                     ?.slice(0, 2)
                     ?.join(".") + ".")
                 : idea?.description
                     ?.replace(/<[^>]*>/g, "")
                     ?.replace(/\s+/g, " ")
                     ?.trim()}
              </p>
              <div className="mt-2">
                <span className="px-2 py-1 text-sm font-normal bg-blue-100 text-blue-800 rounded">
                  {idea?.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default KnowledgeBankModal; 