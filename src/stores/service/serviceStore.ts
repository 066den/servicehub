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
import { ServiceStore, SubcategoryWithTypes, Type } from './types'

const persistOptions: PersistOptions<
	ServiceStore,
	Omit<ServiceStore, 'actions'>
> = {
	name: 'service-storage',
	partialize: state => {
		const { actions: _, ...rest } = state
		void _ // Explicitly mark as intentionally unused
		return rest
	},
}

const devtoolsOptions: DevtoolsOptions = {
	store: 'service-storage',
	name: 'serviceStore',
	enabled: process.env.NODE_ENV === 'development',
}

export const useServiceStore = create<ServiceStore>()(
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
						const { categories } = get()
						set({ isLoading: true, error: null })

						// Optimistic update - создаем временную категорию
						const tempCategory: Category = {
							id: Date.now(), // временный ID
							name: data.name,
							slug: data.slug || null,
							icon: data.icon || null,
							description: data.description || null,
							isActive: data.isActive ?? true,
							image: null,
							servicesCount: 0,
							averagePrice: 0,
							subcategories: [],
							_count: {
								services: 0,
								subcategories: 0,
							},
						}

						set({
							categories: [...categories, tempCategory],
						})

						try {
							const response = await apiRequestAuth<{
								success: boolean
								category: Category
								error?: string
							}>('/api/services/categories', {
								method: 'POST',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.category) {
								throw new Error(response.error || 'Failed to create category')
							}

							// Обновляем с реальными данными с сервера
							const { categories: currentCategories } = get()
							set({
								categories: currentCategories.map(cat =>
									cat.id === tempCategory.id ? response.category : cat
								),
								isLoading: false,
							})

							toast.success('Категорію успішно створено')
							return response.category
						} catch (error) {
							// Rollback - откатываем изменения при ошибке
							set({
								categories: categories,
								error:
									error instanceof Error
										? error.message
										: 'Помилка створення категорії',
								isLoading: false,
							})

							const message =
								error instanceof Error
									? error.message || 'Помилка створення категорії'
									: 'Помилка створення категорії'
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
							}>(`/api/services/categories/${id}`, {
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
						const { categories } = get()
						const categoryToDelete = categories.find(cat => cat.id === id)

						if (!categoryToDelete) {
							toast.error('Категорію не знайдено')
							return
						}

						// Optimistic update - удаляем из массива
						set({
							categories: categories.filter(cat => cat.id !== id),
							error: null,
						})

						try {
							await apiRequestAuth(`/api/services/categories/${id}`, {
								method: 'DELETE',
							})

							toast.success('Категорію успішно видалено')
						} catch (error) {
							// Rollback - возвращаем категорию обратно
							set({
								categories: categories,
								error:
									error instanceof Error
										? error.message
										: 'Помилка видалення категорії',
							})

							const message =
								error instanceof Error
									? error.message || 'Помилка видалення категорії'
									: 'Помилка видалення категорії'
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
								category: Category
							}>(`/api/services/categories/${id}/toggle`, {
								method: 'PATCH',
							})

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

							const message =
								error instanceof Error
									? error.message || 'Помилка зміни статусу категорії'
									: 'Помилка зміни статусу категорії'
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
							}>('/api/services/subcategories')

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
						const { subcategories, categories, types } = get()
						const category = categories.find(cat => cat.id === data.categoryId)

						if (!category) {
							toast.error('Категорію не знайдено')
							return null
						}

						set({ isLoading: true, error: null })

						// Optimistic update - создаем временную подкатегорию
						const tempSubcategory: SubcategoryWithTypes = {
							id: Date.now(), // временный ID
							name: data.name,
							slug: data.slug || null,
							icon: data.icon || null,
							description: data.description || null,
							isActive: data.isActive ?? true,
							servicesCount: 0,
							averagePrice: 0,
							_count: {
								types: 0,
							},
							types: [],
							category: category,
						}

						set({
							subcategories: [...subcategories, tempSubcategory],
						})

						try {
							const response = await apiRequestAuth<{
								success: boolean
								subcategory: Subcategory
								error?: string
							}>('/api/services/subcategories', {
								method: 'POST',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.subcategory) {
								throw new Error(
									response.error || 'Failed to create subcategory'
								)
							}

							// Получаем полные данные с сервера
							const fullData = await apiRequestAuth<{
								success: boolean
								subcategory: SubcategoryWithTypes
								error?: string
							}>(`/api/services/subcategories/${response.subcategory.id}`)

							if (fullData.success && fullData.subcategory) {
								// Обновляем с реальными данными
								const { subcategories: currentSubcategories } = get()
								const updatedSubcategories = currentSubcategories.map(sub =>
									sub.id === tempSubcategory.id ? fullData.subcategory! : sub
								)

								// Обновляем types массив
								const allTypes: Type[] = []
								updatedSubcategories.forEach(sub => {
									allTypes.push(...sub.types)
								})

								set({
									subcategories: updatedSubcategories,
									types: allTypes,
									isLoading: false,
								})
							} else {
								// Если не удалось получить полные данные, обновляем только базовую информацию
								const { subcategories: currentSubcategories } = get()
								const updatedSubcategory: SubcategoryWithTypes = {
									...response.subcategory,
									types: [],
									category: category,
								}
								set({
									subcategories: currentSubcategories.map(sub =>
										sub.id === tempSubcategory.id ? updatedSubcategory : sub
									),
									isLoading: false,
								})
							}

							toast.success('Підкатегорію успішно створено')
							return response.subcategory
						} catch (error) {
							// Rollback
							set({
								subcategories: subcategories,
								types: types,
								error:
									error instanceof Error
										? error.message
										: 'Помилка створення підкатегорії',
								isLoading: false,
							})

							const message =
								error instanceof Error
									? error.message || 'Помилка створення підкатегорії'
									: 'Помилка створення підкатегорії'
							toast.error(message)
							return null
						}
					},

					updateSubcategory: async (id, data) => {
						const { subcategories, types } = get()
						const originalSubcategory = subcategories.find(sub => sub.id === id)

						if (!originalSubcategory) {
							toast.error('Підкатегорію не знайдено')
							return null
						}

						// Optimistic update
						const optimisticSubcategory: SubcategoryWithTypes = {
							...originalSubcategory,
							...data,
							category:
								data.categoryId &&
								data.categoryId !== originalSubcategory.category.id
									? get().categories.find(cat => cat.id === data.categoryId) ||
									  originalSubcategory.category
									: originalSubcategory.category,
						}

						set({
							subcategories: subcategories.map(sub =>
								sub.id === id ? optimisticSubcategory : sub
							),
							error: null,
						})

						try {
							const response = await apiRequestAuth<{
								success: boolean
								subcategory: Subcategory
								error?: string
							}>(`/api/services/subcategories/${id}`, {
								method: 'PUT',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.subcategory) {
								throw new Error(
									response.error || 'Failed to update subcategory'
								)
							}

							// Получаем полные данные с сервера
							const fullData = await apiRequestAuth<{
								success: boolean
								subcategory: SubcategoryWithTypes
								error?: string
							}>(`/api/services/subcategories/${id}`)

							if (fullData.success && fullData.subcategory) {
								// Обновляем с актуальными данными
								const { subcategories: currentSubcategories } = get()
								const updatedSubcategories = currentSubcategories.map(sub =>
									sub.id === id ? fullData.subcategory! : sub
								)

								// Обновляем types массив
								const allTypes: Type[] = []
								updatedSubcategories.forEach(sub => {
									allTypes.push(...sub.types)
								})

								set({
									subcategories: updatedSubcategories,
									types: allTypes,
								})
							} else {
								// Если не удалось получить полные данные, обновляем только базовую информацию
								const { subcategories: currentSubcategories } = get()
								const updatedSubcategory: SubcategoryWithTypes = {
									...response.subcategory,
									types: originalSubcategory.types,
									category: optimisticSubcategory.category,
								}
								set({
									subcategories: currentSubcategories.map(sub =>
										sub.id === id ? updatedSubcategory : sub
									),
								})
							}

							toast.success('Підкатегорію успішно оновлено')
							return response.subcategory
						} catch (error) {
							// Rollback
							set({
								subcategories: subcategories.map(sub =>
									sub.id === id ? originalSubcategory : sub
								),
								types: types,
								error:
									error instanceof Error
										? error.message
										: 'Помилка оновлення підкатегорії',
							})

							const message =
								error instanceof Error
									? error.message || 'Помилка оновлення підкатегорії'
									: 'Помилка оновлення підкатегорії'
							toast.error(message)
							return null
						}
					},

					deleteSubcategory: async id => {
						const { subcategories, types } = get()
						const subcategoryToDelete = subcategories.find(sub => sub.id === id)

						if (!subcategoryToDelete) {
							toast.error('Підкатегорію не знайдено')
							return false
						}

						// Optimistic update - удаляем из массива и обновляем types
						const updatedSubcategories = subcategories.filter(
							sub => sub.id !== id
						)
						const updatedTypes = types.filter(type => type.subcategoryId !== id)

						set({
							subcategories: updatedSubcategories,
							types: updatedTypes,
							error: null,
						})

						try {
							const response = await apiRequestAuth<{
								success: boolean
								error?: string
							}>(`/api/services/subcategories/${id}`, {
								method: 'DELETE',
							})

							if (!response.success) {
								throw new Error(
									response.error || 'Failed to delete subcategory'
								)
							}

							toast.success('Підкатегорію успішно видалено')
							return true
						} catch (error) {
							// Rollback
							set({
								subcategories: subcategories,
								types: types,
								error:
									error instanceof Error
										? error.message
										: 'Помилка видалення підкатегорії',
							})

							const message =
								error instanceof Error
									? error.message || 'Помилка видалення підкатегорії'
									: 'Помилка видалення підкатегорії'
							toast.error(message)
							return false
						}
					},

					toggleSubcategoryStatus: async id => {
						const { subcategories } = get()
						const currentSubcategory = subcategories.find(sub => sub.id === id)

						if (!currentSubcategory) {
							toast.error('Підкатегорію не знайдено')
							return false
						}

						// Optimistic update - сразу обновляем состояние
						const optimisticSubcategory: SubcategoryWithTypes = {
							...currentSubcategory,
							isActive: !currentSubcategory.isActive,
						}

						set({
							subcategories: subcategories.map(sub =>
								sub.id === id ? optimisticSubcategory : sub
							),
							error: null,
						})

						try {
							const response = await apiRequestAuth<{
								success: boolean
								subcategory: Subcategory
								error?: string
							}>(`/api/services/subcategories/${id}/toggle`, {
								method: 'PATCH',
							})

							if (!response.success || !response.subcategory) {
								throw new Error(
									response.error || 'Failed to toggle subcategory status'
								)
							}

							// Получаем полные данные с сервера
							const fullData = await apiRequestAuth<{
								success: boolean
								subcategory: SubcategoryWithTypes
								error?: string
							}>(`/api/services/subcategories/${id}`)

							if (fullData.success && fullData.subcategory) {
								// Обновляем с актуальными данными
								const { subcategories: currentSubcategories } = get()
								const updatedSubcategories = currentSubcategories.map(sub =>
									sub.id === id ? fullData.subcategory! : sub
								)

								// Обновляем types массив
								const allTypes: Type[] = []
								updatedSubcategories.forEach(sub => {
									allTypes.push(...sub.types)
								})

								set({
									subcategories: updatedSubcategories,
									types: allTypes,
								})
							} else {
								// Если не удалось получить полные данные, обновляем только статус
								const { subcategories: currentSubcategories } = get()
								const updatedSubcategory: SubcategoryWithTypes = {
									...currentSubcategory,
									...response.subcategory,
									types: currentSubcategory.types,
									category: currentSubcategory.category,
								}
								set({
									subcategories: currentSubcategories.map(sub =>
										sub.id === id ? updatedSubcategory : sub
									),
								})
							}

							toast.success(
								`Підкатегорію успішно ${
									response.subcategory.isActive ? 'активовано' : 'деактивовано'
								}`
							)
							return true
						} catch (error) {
							// Rollback
							set({
								subcategories: subcategories.map(sub =>
									sub.id === id ? currentSubcategory : sub
								),
							})

							const message =
								error instanceof Error
									? error.message || 'Помилка зміни статусу підкатегорії'
									: 'Помилка зміни статусу підкатегорії'
							set({
								error: message,
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
						const { subcategories, types } = get()
						set({ isLoading: true, error: null })

						// Optimistic update - создаем временный тип
						const tempType: Type = {
							id: Date.now(), // временный ID
							name: data.name,
							slug: data.slug || null,
							icon: data.icon || null,
							description: data.description || null,
							isActive: true,
							servicesCount: 0,
							categoryId: data.categoryId,
							subcategoryId: data.subcategoryId || null,
						}

						// Обновляем subcategories и types
						const updatedSubcategories = subcategories.map(sub => {
							if (
								sub.id === data.subcategoryId ||
								(!data.subcategoryId && sub.category.id === data.categoryId)
							) {
								return {
									...sub,
									types: [...sub.types, tempType],
								}
							}
							return sub
						})

						set({
							subcategories: updatedSubcategories,
							types: [...types, tempType],
						})

						try {
							const response = await apiRequestAuth<{
								success: boolean
								type: Type
								error?: string
							}>('/api/services/types', {
								method: 'POST',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.type) {
								throw new Error(response.error || 'Failed to create type')
							}

							// Обновляем с реальными данными
							const {
								subcategories: currentSubcategories,
								types: currentTypes,
							} = get()
							const updatedSubcategoriesWithRealType = currentSubcategories.map(
								sub => {
									if (
										sub.id === response.type.subcategoryId ||
										(!response.type.subcategoryId &&
											sub.category.id === response.type.categoryId)
									) {
										return {
											...sub,
											types: sub.types.map(t =>
												t.id === tempType.id ? response.type : t
											),
										}
									}
									return sub
								}
							)

							const updatedTypes = currentTypes.map(t =>
								t.id === tempType.id ? response.type : t
							)

							set({
								subcategories: updatedSubcategoriesWithRealType,
								types: updatedTypes,
								isLoading: false,
							})

							toast.success('Тип послуги успішно створено')
							return response.type
						} catch (error) {
							// Rollback
							set({
								subcategories: subcategories,
								types: types,
								error:
									error instanceof Error
										? error.message
										: 'Помилка створення типу послуги',
								isLoading: false,
							})

							const message =
								error instanceof Error
									? error.message || 'Помилка створення типу послуги'
									: 'Помилка створення типу послуги'
							toast.error(message)
							return null
						}
					},

					updateType: async (id, data) => {
						const { subcategories, types } = get()
						const originalType = types.find(t => t.id === id)

						if (!originalType) {
							toast.error('Тип послуги не знайдено')
							return null
						}

						// Optimistic update
						const optimisticType: Type = {
							...originalType,
							...data,
						}

						// Обновляем subcategories и types
						const updatedSubcategories = subcategories.map(sub => ({
							...sub,
							types: sub.types.map(t => (t.id === id ? optimisticType : t)),
						}))

						set({
							subcategories: updatedSubcategories,
							types: types.map(t => (t.id === id ? optimisticType : t)),
							error: null,
						})

						try {
							const response = await apiRequestAuth<{
								success: boolean
								type: Type
								error?: string
							}>(`/api/services/types/${id}`, {
								method: 'PUT',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.type) {
								throw new Error(response.error || 'Failed to update type')
							}

							// Обновляем с актуальными данными
							const {
								subcategories: currentSubcategories,
								types: currentTypes,
							} = get()

							// Если изменился subcategoryId или categoryId, нужно переместить тип
							const oldSubcategoryId = originalType.subcategoryId
							const newSubcategoryId = response.type.subcategoryId

							const updatedSubcategoriesWithRealType = currentSubcategories.map(
								sub => {
									// Удаляем из старой подкатегории
									if (sub.id === oldSubcategoryId) {
										return {
											...sub,
											types: sub.types.filter(t => t.id !== id),
										}
									}
									// Добавляем в новую подкатегорию
									if (sub.id === newSubcategoryId) {
										return {
											...sub,
											types: [...sub.types, response.type],
										}
									}
									// Обновляем в текущей подкатегории
									return {
										...sub,
										types: sub.types.map(t =>
											t.id === id ? response.type : t
										),
									}
								}
							)

							const updatedTypes = currentTypes.map(t =>
								t.id === id ? response.type : t
							)

							set({
								subcategories: updatedSubcategoriesWithRealType,
								types: updatedTypes,
							})

							toast.success('Тип послуги успішно оновлено')
							return response.type
						} catch (error) {
							// Rollback
							const rollbackSubcategories = subcategories.map(sub => ({
								...sub,
								types: sub.types.map(t => (t.id === id ? originalType : t)),
							}))

							set({
								subcategories: rollbackSubcategories,
								types: types.map(t => (t.id === id ? originalType : t)),
								error:
									error instanceof Error
										? error.message
										: 'Помилка оновлення типу послуги',
							})

							const message =
								error instanceof Error
									? error.message || 'Помилка оновлення типу послуги'
									: 'Помилка оновлення типу послуги'
							toast.error(message)
							return null
						}
					},

					deleteType: async id => {
						const { subcategories, types } = get()
						const typeToDelete = types.find(t => t.id === id)

						if (!typeToDelete) {
							toast.error('Тип послуги не знайдено')
							return false
						}

						// Optimistic update - удаляем из массивов
						const updatedSubcategories = subcategories.map(sub => ({
							...sub,
							types: sub.types.filter(t => t.id !== id),
						}))
						const updatedTypes = types.filter(t => t.id !== id)

						set({
							subcategories: updatedSubcategories,
							types: updatedTypes,
							error: null,
						})

						try {
							const response = await apiRequestAuth<{
								success: boolean
								error?: string
							}>(`/api/services/types/${id}`, {
								method: 'DELETE',
							})

							if (!response.success) {
								throw new Error(response.error || 'Failed to delete type')
							}

							toast.success('Тип послуги успішно видалено')
							return true
						} catch (error) {
							// Rollback
							set({
								subcategories: subcategories,
								types: types,
								error:
									error instanceof Error
										? error.message
										: 'Помилка видалення типу послуги',
							})

							const message =
								error instanceof Error
									? error.message || 'Помилка видалення типу послуги'
									: 'Помилка видалення типу послуги'
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
