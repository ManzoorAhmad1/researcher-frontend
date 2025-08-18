import { axiosInstancePrivate } from "@/utils/request";

export const createWorkSpace = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/workspace/create-workspace",
    data
  );
  return response;
};

export const getWorkspacesByUser = async (data?: any) => {
  const response = await axiosInstancePrivate.get(
    `/workspace/get-workspaces/?pageNo=${
      data?.pageNo ? data?.pageNo : ""
    }&limit=${data?.limit ? data?.limit : ""}&user=${
      data?.userId ? data?.userId : ""
    }`
  );
  return response;
};

export const updateWorkspaces = async (data: any) => {
  const response = await axiosInstancePrivate.patch(
    "/workspace/update-workspace",
    data
  );
  return response;
};

export const switchActiveWorkspace = async (data: any) => {
  const response = await axiosInstancePrivate.patch(
    `/workspace/switch?old_workspace=${data?.old_workspace}&new_workspace=${data?.new_workspace}`,
    data
  );
  return response;
};

export const deleteWorkspace = async (id: any) => {
  const response = await axiosInstancePrivate.delete(`/workspace/${id}`);
  return response;
};

export const golbalSearch = async (body: any) => {
  const response = await axiosInstancePrivate.post("/workspace/search", body);
  return response?.data;
};

export const getResearchKeywords = async (userId: any) => {
  const response = await axiosInstancePrivate.get(
    `/workspace/researchKeywords/${userId}`
  );
  return response?.data;
};

export const setNewResearchKeywords = async (
  userId: any,
  newWords: any,
  action: "add" | "remove" = "add"
) => {
  const response = await axiosInstancePrivate.patch(
    `/workspace/newResearchKeywords/${userId}`,
    { newWords, action }
  );
  return response?.data;
};
