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
import { CreateServiceSchema, UpdateServiceSchema } from '@/lib/schemas'
import { ProviderServiceStore } from './types'

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
					fetchServices: async (force = false) => {
						const { lastServicesUpdate } = get()

						const now = Date.now()
						if (!force && now - lastServicesUpdate < 5 * 60 * 1000) {
							return
						}

						set({ isLoading: true, error: null })

						try {
							const data = await apiRequestAuth<{
								services: Service[]
							}>('/api/user/provider/services')

							set({
								services: data.services,
								lastServicesUpdate: now,
								isLoading: false,
							})
						} catch (error) {
							let message = 'Помилка завантаження послуг'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})
						}
					},

					fetchService: async (id: number) => {
						set({ isLoading: true, error: null })

						try {
							const data = await apiRequestAuth<{
								service: Service
							}>(`/api/user/provider/services/${id}`)

							const { services } = get()
							set({
								currentService: data.service,
								services: services.map(s => (s.id === id ? data.service : s)),
								isLoading: false,
							})
						} catch (error) {
							let message = 'Помилка завантаження послуги'
							if (error instanceof Error) {
								message = error.message || message
							}
							set({
								error: message,
								isLoading: false,
							})
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
								// Используем сообщение из ошибки, которое может содержать
								// более детальную информацию от API (например, message из ответа)
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
									get().currentService?.id === id ? null : get().currentService,
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
						set({ error: null })

						const { services, currentService } = get()
						const service = services.find(s => s.id === id)

						if (!service) {
							toast.error('Послугу не знайдено')
							return false
						}

						// Сохраняем исходное состояние для отката
						const previousIsActive = service.isActive
						const newIsActive = !previousIsActive

						// Optimistic update
						set({
							services: services.map(s =>
								s.id === id ? { ...s, isActive: newIsActive } : s
							),
							currentService:
								currentService?.id === id
									? { ...currentService, isActive: newIsActive }
									: currentService,
						})

						try {
							const response = await apiRequestAuth<{
								service: { id: number; isActive: boolean }
							}>(`/api/user/provider/services/${id}/toggle-active`, {
								method: 'PATCH',
							})

							// Обновляем состояние с данными с сервера
							const { services: currentServices, currentService: current } =
								get()
							set({
								services: currentServices.map(s =>
									s.id === id
										? { ...s, isActive: response.service.isActive }
										: s
								),
								currentService:
									current?.id === id
										? { ...current, isActive: response.service.isActive }
										: current,
							})

							return response.service.isActive
						} catch (error) {
							// Откатываем изменения при ошибке
							const { services: currentServices, currentService: current } =
								get()
							set({
								services: currentServices.map(s =>
									s.id === id ? { ...s, isActive: previousIsActive } : s
								),
								currentService:
									current?.id === id
										? { ...current, isActive: previousIsActive }
										: current,
								error:
									error instanceof Error
										? error.message
										: 'Помилка при зміні статусу послуги',
							})

							const message =
								error instanceof Error
									? error.message
									: 'Помилка при зміні статусу послуги'
							toast.error(message)
							return previousIsActive
						}
					},

					toggleFeatured: async (id: number): Promise<boolean> => {
						set({ error: null })

						const { services, currentService } = get()
						const service = services.find(s => s.id === id)

						if (!service) {
							toast.error('Послугу не знайдено')
							return false
						}

						// Сохраняем исходное состояние для отката
						const previousIsFeatured = service.isFeatured
						const newIsFeatured = !previousIsFeatured

						// Optimistic update
						set({
							services: services.map(s =>
								s.id === id ? { ...s, isFeatured: newIsFeatured } : s
							),
							currentService:
								currentService?.id === id
									? { ...currentService, isFeatured: newIsFeatured }
									: currentService,
						})

						try {
							const response = await apiRequestAuth<{
								service: { id: number; isFeatured: boolean }
							}>(`/api/user/provider/services/${id}/toggle-featured`, {
								method: 'PATCH',
							})

							// Обновляем состояние с данными с сервера
							const { services: currentServices, currentService: current } =
								get()
							set({
								services: currentServices.map(s =>
									s.id === id
										? { ...s, isFeatured: response.service.isFeatured }
										: s
								),
								currentService:
									current?.id === id
										? { ...current, isFeatured: response.service.isFeatured }
										: current,
							})

							return response.service.isFeatured
						} catch (error) {
							// Откатываем изменения при ошибке
							const { services: currentServices, currentService: current } =
								get()
							set({
								services: currentServices.map(s =>
									s.id === id ? { ...s, isFeatured: previousIsFeatured } : s
								),
								currentService:
									current?.id === id
										? { ...current, isFeatured: previousIsFeatured }
										: current,
								error:
									error instanceof Error
										? error.message
										: 'Помилка при зміні статусу послуги',
							})

							const message =
								error instanceof Error
									? error.message
									: 'Помилка при зміні статусу послуги'
							toast.error(message)
							return previousIsFeatured
						}
					},

					reorderServices: async (
						services: { id: number; order: number }[]
					): Promise<boolean> => {
						set({ error: null })

						const { services: currentServices } = get()

						// Сохраняем исходное состояние для отката
						const previousServices = [...currentServices]

						// Создаем мапу для быстрого поиска новых порядков
						const orderMap = new Map(services.map(s => [s.id, s.order]))

						// Optimistic update: обновляем порядок в локальном состоянии
						const reorderedServices = currentServices
							.map(service => {
								const newOrder = orderMap.get(service.id)
								if (newOrder !== undefined) {
									return { ...service, order: newOrder }
								}
								return service
							})
							.sort((a, b) => {
								// Сортируем по новому порядку
								const orderA = orderMap.get(a.id) ?? a.order
								const orderB = orderMap.get(b.id) ?? b.order
								if (orderA !== orderB) {
									return orderA - orderB
								}
								// Fallback на createdAt для одинакового порядка
								return (
									new Date(b.createdAt).getTime() -
									new Date(a.createdAt).getTime()
								)
							})

						set({ services: reorderedServices })

						try {
							const response = await apiRequestAuth<{ success: boolean }>(
								'/api/user/provider/services/reorder',
								{
									method: 'PATCH',
									body: JSON.stringify({ services }),
								}
							)

							if (!response.success) {
								throw new Error('Failed to reorder services')
							}

							toast.success('Порядок послуг успішно оновлено')
							return true
						} catch (error) {
							// Откатываем изменения при ошибке
							set({
								services: previousServices,
								error:
									error instanceof Error
										? error.message
										: 'Помилка при зміні порядку послуг',
							})

							const message =
								error instanceof Error
									? error.message
									: 'Помилка при зміні порядку послуг'
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
