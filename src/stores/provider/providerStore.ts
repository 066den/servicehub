'use client'

import { useAuthStore } from '@/stores/auth/authStore'
import { Executor } from '@/types/auth'
import { StaffMember } from '@/types'
import { toast } from 'sonner'
import { create } from 'zustand'
import {
	DevtoolsOptions,
	PersistOptions,
	devtools,
	persist,
} from 'zustand/middleware'
import { apiRequestAuth } from '@/lib/api'
import { UpdateProviderSchema } from '@/lib/schemas'
import { ProviderStore } from './types'

const persistOptions: PersistOptions<
	ProviderStore,
	Omit<ProviderStore, 'actions'>
> = {
	name: 'provider-storage',
	partialize: state => {
		const { actions: _, ...rest } = state
		void _ // Explicitly mark as intentionally unused
		return rest
	},
}

const devtoolsOptions: DevtoolsOptions = {
	store: 'provider-storage',
	name: 'providerStore',
	enabled: process.env.NODE_ENV === 'development',
}

export const useProviderStore = create<ProviderStore>()(
	devtools(
		persist(
			(set, get) => ({
				provider: null,
				lastProviderUpdate: 0,
				isLoadingProvider: false,
				providerError: null,
				staff: [],
				isLoadingStaff: false,
				staffError: null,
				lastStaffUpdate: 0,

				actions: {
					fetchProvider: async (force = false): Promise<Executor | null> => {
						const { lastProviderUpdate, provider } = get()

						const now = Date.now()
						if (!force && now - lastProviderUpdate < 5 * 60 * 1000) {
							return provider
						}

						set({ isLoadingProvider: true, providerError: null })

						try {
							const data = await apiRequestAuth<{
								success: boolean
								provider: Executor
								error?: string
							}>('/api/user/provider')

							if (!data.success || !data.provider) {
								throw new Error(data.error || 'Failed to fetch provider')
							}

							const provider = data.provider

							set({
								provider,
								lastProviderUpdate: now,
								isLoadingProvider: false,
							})

							return provider
						} catch (error) {
							let message = 'Ошибка загрузки профіля виконавця'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								providerError: message,
								isLoadingProvider: false,
							})

							return null
						}
					},

					clearProvider: () => {
						set({
							provider: null,
							lastProviderUpdate: 0,
							isLoadingProvider: false,
							providerError: null,
						})
					},

					createProvider: async (provider: Executor) => {
						set({ isLoadingProvider: true })
						const {
							actions: { refreshUserProfile },
						} = useAuthStore.getState()
						try {
							const response = await apiRequestAuth('/api/user/provider', {
								method: 'POST',
								body: JSON.stringify(provider),
							})
							const data = response as Executor
							set({ provider: data })
							await refreshUserProfile()
							toast.success('Профіль виконавця успішно створено')
						} catch (error) {
							let message = 'Помилка при створенні профіля виконавця'

							if (error instanceof Error) {
								message = error.message || message
							}
							set({ providerError: message })
						} finally {
							set({ isLoadingProvider: false })
						}
					},

					updateProvider: async (
						provider: UpdateProviderSchema
					): Promise<string | undefined> => {
						set({ isLoadingProvider: true })
						const {
							actions: { fetchProvider },
							provider: currentProvider,
						} = get()
						if (!currentProvider) {
							throw new Error('Provider not found')
						}

						const { companyInfo, location, ...restProvider } = provider
						const normalizedLocation = location
							? {
									...location,
									coordinates: location.coordinates ?? undefined,
									skiped: location.skiped ?? undefined,
							  }
							: undefined
						const updatedProvider: Executor = {
							...currentProvider,
							...restProvider,
							location: normalizedLocation,
							companyInfo: currentProvider.companyInfo,
						}

						void companyInfo

						set({ provider: updatedProvider })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								provider: Executor
								warning?: string
							}>('/api/user/provider', {
								method: 'PUT',
								body: JSON.stringify(provider),
							})
							await fetchProvider(true)
							return response.warning
						} catch (error) {
							set({ provider: currentProvider })
							let message = 'Помилка при оновленні профіля виконавця'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({ providerError: message })
							throw error
						} finally {
							set({ isLoadingProvider: false })
						}
					},

					changeProviderType: async type => {
						const { provider: currentProvider } = get()
						if (!currentProvider) {
							throw new Error('Provider not found')
						}

						if (currentProvider.type === type) {
							return
						}

						set({
							isLoadingProvider: true,
							provider: { ...currentProvider, type },
						})

						try {
							const data = await apiRequestAuth<{
								success: boolean
								provider?: Executor
								error?: string
							}>('/api/user/provider/type', {
								method: 'PATCH',
								body: JSON.stringify({ type }),
							})

							if (!data.success || !data.provider) {
								throw new Error(data.error || 'Failed to change provider type')
							}

							set({
								provider: data.provider,
								lastProviderUpdate: Date.now(),
							})
						} catch (error) {
							set({ provider: currentProvider })
							let message = 'Помилка при зміні типу виконавця'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({ providerError: message })
							throw new Error(message)
						} finally {
							set({ isLoadingProvider: false })
						}
					},

					uploadAvatar: async (file: File) => {
						const {
							actions: { fetchProvider },
							provider: currentProvider,
						} = get()

						if (!currentProvider) {
							throw new Error('Provider not found')
						}

						try {
							const formData = new FormData()
							formData.append('avatar', file)

							const data = await apiRequestAuth<{
								success: boolean
								avatarUrl: string
								error?: string
							}>('/api/user/provider/avatar', {
								method: 'POST',
								body: formData,
							})

							if (!data.success) {
								throw new Error(
									data.error || 'Failed to upload provider avatar'
								)
							}

							if (currentProvider) {
								set({
									provider: {
										...currentProvider,
										avatar: data.avatarUrl,
									},
									lastProviderUpdate: Date.now(),
								})
							} else {
								await fetchProvider(true)
							}
						} catch (error) {
							if (error instanceof Error) {
								set({ providerError: error.message })
							}
						}
					},
					removeAvatar: async () => {
						const { provider: currentProvider } = get()
						if (!currentProvider) {
							throw new Error('Provider not found')
						}
						set({ provider: { ...currentProvider, avatar: undefined } })

						try {
							const data = await apiRequestAuth<{
								success: boolean
								error?: string
							}>('/api/user/provider/avatar', {
								method: 'DELETE',
							})

							if (!data.success) {
								throw new Error(
									data.error || 'Failed to remove provider avatar'
								)
							}
						} catch (error) {
							set({ provider: currentProvider })
							if (error instanceof Error) {
								set({ providerError: error.message })
							}
						}
					},

					fetchStaff: async (force = false): Promise<StaffMember[] | null> => {
						const { lastStaffUpdate, staff } = get()

						const now = Date.now()
						if (!force && now - lastStaffUpdate < 5 * 60 * 1000) {
							return staff
						}

						set({ isLoadingStaff: true, staffError: null })

						try {
							const data = await apiRequestAuth<{
								success?: boolean
								staff?: StaffMember[]
							}>('/api/user/provider/staff', {
								method: 'GET',
							})

							if (data.success && data.staff) {
								// Enrich with mock data for UI demo if missing (only for fields not in DB)
								const enrichedStaff = data.staff.map(member => ({
									...member,
									// rating and reviewCount are now in DB, so use them if available
									rating: member.rating ?? 4.8 + Math.random() * 0.2,
									reviewCount:
										member.reviewCount ?? Math.floor(Math.random() * 100),
									// These fields are still UI-only
									completedJobs:
										member.completedJobs ?? Math.floor(Math.random() * 50),
									earnings:
										member.earnings ??
										Math.floor(Math.random() * 20000) + 10000,
								}))

								set({
									staff: enrichedStaff,
									lastStaffUpdate: now,
									isLoadingStaff: false,
								})

								return enrichedStaff
							}

							return null
						} catch (error) {
							let message = 'Помилка завантаження співробітників'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								staffError: message,
								isLoadingStaff: false,
							})
							return null
						}
					},

					updateStaff: async (
						id: number,
						data: {
							phone?: string
							position?: string
							role?: string
							status?: string
						},
						skipLoading = false
					): Promise<StaffMember | null> => {
						if (!skipLoading) {
							set({ isLoadingStaff: true, staffError: null })
						}

						try {
							// Сохраняем старые значения полей, которые не возвращаются из API
							const { staff } = get()
							const currentMember = staff.find(member => member.id === id)
							const preservedFields = currentMember
								? {
										rating: currentMember.rating,
										reviewCount: currentMember.reviewCount,
										completedJobs: currentMember.completedJobs,
										earnings: currentMember.earnings,
								  }
								: {}

							const response = await apiRequestAuth<{
								success: boolean
								staff: StaffMember
							}>(`/api/user/provider/staff/${id}`, {
								method: 'PUT',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.staff) {
								throw new Error('Failed to update staff member')
							}

							// Объединяем обновленные данные с сохраненными полями
							const enrichedStaff: StaffMember = {
								...response.staff,
								...preservedFields,
							}

							// Обновляем сотрудника в списке
							const updatedStaff = staff.map(member =>
								member.id === id ? enrichedStaff : member
							)

							set({
								staff: updatedStaff,
								isLoadingStaff: false,
							})

							return enrichedStaff
						} catch (error) {
							let message = 'Помилка оновлення співробітника'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								staffError: message,
								isLoadingStaff: false,
							})
							return null
						}
					},

					uploadStaffAvatar: async (id: number, file: File) => {
						const { staff } = get()
						const currentMember = staff.find(member => member.id === id)

						if (!currentMember) {
							throw new Error('Staff member not found')
						}

						try {
							const formData = new FormData()
							formData.append('avatar', file)

							const data = await apiRequestAuth<{
								success: boolean
								avatarUrl: string
								error?: string
							}>(`/api/user/provider/staff/${id}/avatar`, {
								method: 'POST',
								body: formData,
							})

							if (!data.success) {
								throw new Error(data.error || 'Failed to upload staff avatar')
							}

							// Обновляем сотрудника в списке
							const updatedStaff = staff.map(member =>
								member.id === id
									? { ...member, avatar: data.avatarUrl }
									: member
							)

							set({
								staff: updatedStaff,
								lastStaffUpdate: Date.now(),
							})
						} catch (error) {
							if (error instanceof Error) {
								set({ staffError: error.message })
							}
							throw error
						}
					},

					removeStaffAvatar: async (id: number) => {
						const { staff } = get()
						const currentMember = staff.find(member => member.id === id)

						if (!currentMember) {
							throw new Error('Staff member not found')
						}

						// Оптимистично обновляем UI
						const updatedStaff = staff.map(member =>
							member.id === id ? { ...member, avatar: undefined } : member
						)
						set({ staff: updatedStaff })

						try {
							const data = await apiRequestAuth<{
								success: boolean
								error?: string
							}>(`/api/user/provider/staff/${id}/avatar`, {
								method: 'DELETE',
							})

							if (!data.success) {
								throw new Error(data.error || 'Failed to remove staff avatar')
							}

							set({
								lastStaffUpdate: Date.now(),
							})
						} catch (error) {
							// Откатываем изменения при ошибке
							set({ staff })
							if (error instanceof Error) {
								set({ staffError: error.message })
							}
							throw error
						}
					},

					deleteStaff: async (id: number): Promise<boolean> => {
						set({ isLoadingStaff: true, staffError: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
							}>(`/api/user/provider/staff/${id}`, {
								method: 'DELETE',
							})

							if (!response.success) {
								throw new Error('Failed to delete staff member')
							}

							// Удаляем сотрудника из списка
							const { staff } = get()
							const updatedStaff = staff.filter(member => member.id !== id)

							set({
								staff: updatedStaff,
								isLoadingStaff: false,
							})

							return true
						} catch (error) {
							let message = 'Помилка видалення співробітника'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								staffError: message,
								isLoadingStaff: false,
							})
							return false
						}
					},

					clearStaff: () => {
						set({
							staff: [],
							lastStaffUpdate: 0,
							isLoadingStaff: false,
							staffError: null,
						})
					},
				},
			}),
			persistOptions
		),
		devtoolsOptions
	)
)
