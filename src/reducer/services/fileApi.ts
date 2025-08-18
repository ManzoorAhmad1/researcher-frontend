import { UserFile } from '@/types/types'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl = 'http://localhost:3000/api'

export const fileApi = createApi({
	reducerPath: 'fileApi',
	baseQuery: fetchBaseQuery({ baseUrl }),
	endpoints: builder => ({
		getFile: builder.query<UserFile, string>({
			query: fileId => `files/${fileId}`,
		}),
		getUserFiles: builder.query<UserFile[], string>({
			query: userId => `files/user/${userId}`,
		}),
		uploadFile: builder.mutation<UserFile, { file: File; userId: string }>({
			query: ({ file, userId }) => {
				const formData = new FormData()
				formData.append('file', file)
				formData.append('user_id', userId)

				return {
					url: 'files',
					method: 'POST',
					body: formData,
				}
			},
		}),
		deleteFile: builder.mutation<
			{ success: boolean; message: string },
			{ fileId: string; fromPath: string }
		>({
			query: ({ fileId, fromPath }) => ({
				url: `files/${fileId}`,
				method: 'DELETE',
				params: { fromPath },
			}),
		}),
		moveFile: builder.mutation<
			{ success: boolean },
			{ fileId: string; toFolderId: string }
		>({
			query: ({ fileId, toFolderId }) => ({
				url: `/files/${fileId}/move`,
				method: 'PUT',
				params: { toFolderId },
			}),
		}),
	}),
})

export const {
	useGetFileQuery,
	useGetUserFilesQuery,
	useUploadFileMutation,
	useDeleteFileMutation,
	useMoveFileMutation,
} = fileApi
