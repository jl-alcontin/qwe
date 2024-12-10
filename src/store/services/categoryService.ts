import { api } from '../api';
import { networkStatus } from '../../utils/networkStatus';
import { handleOfflineAction } from '../../utils/offlineStorage';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  store: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  store: string;
}

export const categoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], string>({
      query: (storeId) => `categories/${storeId}`,
      providesTags: ['Categories'],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded;

          // Listen for offline data changes
          const offlineChangesHandler = (event: StorageEvent) => {
            if (event.key === 'offlineCategories') {
              const offlineData = JSON.parse(event.newValue || '[]');
              updateCachedData((draft) => {
                // Add offline categories to the cached data
                offlineData.forEach((item: any) => {
                  if (!draft.find((cat) => cat._id === item._id)) {
                    draft.push(item);
                  }
                });
              });
            }
          };

          window.addEventListener('storage', offlineChangesHandler);

          await cacheEntryRemoved;
          window.removeEventListener('storage', offlineChangesHandler);
        } catch {
          // Handle error if needed
        }
      },
    }),
    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: (categoryData) => ({
        url: 'categories',
        method: 'POST',
        body: categoryData,
      }),
      async onQueryStarted(category, { dispatch, queryFulfilled }) {
        // Generate a temporary ID for offline use
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const optimisticCategory = {
          _id: tempId,
          ...category,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // If offline, handle the offline action
        if (!networkStatus.isNetworkOnline()) {
          const handled = await handleOfflineAction('category', 'create', optimisticCategory);
          if (handled) {
            // Update the cache optimistically
            dispatch(
              categoryApi.util.updateQueryData('getCategories', category.store, (draft) => {
                draft.push(optimisticCategory);
              })
            );
            return;
          }
        }

        // If online, proceed with normal operation
        try {
          const { data: createdCategory } = await queryFulfilled;
          dispatch(
            categoryApi.util.updateQueryData('getCategories', category.store, (draft) => {
              const index = draft.findIndex((cat) => cat._id === tempId);
              if (index !== -1) {
                draft[index] = createdCategory;
              } else {
                draft.push(createdCategory);
              }
            })
          );
        } catch {
          // Handle error if needed
          dispatch(
            categoryApi.util.updateQueryData('getCategories', category.store, (draft) => {
              const index = draft.findIndex((cat) => cat._id === tempId);
              if (index !== -1) {
                draft.splice(index, 1);
              }
            })
          );
        }
      },
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation<Category, Partial<Category> & Pick<Category, '_id'>>({
      query: ({ _id, ...patch }) => ({
        url: `categories/${_id}`,
        method: 'PUT',
        body: patch,
      }),
      async onQueryStarted({ _id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          categoryApi.util.updateQueryData('getCategories', patch.store!, (draft) => {
            const index = draft.findIndex((cat) => cat._id === _id);
            if (index !== -1) {
              Object.assign(draft[index], patch);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;