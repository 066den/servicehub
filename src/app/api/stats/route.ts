import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
	try {
		const [
			categoriesCount,
			servicesCount,
			performersCount,
			clientsCount,
			typesCount,
		] = await Promise.all([
			// Количество активных категорий
			prisma.category.count({
				where: {
					isActive: true,
				},
			}),
			// Количество услуг (не удаленных)
			prisma.service.count({
				where: {
					deletedAt: null,
				},
			}),
			// Количество активных исполнителей
			prisma.provider.count({
				where: {
					isActive: true,
					isDeleted: false,
				},
			}),
			// Количество всех пользователей
			prisma.user.count(),
			// Количество типов услуг
			prisma.type.count(),
		])

		return NextResponse.json({
			success: true,
			stats: {
				categoriesCount,
				servicesCount,
				performersCount,
				clientsCount,
				typesCount,
			},
		})
	} catch (error) {
		console.error('Error fetching stats:', error)
		return NextResponse.json(
			{ success: false, error: 'Failed to fetch stats' },
			{ status: 500 }
		)
	}
}

