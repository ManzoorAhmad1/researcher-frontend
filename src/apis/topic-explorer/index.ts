import { axiosInstancePrivate } from "@/utils/request";

export const webSearchHistoryAdd = async (body: object) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/topic-explorer/web-search`,
      body
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ createBookmark ~ error:", error);
  }
};

export const getWebSearchHistory = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/topic-explorer/web-search/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ getWebSearchHistory ~ error:", error);
  }
};

export const getWebSearchSavedQueryHistory = async (  id: any,
  page?: number,
  save_query?: boolean,
  limit?: number) => {
  try {
     const params: any = {};
    if (save_query !== undefined) params.save_query = save_query;
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    const response = await axiosInstancePrivate.get(
      `/topic-explorer/web-search_saved_query/${id}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ getWebSearchHistory ~ error:", error);
  }
};
export const getTopicAnalysisSavedQueryHistory = async (id: string, page?: number, save_query?: boolean, limit?: number) => {
  try {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (save_query !== undefined) params.save_query = save_query;
    if (limit !== undefined) params.limit = limit;

    const response = await axiosInstancePrivate.get(
      `/topic-explorer/topic_analysis__saved_query/${id}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ getWebSearchHistory ~ error:", error);
  }
};
export const getOutlineGeneratorSavedQueryHistory = async (
  id: any,
  save_query?: boolean,
  page?: number,
  limit?: number
) => {
  try {
    const params: any = {};
    if (save_query !== undefined) params.save_query = save_query;
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;

    const response = await axiosInstancePrivate.get(
      `/topic-explorer/outline_generator__saved_query/${id}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ getWebSearchHistory ~ error:", error);
  }
};
export const webSearchHistoryUpdate = async (id: number) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/topic-explorer/web-search/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ webSearchHistoryUpdate ~ error:", error);
  }
};

export const creativeThinkingHistoryAdd = async (body: object) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/topic-explorer/creative-thinking`,
      body
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ creativeThinkingHistoryAdd ~ error:", error);
  }
};
export const getCreateThinkingSavedQueryHistory = async (id: string, page: number, save_query?: boolean, limit?: number) => {
  try {
    const params: any = {};
    if (page !== undefined) params.page = page;
    if (save_query !== undefined) params.save_query = save_query;
    if (limit !== undefined) params.limit = limit;

    const response = await axiosInstancePrivate.get(
      `/topic-explorer/creative-thinking/${id}`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ getWebSearchHistory ~ error:", error);
  }
};
export const getCreativeThinkingHistory = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/topic-explorer/creative-thinking_workspace/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ getCreativeThinkingHistory ~ error:", error);
  }
};

export const creativeThinkingHistoryUpdate = async (id: number) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/topic-explorer/creative-thinking/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ creativeThinkingHistoryUpdate ~ error:", error);
  }
};

export const creativeThinkingAddToFavorite = async (
  id: number,
  body: object
) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/topic-explorer/creative-thinking/favorite/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ creativeThinkingAddToFavorite ~ error:", error);
  }
};

export const topicAnalysisHistoryAdd = async (body: object) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/topic-explorer/topic-analysis`,
      body
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ topicAnalysisHistoryAdd ~ error:", error);
  }
};

export const getTopicAnalysisHistory = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/topic-explorer/topic-analysis/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ getTopicAnalysisHistory ~ error:", error);
  }
};

export const topicAnalysisHistoryUpdate = async (id: number) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/topic-explorer/topic-analysis/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ topicAnalysisHistoryUpdate ~ error:", error);
  }
};

export const outlineGeneratorHistoryAdd = async (body: object) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/topic-explorer/outline-generator`,
      body
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ outlineGeneratorHistoryAdd ~ error:", error);
  }
};

export const getOutlineGeneratorHistory = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/topic-explorer/outline-generator/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ getOutlineGeneratorHistory ~ error:", error);
  }
};

export const outlineGeneratorHistoryUpdate = async (id: number) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/topic-explorer/outline-generator/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ outlineGeneratorHistoryUpdate ~ error:", error);
  }
};

export const getGoogleLink = async (body: any) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/topic-explorer/get-link`,
      body
    );
    return response.data;
  } catch (error: any) {
    console.log("🚀 ~ getGoogleLink ~ error:", error);
  }
};

export const fetchToAi = async (body: any) => {
  try {
    const response = await axiosInstancePrivate.post(`/straico`, body);
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ outlineGeneratorHistoryUpdate ~ error:", error);
  }
};

export const lastAllHistory = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/topic-explorer/last-all-history/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ getWebSearchHistory ~ error:", error);
  }
};

export const getUserUserHistory = async (user_id: any, workspace_id: any) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/topic-explorer/user/history/${user_id}/${workspace_id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ getTopicAnalysisHistory ~ error:", error);
  }
};
