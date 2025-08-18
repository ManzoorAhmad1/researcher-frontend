import { createAsyncThunk, createSlice, current } from "@reduxjs/toolkit";
import {
  filterNotesBookmarks,
  folderListApi,
  getNotesBookmarks,
  noteMembersAndrRequest,
  searchFilterNotesBookmarks,
} from "@/apis/notes-bookmarks";
import { AccessRequest, Member } from "@/app/(app)/knowledge-bank/utils/types";
import { tableColumnDatas } from "@/app/(app)/knowledge-bank/utils/const";

interface notesBookmarkState {
  data: any;
  loading: boolean;
  filterLoading: boolean;
  notesBookmarksDatas: any;
  members: Member[];
  tableColumnsData: any;
  shareDialogLoading: boolean;
  accessRequestList: AccessRequest[];
  searchLoading: boolean;
  folderLoading: boolean;
  folderSuccess: boolean;
  notesBookmarksFolderList: any[];
  activeTabValue: string;
  pagination: {
    perPageLimit: number;
    currentPage: number;
  };
}

const initialState: notesBookmarkState = {
  data: [],
  tableColumnsData: tableColumnDatas,
  loading: true,
  filterLoading: false,
  searchLoading: false,
  notesBookmarksDatas: {},
  members: [],
  accessRequestList: [],
  notesBookmarksFolderList: [],
  shareDialogLoading: false,
  folderLoading: false,
  folderSuccess: false,
  activeTabValue: "list",
  pagination: {
    perPageLimit: 10,
    currentPage: 1,
  },
};

export const notesBookmarksSlice = createSlice({
  name: "notes-bookmarks",
  initialState,
  reducers: {
    acceptSingleRequest: (state, action) => {
      const existingMemberIndex = state.members?.findIndex(
        (item: any) => item?.email == action.payload?.email
      );

      if (existingMemberIndex !== -1) {
        // update role
        state.members = state.members.map((member) =>
          member?.email === action.payload?.email
            ? { ...member, role: action.payload?.role }
            : member
        );
      } else {
        // add data in membres
        state.members.push(action.payload);
      }
      state.accessRequestList = state.accessRequestList?.filter(
        (item: any) => item?.email !== action.payload?.email
      );
    },

    rejectRequest: (state, action) => {
      state.accessRequestList = state.accessRequestList?.filter(
        (item: any) => item?.email !== action.payload
      );
    },

    removeAccess: (state, action) => {
      state.members = state.members?.filter(
        (item: any) => item?.email !== action.payload
      );
    },

    searchLoader: (state) => {
      state.searchLoading = true;
    },

    clearData: (state) => {
      state.notesBookmarksDatas = [];
    },

    folderAddToFavorite: (state, action) => {
      const data = state.notesBookmarksDatas?.data?.map((item: any) =>
        item.id == action.payload ? { ...item, favorite: !item.favorite } : item
      );
      state.notesBookmarksDatas.data = data || [];
    },

    fileAddToFavorite: (state, action) => {
      const data = state.notesBookmarksDatas?.data?.map((item: any) =>
        item.id == action.payload ? { ...item, favorite: !item.favorite } : item
      );
      state.notesBookmarksDatas.data = data || [];
    },

    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },

    activeTab: (state, action) => {
      state.activeTabValue = action.payload;
    },

    moveFile: (state, action) => {
      const data = state.notesBookmarksDatas?.data?.filter((item: any) => {
        return !action.payload.includes(item.id);
      });

      state.notesBookmarksDatas.data = data || [];
    },
  },

  extraReducers: (builder) => {
    builder
      //notes-bookmar listing data
      .addCase(getNotesBookmarkAllData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getNotesBookmarkAllData.fulfilled, (state, action) => {
        state.loading = false;
        state.notesBookmarksDatas = action.payload;
      })
      .addCase(getNotesBookmarkAllData.rejected, (state, action) => {
        state.loading = false;
        state.notesBookmarksDatas = action.payload;
      })

      // getRefetchNotesBookmarkAllData
      .addCase(getRefetchNotesBookmarkAllData.fulfilled, (state, action) => {
        state.notesBookmarksDatas = action.payload;
      })

      // search filter
      .addCase(searchFilterNotesBookmarksAllData.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.notesBookmarksDatas = action.payload;
      })

      //add filter
      .addCase(filterNotesBookmarkAllData.pending, (state) => {
        state.filterLoading = true;
      })
      .addCase(filterNotesBookmarkAllData.fulfilled, (state, action) => {
        state.filterLoading = false;
        state.notesBookmarksDatas = action.payload;
      })
      //members listing data
      .addCase(getNoteMembersAndrRequest.pending, (state) => {
        state.shareDialogLoading = true;
      })
      .addCase(getNoteMembersAndrRequest.fulfilled, (state, action) => {
        state.shareDialogLoading = false;
        state.members =
          action.payload?.members
            ?.filter((item: any) => item !== null)
            ?.sort((a: any, b: any) => {
              if (a.role === "Owner" && b.role !== "Owner") {
                return -1; // "owner" comes first
              } else if (a.role !== "Owner" && b.role === "Owner") {
                return 1; // other roles come after "owner"
              } else {
                return 0; // maintain order for same roles
              }
            }) || [];
        state.accessRequestList = action.payload?.request || [];
      })
      //add filter
      .addCase(fetchFolderListApi.pending, (state) => {
        state.folderLoading = true;
      })
      .addCase(fetchFolderListApi.fulfilled, (state, action) => {
        state.folderLoading = false;
        state.folderSuccess = action.payload?.success;
        state.notesBookmarksFolderList = action.payload?.data
      });
  },
});

