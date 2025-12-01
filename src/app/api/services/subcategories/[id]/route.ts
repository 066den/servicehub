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
			},
		})

		if (!subcategory) {
			return NextResponse.json(
				{ error: 'Subcategory not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json({ success: true, subcategory })
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
			return NextResponse.json(
				{
					error: 'Invalid request body',
					details: validationResult.error.issues,
				},
				{ status: 400 }
			)
		}

		const subcategory = await prisma.subcategory.update({
			where: { id },
			data: validationResult.data,
		})

		return NextResponse.json({ success: true, subcategory })
	} catch (error) {
		console.error('Error updating subcategory:', error)
		return NextResponse.json(
			{ error: 'Failed to update subcategory' },
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

