

"use client";
import { getFolders } from "@/apis/explore";
import { ExplorerView } from "@/components/Explorer/ExplorerView";
import { AppDispatch, RootState } from "@/reducer/store";
import { Folder, MockData } from "@/types/types";
import { findFolderByPath } from "@/utils/findFolderByPath";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useDebounce from "@/hooks/useDebounce";
import { usePathname } from "next/navigation";
import { TEMPLATE_STATUS } from "@/constant";
import { upload } from "@/reducer/services/upload";
interface PageProps {
  params: { slug: string[] };
}

export default function Page({ params }: PageProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const user = useSelector((state: RootState) => state.user?.user?.user);
  const uploaded = useSelector((state: RootState) => state.upload.uploaded);
  const currentProjectId = useSelector((state: any) => state?.project?.project?.id);
  const [pageNo, setPageNo] = useState<any>(1);
  const [limit, setLimit] = useState<any>(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("last_update");
  const [orderDirection, setOrderDirection] = useState("DESC");
  const [allFilters, setAllFilters] = useState<any>([
    {
      name: "Name",
      filters: [],
      selectedFilters: [],
      order: "order-1",
    },
    {
      name: "Review Stage",
      filters: TEMPLATE_STATUS,
      selectedFilters: [],
      order: "order-2",
    },
    {
      name: "Tags",
      filters: [],
      selectedFilters: [],
      order: "order-3",
    },
    {
      name: "Status",
      order: "order-4",
      filters: [
        {
          label: "processing",
          value: "processing",
        },
        {
          label: "completed",
          value: "completed",
        },
      ],
      selectedFilters: [],
    },
  ]);
  const debouncedQuery = useDebounce<string>(searchQuery, 1000);
  const dispatch: AppDispatch = useDispatch();
  const [folderData, setFolderData] = useState<any>([]);

  const pathname = usePathname();

  const getLastItemFromUrl = (url: string) => {
    const parts = url.replace(/\/$/, "").split("/");
    return parseInt(parts[parts.length - 1]);
  };

  const fetchFolders = async (restrictRefresh?: boolean) => {
    const lastItem = getLastItemFromUrl(pathname);
    const folderId = pathname.startsWith("/explorer")
      ? typeof lastItem === "number"
        ? lastItem
        : ""
      : "";
    if (!restrictRefresh) {
      setLoading(true);
    }
    try {
      const project_id: any =
      currentProjectId && currentProjectId !== null
          ? currentProjectId
          : localStorage.getItem("currentProject");
           const response: any = await getFolders({
             userId: user?.id,
             pageNo,
             limit,
             search: searchQuery,
             orderBy,
             orderDirection,
             allFilters,
             folderId,
             projectId: project_id,
           });

         
      if (response) {
        setFolderData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch folders", error);
      toast.error("Failed to fetch folders");
    } finally {
      setLoading(false);
    }
  };
  const handleSorting = (orderBy: string) => {
    setPageNo(1);
    setOrderBy(orderBy);
    setOrderDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
  };
  const handleSearching = (searchText: string) => {
    setPageNo(() => 1);
    setSearchQuery(searchText);
  };
  const handlePerPageLimit = (limit: number) => {
    setPageNo(1);
    setLimit(limit);
  };
  useEffect(() => {
    if (uploaded) {
      if (currentProjectId) {
        fetchFolders(false);
      }
    }
    dispatch(upload(false));
  }, [uploaded, currentProjectId]);

  useEffect(() => {
    if (pageNo === -1) {
      setPageNo(1);
    }
    if (currentProjectId) {
      fetchFolders(false);
    }
  }, [limit, pageNo, debouncedQuery, currentProjectId, orderBy, orderDirection]);

  useEffect(() => {
    const path: any = params.slug;
    const foundFolder = findFolderByPath(folderData, path);
  }, [params.slug, folderData]);

  return (
    <div>
      <ExplorerView
        data={folderData}
        showFolders
        slugId={params?.slug.at(-1)}
        fetchFolders={fetchFolders}
        pageNo={pageNo}
        setPageNo={setPageNo}
        handleSorting={handleSorting}
        setFilters={setAllFilters}
        allFilters={allFilters}
        setSearchQuery={handleSearching}
        searchQuery={searchQuery}
        setLoading={setLoading}
        loading={loading}
        setLimit={handlePerPageLimit}
        limit={limit}
      />
    </div>
  );
}
