import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { createTypeSchema } from '@/lib/schemas'
import { generateUniqueSlug } from '@/utils/slug'

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const body = await req.json()
		const validationResult = createTypeSchema.safeParse(body)

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

		// Если указана подкатегория, проверяем её существование
		if (validationResult.data.subcategoryId) {
			const subcategory = await prisma.subcategory.findUnique({
				where: { id: validationResult.data.subcategoryId },
			})

			if (!subcategory) {
				return NextResponse.json(
					{ error: 'Subcategory not found' },
					{ status: 404 }
				)
			}
		}

		// Автоматически генерируем уникальный slug из name
		const slug = await generateUniqueSlug(
			prisma,
			'Type',
			validationResult.data.name
		)

		const type = await prisma.type.create({
			data: {
				...validationResult.data,
				slug,
			},
		})

		return NextResponse.json({ success: true, type }, { status: 201 })
	} catch (error) {
		console.error('Error creating type:', error)
		return NextResponse.json(
			{ error: 'Failed to create type' },
			{ status: 500 }
		)
	}
}

