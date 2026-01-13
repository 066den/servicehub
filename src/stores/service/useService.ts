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
	publicServicesSelector,
	publicServicesPaginationSelector,
	publicServicesIsLoadingSelector,
} from './selectors'
import { Category, Pagination, TypeService } from '@/types'
import { SubcategoryWithTypes } from '@/stores/admin/types'
import {
	ServiceWithRelations,
	type GetServicesResponse,
} from '@/services/service/serviceTypes'

export const useService = () => {
	// State
	const categories: Category[] = useServiceStore(categoriesSelector)
	const subcategories: SubcategoryWithTypes[] = useServiceStore(
		subcategoriesSelector
	)
	const types: TypeService[] = useServiceStore(typesSelector)
	const publicServices: ServiceWithRelations[] = useServiceStore(
		publicServicesSelector
	)
	const isLoading = useServiceStore(isLoadingSelector)
	const publicServicesPagination: Pagination = useServiceStore(
		publicServicesPaginationSelector
	)
	const publicServicesIsLoading: boolean = useServiceStore(
		publicServicesIsLoadingSelector
	)
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

	// Метод для установки initial данных публичных услуг
	const setInitialPublicServices = (
		initialData: GetServicesResponse | undefined,
		city: string,
		subSlug: string
	) => {
		if (initialData?.success && initialData.services) {
			actions.setInitialPublicServices(initialData, {
				city,
				subcategorySlug: subSlug,
				page: 1,
				limit: 20,
			})
		} else if (city && subSlug) {
			// Если нет initial данных, загружаем через API
			actions.fetchPublicServices({
				city,
				subcategorySlug: subSlug,
				page: 1,
				limit: 20,
			})
		}
	}

	return {
		// State
		categories,
		subcategories,
		types,
		publicServices,
		publicServicesPagination,
		publicServicesIsLoading,
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
		setInitialPublicServices,
	}
}
