import { createSlice } from '@reduxjs/toolkit'

interface AiChatDialog {
	show: boolean;
	id: string;
	question:string
}

interface PdfToAi {
	pdfselectedValue: string;
	selectedOption: string; 
}
interface FolderState {
	refreshData: number;
	aiChatDialog: AiChatDialog;
	pdfToAi: PdfToAi;
}

const initialState: FolderState = {
	refreshData: 0,
	aiChatDialog:{
		show:false,
		id:"",
		question:""
	},
	pdfToAi:{
		pdfselectedValue:"",
		selectedOption:""
	}
}

const folderSlice = createSlice({
	name: 'folder',
	initialState,
	reducers: {
		refreshData: state => {
			state.refreshData += 1
		},
		folderAiChatDialog:(state,action)=>{
			state.aiChatDialog=action.payload
		},
		selectedValueInPDF :(state,action)=>{
			const {text,selectedOption}=action.payload
			if(text !==undefined)
				state.pdfToAi.pdfselectedValue=text
		    if(selectedOption !==undefined)
			    state.pdfToAi.selectedOption=selectedOption
		},
		clearPdfToAi:(state,action)=>{
			state.pdfToAi=action.payload
		}
	},
})

export const { refreshData,folderAiChatDialog,selectedValueInPDF,clearPdfToAi } = folderSlice.actions

export default folderSlice.reducer
