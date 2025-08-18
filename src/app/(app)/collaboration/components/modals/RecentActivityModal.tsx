import { Modal } from "rizzui";
import { X } from "lucide-react";

interface RecentActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecentActivityModal({
  isOpen,
  onClose,
}: RecentActivityModalProps) {
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
      </div>
    </Modal>
  );
}