// apis
export const getNotesBookmarkAllData = createAsyncThunk<
  any,
  {
    id: number | string;
    currentPage?: any;
    perPageLimit?: any;
    body: { workspace_id: string };
  }
>(
  "get-notesbookmark-folder",
  async ({ id, currentPage, perPageLimit, body }) => {
    const response = await getNotesBookmarks(
      id,
      currentPage,
      perPageLimit,
      body
    );
    return response;
  }
);

export const getRefetchNotesBookmarkAllData = createAsyncThunk<
  any,
  {
    id: number | string;
    currentPage?: any;
    perPageLimit?: any;
    body: { workspace_id: string };
  }
>(
  "refetch-notesbookmark-folder",
  async ({ id, currentPage, perPageLimit, body }) => {
    const response = await getNotesBookmarks(
      id,
      currentPage,
      perPageLimit,
      body
    );
    return response;
  }
);

export const filterNotesBookmarkAllData = createAsyncThunk<
  any,
  { id: number | string; body?: any; currentPage?: any; perPageLimit?: any }
>(
  "filter-notesbookmark-list",
  async ({ id, body, currentPage, perPageLimit }) => {
    const response = await filterNotesBookmarks(
      id,
      body,
      currentPage,
      perPageLimit
    );
    return response;
  }
);

export const searchFilterNotesBookmarksAllData = createAsyncThunk<
  any,
  { id: number | string; body?: any; currentPage?: any; perPageLimit?: any }
>(
  "search-filter-notesbookmark-list",
  async ({ id, body, currentPage, perPageLimit }) => {
    const response = await searchFilterNotesBookmarks(
      id,
      body,
      currentPage,
      perPageLimit
    );
    return response;
  }
);

export const getNoteMembersAndrRequest = createAsyncThunk<any, { id: any }>(
  "get-getnote-members",
  async (data) => {
    const response = await noteMembersAndrRequest(data?.id);
    return response.data;
  }
);

export const fetchFolderListApi = createAsyncThunk<any, { id: any }>(
  "get-fetchfolder-list",
  async (data) => {
    const response = await folderListApi(data?.id);
    return response;
  }
);

export const {
  activeTab,
  clearData,
  moveFile,
  removeAccess,
  searchLoader,
  rejectRequest,
  setPagination,
  fileAddToFavorite,
  acceptSingleRequest,
  folderAddToFavorite,
} = notesBookmarksSlice.actions;

export const userNotesBookmarks = notesBookmarksSlice.reducer;
