import { useServiceStore } from '@/stores/service/serviceStore'
import {
	serviceActionsSelector,
	categoriesSelector,
	subcategoriesSelector,
	typesSelector,
	isLoadingSelector,
	errorSelector,
	lastCategoriesUpdateSelector,
	lastSubcategoriesUpdateSelector,
	lastTypesUpdateSelector,
} from './selectors'
import { Category, TypeService } from '@/types'
import { SubcategoryWithTypes } from '@/stores/admin/types'

export const useService = () => {
	// State
	const categories: Category[] = useServiceStore(categoriesSelector)
	const subcategories: SubcategoryWithTypes[] = useServiceStore(
		subcategoriesSelector
	)
	const types: TypeService[] = useServiceStore(typesSelector)
	const isLoading = useServiceStore(isLoadingSelector)
	const error = useServiceStore(errorSelector)
	const lastCategoriesUpdate = useServiceStore(lastCategoriesUpdateSelector)
	const lastSubcategoriesUpdate = useServiceStore(
		lastSubcategoriesUpdateSelector
	)
	const lastTypesUpdate = useServiceStore(lastTypesUpdateSelector)

	// Actions
	const actions = useServiceStore(serviceActionsSelector)

	// Computed values
	const hasCategories = categories.length > 0
	const hasSubcategories = subcategories.length > 0
	const hasTypes = types.length > 0

	// Helper functions
	const getCategoryById = (id: number): Category | undefined => {
		return categories.find(cat => cat.id === id)
	}

	const getSubcategoryById = (id: number): SubcategoryWithTypes | undefined => {
		return subcategories.find(sub => sub.id === id)
	}

	const getTypeById = (id: number): TypeService | undefined => {
		return types.find(type => type.id === id)
	}

	const getSubcategoriesByCategoryId = (
		categoryId: number
	): SubcategoryWithTypes[] => {
		return subcategories.filter(sub => sub.category.id === categoryId)
	}

	const getTypesBySubcategoryId = (subcategoryId: number): TypeService[] => {
		return types.filter(type => type.subcategoryId === subcategoryId)
	}

	const getTypesByCategoryId = (categoryId: number): TypeService[] => {
		return types.filter(type => type.categoryId === categoryId)
	}

	return {
		// State
		categories,
		subcategories,
		types,
		isLoading,
		error,
		lastCategoriesUpdate,
		lastSubcategoriesUpdate,
		lastTypesUpdate,

		// Computed
		hasCategories,
		hasSubcategories,
		hasTypes,

		// Actions
		...actions,

		// Helpers
		getCategoryById,
		getSubcategoryById,
		getTypeById,
		getSubcategoriesByCategoryId,
		getTypesBySubcategoryId,
		getTypesByCategoryId,
	}
}
