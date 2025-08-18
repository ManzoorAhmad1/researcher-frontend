"use client";
import { axiosInstancePrivate } from "@/utils/request";

const token = {
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhbXpheWFxdWIwNkBnbWFpbC5jb20iLCJpZCI6NywiaWF0IjoxNzIxODA2MDk4LCJleHAiOjE3NTMzNjM2OTh9.ZGWKlFIOSWDGnxbqlMQRlGpHne4Nr61VQklGghhZEjE`,
  },
};

export const createTeamApi = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/team/createTeam",
    data,
    token
  );
  return response;
};

export const createOrganization = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/organization/createOrganization",
    data,
    token
  );
  return response;
};

export const updateTeamApi = async (data: any) => {
  const response = await axiosInstancePrivate.patch(
    "/team/updateTeam",
    data,
    token
  );
  return response;
};

export const createTeamMemberApi = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/team/invitations",
    data,
    token
  );
  return response;
};
export const updateTeamMemberApi = async (data: any) => {
  const response = await axiosInstancePrivate.put("team/members", data, token);
  return response;
};

export const getAllTeam = async (data: any) => {
  const response = await axiosInstancePrivate.get(
    `/team/getTeams?pageNo=${data?.pageNo || ""}&limit=${
      data?.limit || ""
    }&search=${data?.search || ""}&isOwnerTeam=${
      data?.isOwnerTeam?.toString() || false
    }&id=${data?.id || ""}`,
    token
  );
  return response;
};

export const getNotications = async (data: any) => {
  const response = await axiosInstancePrivate.get(
    `/organization/getNotifications?pageNo=${data?.pageNo}&limit=${data?.limit}`,
    token
  );
  return response;
};

export const markNotificationAsSeen = async (paperId: any) => {
  const response = await axiosInstancePrivate.put(
    `/organization/markNotificationAsSeen/${paperId}`
  );
  return response.data;
};
export const markAllNotificationAsSeen = async (type: string) => {
  const response = await axiosInstancePrivate.post(
    "/organization/markAllNotificationAsSeen",
    {
      type: type,
    }
  );
  return response.data;
};

export const getOrganizationTeam = async (data: any) => {
  const response = await axiosInstancePrivate.get(
    `/organization/findAll?pageNo=${data.pageNo}&limit=${data.limit}`,
    token
  );
  return response;
};

export const updateOrganizationApi = async (data: any) => {
  const response = await axiosInstancePrivate.put(
    `/organization/updateOrganization`,
    data,
    token
  );
  return response;
};

export const getTeamMember = async (data: any) => {
  const filters = data?.allFilters?.map((filter: any) => ({
    name: filter?.name,
    filters: filter?.selectedFilters,
  }));
  const response = await axiosInstancePrivate.get(
    `/team/get_team_members?team_id=${data?.team_id}&pageNo=${
      data?.pageNo
    }&limit=${data?.limit}&search=${data?.search}&filters=${
      data?.allFilters && data?.allFilters?.length > 0
        ? encodeURIComponent(JSON.stringify(filters))
        : ""
    }`,
    token
  );
  return response;
};

export const sendInvitation = async () => {
  const response = await axiosInstancePrivate.get("/team/invitations", token);
  return response;
};

export const deleteTeam = async (id: string) => {
  const response = await axiosInstancePrivate.delete(
    `/team/delete_team/${id}`,
    token
  );
  return response.data;
};

export const deleteOrganization = async (id: string, otp: string) => {
  const response = await axiosInstancePrivate.delete(
    `/organization/${id}?otp=${otp}`,
    token
  );
  return response.data;
};

export const handleDeleteMember = async (userId: string, teamId: string) => {
  const response = await axiosInstancePrivate.delete(
    `/team/delete_team_member/${userId}/${teamId}`,
    token
  );
  return response.data;
};

export const getOrganizationTeamMembers = async () => {
  const response = await axiosInstancePrivate.get(
    `/organization/getOrgMembers`,
    token
  );
  return response;
};
export const getAllOrganizationMembers = async ({
  pageNo,
  limit,
  search,
  allFilters,
  orgId,
}: {
  pageNo: number;
  limit: number;
  search: string;
  allFilters: any[];
  orgId: string | null;
}) => {
  const filters = allFilters?.map((filter: any) => ({
    name: filter?.name,
    filters: filter?.selectedFilters,
  }));

  const response = await axiosInstancePrivate.get(
    `/organization/getOwnerOrgMembers?org_id=${orgId}`,
    {
      params: {
        page: pageNo,
        limit,
        search,
      },
    }
  );
  return response.data;
};
export const getAllOwnerUserOrgMembers = async ({
  pageNo,
  limit,
  search,
  activeUser,
}: {
  pageNo?: number;
  limit?: number;
  search?: string;
  activeUser?: boolean;
}) => {
  const response = await axiosInstancePrivate.get(
    `/organization/getAllUserOrgMembers`,
    {
      params: {
        page: pageNo ? pageNo : "",
        limit: limit ? limit : "",
        search: search ? search : "",
        activeUser: activeUser ? activeUser : "",
      },
    }
  );
  return response.data;
};

export const createOrganizationMember = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    `/organization/createOrganizationTeamMember`,
    data,
    token
  );
  return response;
};

export const deleteOrganizationMember = async (id: string) => {
  const response = await axiosInstancePrivate.delete(
    `/organization/members/${id}`,
    token
  );
  return response;
};

export const getAllTeamsMembersByUser = async (data: any) => {
  const response = await axiosInstancePrivate.get(
    `/team/get_all_teams_members_by_user?id=${data?.id || ""}`,
    token
  );
  return response;
};
