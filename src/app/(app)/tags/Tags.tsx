'use client'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useGetUserQuery } from '@/redux/services/authApi'
import {
	useCreateTagMutation,
	useDeleteTagMutation,
	useGetTagsQuery,
	useUpdateTagMutation,
} from '@/redux/services/tagsApi'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogTitle,
} from '@radix-ui/react-dialog'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { LoaderCircle } from 'lucide-react';
interface Tag {
	id: string
	user_id: string
	name: string
	color: string
	created_at: string
}

export const TagItems: React.FC = () => {
	const { data: user } = useGetUserQuery()
	const userId = user?.id
	const { data, refetch, isFetching } = useGetTagsQuery(userId)
	const tags: Tag[] = data?.data || []
	const [createTag] = useCreateTagMutation()
	const [updateTag] = useUpdateTagMutation()
	const [deleteTag] = useDeleteTagMutation()
	const [newTag, setNewTag] = useState('')
	const [newTagColor, setNewTagColor] = useState('#ffffff')
	const [isEditModalOpen, setEditModalOpen] = useState(false)
	const [isAddModalOpen, setAddModalOpen] = useState(false)
	const [currentEditTag, setCurrentEditTag] = useState<Tag | null>(null)
	const [editTagName, setEditTagName] = useState('')
	const [editTagColor, setEditTagColor] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const handleAddTag = async () => {
		setIsLoading(true)
		if (newTag) {
			await createTag({
				userId: userId,
				name: newTag,
				color: newTagColor,
			})
			setNewTag('')
			setNewTagColor('#ffffff')
			setAddModalOpen(false)
			setIsLoading(false)
			refetch()
		}
	}

	const openEditModal = (tag: Tag) => {
		setCurrentEditTag(tag)
		setEditTagName(tag.name)
		setEditTagColor(tag.color)
		setEditModalOpen(true)
	}

	const handleEditTag = async () => {
		setIsLoading(true)
		if (currentEditTag) {
			await updateTag({
				tagId: currentEditTag.id,
				name: editTagName,
				color: editTagColor,
			})
			setEditModalOpen(false)
			setIsLoading(false)
			refetch()
		}
	}

	const handleDeleteTag = async (tagId: string) => {
		await deleteTag(tagId)
		refetch()
	}

	return (
		<>
			<h2 className='text-xl font-semibold'>Available tags</h2>
			<p className='text-gray-600'>Use tags to label the PDF.</p>
			<div className='flex flex-wrap mt-6 gap-2'>
				{isFetching ? (
						<LoaderCircle className="animate-spin h-8 w-8 text-gray-500" />
				) : (
					tags.map((tag, index) => (
						<DropdownMenu key={index}>
							<DropdownMenuTrigger asChild>
								<span
									className='flex items-center justify-center px-2 py-1 rounded-lg text-sm font-medium text-gray-800 cursor-pointer'
									style={{ backgroundColor: tag.color }}
								>
									{tag.name}
								</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='start'>
								<DropdownMenuItem onSelect={() => openEditModal(tag)}>
									Edit
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => handleDeleteTag(tag.id)}>
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					))
				)}
				<Button
					variant='outline'
					className='flex items-center gap-1 border-dashed border-gray-400'
					onClick={() => setAddModalOpen(true)}
				>
					add new tag <Plus className='h-4 w-4' />
				</Button>
			</div>

			<Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
				<DialogOverlay className='fixed inset-0 bg-black bg-opacity-50' />
				<DialogContent className='fixed p-6 bg-white rounded-md shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96'>
					<DialogTitle className='text-xl font-semibold'>
						Add New Tag
					</DialogTitle>
					<DialogDescription className='mt-2 text-gray-600'>
						Add a new tag with a name and color.
					</DialogDescription>
					<div className='mt-4'>
						<Input
							value={newTag}
							onChange={e => setNewTag(e.target.value)}
							placeholder='New tag'
							className='w-full mb-4'
						/>
						<div className='flex items-center gap-2 '>
							<input
								type='color'
								value={newTagColor}
								onChange={e => setNewTagColor(e.target.value)}
								className='w-12 h-10 p-0 bg-transparent'
							/>
							<span>{newTagColor}</span>
						</div>
					</div>
					<div className='mt-6 flex justify-end gap-2'>
						<Button onClick={() => setAddModalOpen(false)} variant='outline' className='rounded-[26px]'>
							Cancel
						</Button>
						<Button onClick={handleAddTag} variant='default' className='rounded-[26px]'>
							{isLoading ? (<LoaderCircle className="animate-spin h-5 w-5 mx-auto" />) : ("add")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
				<DialogOverlay className='fixed inset-0 bg-black bg-opacity-50' />
				<DialogContent className='fixed p-6 bg-white rounded-md shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96'>
					<DialogTitle className='text-xl font-semibold'>Edit Tag</DialogTitle>
					<DialogDescription className='mt-2 text-gray-600'>
						Edit the name and color of the tag.
					</DialogDescription>
					<div className='mt-4'>
						<Input
							value={editTagName}
							onChange={e => setEditTagName(e.target.value)}
							placeholder='Tag name'
							className='w-full mb-4'
						/>
						<div className='flex items-center gap-2'>
							<input
								type='color'
								value={editTagColor}
								onChange={e => setEditTagColor(e.target.value)}
								className='w-12 h-10 p-0 bg-transparent'
							/>
							<span>{editTagColor}</span>
						</div>
					</div>
					<div className='mt-6 flex justify-end gap-2'>
						<Button onClick={() => setEditModalOpen(false)} variant='outline' className='rounded-[26px]'>
							Cancel
						</Button>
						<Button onClick={handleEditTag} variant='default' className='rounded-[26px]'>
							{isLoading ? (<LoaderCircle className="animate-spin h-5 w-5 mx-auto" />) : ("Save")}

						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}