import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSubcategorySchema = z.object({
	name: z.string().min(1).max(255),
	slug: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	isActive: z.boolean().optional(),
	categoryId: z.number().int().positive().optional(),
})

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const { id: idParam } = await params
		const id = parseInt(idParam)
		if (isNaN(id)) {
			return NextResponse.json(
				{ error: 'Invalid subcategory ID' },
				{ status: 400 }
			)
		}

		const subcategory = await prisma.subcategory.findUnique({
			where: { id },
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
			},
		})

		if (!subcategory) {
			return NextResponse.json(
				{ error: 'Subcategory not found' },
				{ status: 404 }
			)
		}

		// Подсчитываем статистику
		const servicesCount = await prisma.service.count({
			where: {
				subcategoryId: subcategory.id,
				deletedAt: null,
			},
		})

		const avgPriceResult =
			servicesCount > 0
				? await prisma.service.aggregate({
						where: {
							subcategoryId: subcategory.id,
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

		const subcategoryWithStats = {
			...subcategory,
			servicesCount,
			averagePrice: avgPriceResult._avg?.price || 0,
			types: typesWithStats,
		}

		return NextResponse.json({ success: true, subcategory: subcategoryWithStats })
	} catch (error) {
		console.error('Error fetching subcategory:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch subcategory' },
			{ status: 500 }
		)
	}
}

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const { id: idParam } = await params
		const id = parseInt(idParam)
		if (isNaN(id)) {
			return NextResponse.json(
				{ error: 'Invalid subcategory ID' },
				{ status: 400 }
			)
		}

		const body = await req.json()
		const validationResult = updateSubcategorySchema.safeParse(body)

		if (!validationResult.success) {
			console.error('Validation error:', validationResult.error.issues)
			return NextResponse.json(
				{
					error: 'Invalid request body',
					details: validationResult.error.issues,
				},
				{ status: 400 }
			)
		}

		// Проверяем, существует ли подкатегория
		const existingSubcategory = await prisma.subcategory.findUnique({
			where: { id },
		})

		if (!existingSubcategory) {
			return NextResponse.json(
				{ error: 'Subcategory not found' },
				{ status: 404 }
			)
		}

		const updateData: { name: string; slug?: string; icon?: string | null; description?: string | null; isActive?: boolean; category?: { connect: { id: number } } } = { name: validationResult.data.name }
		if (validationResult.data.slug !== null && validationResult.data.slug !== undefined) {
			updateData.slug = validationResult.data.slug
		}
		if (validationResult.data.icon !== undefined) {
			updateData.icon = validationResult.data.icon
		}
		if (validationResult.data.description !== undefined) {
			updateData.description = validationResult.data.description
		}
		if (validationResult.data.isActive !== undefined) {
			updateData.isActive = validationResult.data.isActive
		}
		if (validationResult.data.categoryId !== undefined) {
			updateData.category = { connect: { id: validationResult.data.categoryId } }
		}

		const subcategory = await prisma.subcategory.update({
			where: { id },
			data: updateData,
		})

		return NextResponse.json({ success: true, subcategory })
	} catch (error) {
		console.error('Error updating subcategory:', error)
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to update subcategory'
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const { id: idParam } = await params
		const id = parseInt(idParam)
		if (isNaN(id)) {
			return NextResponse.json(
				{ error: 'Invalid subcategory ID' },
				{ status: 400 }
			)
		}

		// Проверяем, есть ли типы робіт в этой подкатегории
		const typesCount = await prisma.type.count({
			where: { subcategoryId: id },
		})

		if (typesCount > 0) {
			return NextResponse.json(
				{
					error: 'Cannot delete subcategory with existing types',
					typesCount,
				},
				{ status: 400 }
			)
		}

		await prisma.subcategory.delete({
			where: { id },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting subcategory:', error)
		return NextResponse.json(
			{ error: 'Failed to delete subcategory' },
			{ status: 500 }
		)
	}
}

