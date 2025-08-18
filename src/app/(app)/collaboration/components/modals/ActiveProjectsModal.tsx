import { Modal, Text, Avatar } from "rizzui";
import Image from "next/image";
import { X } from "lucide-react";
import folder from "../../../../../images/collaborationFolderIcon.svg";

interface ActiveProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectsFiles: any[];
  notesAndBookmarks: any;
}

const ActiveProjectsModal: React.FC<ActiveProjectsModalProps> = ({
  isOpen,
  onClose,
  projectsFiles,
  notesAndBookmarks,
}) => {
  let projectsFileData = projectsFiles?.map((project: any) => ({
    ...project,
    filteredItems: notesAndBookmarks?.data?.filter(
      (item: any) => item?.project_id === project?.projectId
    ),
  }));

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
        <h2 className="text-lg font-semibold mb-4">Active Research Projects</h2>
        <div className="space-y-4">
          {projectsFileData?.slice(2).map((project: any, index: number) => {
            const notesLength = project?.filteredItems?.filter(
              (note: any) => note?.type === "note"
            );
            const fileLength = project?.filteredItems?.filter(
              (note: any) => note?.type === "file"
            );

            return (
              <div
                key={index}
                className="p-4 bg-[#E5E5E566] rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-4">
                  <div className="mt-2 flex flex-col gap-2 w-full lg:w-3/4">
                    <h3 className="text-sm font-medium text-[#4D4D4D] dark:text-[#CCCCCC]">
                      {project?.project?.name}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <div className="px-2 py-1 text-sm font-normal bg-blue-100 text-[#0E70FF] rounded">
                        {project?.files?.length} papers
                      </div>
                      <div className="px-2 py-1 text-sm font-normal bg-blue-100 text-[#0E70FF] rounded">
                        {notesLength?.length || 0} resources
                      </div>
                      <div className="px-2 py-1 text-sm font-normal bg-blue-100 text-[#0E70FF] rounded">
                        {fileLength?.length || 0} bookmarks
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-4 w-full lg:w-1/4">
                    <h4 className="text-sm font-medium text-[#4D4D4D] dark:text-[#CCCCCC]">
                      Team Members
                    </h4>
                    <div className="flex items-center -space-x-3">
                      {project?.members?.slice(0, 3).map((member: any, idx: number) => (
                        <Avatar
                          key={idx}
                          customSize="32"
                          src={member?.profile_image || "https://randomuser.me/api/portraits/women/40.jpg"}
                          name={member?.first_name || "John Doe"}
                          className="relative inline-flex object-cover ring-2 ring-background"
                        />
                      ))}
                      {project?.members?.length > 4 && (
                        <div className="relative inline-flex h-[32px] w-[32px] items-center justify-center rounded-full text-sm font-medium text-gray-900 bg-gray-200">
                          +{project?.members?.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default ActiveProjectsModal; 