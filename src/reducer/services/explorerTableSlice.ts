import { filterOptions } from "./../../components/Explorer/const";
import { createSlice } from "@reduxjs/toolkit";

interface FolderState {
  filterOptions: any;
}

const initialState: FolderState = {
  filterOptions,
};

const explorerTableSlice = createSlice({
  name: "explorerTable",
  initialState: initialState,
  reducers: {
    filterExporerTableData: (state, action) => {
      const updatedColumns = action.payload;
      state.filterOptions = state.filterOptions.map((option: any) => {
        const updatedOption = updatedColumns.find(
          (col: any) => col.field === option.field
        );
        return updatedOption
          ? { ...option, visible: updatedOption.visible }
          : option;
      });
    },

    applyCss: (state, action) => {
      state.filterOptions = state.filterOptions?.map((item: any) => {
        if (item.id === action.payload?.id) {
          return {
            ...item,
            width: action.payload?.width,
            font_size: action.payload?.font_size,
            truncate: action.payload?.truncate,
          };
        } else {
          return {
            ...item,
            font_size: action.payload?.font_size,
          };
        }
      });
    },

    tableColumnPositionChange: (state, action) => {
      state.filterOptions = action.payload;
    },
  },
});

export const { filterExporerTableData, applyCss, tableColumnPositionChange } =
  explorerTableSlice.actions;

export const filterExporerTableReducer = explorerTableSlice.reducer;
