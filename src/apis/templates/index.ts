import { axiosInstancePrivate } from "@/utils/request";

export const createTemplates = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/template/createTemplate",
    data
  );
  return response;
};

export const getTemplates = async (data?: any) => {
  const response = await axiosInstancePrivate.get(
    `/template/getalltemplates?&limit=${
      data?.limit !== undefined ? data.limit : ""
    }&pageNo=${data?.pageNo !== undefined ? data.pageNo : ""}&search=${
      data?.search ? data.search : ""
    }&orderBy=${data?.orderBy ? data.orderBy : ""}&sortDirection=${
      data?.sortDirection ? data.sortDirection : ""
    }`
  );
  return response;
};

export const getNewTemplates = async (data?: any) => {
  const response = await axiosInstancePrivate.get(
    `/template/getalltemplates?&limit=${
      data?.limit !== undefined ? data.limit : ""
    }&pageNo=${data?.pageNo !== undefined ? data.pageNo : ""}&search=${
      data?.search ? data.search : ""
    }&orderBy=${data?.orderBy ? data.orderBy : ""}&sortDirection=${
      data?.sortDirection ? data.sortDirection : ""
    }&currentTab=${
      data?.selectedTab ? data.selectedTab : ""
    }`
  );
  return response;
};

export const updateTemplates = async (data: any,id:number) => {
  const response = await axiosInstancePrivate.patch(
    `/template/updateTemplate/${id}`,
    data
  );
  return response;
};

export const duplicateTemplates = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/template/duplicateTemplate",
    data
  );
  return response;
};

export const updateTemplateStatus = async (data: any, id: number) => {
  const response = await axiosInstancePrivate.put(
    `/template/${id}/update-status`,
    data
  );
  return response;
};
export const deleteTemplate = async (id: any) => {
  const response = await axiosInstancePrivate.delete(`/template/${id}`);
  return response;
};

export const getTemplateById = async (id: any) => {
  const response = await axiosInstancePrivate.get(`/template/${id}`);
  return response;
};

export const updatePromptTemplates = async (data: any) => {
  const response = await axiosInstancePrivate.post(
    "/template/updateTemplatePreview",
    data
  );
  return response;
};