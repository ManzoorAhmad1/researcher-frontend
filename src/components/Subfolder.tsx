import React, { useState } from "react";
import { File } from "lucide-react";
import { OptimizedImage } from "./ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";


interface File {
  id: number;
  fileName: string;
  fileUrl: string;
}

interface Folder {
  id: number;
  name: string;
  subFolder: Folder[];
  files: File[];
}

interface FolderViewProps {
  folder: Folder;
  sidebarWidth: number;
  handleLinkClick: (path: string) => void;
  activeFolder: number | null;
  setActiveFolder: (id: number | null) => void;
  isBookmark?: boolean;
}

const Subfolder: React.FC<FolderViewProps> = ({
  folder,
  sidebarWidth,
  handleLinkClick,
  activeFolder,
  setActiveFolder,
  isBookmark,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };
  function calculateTotalFiles(folder: any) {
    let totalFiles = folder.fileCount || 0;

    if (folder.subFolders && folder.subFolders.length > 0) {
      folder.subFolders.forEach((subFolder: any) => {
        totalFiles += calculateTotalFiles(subFolder);
      });
    }

    folder.totalFiles = totalFiles;
    return totalFiles;
  }
  const renderFolder = (folder: any) => {
    const isActive = activeFolder === folder.id;

    return (
      <div key={folder.id} className="">
        <div
          className="flex items-center justify-between cursor-pointer space-y-[16px] mb-[16px] "
          onClick={() => toggleFolder(folder.id)}
        >
          <div
            className="flex items-center gap-1"
            onClick={() => {
              setActiveFolder(folder.id);
              if (isBookmark) {
                handleLinkClick(`/knowledge-bank/${folder.id}`);
              } else {
                handleLinkClick(`/explorer/${folder.id}`);
              }
            }}
          >
            <OptimizedImage
              src={
                isActive
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//openFolderIcon.svg`
                  :  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/Expfolder.svg`
              }
              alt={isActive ? "FolderOpen" : "Folder"}
              width={ImageSizes.icon.xs.width}
              height={ImageSizes.icon.xs.height}
            />
            <span
              className={`text-[13px] font-normal ${
                isActive
                  ? "text-[#0E70FF]"
                  : "text-[#666666] dark:text-[#CCCCCC]"
              }`}
            >
              {folder.folder_name}
            </span>
          </div>
          <div
            className={`!mt-[0] text-[11px] font-medium pt-[1px] h-[18px] w-[18px] flex justify-center items-center rounded-full  text-[#666666]  ${
              isActive
                ? "bg-[#0E70FF38]  dark:text-white"
                : "bg-[#D9D9D9] dark:text-[#4d4d4d]  "
            } `}
          >
            {calculateTotalFiles(folder)}
          </div>
        </div>
        <div className="ml-[5px]">
          {expandedFolders.includes(folder.id) && (
            <div className=" mt-[16px]">
              {folder.subFolders.map((subFolder: any) =>
                renderFolder(subFolder)
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return <div>{renderFolder(folder)}</div>;
};

export default Subfolder;
