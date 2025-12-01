import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTypeSchema = z.object({
	name: z.string().min(1).max(255),
	slug: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	categoryId: z.number().int().positive().optional(),
	subcategoryId: z.number().int().positive().optional().nullable(),
})

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
			return NextResponse.json({ error: 'Invalid type ID' }, { status: 400 })
		}

		const body = await req.json()
		const validationResult = updateTypeSchema.safeParse(body)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid request body',
					details: validationResult.error.issues,
				},
				{ status: 400 }
			)
		}

		const type = await prisma.type.update({
			where: { id },
			data: validationResult.data,
		})

		return NextResponse.json({ success: true, type })
	} catch (error) {
		console.error('Error updating type:', error)
		return NextResponse.json(
			{ error: 'Failed to update type' },
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
			return NextResponse.json({ error: 'Invalid type ID' }, { status: 400 })
		}

		// Проверяем, есть ли услуги в этом типе
		const servicesCount = await prisma.service.count({
			where: { typeId: id },
		})

		if (servicesCount > 0) {
			return NextResponse.json(
				{
					error: 'Cannot delete type with existing services',
					servicesCount,
				},
				{ status: 400 }
			)
		}

		await prisma.type.delete({
			where: { id },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting type:', error)
		return NextResponse.json(
			{ error: 'Failed to delete type' },
			{ status: 500 }
		)
	}
}

