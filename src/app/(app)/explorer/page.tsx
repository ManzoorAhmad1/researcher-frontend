"use client";
import { getFolders } from "@/apis/explore";
import useDebounce from "@/hooks/useDebounce";
import { ExplorerView } from "@/components/Explorer/ExplorerView";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { useEffect, useState ,useRef} from "react";
import { upload } from "@/reducer/services/upload";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { TEMPLATE_STATUS } from "@/constant";

export default function Explorer() {
  const user = useSelector((state: RootState) => state.user?.user?.user);
  const uploaded = useSelector((state: RootState) => state.upload.uploaded);
  const currentProjectId = useSelector((state: any) => state?.project?.project?.id);
  const dispatch: AppDispatch = useDispatch();
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
  const debouncedQuery = useDebounce<string>(searchQuery, 300);
  const [folderData, setFolderData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [filterSubmit, setFilterSubmit] = useState<string>("");

  const filterData = async () => {
    const lastCheckTime = localStorage.getItem("lastCreditCheckTime");
    const currentTime = new Date().getTime();
    if (!lastCheckTime || currentTime - parseInt(lastCheckTime) > 3600000) {
      const { forward, message, mode } = (await verifyCreditApi(user?.id)) as {
        forward: boolean;
        message: string;
        mode: string;
      };
      localStorage.setItem("lastCreditCheckTime", currentTime.toString());
    }
  };

   const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    filterData();
  }, [user?.id]);

  const fetchFolders = async (restrictRefresh?: boolean) => {
    if (!restrictRefresh) {
      setLoading(true);
    }
    const project_id: any =
    currentProjectId && currentProjectId !== null
        ? currentProjectId
        : localStorage.getItem("currentProject");
    try {
      const response: any = await getFolders({
        userId: user?.id,
        pageNo,
        limit,
        search: searchQuery,
        orderBy,
        orderDirection,
        allFilters,
        projectId: project_id,
      });
      if (response?.data) {
        setFolderData(response.data);
        setFilterSubmit("");
      }
    } catch (error) {
      console.error("Failed to fetch folders", error);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSorting = (orderBy: string) => {
    setPageNo(1);
    setOrderBy(orderBy);
    setOrderDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
  };

  const handlePerPageLimit = (limit: number) => {
    setPageNo(1);
    setLimit(limit);
  };

  const handleSearching = (searchText: string) => {
    setPageNo(() => 1);
    setSearchQuery(searchText);
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
      return;
    }
    if (currentProjectId) {
      fetchFolders(false);
    }
  }, [orderBy, orderDirection, limit, pageNo, debouncedQuery, currentProjectId]);

  return (
    <ExplorerView
      searchLoading={searchLoading}
      setSearchLoading={setSearchLoading}
      data={folderData}
      showFolders
      fetchFolders={fetchFolders}
      setPageNo={setPageNo}
      pageNo={pageNo}
      handleSorting={handleSorting}
      setSearchQuery={handleSearching}
      searchQuery={searchQuery}
      loading={loading}
      setLoading={setLoading}
      setFilters={setAllFilters}
      allFilters={allFilters}
      setLimit={handlePerPageLimit}
      limit={limit}
      filterSubmit={filterSubmit}
      setFilterSubmit={setFilterSubmit}
    />
  );
}
