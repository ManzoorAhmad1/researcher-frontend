import { axiosInstancePrivate } from "@/utils/request";

export const collectiveMindNetWorkData = async (id: number) => {
  try {
    const response = await axiosInstancePrivate.get(
      `collective-mind/network/${id}`
    );
    return response.data;
  } catch (error: any) {
    return error.response;
  }
};

export const collectiveMindSwarmplotData = async (id: number, values: any) => {
  console.log("🚀 ~ collectiveMindSwarmplotData ~ values:", values);
  const body = { values };
  try {
    const response = await axiosInstancePrivate.post(
      `collective-mind/swarmplot/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {
    return error.response;
  }
};
