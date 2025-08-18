import { createSlice } from '@reduxjs/toolkit';

interface CurrentState {
  currentPage: number;
  rolesName: string;
  goalName: any[];
  interestName: any[];
  keywordName?: string[];
  formCompleted: boolean;
}

const currentState: CurrentState = {
  currentPage: 0,
  rolesName: '',
  goalName: [],
  interestName: [],
  keywordName: [],
  formCompleted: false,
};

const rolesGoalsSlice = createSlice({
  name: 'roles-goals',
  initialState: currentState,
  reducers: {
    incrementPage: (state) => {
      state.currentPage += 1;
    },
    decrementPage: (state) => {
      state.currentPage -= 1;
    },
    rolesName: (state, action) => {
      state.rolesName = action.payload;
    },
    goalName: (state, action) => {
      state.goalName = action.payload;
    },
    interestName: (state, action) => {
      state.interestName = action.payload;
    },
    keywordName: (state, action) => {
      state.keywordName = action.payload;
    },
    formCompleted: (state) => {
      state.formCompleted = true;
    },
    emptyRolesAndGoals: (state) => {
      return {
        currentPage: 0,
        rolesName: '',
        goalName: [],
        interestName: [],
        keywordName: [],
        formCompleted: false,
      };
    },
  },
});

export const {
  incrementPage,
  decrementPage,
  rolesName,
  interestName,
  keywordName,
  goalName,
  formCompleted,
  emptyRolesAndGoals,
} = rolesGoalsSlice.actions;

export const rolesGoalsReducer = rolesGoalsSlice.reducer;
