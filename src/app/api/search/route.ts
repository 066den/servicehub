import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Вспомогательная функция для удаления служебных полей из результата поиска
function removeServiceFields<T extends Record<string, unknown>>(
	obj: T
): Omit<T, 'premiumPriority' | 'premiumType' | 'isFeatured' | 'createdAt'> {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { premiumPriority, premiumType, isFeatured, createdAt, ...rest } = obj
	return rest
}

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const query = searchParams.get('q') || ''
		const limit = parseInt(searchParams.get('limit') || '10')

		if (!query || query.trim().length < 2) {
			return NextResponse.json({
				success: true,
				suggestions: [],
				results: [],
				categories: [],
			})
		}

		const searchTerm = query.trim().toLowerCase()
		const categoryId = searchParams.get('categoryId')
			? parseInt(searchParams.get('categoryId') || '0')
			: null

		// Получаем активные премиум-услуги для всех провайдеров
		const now = new Date()
		const activePremiumServices = await prisma.providerPremiumService.findMany({
			where: {
				isActive: true,
				expiresAt: {
					gte: now,
				},
			},
			include: {
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		})

		// Создаем карту премиум-услуг по providerId
		const premiumServicesMap = new Map<
			number,
			{
				type: string
				categoryId: number | null
			}[]
		>()

		activePremiumServices.forEach(service => {
			if (!premiumServicesMap.has(service.providerId)) {
				premiumServicesMap.set(service.providerId, [])
			}
			premiumServicesMap.get(service.providerId)?.push({
				type: service.type,
				categoryId: service.categoryId,
			})
		})

		// Поиск услуг (services)
		const services = await prisma.service.findMany({
			where: {
				OR: [
					{
						name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
					{
						description: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				],
				deletedAt: null,
				isActive: true,
			},
			include: {
				provider: {
					select: {
						id: true,
						businessName: true,
						avatar: true,
						rating: true,
						reviewCount: true,
					},
				},
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
					},
				},
				photos: {
					where: {
						isMain: true,
					},
					take: 1,
				},
			},
			take: limit * 2, // Берем больше, чтобы после сортировки осталось достаточно
		})

		// Поиск категорий
		const categories = await prisma.category.findMany({
			where: {
				OR: [
					{
						name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
					{
						description: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				],
				isActive: true,
			},
			select: {
				id: true,
				name: true,
				slug: true,
				icon: true,
				image: true,
			},
			take: 5,
		})

		// Генерация подсказок на основе популярных запросов
		// Пока используем простую логику - берем первые слова из найденных услуг
		const suggestions: string[] = []
		const seenSuggestions = new Set<string>()

		// Добавляем сам запрос как первую подсказку
		if (searchTerm.length >= 2) {
			suggestions.push(searchTerm)
			seenSuggestions.add(searchTerm.toLowerCase())
		}

		// Генерируем подсказки из названий услуг
		services.forEach(service => {
			const words = service.name.toLowerCase().split(/\s+/)
			words.forEach(word => {
				if (
					word.startsWith(searchTerm) &&
					word.length > searchTerm.length &&
					!seenSuggestions.has(word) &&
					suggestions.length < 10
				) {
					suggestions.push(word)
					seenSuggestions.add(word)
				}
			})
		})

		// Функция для определения приоритета премиум-услуги
		const getPremiumPriority = (
			providerId: number,
			serviceCategoryId: number
		): number => {
			const providerPremiumServices = premiumServicesMap.get(providerId) || []
			let maxPriority = 0

			providerPremiumServices.forEach(premium => {
				let priority = 0
				switch (premium.type) {
					case 'TOP':
						priority = 100
						break
					case 'PRO':
						priority = 80
						break
					case 'CATEGORY_ADS':
						// Реклама в категории имеет приоритет только если соответствует категории поиска
						if (
							premium.categoryId &&
							(categoryId === premium.categoryId ||
								serviceCategoryId === premium.categoryId)
						) {
							priority = 60
						}
						break
					case 'SEARCH_BOOST':
						priority = 40
						break
				}
				maxPriority = Math.max(maxPriority, priority)
			})

			return maxPriority
		}

		// Форматируем результаты для фронтенда и добавляем информацию о премиум-статусе
		const formattedResults = services
			.map(service => {
				const premiumPriority = getPremiumPriority(
					service.provider.id,
					service.subcategory.category.id
				)
				const providerPremiumServices =
					premiumServicesMap.get(service.provider.id) || []
				const activePremiumType = providerPremiumServices.find(
					premium =>
						premium.type === 'TOP' ||
						premium.type === 'PRO' ||
						(premium.type === 'CATEGORY_ADS' &&
							premium.categoryId &&
							(categoryId === premium.categoryId ||
								service.subcategory.category.id === premium.categoryId)) ||
						premium.type === 'SEARCH_BOOST'
				)?.type

				return {
					id: service.id,
					name: service.name,
					description: service.description,
					price: service.price,
					category: {
						id: service.subcategory.category.id,
						name: service.subcategory.category.name,
						slug: service.subcategory.category.slug,
					},
					type: {
						id: service.type.id,
						name: service.type.name,
						slug: service.type.slug,
					},
					provider: {
						id: service.provider.id,
						businessName: service.provider.businessName,
						avatar: service.provider.avatar,
						rating: service.provider.rating,
						reviewCount: service.provider.reviewCount,
					},
					image: service.photos[0]?.url || null,
					premiumPriority,
					premiumType: activePremiumType || null,
					isFeatured: service.isFeatured,
					createdAt: service.createdAt,
				}
			})
			.sort((a, b) => {
				// Сортировка по приоритету премиум-услуг (убывание)
				if (b.premiumPriority !== a.premiumPriority) {
					return b.premiumPriority - a.premiumPriority
				}
				// Затем по isFeatured
				if (b.isFeatured !== a.isFeatured) {
					return b.isFeatured ? 1 : -1
				}
				// Затем по дате создания (новые первыми)
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			})
			.slice(0, limit) // Берем только нужное количество
			.map(removeServiceFields) // Убираем служебные поля

		return NextResponse.json({
			success: true,
			suggestions: suggestions.slice(0, 10),
			results: formattedResults,
			categories: categories,
		})
	} catch (error) {
		console.error('Error searching:', error)
		return NextResponse.json(
			{ success: false, error: 'Failed to search' },
			{ status: 500 }
		)
	}
}
