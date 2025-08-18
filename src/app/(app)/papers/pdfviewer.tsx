import { Modal } from "rizzui";
import { FaTimes } from "react-icons/fa";
import dynamic from "next/dynamic";
import { Suspense } from "react";

interface FileRendererProps {
  templateModalOpen: boolean;
  setTemplateModalOpen: (open: boolean) => void;
  url: string;
}

// Create a dynamic PDF viewer component that only loads on the client
const PDFViewerComponent = dynamic(() => import("./PDFViewerComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ),
});

const FileRenderer: React.FC<FileRendererProps> = ({
  templateModalOpen,
  setTemplateModalOpen,
  url,
}) => {
  return (
    <Modal
      isOpen={templateModalOpen}
      onClose={() => setTemplateModalOpen(false)}
      size="xl"
    >
      <div className="relative bg-white rounded-lg p-4">
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <button
            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
            onClick={() => setTemplateModalOpen(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mt-12" style={{ height: "720px", width: "100%" }}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            }
          >
            {templateModalOpen && <PDFViewerComponent url={url} />}
          </Suspense>
        </div>
      </div>
    </Modal>
  );
};

export default FileRenderer;
