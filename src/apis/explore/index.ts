import { v4 as uuidv4 } from "uuid";
import { convertToTimestamp } from "@/app/(app)/web-search/utils";
import { fetchApi } from "@/utils/fetchApi";
import { axiosInstancePrivate } from "@/utils/request";
const token = {
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhbXpheWFxdWIwNkBnbWFpbC5jb20iLCJpZCI6NywiaWF0IjoxNzIxODA2MDk4LCJleHAiOjE3NTMzNjM2OTh9.ZGWKlFIOSWDGnxbqlMQRlGpHne4Nr61VQklGghhZEjE`,
  },
};
export const createPaperPdf = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/files/semantic-scholar",
    data
  );
  return response;
};

export const importPaperPdf = async (data: any) => {
  try {
    const response = await axiosInstancePrivate.post(
      "/files/import-files",
      data
    );
    return response;
  } catch (error) {
    console.error("Error semantic-scholar:", error);
    throw null;
  }
};
export const createFolder = async (data: any) => {
  const response = await axiosInstancePrivate.post("/folders/", data);
  return response;
};

export const getFolders = async (data: any) => {
  const response = await axiosInstancePrivate.get(
    `/files/user-files/${data?.projectId}?pageNo=${
      data?.pageNo ? (data?.pageNo === -1 ? 1 : data?.pageNo) : ""
    }&limit=${data?.limit ? data?.limit : ""}&search=${
      data?.search ? encodeURIComponent(data?.search.toString()) : ""
    }&orderBy=${data?.orderBy ? data?.orderBy : ""}&orderDirection=${
      data?.orderDirection ? data?.orderDirection : ""
    }&filters=${
      data?.allFilters && data?.allFilters?.length > 0
        ? JSON.stringify(
            data?.allFilters?.map((filter: any) => ({
              name: filter?.name,
              filters: filter?.selectedFilters,
            }))
          )
        : ""
    }&folderId=${data?.folderId ? data?.folderId : ""}`
  );
  return response;
};

export const moveItemAPI = async (data: any, userId: string) => {
  try {
    const response = await axiosInstancePrivate.post("/files/update-files", {
      ...data,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteItem = async (
  itemId: any,
  itemType: any,
  deletedSubFolders: number[],
  projectId: any
) => {
  try {
    const response = await axiosInstancePrivate.delete(
      `/folders/${itemId}`,

      {
        data: {
          itemType,
          projectId,
          deletedSubFolders,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error delete item:", error);
    throw error;
  }
};

export const editItem = async (
  itemId: any,
  itemType: any,
  newName: any,
  projectId: any
) => {
  try {
    const response = await axiosInstancePrivate.put(`/folders/${itemId}`, {
      itemType,
      newName,
      projectId,
    });
    return response.data;
  } catch (error) {
    console.error("Error editing item:", error);
    throw error;
  }
};
export const updateFileStatus = async (data: any, id: number) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/files/${id}/update-file`,
      data,
      token
    );
    return response;
  } catch (error) {
    console.error("Error fetching update-file:", error);
    throw null;
  }
};

export const getNewsFromSpaceSerpApi = async (
  search: string,
  searchId: string
) => {
  const response = await fetchApi(
    `https://api.spaceserp.com/google/search?apiKey=${process.env.NEXT_PUBLIC_SERP_API_KEY}&q=${search}&hl=en&pageSize=100&tbm=nws&period=qdr%3Aw`,
    {
      method: "GET",
    }
  );

  const sortedNews = response?.news_results?.sort((a: any, b: any) => {
    return convertToTimestamp(b.date) - convertToTimestamp(a.date);
  });
  const topTenNews = sortedNews?.slice(0, 10)?.map((item: any) => ({
    id: uuidv4(),
    date: item?.date,
    description: item?.description,
    domain: item?.domain,
    link: item?.link,
    search_id: searchId,
  }));
  return topTenNews || [];
};

export const saveNews = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/topic-explorer/news",
    data
  );
  return response;
};

export const handleFavouriteNews = async (
  is_favourite: boolean,
  id: number,
  search_id: number
) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/topic-explorer/favourite/${id}`,
      {
        is_favourite: is_favourite,
        search_id: search_id,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error ", error);
    throw error;
  }
};

export const getNewsByTopic = async (Ids: Number[]) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/topic-explorer/news-by-topics?topics=${JSON.stringify(Ids)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
};
export const getFavouriteNews = async () => {
  try {
    const response = await axiosInstancePrivate.get(
      `/topic-explorer/favourite-news`
    );
    return response.data;
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
};

export const addTags = async (
  userId: any,
  name: any,
  color: any,
  itemId: any,
  projectId: string
) => {
  try {
    const response = await axiosInstancePrivate.post(`/tags/`, {
      userId,
      name,
      color,
      itemId,
      projectId,
    });
    return response.data;
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
};

export const getTags = async (itemId: any) => {
  try {
    const response = await axiosInstancePrivate.get(`tags/user/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
};

export const deleteTag = async (
  itemId: any,
  index: number,
  projectId: string
) => {
  try {
    const response = await axiosInstancePrivate.delete(`tags/${itemId}`, {
      data: { index, projectId },
    });
    return response.data;
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
};

export const updateTag = async (
  itemId: any,
  oldName: any,
  newName: any,
  newColor: any,
  projectId: any
) => {
  try {
    const response = await axiosInstancePrivate.put(`tags/${itemId}`, {
      oldName,
      newName,
      newColor,
      projectId,
    });
    return response.data;
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
};

export const getFolder = async (folderId: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/folders/folder/${folderId}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching folder:", error);
    throw null;
  }
};

export const deleteMultipleItems = async (
  fileIds: string[],
  folderIds: string[],
  deletedSubFolders: number[],
  projectId: string
) => {
  try {
    const response = await axiosInstancePrivate.delete(
      `/folders/multi-delete/${projectId}`,

      {
        data: {
          fileIds,
          folderIds,
          deletedSubFolders,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error delete item:", error);
    throw error;
  }
};

export const getMoveData = async (data: any) => {
  const response = await axiosInstancePrivate.get(
    `/files/move-files/${data?.projectId}?pageNo=${
      data?.pageNo ? (data?.pageNo === -1 ? 1 : data?.pageNo) : ""
    }&limit=${data?.limit ? data?.limit : ""}
    &orderBy=${data?.orderBy ? data?.orderBy : ""}&orderDirection=${
      data?.orderDirection ? data?.orderDirection : ""
    }&folderId=${data?.folderId ? data?.folderId : ""}`
  );
  return response;
};

export const paperExists = async (data: any) => {
  try {
    const response = await axiosInstancePrivate.post(
      "/files/papers-check",
      data
    );
    return response?.data;
  } catch (error) {
    console.error("Error semantic-scholar:", error);
    throw null;
  }
};
