import { axiosInstancePrivate } from "@/utils/request";

export const UploadFile = async (
  formData: FormData,
  projectId: string,
  parentId?: any
) => {
  try {
    if (parentId) {
      formData.append("parent_id", parentId);
    }
    formData.append("project_id", projectId);
    const response = await axiosInstancePrivate.post("/files/upload", formData);
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const UploadTemplateFile = async (
  formData: FormData,
  projectId: string,
  parentId?: any
) => {
  try {
    if (parentId) {
      formData.append("parent_id", parentId);
    }
    formData.append("project_id", projectId);
    const response = await axiosInstancePrivate.post(
      "/files/upload-template",
      formData
    );

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response.data.error || "An unexpected error occurred.";
    return { error: true, message: errorMessage };
  }
};
