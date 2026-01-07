import { prisma } from '@/lib/prisma'
import { Category } from '@/types'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

/**
 * Получает список категорий с подкатегориями и статистикой из базы данных
 * Серверная функция для использования в Server Components и API routes
 * @returns Массив категорий с подкатегориями и статистикой
 */
export async function getCategoriesWithSubcategories(): Promise<Category[]> {
	try {
		const categories = await prisma.category.findMany({
			include: {
				subcategories: {
					include: {
						_count: {
							select: {
								types: true,
							},
						},
					},
				},
				_count: {
					select: {
						subcategories: true,
					},
				},
			},
			orderBy: [
				{
					id: 'asc',
				},
			],
		})

		// Подсчитываем статистику для каждой категории
		const categoriesWithStats = await Promise.all(
			categories.map(async category => {
				// Подсчитываем услуги в категории и подкатегориях
				const servicesCount = await prisma.service.count({
					where: {
						subcategory: {
							categoryId: category.id,
						},
						deletedAt: null,
					},
				})

				// Подсчитываем среднюю цену услуг в категории
				const avgPriceResult =
					servicesCount > 0
						? await prisma.service.aggregate({
								where: {
									subcategory: {
										categoryId: category.id,
									},
									deletedAt: null,
								},
								_avg: {
									price: true,
								},
						  })
						: { _avg: { price: null } }

				// Подсчитываем услуги в подкатегориях
				const subcategoriesWithStats = await Promise.all(
					(category.subcategories || []).map(
						async (subcategory: {
							id: number
							name: string
							slug: string | null
							icon: string | null
							image: string | null
							description: string | null
							isActive: boolean
							categoryId: number
							_count: { types: number }
						}) => {
							// Находим все типы робіт в этой подкатегории
							const types = await prisma.type.findMany({
								where: {
									subcategoryId: subcategory.id,
								},
								select: { id: true },
							})

							const typeIds = types.map(t => t.id)

							const subServicesCount =
								typeIds.length > 0
									? await prisma.service.count({
											where: {
												subcategoryId: subcategory.id,
												typeId: {
													in: typeIds,
												},
												deletedAt: null,
											},
									  })
									: 0

							const subAvgPriceResult =
								typeIds.length > 0 && subServicesCount > 0
									? await prisma.service.aggregate({
											where: {
												subcategoryId: subcategory.id,
												typeId: {
													in: typeIds,
												},
												deletedAt: null,
											},
											_avg: {
												price: true,
											},
									  })
									: { _avg: { price: null } }

							return {
								id: subcategory.id,
								name: subcategory.name,
								slug: subcategory.slug,
								icon: subcategory.icon,
								image: subcategory.image,
								description: subcategory.description,
								isActive: subcategory.isActive,
								servicesCount: subServicesCount,
								averagePrice: subAvgPriceResult._avg?.price || 0,
								types: [], // Типы не включаются в базовый запрос для оптимизации
								category: {
									id: category.id,
									name: category.name,
									slug: category.slug,
									icon: category.icon,
									image: category.image,
									description: category.description,
									isActive: category.isActive,
									servicesCount: 0, // Будет заполнено позже
									averagePrice: 0, // Будет заполнено позже
									subcategories: [],
									_count: category._count,
								},
							}
						}
					)
				)

				// Создаем объект категории для использования в подкатегориях
				const categoryForSubcategories: Category = {
					id: category.id,
					name: category.name,
					slug: category.slug,
					icon: category.icon,
					image: category.image,
					description: category.description,
					isActive: category.isActive,
					servicesCount,
					averagePrice: avgPriceResult._avg?.price || 0,
					subcategories: [],
					_count: {
						services: servicesCount,
						subcategories: category._count.subcategories,
					},
				}

				return {
					...categoryForSubcategories,
					subcategories: subcategoriesWithStats.map(sub => ({
						...sub,
						category: categoryForSubcategories,
					})),
				}
			})
		)

		// Сортируем по количеству услуг (по убыванию), затем по id (по возрастанию)
		categoriesWithStats.sort((a, b) => {
			if (b.servicesCount !== a.servicesCount) {
				return b.servicesCount - a.servicesCount
			}
			return a.id - b.id
		})

		return categoriesWithStats
	} catch (error) {
		console.error('Error fetching categories:', error)
		
		// Проверяем, является ли это ошибкой подключения к БД
		const isDatabaseError = isDatabaseConnectionError(error)

		if (isDatabaseError) {
			console.warn(
				'[CategoryService] Database unavailable, returning empty categories list'
			)
			// Возвращаем пустой массив вместо падения приложения
			// Это позволит приложению работать даже при проблемах с БД
			return []
		}

		// Для других ошибок все равно выбрасываем исключение
		throw new Error('Failed to fetch categories')
	}
}

/**
 * Проверяет, является ли ошибка ошибкой подключения к базе данных
 */
function isDatabaseConnectionError(error: unknown): boolean {
	if (error instanceof PrismaClientKnownRequestError) {
		// P1000 - Authentication failed
		// P1001 - Can't reach database server
		return error.code === 'P1001' || error.code === 'P1000'
	}
	
	if (error instanceof Error) {
		return (
			error.message?.includes('planLimitReached') ||
			error.message?.includes('Failed to identify your database') ||
			error.message?.includes("Can't reach database server") ||
			error.message?.includes('Connection') ||
			error.message?.includes('ECONNREFUSED') ||
			error.message?.includes('database')
		)
	}
	
	return false
}
