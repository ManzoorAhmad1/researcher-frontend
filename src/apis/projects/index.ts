import { axiosInstancePrivate } from "@/utils/request";

export const getProjectByWorkspace = async (data: {
  workspaceId: string;
  pageNo?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: string;
}) => {
  const response = await axiosInstancePrivate.get(
    `/project/projects-by-workspace/${data?.workspaceId}?pageNo=${
      data?.pageNo ? data?.pageNo : ""
    }&limit=${data?.limit ? data?.limit : ""}&search=${
      data?.search ? data?.search : ""
    }&orderBy=${data?.orderBy ? data?.orderBy : ""}&orderDirection=${
      data?.orderDirection ? data?.orderDirection : ""
    }`
  );
  return response;
};

export const createProject = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/project/create-project",
    data
  );
  return response;
};

export const updateProject = async (data: any) => {
  const response = await axiosInstancePrivate.patch(
    "/project/update-project",
    data
  );
  return response;
};
export const deleteProject = async (id: string) => {
  const response = await axiosInstancePrivate.delete(`/project/${id}`);
  return response;
};

export const updateProjectCollaboration = async (data: any) => {
  const response = await axiosInstancePrivate.patch(
    "/project/update-collaborators",
    data
  );
  return response;
};

export const getProjectByUser = async (data: {
  pageNo?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: string;
}) => {
  const response = await axiosInstancePrivate.get(
    `/project/projects-by-userId?pageNo=${
      data?.pageNo ? data?.pageNo : ""
    }&limit=${data?.limit ? data?.limit : ""}&search=${
      data?.search ? data?.search : ""
    }&orderBy=${data?.orderBy ? data?.orderBy : ""}&orderDirection=${
      data?.orderDirection ? data?.orderDirection : ""
    }`
  );
  return response;
};

export const getProjectById = async (id: string) => {
  const response = await axiosInstancePrivate.get(`/project/${id}`);
  return response;
};

export const updateProjectTeamLead = async (data: any) => {
  const response = await axiosInstancePrivate.patch(
    "/project/switch-lead",
    data
  );
  return response;
};

export const getFoldersAndBookmarksByProjectId = async (data: any) => {
  const response = await axiosInstancePrivate.get(
    `/project/papers-knowledgebank-by-projectId/${data?.projectId}`
  );
  return response;
};

export const getProjectTeamMembers = async (projectId: string) => {
  const response = await axiosInstancePrivate.get(
    `/project/project-team-members/${projectId}`
  );
  return response;
};
