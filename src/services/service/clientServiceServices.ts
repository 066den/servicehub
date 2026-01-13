import { apiRequest } from '@/lib/api'
import type { GetServicesParams, GetServicesResponse } from './serviceTypes'

// Реэкспортируем типы для удобства
export type {
	GetServicesParams,
	GetServicesResponse,
	ServiceWithRelations,
} from './serviceTypes'

/**
 * Получает список услуг с возможностью фильтрации
 * Клиентская функция для использования на клиенте (делает HTTP запрос)
 * @param params - Параметры фильтрации и пагинации
 * @returns Объект с услугами и метаданными пагинации
 */
export const getServices = async (
	params: GetServicesParams = {}
): Promise<GetServicesResponse> => {
	const {
		city,
		categoryId,
		subcategoryId,
		subcategorySlug,
		typeId,
		search,
		page = 1,
		limit = 20,
	} = params

	// Формируем query string
	const queryParams = new URLSearchParams()

	if (city) queryParams.append('city', city)
	if (categoryId) queryParams.append('categoryId', categoryId.toString())
	if (subcategoryId)
		queryParams.append('subcategoryId', subcategoryId.toString())
	if (subcategorySlug) queryParams.append('subcategorySlug', subcategorySlug)
	if (typeId) queryParams.append('typeId', typeId.toString())
	if (search) queryParams.append('search', search)
	queryParams.append('page', page.toString())
	queryParams.append('limit', limit.toString())

	const queryString = queryParams.toString()
	const url = `/api/services${queryString ? `?${queryString}` : ''}`
	return apiRequest<GetServicesResponse>(url)
}
