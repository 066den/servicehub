import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { id } = await params
	const serviceId = Number(id)
	if (isNaN(serviceId)) {
		return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 })
	}

	// Получаем provider текущего пользователя
	const provider = await prisma.provider.findUnique({
		where: {
			userId: Number(session.user.id),
		},
	})

	if (!provider) {
		return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
	}

	// Проверяем, что услуга принадлежит этому провайдеру
	const service = await prisma.service.findFirst({
		where: {
			id: serviceId,
			providerId: provider.id,
			deletedAt: null,
		},
	})

	if (!service) {
		return NextResponse.json(
			{ error: 'Service not found' },
			{ status: 404 }
		)
	}

	try {
		const updatedService = await prisma.service.update({
			where: { id: serviceId },
			data: {
				isFeatured: !service.isFeatured,
			},
			select: {
				id: true,
				isFeatured: true,
			},
		})

		return NextResponse.json({ success: true, service: updatedService })
	} catch (error) {
		console.error('Error toggling service featured status:', error)
		return NextResponse.json(
			{ error: 'Failed to toggle service featured status' },
			{ status: 500 }
		)
	}
}
