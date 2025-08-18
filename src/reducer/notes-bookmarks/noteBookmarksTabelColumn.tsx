import { createSlice } from "@reduxjs/toolkit";
import { tableColumnDatas } from "@/app/(app)/knowledge-bank/utils/const";
import { AccessRequest, Member } from "@/app/(app)/knowledge-bank/utils/types";

interface notesBookmarkState {
  tableColumnsData: any;
}

const initialState: notesBookmarkState = {
  tableColumnsData: tableColumnDatas,
};

export const noteBookmarksTabelColumn = createSlice({
  name: "notes-bookmarks",
  initialState,
  reducers: {
    moveColumn: (state, action) => {
      state.tableColumnsData = action.payload;
    },
  },
});

export const { moveColumn } = noteBookmarksTabelColumn.actions;

export const useNoteBookmarksTabelColumn = noteBookmarksTabelColumn.reducer;
