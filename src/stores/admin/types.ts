import { Category, Subcategory, TypeService } from '@/types'

export interface SubcategoryWithTypes extends Subcategory {
	types: TypeService[]
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
