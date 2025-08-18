import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl = 'http://localhost:3000/api/favorites'

export const favoritesApi = createApi({
	reducerPath: 'favoritesApi',
	baseQuery: fetchBaseQuery({ baseUrl }),
	endpoints: builder => ({
		getAllFavorites: builder.query({
			query: userId => `/user/${userId}`,
		}),
		addToFavorites: builder.mutation({
			query: ({ userId, itemId, itemType }) => ({
				url: '/',
				method: 'POST',
				body: { userId, itemId, itemType },
			}),
		}),
		deleteFromFavorites: builder.mutation({
			query: favoriteId => ({
				url: `/${favoriteId}`,
				method: 'DELETE',
			}),
		}),
	}),
})

export const {
	useGetAllFavoritesQuery,
	useAddToFavoritesMutation,
	useDeleteFromFavoritesMutation,
} = favoritesApi
