'use client'
import { HeaderTitle } from '@/components/Header/HeaderTitle'
import { useGetUserQuery } from '@/redux/services/authApi'
import { useGetUserFilesQuery } from '@/redux/services/fileApi'
import TabsSection from '../dashboard/TabsSection'

export default function History() {
	const {
		data: user,
		error: userError,
		isLoading: userLoading,
	} = useGetUserQuery()

	const {
		data: userFiles,
		error: filesError,
		isLoading: filesLoading,
	} = useGetUserFilesQuery(user?.id!, {
		skip: !user?.id,
	})

	if (userLoading || filesLoading) {
		return <p>Loading...</p>
	}

	if (!userFiles || userFiles.length === 0) {
		return <p>No files found.</p>
	}

	return (
		<main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>
			<HeaderTitle name={'History'} />
			<TabsSection data={userFiles} />
		</main>
	)
}
