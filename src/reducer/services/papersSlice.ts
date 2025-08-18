import { createSlice } from '@reduxjs/toolkit'
interface PapersState {
	question: string;
}

const initialState: PapersState = {
	question: "",
}

const papersSlice = createSlice({
	name: 'papers',
	initialState,
	reducers: {
		papersQuestion: (state,action) => {
			state.question=action.payload
		},
	
	},
})

export const { papersQuestion } = papersSlice.actions

export default papersSlice.reducer
