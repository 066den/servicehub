import { apiRequest } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type {
	GetServicesParams,
	GetServicesResponse,
	ServiceWithRelations,
} from './serviceTypes'
// Реэкспортируем типы из отдельного файла
export type {
	GetServicesParams,
	GetServicesResponse,
	ServiceWithRelations,
} from './serviceTypes'

// ============================================================================
// СЕРВЕРНЫЕ ФУНКЦИИ (для использования в API routes)
// ============================================================================

/**
 * Получает список услуг из базы данных с возможностью фильтрации
 * Серверная функция для использования в API routes
 * @param params - Параметры фильтрации и пагинации
 * @returns Объект с услугами и метаданными пагинации
 */
export const getServicesFromDB = async (
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

	// Формируем условия фильтрации
	const where: Prisma.ServiceWhereInput = {
		isActive: true,
		deletedAt: null,
	}

	// Фильтр по подкатегории - объединяем условия если нужно
	if (subcategoryId) {
		where.subcategoryId = subcategoryId
	} else if (subcategorySlug) {
		// Если передан slug, фильтруем по slug
		where.subcategory = {
			slug: subcategorySlug,
			isActive: true,
			...(categoryId && { categoryId: categoryId }),
		}
	} else if (categoryId) {
		// Если передан только categoryId
		where.subcategory = {
			categoryId: categoryId,
		}
	}

	// Фильтр по типу
	if (typeId) {
		where.typeId = typeId
	}

	// Поиск по названию и описанию
	if (search) {
		where.OR = [
			{
				name: {
					contains: search,
					mode: 'insensitive',
				},
			},
			{
				description: {
					contains: search,
					mode: 'insensitive',
				},
			},
			{
				shortDescription: {
					contains: search,
					mode: 'insensitive',
				},
			},
		]
	}

	// Получаем все услуги с фильтрами (без фильтра по городу)
	// Фильтрацию по городу делаем на уровне приложения, так как location - это JSON массив
	const allServices = await prisma.service.findMany({
		where,
		include: {
			subcategory: {
				include: {
					category: {
						select: {
							id: true,
							name: true,
							slug: true,
						},
					},
				},
			},
			type: {
				select: {
					id: true,
					name: true,
					slug: true,
					icon: true,
				},
			},
			provider: {
				select: {
					id: true,
					businessName: true,
					avatar: true,
					rating: true,
					reviewCount: true,
					slug: true,
				},
			},
			photos: {
				where: {
					isMain: true,
				},
				take: 1,
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})

	// Фильтруем по городу на уровне приложения (location - это массив строк)
	let filteredServices = allServices
	if (city) {
		filteredServices = allServices.filter(service => {
			if (!service.location) return false
			const serviceAreas = Array.isArray(service.location)
				? service.location
				: [service.location]
			// Нормализуем названия городов для сравнения
			const normalizedCity = city.toLowerCase().trim()
			return serviceAreas.some(
				area =>
					(typeof area === 'string' &&
						area.toLowerCase().trim() === normalizedCity) ||
					(typeof area === 'object' &&
						area !== null &&
						'city' in area &&
						String(area.city).toLowerCase().trim() === normalizedCity)
			)
		})
	}

	// Подсчитываем общее количество после фильтрации по городу
	const total = filteredServices.length

	// Вычисляем пагинацию
	const totalPages = Math.ceil(total / limit)
	const skip = (page - 1) * limit

	// Применяем пагинацию
	const services = filteredServices.slice(skip, skip + limit)

	// Сериализуем данные для передачи от сервера к клиенту
	// Преобразуем Date объекты в строки
	const serializedServices = services.map(service => ({
		...service,
		createdAt: service.createdAt.toISOString(),
		updatedAt: service.updatedAt.toISOString(),
		deletedAt: service.deletedAt?.toISOString() || null,
		photos: service.photos.map(photo => ({
			...photo,
		})),
	}))

	return {
		success: true,
		services: serializedServices as unknown as ServiceWithRelations[],
		pagination: {
			total,
			page,
			limit,
			totalPages,
		},
	}
}

// ============================================================================
// КЛИЕНТСКИЕ ФУНКЦИИ (для использования на клиенте)
// ============================================================================

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
