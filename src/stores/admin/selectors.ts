import { AdminStore } from './types'

// Actions selector
export const adminActionsSelector = (state: AdminStore) => state.actions

// Categories selectors
export const categoriesSelector = (state: AdminStore) => state.categories
export const isLoadingSelector = (state: AdminStore) => state.isLoading
export const errorSelector = (state: AdminStore) => state.error
export const lastCategoriesUpdateSelector = (state: AdminStore) =>
	state.lastCategoriesUpdate

// Subcategories selectors
export const subcategoriesSelector = (state: AdminStore) => state.subcategories
export const lastSubcategoriesUpdateSelector = (state: AdminStore) =>
	state.lastSubcategoriesUpdate

// Types selectors
export const typesSelector = (state: AdminStore) => state.types
export const lastTypesUpdateSelector = (state: AdminStore) =>
	state.lastTypesUpdate

