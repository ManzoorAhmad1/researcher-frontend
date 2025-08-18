import { axiosInstancePrivate } from "@/utils/request";

export const getFilesByWorkspace = async (workspaceId: string) => {
  const response = await axiosInstancePrivate.get(
    `files/files-by-workspace/${workspaceId}`
  );
  return response;
};

export const getFilesByProject = async (projectId: string) => {
  const response = await axiosInstancePrivate.get(
    `files/files-by-project/${projectId}`
  );
  return response && response;
};

export const disconnectZotero = async (apiKey: string) => {
  const response = await axiosInstancePrivate.post("files/disconnect-zotero", {
    apiKey,
  });

  return response;
};

export const moveFilesToFolder = async (data: any, folderId: number) => {
  const response = await axiosInstancePrivate.put(
    `/files/folder/${folderId}/move`,
    data
  );
  return response;
};

export const folderChat = async (body: any, signal?: AbortSignal) => {
  const response = await axiosInstancePrivate.post(
    `/folders/folder-chat`,
    body,
    { signal }
  );
  return response;
};

export const generateDoc = async (fileId: string, fileType: string) => {
  const response = await axiosInstancePrivate.get(
    `/files/generate/${fileId}/${fileType}`,
    {
      responseType: "arraybuffer",
    }
  );
  return response;
};

export const reGenerateApi = async (body: any) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/folders/regenerate`,
      body
    );
    return response;
  } catch (error: any) {
    console.log("🚀 ~ rejectRequestApi ~ error:", error);
  }
};

export const getRelativePdf = async (id: any) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/files/relative-pdf/${id}`
    );
    return response;
  } catch (error: any) {
    console.log("🚀 ~ rejectRequestApi ~ error:", error);
  }
};

export const getWordCloudData = async (id: any) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/files/word-cloud-gen/${id}`
    );
    return response;
  } catch (error: any) {
    console.log("🚀 ~ rejectRequestApi ~ error:", error);
  }
};

export const saveWordCloudData = async (id: any, data: any) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/files/word-cloud-save/${id}`,
      { data }
    );
    return response;
  } catch (error: any) {
    console.log("🚀 ~ rejectRequestApi ~ error:", error);
  }
};

export const changePrivacyApi = async (body: any) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/files/change-privacy`,
      body
    );
    return response;
  } catch (error: any) {
    console.log("🚀 ~ changePrivacyApi ~ error:", error);
  }
};

export const updateLoaderStatus = async (body: any) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/folders/update-loader-status`,
      body
    );
    return response;
  } catch (error: any) {
    console.log("🚀 ~ updateLoaderStatus ~ error:", error);
  }
};

export const autoImportSearchPdf = async (body: {
  type?: string;
  value?: string;
  text?: string;
}) => {
  try {
    const response = await axiosInstancePrivate.post(`/search_pdf`, body);
    return response.data;
  } catch (error: any) {
    return error.response.data;
  }
};

export const getFileById = async (fileId: any) => {
  try {
    const response = await axiosInstancePrivate.get(`/files/${fileId}`);
    return response;
  } catch (error) {
    console.error("Error fetching update-file:", error);
    throw null;
  }
};

export const getFileHistory = async (
  userId: any,
  save_query?: boolean,
  page?: number,
  limit?: number
) => {
  try {
    const params: any = {};
    if (save_query !== undefined) params.save_query = save_query;
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;

    console.log(
      `API Call - getFileHistory - userId: ${userId}, params:`,
      params
    );

    const response = await axiosInstancePrivate.get(
      `files/user/history/${userId}`,
      { params }
    );

    console.log(`API Response - getFileHistory:`, {
      status: response.status,
      dataLength: response?.data?.data?.length,
      totalCount: response?.data?.totalCount,
      data: response.data,
    });

    return response;
  } catch (error) {
    console.error("Error fetching file history:", error);
    throw null;
  }
};

export const getUserFiles = async () => {
  const response = await axiosInstancePrivate.get(`/files/user/files`);
  return response;
};

export const getFilesByFolderId = async (folderId: string) => {
  const response = await axiosInstancePrivate.get(
    `/files/user/files/${folderId}`
  );
  return response;
};

export const getFoldersByUserId = async () => {
  const response = await axiosInstancePrivate.get(`/folders/user/folders`);
  return response;
};

export const getFoldersByProjectId = async (projectId: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/folders/folders-by-project/${projectId}`
    );
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getFavoritesByUserId = async (userId: string, itemId: string) => {
  const response = await axiosInstancePrivate.get(
    `files/favorites/${userId}/${itemId}`
  );
  return response;
};
