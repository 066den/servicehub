import { Category, Subcategory } from '@/types'

export interface Type {
	id: number
	name: string
	slug: string | null
	icon: string | null
	description: string | null
	isActive: boolean
	servicesCount: number
	categoryId: number
	subcategoryId: number | null
}

export interface SubcategoryWithTypes extends Subcategory {
	types: Type[]
	category: Category
}

export interface ServiceState {
	// Categories
	categories: Category[]
	isLoading: boolean
	error: string | null
	lastCategoriesUpdate: number

	// Subcategories
	subcategories: SubcategoryWithTypes[]
	lastSubcategoriesUpdate: number

	// Types
	types: Type[]
	lastTypesUpdate: number
}

export interface ServiceActions {
	// Categories actions
	fetchCategories: (force?: boolean) => Promise<void>
	createCategory: (data: {
		name: string
		slug?: string | null
		icon?: string | null
		description?: string | null
		isActive?: boolean
	}) => Promise<Category | null>
	updateCategory: (
		id: number,
		data: {
			name?: string
			slug?: string | null
			icon?: string | null
			description?: string | null
			isActive?: boolean
		}
	) => Promise<Category | null>
	deleteCategory: (id: number) => Promise<void>
	toggleCategoryStatus: (id: number) => Promise<boolean>
	clearCategories: () => void

	// Subcategories actions
	fetchSubcategories: (
		force?: boolean
	) => Promise<SubcategoryWithTypes[] | null>
	createSubcategory: (data: {
		name: string
		categoryId: number
		slug?: string | null
		icon?: string | null
		description?: string | null
		isActive?: boolean
	}) => Promise<Subcategory | null>
	updateSubcategory: (
		id: number,
		data: {
			name?: string
			slug?: string | null
			icon?: string | null
			description?: string | null
			isActive?: boolean
			categoryId?: number
		}
	) => Promise<Subcategory | null>
	deleteSubcategory: (id: number) => Promise<boolean>
	toggleSubcategoryStatus: (id: number) => Promise<boolean>
	clearSubcategories: () => void

	// Types actions
	fetchTypes: (force?: boolean) => Promise<Type[] | null>
	createType: (data: {
		name: string
		categoryId: number
		subcategoryId?: number | null
		slug?: string | null
		icon?: string | null
		description?: string | null
	}) => Promise<Type | null>
	updateType: (
		id: number,
		data: {
			name?: string
			slug?: string | null
			icon?: string | null
			description?: string | null
			categoryId?: number
			subcategoryId?: number | null
		}
	) => Promise<Type | null>
	deleteType: (id: number) => Promise<boolean>
	clearTypes: () => void

	// Clear all
	clearAll: () => void
}

export interface ServiceStore extends ServiceState {
	actions: ServiceActions
}
