import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { createCategorySchemaValidate } from '@/lib/schemas'
import { checkAdminAccess } from '@/lib/auth/adminAuth'
import { generateUniqueSlug } from '@/utils/slug'
import { getCategoriesWithSubcategories } from '@/services/service/categoryServices'

export async function GET() {
	try {
		const categories = await getCategoriesWithSubcategories()
		return NextResponse.json({ success: true, categories })
	} catch (error) {
		console.error('Error fetching categories:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch categories' },
			{ status: 500 }
		)
	}
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)

	const adminCheck = await checkAdminAccess(session)
	if (adminCheck) {
		return adminCheck
	}

	try {
		const body = await req.json()

		const validationResult = createCategorySchemaValidate(body)
		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid request body',
					details: validationResult.error.issues,
				},
				{ status: 400 }
			)
		}

		// Автоматически генерируем уникальный slug из name
		const slug = await generateUniqueSlug(
			prisma,
			'Category',
			validationResult.data.name
		)

		const category = await prisma.category.create({
			data: {
				...validationResult.data,
				slug,
			},
		})

		return NextResponse.json({ success: true, category }, { status: 201 })
	} catch (error) {
		console.error('Error creating category:', error)
		return NextResponse.json(
			{ error: 'Failed to create category' },
			{ status: 500 }
		)
	}
}
