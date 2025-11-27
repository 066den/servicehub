import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
						services: true,
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
						categoryId: category.id,
						deletedAt: null,
					},
				})

				// Подсчитываем среднюю цену услуг в категории
				const avgPriceResult =
					servicesCount > 0
						? await prisma.service.aggregate({
								where: {
									categoryId: category.id,
									deletedAt: null,
								},
								_avg: {
									price: true,
								},
						  })
						: { _avg: { price: null } }

				// Подсчитываем услуги в подкатегориях
				const subcategoriesWithStats = await Promise.all(
					category.subcategories.map(async subcategory => {
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
											categoryId: category.id,
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
											categoryId: category.id,
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
							...subcategory,
							servicesCount: subServicesCount,
							averagePrice: subAvgPriceResult._avg.price || 0,
						}
					})
				)

				return {
					...category,
					servicesCount,
					averagePrice: avgPriceResult._avg.price || 0,
					subcategories: subcategoriesWithStats,
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

		return NextResponse.json({ success: true, categories: categoriesWithStats })
	} catch (error) {
		console.error('Error fetching categories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
			{ status: 500 }
		)
	}
}
