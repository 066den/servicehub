import { useAdminStore } from '@/stores/admin/adminStore'
import {
	adminActionsSelector,
	categoriesSelector,
	subcategoriesSelector,
	typesSelector,
	isLoadingSelector,
	errorSelector,
	lastCategoriesUpdateSelector,
	lastSubcategoriesUpdateSelector,
	lastTypesUpdateSelector,
} from './selectors'
import { Category } from '@/types'
import { Type, SubcategoryWithTypes } from './types'

export const useAdmin = () => {
	// State
	const categories: Category[] = useAdminStore(categoriesSelector)
	const subcategories: SubcategoryWithTypes[] = useAdminStore(
		subcategoriesSelector
	)
	const types: Type[] = useAdminStore(typesSelector)
	const isLoading = useAdminStore(isLoadingSelector)
	const error = useAdminStore(errorSelector)
	const lastCategoriesUpdate = useAdminStore(lastCategoriesUpdateSelector)
	const lastSubcategoriesUpdate = useAdminStore(
		lastSubcategoriesUpdateSelector
	)
	const lastTypesUpdate = useAdminStore(lastTypesUpdateSelector)

	// Actions
	const actions = useAdminStore(adminActionsSelector)

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

	const getTypeById = (id: number): Type | undefined => {
		return types.find(type => type.id === id)
	}

	const getSubcategoriesByCategoryId = (
		categoryId: number
	): SubcategoryWithTypes[] => {
		return subcategories.filter(sub => sub.category.id === categoryId)
	}

	const getTypesBySubcategoryId = (subcategoryId: number): Type[] => {
		return types.filter(type => type.subcategoryId === subcategoryId)
	}

	const getTypesByCategoryId = (categoryId: number): Type[] => {
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

		// Helpers
		getCategoryById,
		getSubcategoryById,
		getTypeById,
		getSubcategoriesByCategoryId,
		getTypesBySubcategoryId,
		getTypesByCategoryId,

		// Actions
		...actions,
	}
}

