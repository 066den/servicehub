'use client'

import { create } from 'zustand'
import {
	DevtoolsOptions,
	PersistOptions,
	devtools,
	persist,
} from 'zustand/middleware'
import type { GeneratedDescriptions } from '@/components/ui/DescriptionGenerator'

interface DescriptionGeneratorState {
	keywords: string[]
	descriptions: GeneratedDescriptions | null
}

interface DescriptionGeneratorActions {
	setKeywords: (keywords: string[]) => void
	setDescriptions: (descriptions: GeneratedDescriptions | null) => void
	clearData: () => void
}

interface DescriptionGeneratorStore
	extends DescriptionGeneratorState,
		DescriptionGeneratorActions {}

const persistOptions: PersistOptions<
	DescriptionGeneratorStore,
	DescriptionGeneratorState
> = {
	name: 'description-generator-storage',
	partialize: state => ({
		keywords: state.keywords,
		descriptions: state.descriptions,
	}),
}

const devtoolsOptions: DevtoolsOptions = {
	store: 'description-generator-storage',
	name: 'descriptionGeneratorStore',
	enabled: process.env.NODE_ENV === 'development',
}

export const useDescriptionGeneratorStore = create<DescriptionGeneratorStore>()(
	devtools(
		persist(
			(set) => ({
				// Initial state
				keywords: [],
				descriptions: null,

				// Actions
				setKeywords: (keywords: string[]) => {
					set({ keywords })
				},

				setDescriptions: (descriptions: GeneratedDescriptions | null) => {
					set({ descriptions })
				},

				clearData: () => {
					set({
						keywords: [],
						descriptions: null,
					})
				},
			}),
			persistOptions
		),
		devtoolsOptions
	)
)

