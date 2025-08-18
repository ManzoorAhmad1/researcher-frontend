import { axiosInstancePrivate } from "@/utils/request";

export const researchAssistantApi = async (data: any) => {
  try {
    const response = await axiosInstancePrivate.post(
      "/research-assistant",
      data
    );
    return response;
  } catch (error) {
    console.log("🚀 ~ researchAssistantApi ~ error:", error);
  }
};

export const startAnalysisApi = async (id: number, data: any) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/research-assistant/${id}`,
      data
    );
    return response;
  } catch (error) {
    console.log("🚀 ~ startAnalysisApi ~ error:", error);
  }
};

export const startContentInclution = async (id: number, data: any) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/research-assistant/contentInclution/${id}`,
      data
    );
    return response;
  } catch (error) {
    console.log("🚀 ~ startContentInclutionApi ~ error:", error);
  }
};

export const lastResearch = async () => {
  try {
    const response = await axiosInstancePrivate.get(
      `/research-assistant/last-research`
    );
    return response.data;
  } catch (error: any) {
    console.log("🚀 ~ lastResearch ~ error:", error);
  }
};
export const getResearchHistory = async () => {
  try {
    const response = await axiosInstancePrivate.get(
      `/research-assistant/history`
    );
    return response.data;
  } catch (error: any) {
    console.log("🚀 ~ getResearchHistory ~ error:", error);
  }
};
export const getCreditAnalysis = async (id: number) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/research-assistant/credit-analysis/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.log("🚀 ~ getResearchHistory ~ error:", error);
  }
};
