import { axiosInstancePrivate } from "@/utils/request";

export const getNotesAndBookmarks = async () => {
  try {
    const response = await axiosInstancePrivate.get('/collaborations/notes-and-bookmarks');
    return response;
  } catch (error) {
    console.error('Error fetching notes and bookmarks:', error);
    throw error;
  }
};

export const getProjects = async () => {
  try {
    const response = await axiosInstancePrivate.get('/collaborations/projects');
    return response;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const getActivities = async () => {
  try {
    const response = await axiosInstancePrivate.get('/collaborations/activities');
    return response;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const getWorkspaces = async () => {
  try {
    const response = await axiosInstancePrivate.get('/collaborations/workspaces');
    return response;
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    throw error;
  }
};

export const getRecentFolder = async () => {
  try {
    const response = await axiosInstancePrivate.get('/collaborations/recent-folder');
    return response;
  } catch (error) {
    console.error('Error fetching recent folder:', error);
    throw error;
  }
};

export const getFilesCount = async () => {
  try {
    const response = await axiosInstancePrivate.get('/collaborations/files-count');
    return response;
  } catch (error) {
    console.error('Error fetching files count:', error);
    throw error;
  }
};

export const getFavorites = async () => {
  try {
    const response = await axiosInstancePrivate.get('/collaborations/favorites');
    return response;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

export const getTrendingTopics = async () => {
  try {
    const response = await axiosInstancePrivate.get('/collaborations/trending-topics');
    return response;
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    throw error;
  }
};

export const getUserStorage = async () => {
  try {
    const response = await axiosInstancePrivate.get('/collaborations/user-storage');
    return response;
  } catch (error) {
    console.error('Error fetching user storage:', error);
    throw error;
  }
}; 
export const getTrendsPapers = async () => {
  try {
    const response = await axiosInstancePrivate.get('/ai/getTrends');
    return response;
  } catch (error) {
    console.error('Error fetching user storage:', error);
    throw error;
  }
}; 


// i need an ai that will return latest 2 complteted status reminders and latest 2 pending status reminders
export const getLatestReminders = async () => {
  try {
    const response = await axiosInstancePrivate.get('/reminders/latest-reminders');
    return response;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
};