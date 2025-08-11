'use client'

import { useAuthStore } from '@/stores/authStore'
import { Provider } from '@/types/auth'
import { getSession } from 'next-auth/react'
import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import { useNotificationStore } from './notificationStore'

interface ProviderState {
	provider: Provider | null
	lastProviderUpdate: number
	isLoadingProvider: boolean
	providerError: string | null
	fetchProvider: () => Promise<Provider | null>
	createProvider: (provider: Provider) => void
}

export const useProviderStore = create<ProviderState>()(
	devtools(
		persist(
			(set, get) => ({
				provider: null,
				lastProviderUpdate: 0,
				isLoadingProvider: false,
				providerError: null,
				fetchProvider: async (force = false): Promise<Provider | null> => {
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

						const provider: Provider = data.provider

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
				createProvider: async (provider: Provider) => {
					const session = await getSession()
					if (!session?.accessToken) {
						throw new Error('Not access token')
					}

					try {
						const response = await fetch('/api/user/provider', {
							method: 'POST',
							headers: {
								Authorization: `Bearer ${session.accessToken}`,
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(provider),
						})

						if (!response.ok) {
							const errorData = await response.json().catch(() => ({}))
							console.error(errorData)
							throw new Error(errorData.error || `HTTP ${response.status}`)
						}

						const data = await response.json()

						if (!data.success || !data.provider) {
							throw new Error(data.error || 'Failed to create provider')
						}

						set({ provider: data.provider })
						await useAuthStore.getState().refreshUserProfile()
						useNotificationStore.getState().addNotification({
							title: 'Профіль виконавця успішно створено',
							message: 'Ви можете зараз починати отримувати замовлення',
							type: 'success',
						})
					} catch (error) {
						let message = 'Ошибка создания профіля виконавця'
						if (error instanceof Error) {
							message = error.message || message
						}
						set({ providerError: message })
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
