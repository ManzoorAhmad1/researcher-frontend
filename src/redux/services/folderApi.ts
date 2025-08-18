import { Folder, FolderWithFiles } from '@/types/types'
import { createClient } from '@/utils/supabase/client'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { SupabaseClient } from '@supabase/supabase-js'

const supabase: SupabaseClient = createClient()

interface CreateFolderResponse {
  success: boolean
  data?: Folder | null
}

interface DeleteFolderResponse {
  success: boolean
}

interface CustomError {
  status: number | 'CUSTOM_ERROR' | 'FETCH_ERROR'
  data: any
  error: string
}

const baseUrl = 'http://localhost:3000/api'

export const folderApi = createApi({
  reducerPath: 'folderApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: builder => ({
    createFolder: builder.mutation<
      CreateFolderResponse,
      { folderName: string; parentId?: string; user: any }
    >({
      async queryFn({ folderName, parentId, user }) {
        try {
          const { data: userData, error: userError } = user

          if (userError) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                data: userError.message,
                error: 'User fetch error',
              } as CustomError,
            }
          }

          const userId = userData.user.id

          const response = await fetch(`${baseUrl}/folders/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              folder_name: folderName,
              parent_id: parentId || null,
              user_id: userId,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            return {
              error: {
                status: response.status,
                data: errorText,
                error: response.statusText,
              } as CustomError,
            }
          }

          const result = await response.json()

          if (!result.success) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                data: result.message,
                error: 'Folder creation error',
              } as CustomError,
            }
          }

          return { data: { success: true, data: result.data } }
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              data: (error as Error).message,
              error: 'Network error',
            } as CustomError,
          }
        }
      },
    }),
    deleteFolder: builder.mutation<DeleteFolderResponse, { folderId: string }>({
      async queryFn({ folderId }) {
        try {
          const response = await fetch(`${baseUrl}/folders/${folderId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            const errorText = await response.text()
            return {
              error: {
                status: response.status,
                data: errorText,
                error: response.statusText,
              } as CustomError,
            }
          }

          const result = await response.json()

          if (result.message !== 'Folder deleted successfully') {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                data: result.message,
                error: 'Folder deletion error',
              } as CustomError,
            }
          }

          return { data: { success: true } }
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              data: (error as Error).message,
              error: 'Network error',
            } as CustomError,
          }
        }
      },
    }),
    getFolderWithFiles: builder.query<FolderWithFiles | null, { folderId?: string; user: any }>({
      async queryFn({ folderId, user }) {
        try {
          const { data: userData, error: userError } = user

          if (userError) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                data: userError.message,
                error: 'User fetch error',
              } as CustomError,
            }
          }

          const userId = userData.user.id
          const url = folderId
            ? `${baseUrl}/folders/${userId}/${folderId}`
            : `${baseUrl}/folders/${userId}`
          
          const response = await fetch(url)

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: response.statusText,
                error: 'Fetch error',
              } as CustomError,
            }
          }

          const data: FolderWithFiles = await response.json()
          return { data }
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              data: (error as Error).message,
              error: 'Network error',
            } as CustomError,
          }
        }
      },
    }),
    moveFolder: builder.mutation<{ success: boolean }, { folderId: any; toParentId: any }>({
      query: ({ folderId, toParentId }) => ({
        url: `/folders/${folderId}/move`,
        method: 'PUT',
        params: { toParentId },
      }),
    }),
  }),
})

export const {
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useGetFolderWithFilesQuery,
  useMoveFolderMutation,
} = folderApi
