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

export interface LocationData {
	description: string
	place_id: string
	lat: number
	lng: number
	formatted_address?: string
	timestamp: number
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
}

export interface Suggestion {
	description: string
	place_id: string
	structured_formatting?: {
		main_text: string
		secondary_text: string
	}
}
