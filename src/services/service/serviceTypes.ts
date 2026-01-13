import type { Service, Subcategory } from '@/types'

// Типы для параметров запроса
export interface GetServicesParams {
	city?: string
	categoryId?: number
	subcategoryId?: number
	subcategorySlug?: string
	typeId?: number
	search?: string
	page?: number
	limit?: number
}

// Тип для провайдера в ответе API
interface ServiceProvider {
	id: number
	businessName: string | null
	avatar: string | null
	rating: number | null
	reviewCount: number
	slug: string | null
}

// Тип для категории в ответе API
interface ServiceCategory {
	id: number
	name: string
	slug: string | null
}

// Тип для типа услуги в ответе API
interface ServiceType {
	id: number
	name: string
	slug: string | null
}

// Тип для фото услуги
interface ServicePhoto {
	id: number
	serviceId: number
	url: string
	alt: string | null
	order: number
	isMain: boolean
}

// Расширенный тип Service с включенными связями
export interface ServiceWithRelations
	extends Omit<Service, 'subcategory' | 'type' | 'photos'> {
	subcategory: Subcategory & {
		category: ServiceCategory
	}
	type: ServiceType | null
	provider: ServiceProvider
	photos: ServicePhoto[]
}

// Тип для ответа API
export interface GetServicesResponse {
	success: boolean
	services: ServiceWithRelations[]
	pagination: {
		total: number
		page: number
		limit: number
		totalPages: number
	}
}

