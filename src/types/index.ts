export enum EStatus {
	sent = 'sent',
	failed = 'failed',
	pending = 'pending',
	delivered = 'delivered',
	expired = 'expired',
	rejected = 'rejected',
}

export interface ServiceCategory {
	id: number
	name: string
	slug: string
	description?: string
	icon?: string
}

export interface INotification {
	id?: string
	title?: string
	message: string
	type?: 'success' | 'error' | 'info' | 'warning' | 'message'
	persistent?: boolean
	duration?: number
	icon?: string
	actions?: {
		label: string
		onClick: () => void
	}[]
}

export interface ServiceOrder {
	id: number
	title: string
	description: string
	category: string
	location: string
	price?: number
	status: OrderStatus
	userId: number
	executorId?: number
	createdAt: Date
	updatedAt: Date
}

export type OrderStatus =
	| 'pending'
	| 'accepted'
	| 'in_progress'
	| 'completed'
	| 'cancelled'

export interface CreateOrderData {
	title: string
	description: string
	category: string
	location: string
	price?: number
}

export interface GeolocationData {
	lat: number
	lng: number
}
// export interface LocationCityData {
// 	description: string
// 	place_id: string
// 	lat: number
// 	lng: number
// 	formatted_address?: string
// 	timestamp: number
// }

export interface LocationData {
	coordinates?: GeolocationData
	address?: string
	city?: string
	area?: string
	formattedAddress?: string
	placeId?: string
	skiped?: boolean
}

export interface PlacesAutocompleteProps {
	onLocationSelect?: (location: LocationData) => void
	placeholder?: string
	restrictToCountry?: string
	types?: string[]
	className?: string
	disabled?: boolean
	showFrequentPlaces?: boolean
	showStats?: boolean
	showGeolocation?: boolean
	storageKey?: string
	maxFrequentPlaces?: number
	location?: LocationData | null
	label?: string
	helperText?: string
}

export interface Suggestion {
	description: string
	place_id: string
	structured_formatting?: {
		main_text: string
		secondary_text: string
	}
	// Для нового API AutocompleteSuggestion
	placePrediction?: google.maps.places.AutocompletePrediction
	suggestion?: google.maps.places.AutocompleteSuggestion
}

export interface StaffMember {
	id: number
	firstName: string
	lastName: string
	phone?: string | null
	role: string
	status: string
	position?: string | null
	department?: string | null
	specialization?: string | null
	experience?: number | null
	avatar?: string | null
	// Added fields for UI
	rating?: number
	reviewCount?: number
	completedJobs?: number
	earnings?: number
}

export interface Subcategory {
	id: number
	name: string
	slug: string | null
	icon: string | null
	description: string | null
	isActive: boolean
	servicesCount: number
	averagePrice: number
	_count: {
		types: number
	}
}

export interface Category {
	id: number
	name: string
	slug: string | null
	icon: string | null
	image: string | null
	description: string | null
	isActive: boolean
	servicesCount: number
	averagePrice: number
	subcategories: Subcategory[]
	_count: {
		services: number
		subcategories: number
	}
}
