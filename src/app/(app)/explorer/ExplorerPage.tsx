"use client";

import { ExplorerView } from "@/components/Explorer/ExplorerView";
import { useGetFolderWithFilesQuery } from "@/redux/services/folderApi";
import { RootState } from "@/reducer/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

interface PageProps {
  params?: { slug?: string[] };
}

export default function ExplorerPage({ params }: PageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const folderId = params?.slug ? params.slug[0] : undefined;
  const refreshData = useSelector(
    (state: RootState) => state.folder.refreshData 
  );
  const user = useSelector((state: RootState) => state.user );

  const {
    data: folderData,
    error,
    isLoading,
    refetch,
  } = useGetFolderWithFilesQuery({ folderId, user });

  useEffect(() => {
    if (!isLoading && !folderData && !error) {
      router.replace("/explorer");
    }
  }, [isLoading, folderData, error, router, pathname]);

  useEffect(() => {
    refetch();
  }, [refreshData, refetch]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading folder data</p>;
  }

  return (
    <div>
      {folderData ? (
        <ExplorerView data={folderData}  showFolders />
      ) : (
        <p>Folder not found</p>
      )}
    </div>
  );
}
