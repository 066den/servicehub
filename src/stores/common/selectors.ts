import { CommonStore } from './types'

// Actions selector
export const commonActionsSelector = (state: CommonStore) => state.actions

// Stats selectors
export const statsSelector = (state: CommonStore) => state.stats
export const isLoadingSelector = (state: CommonStore) => state.isLoading
export const errorSelector = (state: CommonStore) => state.error
export const lastStatsUpdateSelector = (state: CommonStore) =>
	state.lastStatsUpdate

