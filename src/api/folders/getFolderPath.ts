export const getFolderPath = async (
	folderId: string
): Promise<{ id: string; folder_name: string }[] | null> => {
	try {
		const url = `${process.env.NEXT_PUBLIC_BE_URL}/api/v1/folders/path/${folderId}`

		const response = await fetch(url)

		if (!response.ok) {
			console.error('Error fetching folder path:', response.statusText)
			return null
		}

		const data = await response.json()
		return data.path
	} catch (error) {
		console.error('Error fetching folder path:', error)
		return null
	}
}
