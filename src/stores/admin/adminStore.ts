'use client'

import { create } from 'zustand'
import {
	DevtoolsOptions,
	PersistOptions,
	devtools,
	persist,
} from 'zustand/middleware'
import { toast } from 'sonner'
import { apiRequest, apiRequestAuth } from '@/lib/api'
import { Category, Subcategory } from '@/types'
import { AdminStore, SubcategoryWithTypes, Type } from './types'

const persistOptions: PersistOptions<
	AdminStore,
	Omit<AdminStore, 'actions'>
> = {
	name: 'admin-storage',
	partialize: state => {
		const { actions: _, ...rest } = state
		void _ // Explicitly mark as intentionally unused
		return rest
	},
}

const devtoolsOptions: DevtoolsOptions = {
	store: 'admin-storage',
	name: 'adminStore',
	enabled: process.env.NODE_ENV === 'development',
}

export const useAdminStore = create<AdminStore>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				categories: [],
				isLoading: false,
				error: null,
				lastCategoriesUpdate: 0,
				subcategories: [],
				lastSubcategoriesUpdate: 0,
				types: [],
				lastTypesUpdate: 0,

				actions: {
					// Categories actions
					fetchCategories: async (force = false) => {
						const { lastCategoriesUpdate } = get()

						const now = Date.now()
						if (!force && now - lastCategoriesUpdate < 5 * 60 * 1000) {
							return
						}

						set({ isLoading: true, error: null })

						try {
							const data = await apiRequest<{ categories: Category[] }>(
								'/api/services/categories'
							)

							set({
								categories: data.categories,
								lastCategoriesUpdate: now,
								isLoading: false,
							})
						} catch (error) {
							let message = 'Помилка завантаження категорій'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
						}
					},

					createCategory: async data => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								category: Category
								error?: string
							}>('/api/admin/categories', {
								method: 'POST',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.category) {
								throw new Error(response.error || 'Failed to create category')
							}

							const { categories } = get()
							set({
								categories: [...categories, response.category],
								isLoading: false,
							})

							toast.success('Категорію успішно створено')
							return response.category
						} catch (error) {
							let message = 'Помилка створення категорії'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
							return null
						}
					},

					updateCategory: async (id, data) => {
						const { categories } = get()
						const originalCategory = categories.find(cat => cat.id === id)

						if (!originalCategory) {
							toast.error('Категорію не знайдено')
							return null
						}

						// Optimistic update
						const optimisticCategory: Category = {
							...originalCategory,
							...data,
						}

						set({
							categories: categories.map(cat =>
								cat.id === id ? optimisticCategory : cat
							),
							error: null,
						})

						try {
							const response = await apiRequestAuth<{
								category: Category
							}>(`/api/admin/categories/${id}`, {
								method: 'PUT',
								body: JSON.stringify(data),
							})

							// Обновляем с актуальными данными с сервера
							const { categories: currentCategories } = get()
							set({
								categories: currentCategories.map(cat =>
									cat.id === id ? response.category : cat
								),
							})

							toast.success('Категорію успішно оновлено')
							return response.category
						} catch (error) {
							// Rollback
							set({
								categories: categories.map(cat =>
									cat.id === id ? originalCategory : cat
								),
								error:
									error instanceof Error
										? error.message
										: 'Помилка оновлення категорії',
							})

							const message =
								error instanceof Error
									? error.message || 'Помилка оновлення категорії'
									: 'Помилка оновлення категорії'

							toast.error(message)
							return null
						}
					},

					deleteCategory: async id => {
						set({ isLoading: true, error: null })

						try {
							await apiRequestAuth(`/api/admin/categories/${id}`, {
								method: 'DELETE',
							})

							const { categories } = get()
							set({
								categories: categories.filter(cat => cat.id !== id),
								isLoading: false,
							})

							toast.success('Категорію успішно видалено')
						} catch (error) {
							let message = 'Помилка видалення категорії'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
						}
					},

					toggleCategoryStatus: async id => {
						const { categories } = get()
						const currentCategory = categories.find(cat => cat.id === id)

						if (!currentCategory) {
							toast.error('Категорію не знайдено')
							return false
						}

						// Optimistic update - сразу обновляем состояние
						const optimisticCategory: Category = {
							...currentCategory,
							isActive: !currentCategory.isActive,
						}

						set({
							categories: categories.map(cat =>
								cat.id === id ? optimisticCategory : cat
							),
							error: null,
						})

						try {
							const response = await apiRequestAuth<{
								success: boolean
								category: Category
								error?: string
							}>(`/api/admin/categories/${id}/toggle`, {
								method: 'PATCH',
							})

							if (!response.success || !response.category) {
								throw new Error(
									response.error || 'Failed to toggle category status'
								)
							}

							// Обновляем с актуальными данными с сервера
							const { categories: currentCategories } = get()
							set({
								categories: currentCategories.map(cat =>
									cat.id === id ? response.category : cat
								),
							})

							toast.success(
								`Категорію успішно ${
									response.category.isActive ? 'активовано' : 'деактивовано'
								}`
							)
							return true
						} catch (error) {
							// Rollback - откатываем изменения при ошибке
							set({
								categories: categories.map(cat =>
									cat.id === id ? currentCategory : cat
								),
							})

							let message = 'Помилка зміни статусу категорії'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
							})

							toast.error(message)
							return false
						}
					},

					clearCategories: () => {
						set({
							categories: [],
							lastCategoriesUpdate: 0,
							isLoading: false,
							error: null,
						})
					},

					// Subcategories actions
					fetchSubcategories: async (force = false) => {
						const { lastSubcategoriesUpdate, subcategories } = get()

						const now = Date.now()
						if (!force && now - lastSubcategoriesUpdate < 5 * 60 * 1000) {
							return subcategories
						}

						set({ isLoading: true, error: null })

						try {
							const data = await apiRequestAuth<{
								success: boolean
								subcategories: SubcategoryWithTypes[]
								error?: string
							}>('/api/admin/subcategories')

							if (!data.success || !data.subcategories) {
								throw new Error(data.error || 'Failed to fetch subcategories')
							}

							set({
								subcategories: data.subcategories,
								lastSubcategoriesUpdate: now,
								isLoading: false,
							})

							return data.subcategories
						} catch (error) {
							let message = 'Помилка завантаження підкатегорій'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
							return null
						}
					},

					createSubcategory: async data => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								subcategory: Subcategory
								error?: string
							}>('/api/admin/subcategories', {
								method: 'POST',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.subcategory) {
								throw new Error(
									response.error || 'Failed to create subcategory'
								)
							}

							// Refresh subcategories to get full data with types
							await get().actions.fetchSubcategories(true)

							toast.success('Підкатегорію успішно створено')
							return response.subcategory
						} catch (error) {
							let message = 'Помилка створення підкатегорії'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
							return null
						}
					},

					updateSubcategory: async (id, data) => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								subcategory: Subcategory
								error?: string
							}>(`/api/admin/subcategories/${id}`, {
								method: 'PUT',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.subcategory) {
								throw new Error(
									response.error || 'Failed to update subcategory'
								)
							}

							// Refresh subcategories to get full data with types
							await get().actions.fetchSubcategories(true)

							toast.success('Підкатегорію успішно оновлено')
							return response.subcategory
						} catch (error) {
							let message = 'Помилка оновлення підкатегорії'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
							return null
						}
					},

					deleteSubcategory: async id => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								error?: string
							}>(`/api/admin/subcategories/${id}`, {
								method: 'DELETE',
							})

							if (!response.success) {
								throw new Error(
									response.error || 'Failed to delete subcategory'
								)
							}

							const { subcategories } = get()
							set({
								subcategories: subcategories.filter(sub => sub.id !== id),
								isLoading: false,
							})

							toast.success('Підкатегорію успішно видалено')
							return true
						} catch (error) {
							let message = 'Помилка видалення підкатегорії'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
							return false
						}
					},

					toggleSubcategoryStatus: async id => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								subcategory: Subcategory
								error?: string
							}>(`/api/admin/subcategories/${id}/toggle`, {
								method: 'PATCH',
							})

							if (!response.success || !response.subcategory) {
								throw new Error(
									response.error || 'Failed to toggle subcategory status'
								)
							}

							const { subcategories } = get()
							set({
								subcategories: subcategories.map(sub =>
									sub.id === id
										? { ...sub, isActive: response.subcategory.isActive }
										: sub
								),
								isLoading: false,
							})

							toast.success(
								`Підкатегорію успішно ${
									response.subcategory.isActive ? 'активовано' : 'деактивовано'
								}`
							)
							return true
						} catch (error) {
							let message = 'Помилка зміни статусу підкатегорії'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
							return false
						}
					},

					clearSubcategories: () => {
						set({
							subcategories: [],
							lastSubcategoriesUpdate: 0,
							isLoading: false,
							error: null,
						})
					},

					// Types actions
					fetchTypes: async (force = false) => {
						const { lastTypesUpdate, types } = get()

						const now = Date.now()
						if (!force && now - lastTypesUpdate < 5 * 60 * 1000) {
							return types
						}

						set({ isLoading: true, error: null })

						try {
							// Types are fetched as part of subcategories
							const subcategories = await get().actions.fetchSubcategories(
								force
							)
							if (!subcategories) {
								return null
							}

							const allTypes: Type[] = []
							subcategories.forEach(sub => {
								allTypes.push(...sub.types)
							})

							set({
								types: allTypes,
								lastTypesUpdate: now,
								isLoading: false,
							})

							return allTypes
						} catch (error) {
							let message = 'Помилка завантаження типів послуг'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
							return null
						}
					},

					createType: async data => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								type: Type
								error?: string
							}>('/api/admin/types', {
								method: 'POST',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.type) {
								throw new Error(response.error || 'Failed to create type')
							}

							// Refresh subcategories to get updated types
							await get().actions.fetchSubcategories(true)

							toast.success('Тип послуги успішно створено')
							return response.type
						} catch (error) {
							let message = 'Помилка створення типу послуги'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
							return null
						}
					},

					updateType: async (id, data) => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								type: Type
								error?: string
							}>(`/api/admin/types/${id}`, {
								method: 'PUT',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.type) {
								throw new Error(response.error || 'Failed to update type')
							}

							// Refresh subcategories to get updated types
							await get().actions.fetchSubcategories(true)

							toast.success('Тип послуги успішно оновлено')
							return response.type
						} catch (error) {
							let message = 'Помилка оновлення типу послуги'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
							return null
						}
					},

					deleteType: async id => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								error?: string
							}>(`/api/admin/types/${id}`, {
								method: 'DELETE',
							})

							if (!response.success) {
								throw new Error(response.error || 'Failed to delete type')
							}

							// Refresh subcategories to get updated types
							await get().actions.fetchSubcategories(true)

							toast.success('Тип послуги успішно видалено')
							return true
						} catch (error) {
							let message = 'Помилка видалення типу послуги'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							toast.error(message)
							return false
						}
					},

					clearTypes: () => {
						set({
							types: [],
							lastTypesUpdate: 0,
							isLoading: false,
							error: null,
						})
					},

					// Clear all
					clearAll: () => {
						get().actions.clearCategories()
						get().actions.clearSubcategories()
						get().actions.clearTypes()
					},
				},
			}),
			persistOptions
		),
		devtoolsOptions
	)
)
