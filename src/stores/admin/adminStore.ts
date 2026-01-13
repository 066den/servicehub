'use client'

import { create } from 'zustand'
import {
	DevtoolsOptions,
	PersistOptions,
	devtools,
	persist,
} from 'zustand/middleware'
import { AdminStore } from './types'

const persistOptions: PersistOptions<
	AdminStore,
	Omit<AdminStore, 'actions'>
> = {
	name: 'admin-storage',
	partialize: state => {
		const { actions: _, ...rest } = state
		void _ // Explicitly mark as intentionally unused
		return rest
	},
}

const devtoolsOptions: DevtoolsOptions = {
	store: 'admin-storage',
	name: 'adminStore',
	enabled: process.env.NODE_ENV === 'development',
}

export const useAdminStore = create<AdminStore>()(
	devtools(
		persist(
			set => ({
				// Initial state
				isLoading: false,
				error: null,

				actions: {
					clearAll: () => {
						set({
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
