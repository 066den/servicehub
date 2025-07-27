import { NextResponse } from 'next/server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'

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
		displayName: getDisplayName(user.firstName, user.lastName, user.phone),
	}

	return NextResponse.json({ success: true, user: profileData })
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

// Вспомогательная функция для отображаемого имени
function getDisplayName(
	firstName?: string | null,
	lastName?: string | null,
	phone?: string
): string {
	if (firstName && lastName) {
		return `${firstName} ${lastName}`
	}
	if (firstName) {
		return firstName
	}
	if (lastName) {
		return lastName
	}
	// Возвращаем замаскированный номер телефона
	if (phone) {
		return phone.replace(/(\+\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1***$4$5')
	}
	return 'Пользователь'
}
