import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
	firstName: z.string().min(1).max(50).optional(),
	lastName: z.string().max(50).optional(),
	email: z.email().optional(),
	avatar: z.url().optional(),
	phoneNormalized: z.string().optional(),
	phone: z.string().optional(),
})

export async function GET() {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id && !session?.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const user = await prisma.user.findUnique({
		where: {
			id: session.user.id,
		},

		include: {
			_count: {
				select: {
					sessions: {
						where: {
							isActive: true,
							expiresAt: { gt: new Date() },
						},
					},
				},
			},
		},

		// select: {
		// 	id: true,
		// 	phone: true,
		// 	phoneNormalized: true,
		// 	firstName: true,
		// 	lastName: true,
		// 	isVerified: true,
		// 	isActive: true,
		// 	role: true,
		// 	isBlocked: true,
		// 	createdAt: true,
		// 	updatedAt: true,
		// 	lastLoginAt: true,
		// 	// Подсчитываем активные сессии
		// 	_count: {
		// 		select: {
		// 			sessions: {
		// 				where: {
		// 					isActive: true,
		// 					expiresAt: { gt: new Date() },
		// 				},
		// 			},
		// 		},
		// 	},
		// },
	})

	if (!user) {
		return NextResponse.json({ error: 'User not found' }, { status: 404 })
	}

	const stats = await getUserStats(user.id)

	const profileData = {
		...user,
		stats,
		createdAt: user.createdAt.toISOString(),
		updatedAt: user.updatedAt.toISOString(),
		lastLoginAt: user.lastLoginAt?.toISOString() || null,
		//activeSessions: user._count.sessions,
	}

	return NextResponse.json({ success: true, user: profileData })
}

export async function PUT(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const body = await req.json().catch(() => ({}))

	const validationResult = updateProfileSchema.safeParse(body)

	if (!validationResult.success) {
		return NextResponse.json(
			{
				error: 'Invalid request body',
				details: validationResult.error.issues.map(issue => ({
					field: issue.path.join('.'),
					message: issue.message,
				})),
			},
			{ status: 400 }
		)
	}

	const updateData = { ...body, ...validationResult.data }

	const existingUser = await prisma.user.findUnique({
		where: { id: session.user.id },
	})

	if (!existingUser) {
		return NextResponse.json(
			{ error: 'Пользователь не найден' },
			{ status: 404 }
		)
	}

	if (updateData.email && updateData.email !== existingUser.email) {
		const emailExists = await prisma.user.findFirst({
			where: {
				email: updateData.email,
				id: { not: session.user.id },
			},
		})

		if (emailExists) {
			return NextResponse.json(
				{ error: 'Email already in use' },
				{ status: 409 }
			)
		}
	}

	if (
		updateData.phoneNormalized &&
		updateData.phoneNormalized !== existingUser.phoneNormalized
	) {
		const phoneExists = await prisma.user.findFirst({
			where: {
				phoneNormalized: updateData.phoneNormalized,
				id: { not: session.user.id },
			},
		})

		if (phoneExists) {
			return NextResponse.json(
				{ error: 'Phone already in use' },
				{ status: 409 }
			)
		}
	}

	const updatedUser = await prisma.user.update({
		where: { id: session.user.id },
		data: {
			...updateData,
			updatedAt: new Date(),
		},
	})

	return NextResponse.json({ success: true, user: updatedUser })
}

// Вспомогательная функция для получения статистики
async function getUserStats(userId: number) {
	try {
		// Здесь можно добавить статистику по заказам, услугам и т.д.
		// Пока возвращаем заглушку
		return {
			totalOrders: 0,
			completedOrders: 0,
			totalServices: 0,
			rating: 0,
			earnings: 0,
		}

		console.log(userId)

		// Пример реальной статистики:
		/*
    const [orders, services] = await Promise.all([
      prisma.order.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { amount: true }
      }),
      prisma.service.count({
        where: { userId, isActive: true }
      })
    ]);

    return {
      totalOrders: orders._count.id || 0,
      completedOrders: orders._count.id || 0, // TODO: фильтр по статусу
      totalServices: services,
      rating: 4.5, // TODO: вычислить реальный рейтинг
      earnings: orders._sum.amount || 0
    };
    */
	} catch (error) {
		console.error('Ошибка получения статистики:', error)
		return {
			totalOrders: 0,
			completedOrders: 0,
			totalServices: 0,
			rating: 0,
			earnings: 0,
		}
	}
}
