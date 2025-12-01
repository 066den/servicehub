import { AdminStore } from './types'

// Actions selector
export const adminActionsSelector = (state: AdminStore) => state.actions

// Common selectors
export const isLoadingSelector = (state: AdminStore) => state.isLoading
export const errorSelector = (state: AdminStore) => state.error


