import { CreateServiceSchema, UpdateServiceSchema } from '@/lib/schemas'
import { Category, Service, Subcategory } from '@/types'

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
	fetchSubcategories: (force?: boolean) => Promise<void>
	createSubcategory: (data: {
		name: string
		categoryId: number
		slug?: string | null
		icon?: string | null
		description?: string | null
		isActive?: boolean
	}) => Promise<void>
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
	) => Promise<void>
	deleteSubcategory: (id: number) => Promise<boolean>
	toggleSubcategoryStatus: (id: number) => Promise<boolean>
	clearSubcategories: () => void

	// Types actions
	fetchTypes: (force?: boolean) => Promise<void>
	createType: (data: {
		name: string
		categoryId: number
		subcategoryId?: number | null
		slug?: string | null
		icon?: string | null
		description?: string | null
	}) => Promise<void>
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
	) => Promise<void>
	deleteType: (id: number) => Promise<boolean>
	clearTypes: () => void

	// Clear all
	clearAll: () => void
}

interface ProviderServiceState {
	services: Service[]
	currentService: Service | null
	isLoading: boolean
	error: string | null
	lastServicesUpdate: number
}

export interface ProviderServiceActions {
	fetchServices: (force?: boolean) => Promise<Service[] | null>
	fetchService: (id: number) => Promise<Service | null>
	createService: (data: CreateServiceSchema) => Promise<Service | null>
	updateService: (
		id: number,
		data: UpdateServiceSchema
	) => Promise<Service | null>
	deleteService: (id: number) => Promise<boolean>
	toggleActive: (id: number) => Promise<boolean>
	toggleFeatured: (id: number) => Promise<boolean>
	clearServices: () => void
}

export interface ProviderServiceStore extends ProviderServiceState {
	actions: ProviderServiceActions
}

export interface ServiceStore extends ServiceState {
	actions: ServiceActions
}
