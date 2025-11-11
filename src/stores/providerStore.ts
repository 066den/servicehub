'use client'

import { useAuthStore } from '@/stores/authStore'
import { Executor } from '@/types/auth'
import { getSession } from 'next-auth/react'
import { toast } from 'sonner'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { apiRequestAuth } from '@/lib/api'

interface ProviderState {
	provider: Executor | null
	lastProviderUpdate: number
	isLoadingProvider: boolean
	providerError: string | null
	fetchProvider: () => Promise<Executor | null>
	createProvider: (provider: Executor) => void
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

					const session = await getSession()
					if (!session?.accessToken) {
						throw new Error('Not access token')
					}

					try {
						const response = await fetch('/api/user/provider', {
							headers: {
								Authorization: `Bearer ${session.accessToken}`,
								'Content-Type': 'application/json',
							},
						})

						if (!response.ok) {
							const errorData = await response.json().catch(() => ({}))
							throw new Error(errorData.error || `HTTP ${response.status}`)
						}

						const data = await response.json()

						if (!data.success || !data.provider) {
							throw new Error(data.error || 'Failed to fetch provider')
						}

						const provider: Executor = data.provider

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
