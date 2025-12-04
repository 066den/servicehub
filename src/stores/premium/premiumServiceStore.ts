'use client'

import { create } from 'zustand'
import {
	DevtoolsOptions,
	PersistOptions,
	devtools,
	persist,
} from 'zustand/middleware'
import { toast } from 'sonner'
import { apiRequestAuth } from '@/lib/api'
import { ProviderPremiumService } from '@/types'
import { CreatePremiumServiceSchema } from '@/lib/schemas'

interface PremiumServiceState {
	premiumServices: ProviderPremiumService[]
	activeServices: ProviderPremiumService[]
	isLoading: boolean
	error: string | null
	lastUpdate: number
}

interface PremiumServiceActions {
	fetchPremiumServices: (force?: boolean) => Promise<ProviderPremiumService[] | null>
	activatePremiumService: (
		data: CreatePremiumServiceSchema
	) => Promise<ProviderPremiumService | null>
	clearPremiumServices: () => void
}

interface PremiumServiceStore extends PremiumServiceState {
	actions: PremiumServiceActions
}

const persistOptions: PersistOptions<
	PremiumServiceStore,
	Omit<PremiumServiceStore, 'actions'>
> = {
	name: 'premium-service-storage',
	partialize: state => {
		const { actions: _, ...rest } = state
		void _
		return rest
	},
}

const devtoolsOptions: DevtoolsOptions = {
	store: 'premium-service-storage',
	name: 'premiumServiceStore',
	enabled: process.env.NODE_ENV === 'development',
}

export const usePremiumServiceStore = create<PremiumServiceStore>()(
	devtools(
		persist(
			(set, get) => ({
				premiumServices: [],
				activeServices: [],
				isLoading: false,
				error: null,
				lastUpdate: 0,

				actions: {
					fetchPremiumServices: async (
						force = false
					): Promise<ProviderPremiumService[] | null> => {
						const { lastUpdate, premiumServices } = get()

						const now = Date.now()
						if (!force && now - lastUpdate < 5 * 60 * 1000) {
							return premiumServices
						}

						set({ isLoading: true, error: null })

						try {
							const data = await apiRequestAuth<{
								success: boolean
								premiumServices: ProviderPremiumService[]
								activeServices: ProviderPremiumService[]
							}>('/api/user/provider/premium-services')

							if (!data.success || !data.premiumServices) {
								throw new Error('Failed to fetch premium services')
							}

							set({
								premiumServices: data.premiumServices,
								activeServices: data.activeServices || [],
								lastUpdate: now,
								isLoading: false,
							})

							return data.premiumServices
						} catch (error) {
							let message = 'Помилка завантаження преміум-послуг'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})

							return null
						}
					},

					activatePremiumService: async (
						data: CreatePremiumServiceSchema
					): Promise<ProviderPremiumService | null> => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								premiumService: ProviderPremiumService
								error?: string
							}>('/api/user/provider/premium-services', {
								method: 'POST',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.premiumService) {
								throw new Error(
									response.error || 'Failed to activate premium service'
								)
							}

							const { premiumServices } = get()
							const updatedServices = [...premiumServices, response.premiumService]
							const now = new Date()
							const activeServices = updatedServices.filter(
								service =>
									service.isActive && new Date(service.expiresAt) >= now
							)

							set({
								premiumServices: updatedServices,
								activeServices,
								isLoading: false,
							})

							toast.success('Преміум-послуга успішно активована')
							return response.premiumService
						} catch (error) {
							let message = 'Помилка активації преміум-послуги'
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

					clearPremiumServices: () => {
						set({
							premiumServices: [],
							activeServices: [],
							error: null,
							lastUpdate: 0,
						})
					},
				},
			}),
			persistOptions
		),
		devtoolsOptions
	)
)

