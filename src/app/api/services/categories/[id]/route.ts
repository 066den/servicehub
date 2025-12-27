import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { updateCategorySchemaValidate } from '@/lib/schemas'
import { checkAdminAccess } from '@/lib/auth/adminAuth'

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions)

	const adminCheck = await checkAdminAccess(session)
	if (adminCheck) {
		return adminCheck
	}

	try {
		const { id: idParam } = await params
		const id = parseInt(idParam)
		if (isNaN(id)) {
			return NextResponse.json(
				{ error: 'Invalid category ID' },
				{ status: 400 }
			)
		}

		const body = await req.json()
		const validationResult = updateCategorySchemaValidate(body)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid request body',
					details: validationResult.error.issues,
				},
				{ status: 400 }
			)
		}

		const updateData: { name: string; slug?: string; icon?: string | null; description?: string | null; isActive?: boolean } = { name: validationResult.data.name }
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

		const category = await prisma.category.update({
			where: { id },
			data: updateData,
		})

		return NextResponse.json({ success: true, category })
	} catch (error) {
		console.error('Error updating category:', error)
		return NextResponse.json(
			{ error: 'Failed to update category' },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions)

	const adminCheck = await checkAdminAccess(session)
	if (adminCheck) {
		return adminCheck
	}

	try {
		const { id: idParam } = await params
		const id = parseInt(idParam)
		if (isNaN(id)) {
			return NextResponse.json(
				{ error: 'Invalid category ID' },
				{ status: 400 }
			)
		}

		// Проверяем, есть ли услуги в этой категории
		const servicesCount = await prisma.service.count({
			where: {
				subcategory: {
					categoryId: id,
				},
			},
		})

		if (servicesCount > 0) {
			return NextResponse.json(
				{
					error: 'Cannot delete category with existing services',
					servicesCount,
				},
				{ status: 400 }
			)
		}

		await prisma.category.delete({
			where: { id },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting category:', error)
		return NextResponse.json(
			{ error: 'Failed to delete category' },
			{ status: 500 }
		)
	}
}
