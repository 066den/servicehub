import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'

export async function PATCH(
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
		})

		if (!subcategory) {
			return NextResponse.json(
				{ error: 'Subcategory not found' },
				{ status: 404 }
			)
		}

		const updatedSubcategory = await prisma.subcategory.update({
			where: { id },
			data: {
				isActive: !subcategory.isActive,
			},
		})

		return NextResponse.json({ success: true, subcategory: updatedSubcategory })
	} catch (error) {
		console.error('Error toggling subcategory:', error)
		return NextResponse.json(
			{ error: 'Failed to toggle subcategory' },
			{ status: 500 }
		)
	}
}

