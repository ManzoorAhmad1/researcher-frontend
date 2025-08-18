import {
  axiosFormDataInstancePrivate,
  axiosInstancePrivate,
} from "@/utils/request";
import {
  AccepteRequestBody,
  AddNotesBookmarksTagBody,
  CreateFolderBody,
  CreateNoteBody,
  RejectRequestApiBody,
  RemoveAccessAPIBody,
  SendEmailBody,
  ShareSaveNotesBody,
  TransferOwnerShipBody,
  UpdateNotesBookmarksTagBody,
} from "./types";

export const createFolder = async (
  id: string | number,
  body: CreateFolderBody
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/createfolder/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {
    return error?.response?.data;
  }
};

export const createBookmark = async (id: string, body: FormData) => {
  try {
    const response = await axiosFormDataInstancePrivate.post(
      `/notes-bookmarks/createbookmark/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {
    console.log(error, "error in createBookmark");
  }
};

export const updateBookmark = async (id: string, body: FormData) => {
  try {
    const response = await axiosFormDataInstancePrivate.patch(
      `/notes-bookmarks/createbookmark/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { success: false, message: "Failed to update bookmark" };
  }
};

export const generateBookmark = async (workspace_id: string, body: any) => {
  try {
    const response = await axiosFormDataInstancePrivate.post(
      `/notes-bookmarks/gen-bookmark/${workspace_id}`,
      body
    );
    return response.data;
  } catch (error: any) {
    return error?.response?.data || { success: false, message: "Failed to update bookmark" };
  }
};

export const createNote = async (body: CreateNoteBody) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/createnote`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const getNote = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/notes-bookmarks/getnote/${id}`
    );
    return response.data;
  } catch (error: any) {}
};

export const shareSaveNotes = async (body: ShareSaveNotesBody) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/sharesavenote`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const shareBookmark = async (body: ShareSaveNotesBody, id: string) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/sharebookmark/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const noteMembersAndrRequest = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/notes-bookmarks/membersandrequest/${id}`
    );
    return response.data;
  } catch (error: any) {}
};

export const accepteRequest = async (
  id: string | undefined,
  body: AccepteRequestBody
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/accepterequest/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const rejectRequestApi = async (
  id: string,
  body: RejectRequestApiBody
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/rejectrequest/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const removeAccessAPI = async (
  id: string,
  body: RemoveAccessAPIBody
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/removeaccess/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const removeBookmarkAccessAPI = async (
  id: string,
  body: { id: string }
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/remove/bookmarkaccess/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const transferOwnerShip = async (
  id: string,
  body: TransferOwnerShipBody
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/transferownership/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const deleteSoftNote = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.delete(
      `/notes-bookmarks/deletesoftnote/${id}`
    );
    return response.data;
  } catch (error: any) {}
};

export const deleteBookmarkFile = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.delete(
      `/notes-bookmarks/bookmark_file/${id}`
    );
    return response.data;
  } catch (error: any) {}
};

export const deleteFolderApi = async (id: string | number) => {
  try {
    const response = await axiosInstancePrivate.delete(
      `/notes-bookmarks/deletefolder/${id}`
    );
    return response.data;
  } catch (error: any) {}
};

export const sendEmail = async (body: SendEmailBody) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/sendemail`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const sendShareBookmarkEmail = async (body: SendEmailBody) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/send/sharebookmarkemail`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const getNotesBookmarks = async (
  id: string | number,
  perPageLimit: number,
  currentPage: number,
  body: { workspace_id: string }
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/${id}?page=${perPageLimit}&limit=${currentPage}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const filterNotesBookmarks = async (
  id: string | number,
  body: { search: string },
  perPageLimit: number,
  currentPage: number
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/filter/${id}?page=${perPageLimit}&limit=${currentPage}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const searchFilterNotesBookmarks = async (
  id: string | number,
  body: { search: string; workspace_id: string },
  perPageLimit: number,
  currentPage: number
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/search_filter/${id}?page=${perPageLimit}&limit=${currentPage}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

// N&B api
export const addNotesBookmarksTag = async (
  id: string,
  body: AddNotesBookmarksTagBody
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/tag/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const getNotesBookmarksTags = async (id: string | number) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/notes-bookmarks/tags/${id}`
    );
    return response.data;
  } catch (error: any) {}
};

export const updateNotesBookmarksTag = async (
  id: string | number,
  body: UpdateNotesBookmarksTagBody
) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/notes-bookmarks/tag/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const deleteNotesBookmarksTag = async (
  id: string,
  body: number | any
) => {
  try {
    const response = await axiosInstancePrivate.delete(
      `/notes-bookmarks/tag/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};

export const folderListApi = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/notes-bookmarks/recursive/dropdown/${id}`
    );
    return response.data;
  } catch (error: any) {}
};

export const getBookmark = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/notes-bookmarks/getbookmark/${id}`
    );
    return response.data;
  } catch (error: any) {
    return error?.response?.data;
  }
};

export const moveFileToFolder = async (
  item: string[] | unknown,
  id: string
) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/move-file/${id}`,
      item
    );
    return response.data;
  } catch (error: any) {}
};

export const moveFileData = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/notes-bookmarks/move-file-data/${id}`
    )
    return response.data
  } catch (error:any) {
    
  }
}

export const moveItemAPIForKB = async (data: any, projectId: any, userId: string) => {
  try {
    const response = await axiosInstancePrivate.post(`/notes-bookmarks/movefilesdata/${projectId}`, {
      ...data,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const multipleFileDelete = async (item: string[] | unknown) => {
  try {
    const response = await axiosInstancePrivate.post(
      `/notes-bookmarks/multi-file/delete`,
      item
    );
    return response.data;
  } catch (error: any) {}
};

export const notesBookmarksFolder = async (id: number) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/notes-bookmarks/folder/${id}`
    );
    return response.data;
  } catch (error: any) {
    return error;
  }
};

export const requestList = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/notes-bookmarks/request/${id}`
    );
    return response.data;
  } catch (error: any) {
    return error;
  }
};

export const getAllBookmark = async (id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/notes-bookmarks/knowledgeBank/bookmark/${id}`
    );
    return response.data;
  } catch (error: any) {}
};

export const updateBookmarks = async (id: string, body: any) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/notes-bookmarks/knowledgeBank/bookmark/comment/${id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};
export const getNoteByDocId = async (doc_id: string) => {
  try {
    const response = await axiosInstancePrivate.get(
      `/notes-bookmarks/notes/${doc_id}`,
    );
    return response.data;
  } catch (error: any) {}
};

export const updateNote = async (doc_id: string, body: any) => {
  try {
    const response = await axiosInstancePrivate.patch(
      `/notes-bookmarks/knowledgeBank/notes/${doc_id}`,
      body
    );
    return response.data;
  } catch (error: any) {}
};
export const updateKnoledgeBankFolder = async (id: string, body: any) => {
  
    const response = await axiosInstancePrivate.patch(
      `/notes-bookmarks/knowledgeBank/folder/${id}`,
      body
    );
    return response.data;
};
