import { axiosInstancePrivate } from "@/utils/request";

export const favorites = async (body: any) => {
  const response = await axiosInstancePrivate.post(`/favorites`, body);
  return response;
};

export const removeFavorite = async (file_id: any) => {
  const response = await axiosInstancePrivate.delete(`/favorites/${file_id}`);
  return response;
};
