import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSubcategorySchema = z.object({
	name: z.string().min(1).max(255),
	slug: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	isActive: z.boolean().optional(),
	categoryId: z.number().int().positive(),
})

export async function GET() {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const subcategories = await prisma.subcategory.findMany({
			include: {
				category: true,
				types: {
					include: {
						_count: {
							select: {
								services: true,
							},
						},
					},
				},
				_count: {
					select: {
						types: true,
					},
				},
			},
			orderBy: {
				name: 'asc',
			},
		})

		// Подсчитываем статистику для каждой подкатегории
		const subcategoriesWithStats = await Promise.all(
			subcategories.map(async subcategory => {
				// Подсчитываем услуги в подкатегории через типы
				const servicesCount = await prisma.service.count({
					where: {
						categoryId: subcategory.categoryId,
						type: {
							subcategoryId: subcategory.id,
						},
						deletedAt: null,
					},
				})

				// Подсчитываем среднюю цену
				const avgPriceResult =
					servicesCount > 0
						? await prisma.service.aggregate({
								where: {
									categoryId: subcategory.categoryId,
									type: {
										subcategoryId: subcategory.id,
									},
									deletedAt: null,
								},
								_avg: {
									price: true,
								},
							})
						: { _avg: { price: null } }

				// Подсчитываем услуги для каждого типа
				const typesWithStats = await Promise.all(
					subcategory.types.map(async type => {
						const typeServicesCount = await prisma.service.count({
							where: {
								typeId: type.id,
								deletedAt: null,
							},
						})

						return {
							...type,
							servicesCount: typeServicesCount,
							categoryId: type.categoryId,
							subcategoryId: type.subcategoryId,
							isActive: true, // Type model doesn't have isActive field yet
						}
					})
				)

				return {
					...subcategory,
					servicesCount,
					averagePrice: avgPriceResult._avg.price || 0,
					types: typesWithStats,
				}
			})
		)

		return NextResponse.json({
			success: true,
			subcategories: subcategoriesWithStats,
		})
	} catch (error) {
		console.error('Error fetching subcategories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch subcategories' },
			{ status: 500 }
		)
	}
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const body = await req.json()
		const validationResult = createSubcategorySchema.safeParse(body)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid request body',
					details: validationResult.error.issues,
				},
				{ status: 400 }
			)
		}

		// Проверяем существование категории
		const category = await prisma.category.findUnique({
			where: { id: validationResult.data.categoryId },
		})

		if (!category) {
			return NextResponse.json(
				{ error: 'Category not found' },
				{ status: 404 }
			)
		}

		const subcategory = await prisma.subcategory.create({
			data: validationResult.data,
		})

		return NextResponse.json({ success: true, subcategory }, { status: 201 })
	} catch (error) {
		console.error('Error creating subcategory:', error)
		return NextResponse.json(
			{ error: 'Failed to create subcategory' },
			{ status: 500 }
		)
	}
}

