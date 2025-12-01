'use client'

import { create } from 'zustand'
import {
	DevtoolsOptions,
	PersistOptions,
	devtools,
	persist,
} from 'zustand/middleware'
import { toast } from 'sonner'
import { apiRequest } from '@/lib/api'
import { CommonStore, Stats } from './types'

const persistOptions: PersistOptions<
	CommonStore,
	Omit<CommonStore, 'actions'>
> = {
	name: 'common-storage',
	partialize: state => {
		const { actions: _, ...rest } = state
		void _ // Explicitly mark as intentionally unused
		return rest
	},
}

const devtoolsOptions: DevtoolsOptions = {
	store: 'common-storage',
	name: 'commonStore',
	enabled: process.env.NODE_ENV === 'development',
}

export const useCommonStore = create<CommonStore>()(
	devtools(
		persist(
			(set, get) => ({
				// Initial state
				stats: null,
				isLoading: false,
				error: null,
				lastStatsUpdate: 0,

				actions: {
					fetchStats: async (force = false) => {
						const { lastStatsUpdate } = get()

						const now = Date.now()
						if (!force && now - lastStatsUpdate < 5 * 60 * 1000) {
							return
						}

						set({ isLoading: true, error: null })

						try {
							const data = await apiRequest<{
								success: boolean
								stats: Stats
							}>('/api/stats')

							if (!data.success || !data.stats) {
								throw new Error('Failed to fetch stats')
							}

							set({
								stats: data.stats,
								lastStatsUpdate: now,
								isLoading: false,
							})
						} catch (error) {
							let message = 'Помилка завантаження статистики'
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

					clearStats: () => {
						set({
							stats: null,
							lastStatsUpdate: 0,
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
