import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { checkAdminAccess } from '@/lib/auth/adminAuth'

export async function PATCH(
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

		const category = await prisma.category.findUnique({
			where: { id },
		})

		if (!category) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		const updatedCategory = await prisma.category.update({
			where: { id },
			data: {
				isActive: !category.isActive,
			},
		})

		return NextResponse.json({ success: true, category: updatedCategory })
	} catch (error) {
		console.error('Error toggling category:', error)
		return NextResponse.json(
			{ error: 'Failed to toggle category' },
			{ status: 500 }
		)
	}
}
