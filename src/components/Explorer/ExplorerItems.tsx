"use client";

import { Loader } from "rizzui";
import FileItem from "./FileItem";
import FolderItem from "./FolderItem";

interface ExplorerItemsProps {
  data: any;
  loading: boolean | undefined;
  showFolders?: boolean;
  fetchFolders?: () => void;
}

export const ExplorerItems: React.FC<ExplorerItemsProps> = ({
  data,
  loading,
  fetchFolders,
  showFolders,
}) => {
  const hasSubfolders = data?.subFolder && data.subFolder.length > 0;
  
  // Debug logging
  

  return (
    <div className="flex flex-col gap-4 flex-1 rounded-lg">
      {loading || !data || data === null ? (
        <div className="flex justify-center items-center h-[30rem]">
          <Loader variant="threeDot" size="lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-1 w-full">
          {loading ? (
            <div className="flex items-center justify-center w-full h-96">
              <Loader className="h-12 w-12 opacity-60" variant="spinner" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-4">
              {/* Show folders if showFolders is true and we have folder data */}
              {showFolders && data?.subFolder && data.subFolder.length > 0 && 
                data.subFolder.map((folder: any) => (
                  <FolderItem
                    key={folder.id || folder.name}
                    info={folder}
                    fetchFolders={fetchFolders}
                  />
                ))
              }

              {data?.files?.length > 0
                ? data?.files?.map((file: any) => (
                    <FileItem
                      key={file.id}
                      info={file}
                      fetchFolders={fetchFolders}
                    />
                  ))
                : null}

              {/* Show "No Data Found" only when there are no files AND no folders */}
              {(!data?.files || data.files.length === 0) && 
               (!data?.subFolder || data.subFolder.length === 0) && (
                <div className="col-span-full h-[59vh] flex justify-center items-center">
                  No Data Found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
