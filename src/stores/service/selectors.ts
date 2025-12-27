import { ServiceStore } from './types'

// Actions selector
export const serviceActionsSelector = (state: ServiceStore) => state.actions

// Categories selectors
export const categoriesSelector = (state: ServiceStore) => state.categories
export const lastCategoriesUpdateSelector = (state: ServiceStore) =>
	state.lastCategoriesUpdate

// Subcategories selectors
export const subcategoriesSelector = (state: ServiceStore) =>
	state.subcategories
export const lastSubcategoriesUpdateSelector = (state: ServiceStore) =>
	state.lastSubcategoriesUpdate

// Types selectors
export const typesSelector = (state: ServiceStore) => state.types
export const lastTypesUpdateSelector = (state: ServiceStore) =>
	state.lastTypesUpdate

// Public services selectors
export const publicServicesSelector = (state: ServiceStore) =>
	state.publicServices
export const publicServicesPaginationSelector = (state: ServiceStore) =>
	state.publicServicesPagination
export const publicServicesIsLoadingSelector = (state: ServiceStore) =>
	state.publicServicesIsLoading

// Common selectors
export const isLoadingSelector = (state: ServiceStore) => state.isLoading
export const errorSelector = (state: ServiceStore) => state.error
