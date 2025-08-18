import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl = 'http://localhost:3000/api/tags/'

export const tagsApi = createApi({
	reducerPath: 'tagsApi',
	baseQuery: fetchBaseQuery({ baseUrl }),
	endpoints: builder => ({
		getTags: builder.query({
			query: userId => `user/${userId}`,
		}),
		createTag: builder.mutation({
			query: tag => ({
				url: '/',
				method: 'POST',
				body: tag,
			}),
		}),
		updateTag: builder.mutation({
			query: ({ tagId, ...patch }) => ({
				url: `/${tagId}`,
				method: 'PUT',
				body: patch,
			}),
		}),
		deleteTag: builder.mutation({
			query: tagId => ({
				url: `/${tagId}`,
				method: 'DELETE',
			}),
		}),
	}),
})

export const {
	useGetTagsQuery,
	useCreateTagMutation,
	useUpdateTagMutation,
	useDeleteTagMutation,
} = tagsApi
