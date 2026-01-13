import { authOptions } from '@/lib/auth/authOptions'
import { createServiceSchemaValidate } from '@/lib/schemas'
import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET() {
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

	try {
		const services = await prisma.service.findMany({
			where: {
				providerId: provider.id,
				deletedAt: null,
			},
			include: {
				subcategory: {
					include: {
						category: true,
					},
				},
				type: true,
				photos: {
					where: {
						isMain: true,
					},
					take: 1,
				},
				addons: {
					orderBy: {
						order: 'asc',
					},
				},
			},
			orderBy: [
				{
					order: 'asc',
				},
				{
					createdAt: 'desc',
				},
			],
		})

		return NextResponse.json({ success: true, services })
	} catch (error) {
		console.error('Error fetching services:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch services' },
			{ status: 500 }
		)
	}
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const body = await req.json().catch(() => ({}))
	const validationResult = createServiceSchemaValidate(body)

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

	try {
		// Проверяем, что subcategory и type существуют и связаны
		const subcategory = await prisma.subcategory.findUnique({
			where: { id: validationResult.data.subcategoryId },
			include: { category: true },
		})

		if (!subcategory) {
			return NextResponse.json(
				{ error: 'Subcategory not found' },
				{ status: 404 }
			)
		}

		const type = await prisma.type.findUnique({
			where: { id: validationResult.data.typeId },
		})

		if (!type) {
			return NextResponse.json({ error: 'Type not found' }, { status: 404 })
		}

		// Проверяем, что тип принадлежит выбранной подкатегории
		if (
			type.subcategoryId !== validationResult.data.subcategoryId &&
			type.categoryId !== subcategory.categoryId
		) {
			return NextResponse.json(
				{ error: 'Type does not belong to selected subcategory' },
				{ status: 400 }
			)
		}

		const { addons } = validationResult.data

		// Если location (serviceAreas) не передан, автоматически берем из provider.serviceAreas
		let serviceAreas: string[] = validationResult.data.location || []
		if (!serviceAreas || serviceAreas.length === 0) {
			if (Array.isArray(provider.serviceAreas)) {
				serviceAreas = provider.serviceAreas.filter((item): item is string => typeof item === 'string')
			} else {
				serviceAreas = []
			}
		}

		const serviceData: Prisma.ServiceUncheckedCreateInput = {
			name: validationResult.data.name,
			shortDescription: validationResult.data.shortDescription ?? null,
			description: validationResult.data.description ?? null,
			subcategoryId: validationResult.data.subcategoryId,
			typeId: validationResult.data.typeId,
			providerId: provider.id,
			price: validationResult.data.price ?? null,
			duration: validationResult.data.duration ?? null,
			pricingOptions:
				(validationResult.data.pricingOptions as Prisma.InputJsonValue) ?? null,
			location: (serviceAreas as Prisma.InputJsonValue) ?? null,
			requirements:
				(validationResult.data.requirements as Prisma.InputJsonValue) ?? null,
			isActive: validationResult.data.isActive ?? true,
			isFeatured: validationResult.data.isFeatured ?? false,
		}

		// Создаем сервис
		const createdService = await prisma.service.create({
			data: serviceData,
		})

		// Создаем addons, если они есть
		if (addons && addons.length > 0) {
			await prisma.serviceAddon.createMany({
				data: addons.map((addon, index) => ({
					serviceId: createdService.id,
					title: addon.title,
					duration: addon.duration,
					price: addon.price,
					minQuantity: addon.minQuantity,
					maxQuantity: addon.maxQuantity,
					order: addon.order ?? index,
					isActive: addon.isActive ?? true,
				})),
			})
		}

		// Получаем сервис с полными данными
		const service = await prisma.service.findUnique({
			where: { id: createdService.id },
			include: {
				subcategory: {
					include: {
						category: true,
					},
				},
				type: true,
				photos: true,
				addons: {
					orderBy: {
						order: 'asc',
					},
				},
			},
		})

		return NextResponse.json({ success: true, service }, { status: 201 })
	} catch (error) {
		console.error('Error creating service:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return NextResponse.json(
					{
						error: 'Service with this name already exists for this provider',
					},
					{ status: 409 }
				)
			}
		}

		return NextResponse.json(
			{ error: 'Failed to create service' },
			{ status: 500 }
		)
	}
}
