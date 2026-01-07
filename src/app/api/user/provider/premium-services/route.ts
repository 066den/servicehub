import { authOptions } from '@/lib/auth/authOptions'
import { createPremiumServiceSchemaValidate } from '@/lib/schemas'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { PremiumServiceType } from '@prisma/client'

export async function GET() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

	try {
		const now = new Date()

		// Получаем все премиум-услуги исполнителя
		const premiumServices = await prisma.providerPremiumService.findMany({
			where: {
				providerId: provider.id,
			},
			include: {
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		// Обновляем isActive на основе expiresAt
		const updatedServices = await Promise.all(
			premiumServices.map(async service => {
				const isExpired = service.expiresAt < now
				if (service.isActive && isExpired) {
					// Автоматически деактивируем истекшие услуги
					const updated = await prisma.providerPremiumService.update({
						where: { id: service.id },
						data: { isActive: false },
					})
					return { ...updated, category: service.category }
				}
				return service
			})
		)

		// Фильтруем только активные услуги
		const activeServices = updatedServices.filter(
			service => service.isActive && service.expiresAt >= now
		)

		return NextResponse.json({
			success: true,
			premiumServices: updatedServices,
			activeServices,
		})
	} catch (error) {
		console.error('Error fetching premium services:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch premium services' },
			{ status: 500 }
		)
	}
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

	try {
		const body = await req.json().catch(() => ({}))
		const validationResult = createPremiumServiceSchemaValidate(body)

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

		const { type, categoryId, durationDays } = validationResult.data

		// Проверяем, что для CATEGORY_ADS указана категория
		if (type === 'CATEGORY_ADS' && !categoryId) {
			return NextResponse.json(
				{ error: 'Category is required for category advertising' },
				{ status: 400 }
			)
		}

		// Проверяем существование категории, если указана
		if (categoryId) {
			const category = await prisma.category.findUnique({
				where: { id: categoryId },
			})
			if (!category) {
				return NextResponse.json(
					{ error: 'Category not found' },
					{ status: 404 }
				)
			}
		}

		// Вычисляем даты начала и окончания
		const startsAt = new Date()
		const expiresAt = new Date()
		expiresAt.setDate(expiresAt.getDate() + durationDays)

		// Проверяем, нет ли уже активной услуги такого же типа
		const existingActiveService = await prisma.providerPremiumService.findFirst({
			where: {
				providerId: provider.id,
				type: type as PremiumServiceType,
				isActive: true,
				expiresAt: {
					gte: new Date(),
				},
				// Для CATEGORY_ADS проверяем также категорию
				...(type === 'CATEGORY_ADS' && categoryId
					? { categoryId }
					: type === 'CATEGORY_ADS'
						? {}
						: {}),
			},
		})

		if (existingActiveService) {
			const serviceTypeNames: Record<string, string> = {
				SEARCH_BOOST: 'Поднять в поиске',
				CATEGORY_ADS: 'Реклама в категории',
				TOP: 'ТОП',
				PRO: 'ПРО',
			}
			return NextResponse.json(
				{
					error: `У вас вже є активна послуга "${serviceTypeNames[type] || type}". Очікуйте закінчення поточної послуги або деактивуйте її.`,
				},
				{ status: 400 }
			)
		}

		// Создаем новую премиум-услугу
		const premiumService = await prisma.providerPremiumService.create({
			data: {
				providerId: provider.id,
				type: type as PremiumServiceType,
				categoryId: categoryId || null,
				startsAt,
				expiresAt,
				isActive: true,
			},
			include: {
				category: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		})

		return NextResponse.json({
			success: true,
			premiumService,
		})
	} catch (error) {
		console.error('Error creating premium service:', error)
		return NextResponse.json(
			{ error: 'Failed to create premium service' },
			{ status: 500 }
		)
	}
}

