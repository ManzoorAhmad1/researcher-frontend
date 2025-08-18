'use client'

import { ExplorerView } from '@/components/Explorer/ExplorerView'
import { mockData } from '@/mockData/mockData'
import { Folder, FolderWithFiles } from '@/types/types'
import { findFolderByPath } from '@/utils/findFolderByPath'
import { useEffect, useState } from 'react'

interface PageProps {
	params: { slug: string[] }
}

export default function Page({ params }: PageProps) {
	const [folder, setFolder] = useState<FolderWithFiles | null>(null)

	useEffect(() => {
		const path = params.slug.join('/')
		const foundFolder = findFolderByPath(mockData, path) as FolderWithFiles | null
		setFolder(foundFolder)
	}, [params.slug])

	return (
		<div>
			{folder ? (
				<ExplorerView data={folder} showFolders />
			) : (
				<p>Folder not found</p>
			)}
		</div>
	)
}
