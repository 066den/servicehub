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

export interface AdminState {
	isLoading: boolean
	error: string | null
}

export interface AdminActions {
	// AdminStore is now empty - all service-related actions moved to serviceStore
	clearAll: () => void
}

export interface AdminStore extends AdminState {
	actions: AdminActions
}
