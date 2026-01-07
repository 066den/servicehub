import { authOptions } from '@/lib/auth/authOptions'
import { reorderServicesSchemaValidate } from '@/lib/schemas'
import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	// Получаем provider текущего пользователя
	const userId = session.user.id
	if (!userId || userId === 0) {
		console.error('Invalid user ID in session:', userId)
		return NextResponse.json({ error: 'Invalid user session' }, { status: 401 })
	}

	const provider = await prisma.provider.findUnique({
		where: {
			userId: userId,
		},
	})

	if (!provider) {
		console.error('Provider not found for userId:', userId)
		return NextResponse.json(
			{
				error: 'Provider not found',
				message:
					'Профіль виконавця не знайдено. Будь ласка, спочатку створіть профіль виконавця.',
			},
			{ status: 404 }
		)
	}

	let body
	try {
		body = await req.json()
	} catch {
		return NextResponse.json(
			{ error: 'Invalid JSON in request body' },
			{ status: 400 }
		)
	}

	const validationResult = reorderServicesSchemaValidate(body)

	if (!validationResult.success) {
		return NextResponse.json(
			{
				error: 'Invalid request body',
				details: validationResult.error.issues.map((issue: z.ZodIssue) => ({
					field: issue.path.join('.'),
					message: issue.message,
				})),
			},
			{ status: 400 }
		)
	}

	try {
		const { services } = validationResult.data

		// Получаем все ID услуг из запроса
		const serviceIds = services.map(s => s.id)

		// Проверяем, что все услуги принадлежат этому провайдеру
		const existingServices = await prisma.service.findMany({
			where: {
				id: { in: serviceIds },
				providerId: provider.id,
				deletedAt: null,
			},
			select: {
				id: true,
			},
		})

		// Проверяем, что все запрошенные услуги найдены
		if (existingServices.length !== serviceIds.length) {
			const foundIds = new Set(existingServices.map(s => s.id))
			const missingIds = serviceIds.filter(id => !foundIds.has(id))
			return NextResponse.json(
				{
					error: 'Some services not found or do not belong to this provider',
					missingIds,
				},
				{ status: 404 }
			)
		}

		// Обновляем порядок в транзакции для атомарности
		await prisma.$transaction(
			services.map(service =>
				prisma.service.update({
					where: { id: service.id },
					data: { order: service.order },
				})
			)
		)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error reordering services:', error)
		return NextResponse.json(
			{ error: 'Failed to reorder services' },
			{ status: 500 }
		)
	}
}

