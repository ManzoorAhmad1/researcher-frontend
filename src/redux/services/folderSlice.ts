import { createSlice } from '@reduxjs/toolkit'

interface FolderState {
	refreshData: number
}

const initialState: FolderState = {
	refreshData: 0,
}

const folderSlice = createSlice({
	name: 'folder',
	initialState,
	reducers: {
		refreshData: state => {
			state.refreshData += 1
		},
	},
})

export const { refreshData } = folderSlice.actions

export default folderSlice.reducer
