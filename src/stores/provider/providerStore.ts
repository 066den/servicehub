'use client'

import { useAuthStore } from '@/stores/auth/authStore'
import { Executor } from '@/types/auth'
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

					updateProvider: async (provider: UpdateProviderSchema) => {
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
							await apiRequestAuth('/api/user/provider', {
								method: 'PUT',
								body: JSON.stringify(provider),
							})
							await fetchProvider(true)
						} catch (error) {
							set({ provider: currentProvider })
							let message = 'Помилка при оновленні профіля виконавця'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({ providerError: message })
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
							console.error('Error uploadAvatar:', error)
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
							console.error('Error removeAvatar:', error)
							if (error instanceof Error) {
								set({ providerError: error.message })
							}
						}
					},
				},
			}),
			persistOptions
		),
		devtoolsOptions
	)
)
