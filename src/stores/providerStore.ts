'use client'

import { useAuthStore } from '@/stores/authStore'
import { Executor } from '@/types/auth'
import { toast } from 'sonner'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { apiRequestAuth } from '@/lib/api'
import { UpdateProviderSchema } from '@/lib/schemas'

interface ProviderState {
	provider: Executor | null
	lastProviderUpdate: number
	isLoadingProvider: boolean
	providerError: string | null
	fetchProvider: (force?: boolean) => Promise<Executor | null>
	createProvider: (provider: Executor) => void
	updateProvider: (provider: UpdateProviderSchema) => void
	uploadAvatar: (file: File) => Promise<void>
	removeAvatar: () => Promise<void>
}

export const useProviderStore = create<ProviderState>()(
	devtools(
		persist(
			(set, get) => ({
				provider: null,
				lastProviderUpdate: 0,
				isLoadingProvider: false,
				providerError: null,
				fetchProvider: async (force = false): Promise<Executor | null> => {
					const { lastProviderUpdate } = get()

					const now = Date.now()
					if (!force && now - lastProviderUpdate < 5 * 60 * 1000) {
						return get().provider
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
				createProvider: async (provider: Executor) => {
					set({ isLoadingProvider: true })
					try {
						const response = await apiRequestAuth('/api/user/provider', {
							method: 'POST',
							body: JSON.stringify(provider),
						})
						const data = response as Executor
						set({ provider: data })
						await useAuthStore.getState().refreshUserProfile()
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
					const { provider: currentProvider } = get()
					if (!currentProvider) {
						throw new Error('Provider not found')
					}

					set({ provider: { ...currentProvider, ...provider } })

					try {
						await apiRequestAuth('/api/user/provider', {
							method: 'PUT',
							body: JSON.stringify(provider),
						})
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

				uploadAvatar: async (file: File) => {
					const { provider: currentProvider } = get()
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
							throw new Error(data.error || 'Failed to upload provider avatar')
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
							await get().fetchProvider(true)
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
							throw new Error(data.error || 'Failed to remove provider avatar')
						}
					} catch (error) {
						set({ provider: currentProvider })
						console.error('Error removeAvatar:', error)
						if (error instanceof Error) {
							set({ providerError: error.message })
						}
					}
				},
			}),
			{
				name: 'provider-storage',
				partialize: state => ({
					provider: state.provider,
					lastProviderUpdate: state.lastProviderUpdate,
					isLoadingProvider: state.isLoadingProvider,
					providerError: state.providerError,
				}),
				storage: createJSONStorage(() => localStorage),
			}
		),
		{
			name: 'provider-store',
		}
	)
)
