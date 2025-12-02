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
import { Service } from '@/types'
import {
	CreateServiceSchema,
	UpdateServiceSchema,
} from '@/lib/schemas'

interface ProviderServiceState {
	services: Service[]
	currentService: Service | null
	isLoading: boolean
	error: string | null
	lastServicesUpdate: number
}

interface ProviderServiceActions {
	fetchServices: (force?: boolean) => Promise<Service[] | null>
	fetchService: (id: number) => Promise<Service | null>
	createService: (data: CreateServiceSchema) => Promise<Service | null>
	updateService: (id: number, data: UpdateServiceSchema) => Promise<Service | null>
	deleteService: (id: number) => Promise<boolean>
	toggleActive: (id: number) => Promise<boolean>
	toggleFeatured: (id: number) => Promise<boolean>
	clearServices: () => void
}

interface ProviderServiceStore extends ProviderServiceState {
	actions: ProviderServiceActions
}

const persistOptions: PersistOptions<
	ProviderServiceStore,
	Omit<ProviderServiceStore, 'actions'>
> = {
	name: 'provider-service-storage',
	partialize: state => {
		const { actions: _, ...rest } = state
		void _
		return rest
	},
}

const devtoolsOptions: DevtoolsOptions = {
	store: 'provider-service-storage',
	name: 'providerServiceStore',
	enabled: process.env.NODE_ENV === 'development',
}

export const useProviderServiceStore = create<ProviderServiceStore>()(
	devtools(
		persist(
			(set, get) => ({
				services: [],
				currentService: null,
				isLoading: false,
				error: null,
				lastServicesUpdate: 0,

				actions: {
					fetchServices: async (force = false): Promise<Service[] | null> => {
						const { lastServicesUpdate, services } = get()

						const now = Date.now()
						if (!force && now - lastServicesUpdate < 5 * 60 * 1000) {
							return services
						}

						set({ isLoading: true, error: null })

						try {
							const data = await apiRequestAuth<{
								success: boolean
								services: Service[]
							}>('/api/user/provider/services')

							if (!data.success || !data.services) {
								throw new Error('Failed to fetch services')
							}

							set({
								services: data.services,
								lastServicesUpdate: now,
								isLoading: false,
							})

							return data.services
						} catch (error) {
							let message = 'Помилка завантаження послуг'
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

					fetchService: async (id: number): Promise<Service | null> => {
						set({ isLoading: true, error: null })

						try {
							const data = await apiRequestAuth<{
								success: boolean
								service: Service
							}>(`/api/user/provider/services/${id}`)

							if (!data.success || !data.service) {
								throw new Error('Failed to fetch service')
							}

							set({
								currentService: data.service,
								isLoading: false,
							})

							return data.service
						} catch (error) {
							let message = 'Помилка завантаження послуги'
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

					createService: async (
						data: CreateServiceSchema
					): Promise<Service | null> => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								service: Service
							}>('/api/user/provider/services', {
								method: 'POST',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.service) {
								throw new Error('Failed to create service')
							}

							const { services } = get()
							set({
								services: [response.service, ...services],
								isLoading: false,
							})

							toast.success('Послугу успішно створено')
							return response.service
						} catch (error) {
							let message = 'Помилка при створенні послуги'
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

					updateService: async (
						id: number,
						data: UpdateServiceSchema
					): Promise<Service | null> => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								service: Service
							}>(`/api/user/provider/services/${id}`, {
								method: 'PUT',
								body: JSON.stringify(data),
							})

							if (!response.success || !response.service) {
								throw new Error('Failed to update service')
							}

							const { services } = get()
							set({
								services: services.map(s =>
									s.id === id ? response.service : s
								),
								currentService:
									get().currentService?.id === id
										? response.service
										: get().currentService,
								isLoading: false,
							})

							toast.success('Послугу успішно оновлено')
							return response.service
						} catch (error) {
							let message = 'Помилка при оновленні послуги'
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

					deleteService: async (id: number): Promise<boolean> => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{ success: boolean }>(
								`/api/user/provider/services/${id}`,
								{
									method: 'DELETE',
								}
							)

							if (!response.success) {
								throw new Error('Failed to delete service')
							}

							const { services } = get()
							set({
								services: services.filter(s => s.id !== id),
								currentService:
									get().currentService?.id === id
										? null
										: get().currentService,
								isLoading: false,
							})

							toast.success('Послугу успішно видалено')
							return true
						} catch (error) {
							let message = 'Помилка при видаленні послуги'
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

					toggleActive: async (id: number): Promise<boolean> => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								service: { id: number; isActive: boolean }
							}>(`/api/user/provider/services/${id}/toggle-active`, {
								method: 'PATCH',
							})

							if (!response.success || !response.service) {
								throw new Error('Failed to toggle service active status')
							}

							const { services } = get()
							set({
								services: services.map(s =>
									s.id === id
										? { ...s, isActive: response.service.isActive }
										: s
								),
								isLoading: false,
							})

							return response.service.isActive
						} catch (error) {
							let message = 'Помилка при зміні статусу послуги'
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

					toggleFeatured: async (id: number): Promise<boolean> => {
						set({ isLoading: true, error: null })

						try {
							const response = await apiRequestAuth<{
								success: boolean
								service: { id: number; isFeatured: boolean }
							}>(`/api/user/provider/services/${id}/toggle-featured`, {
								method: 'PATCH',
							})

							if (!response.success || !response.service) {
								throw new Error('Failed to toggle service featured status')
							}

							const { services } = get()
							set({
								services: services.map(s =>
									s.id === id
										? { ...s, isFeatured: response.service.isFeatured }
										: s
								),
								isLoading: false,
							})

							return response.service.isFeatured
						} catch (error) {
							let message = 'Помилка при зміні статусу послуги'
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

					clearServices: () => {
						set({
							services: [],
							currentService: null,
							lastServicesUpdate: 0,
							isLoading: false,
							error: null,
						})
					},
				},
			}),
			persistOptions
		),
		devtoolsOptions
	)
)
