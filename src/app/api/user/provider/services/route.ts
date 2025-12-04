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
	const provider = await prisma.provider.findUnique({
		where: {
			userId: Number(session.user.id),
		},
	})

	if (!provider) {
		return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
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
			orderBy: {
				createdAt: 'desc',
			},
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
	const provider = await prisma.provider.findUnique({
		where: {
			userId: Number(session.user.id),
		},
	})

	if (!provider) {
		return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
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

		const serviceData: Prisma.ServiceUncheckedCreateInput = {
			name: validationResult.data.name,
			description: validationResult.data.description ?? null,
			subcategoryId: validationResult.data.subcategoryId,
			typeId: validationResult.data.typeId,
			providerId: provider.id,
			price: validationResult.data.price ?? null,
			duration: validationResult.data.duration ?? null,
			pricingOptions:
				(validationResult.data.pricingOptions as Prisma.InputJsonValue) ?? null,
			location:
				(validationResult.data.location as Prisma.InputJsonValue) ?? null,
			requirements:
				(validationResult.data.requirements as Prisma.InputJsonValue) ?? null,
			isActive: validationResult.data.isActive ?? true,
			isFeatured: validationResult.data.isFeatured ?? false,
			addons: {
				create: (addons || []).map((addon, index) => ({
					title: addon.title,
					duration: addon.duration,
					price: addon.price,
					minQuantity: addon.minQuantity,
					maxQuantity: addon.maxQuantity,
					order: addon.order ?? index,
					isActive: addon.isActive ?? true,
				})),
			},
		}

		const service = await prisma.service.create({
			data: serviceData,
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
