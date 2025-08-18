import { axiosInstancePrivate } from "@/utils/request";

export const getRecentActivitiesByFileId = async (data: any) => {
  const response = await axiosInstancePrivate.get(
    `/recent-activity/${data?.fileId}?pageNo=${
      data?.pageNo ? (data?.pageNo === -1 ? 1 : data?.pageNo) : ""
    }&type=${data?.type ? data?.type : ""}&limit=${
      data?.limit ? data?.limit : ""
    }&orderBy=${data?.orderBy ? data?.orderBy : ""}&orderDirection=${
      data?.orderDirection ? data?.orderDirection : ""
    }}`
  );
  return response;
};

export const updateRecentActivity = async (doc_id: string, body: any) => {
  const response = await axiosInstancePrivate.patch(
    `/recent-activity/update/${doc_id}`,
    body
  );
  return response;
};
