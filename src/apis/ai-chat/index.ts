import { axiosInstancePrivate } from "@/utils/request";

export const fetchAiHistory = async (id: number) => {
  try {
    const response = await axiosInstancePrivate.get(`/ai/history/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ fetchAiHistory ~ error:", error);
    return error?.response;
  }
};

export const addAiHistory = async (body: object) => {
  try {
    const response = await axiosInstancePrivate.post(`/ai/history`, body);
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ updateAiHistory ~ error:", error);
    return error?.response;
  }
};

export const updateAiHistory = async (id: number, body: object) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/ai/history/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {
    console.error("🚀 ~ updateAiHistory ~ error:", error);
    return error?.response;
  }
};
