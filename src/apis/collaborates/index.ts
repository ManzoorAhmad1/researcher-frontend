import { axiosInstancePrivate } from "@/utils/request";

export const getCallobrationsData = async () => {
  const response = await axiosInstancePrivate.get("/collaborations");
  return response;
};

export const favouriteCollaboration = async () => {
  const response = await axiosInstancePrivate.get(
    "/collaborations/user-favorites"
  );
  return response;
};
export const notesAndBookmarksCollaboration = async () => {
  const response = await axiosInstancePrivate.get(
    "/collaborations/user-notes-bookmarks"
  );
  return response;
};
export const projectFilesCollaboration = async () => {
  const response = await axiosInstancePrivate.get(
    "/collaborations/project-files"
  );
  return response;
};
export const getDashboardAnalytics = async () => {
  const response = await axiosInstancePrivate.get(`/collaborations/dashboard`);
  return response;
};

export const getAccountDashboardAnalytics = async () => {
  const response = await axiosInstancePrivate.get(
    `/collaborations/account/dashboard`
  );
  return response;
};
