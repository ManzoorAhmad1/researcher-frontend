'use client'

import { ExplorerView } from '@/components/Explorer/ExplorerView'
import { HeaderTitle } from '@/components/Header/HeaderTitle'
import { useGetUserQuery } from '@/redux/services/authApi'
import { useGetAllFavoritesQuery } from '@/redux/services/favoritesApi'
import { RootState } from '@/reducer/store'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

export default function Favorites() {
	const { data: user } = useGetUserQuery()
	const userId = user?.id
	const refresh = useSelector((state: RootState) => state.folder.refreshData )
	const { data, error, isLoading, refetch } = useGetAllFavoritesQuery(userId, {
		skip: !userId,
	})

	useEffect(() => {
		if (userId) {
			refetch()
		}
	}, [refresh, userId, refetch])

	return (
		<main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
			<HeaderTitle name={'Favorites'} />
			<div>
				{isLoading ? (
					<p>Loading...</p>
				) : error ? (
					<p>Error loading favorites</p>
				) : data ? (
					<ExplorerView data={data} showFolders hideAddFolderButton />
				) : (
					<p>No favorites found</p>
				)}
			</div>
		</main>
	)
}
