import { authOptions } from '@/lib/auth/authOptions'
import { updateServiceSchemaValidate } from '@/lib/schemas'
import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(
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

	try {
		const service = await prisma.service.findFirst({
			where: {
				id: serviceId,
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
					orderBy: {
						order: 'asc',
					},
				},
			},
		})

		if (!service) {
			return NextResponse.json(
				{ error: 'Service not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json({ success: true, service })
	} catch (error) {
		console.error('Error fetching service:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch service' },
			{ status: 500 }
		)
	}
}

export async function PUT(
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
	const existingService = await prisma.service.findFirst({
		where: {
			id: serviceId,
			providerId: provider.id,
			deletedAt: null,
		},
		select: {
			id: true,
			subcategoryId: true,
		},
	})

	if (!existingService) {
		return NextResponse.json(
			{ error: 'Service not found' },
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

	const validationResult = updateServiceSchemaValidate(body)

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
		// Если обновляются subcategoryId или typeId, проверяем их валидность
		if (validationResult.data.subcategoryId || validationResult.data.typeId) {
			if (validationResult.data.subcategoryId) {
				const subcategory = await prisma.subcategory.findUnique({
					where: { id: validationResult.data.subcategoryId },
				})
				if (!subcategory) {
					return NextResponse.json(
						{ error: 'Subcategory not found' },
						{ status: 404 }
					)
				}
			}

			if (validationResult.data.typeId) {
				const type = await prisma.type.findUnique({
					where: { id: validationResult.data.typeId },
				})
				if (!type) {
					return NextResponse.json({ error: 'Type not found' }, { status: 404 })
				}

				// Если обновляется только typeId, проверяем совместимость с текущей subcategory
				if (!validationResult.data.subcategoryId) {
					const subcategory = await prisma.subcategory.findUnique({
						where: { id: existingService.subcategoryId },
					})
					if (
						type.subcategoryId !== existingService.subcategoryId &&
						type.categoryId !== subcategory?.categoryId
					) {
						return NextResponse.json(
							{ error: 'Type does not belong to current subcategory' },
							{ status: 400 }
						)
					}
				}
			}

			// Если обновляются оба, проверяем совместимость
			if (validationResult.data.subcategoryId && validationResult.data.typeId) {
				const subcategory = await prisma.subcategory.findUnique({
					where: { id: validationResult.data.subcategoryId },
					include: { category: true },
				})
				const type = await prisma.type.findUnique({
					where: { id: validationResult.data.typeId },
				})
				if (!type) {
					return NextResponse.json({ error: 'Type not found' }, { status: 404 })
				}
				if (
					type.subcategoryId !== validationResult.data.subcategoryId &&
					type.categoryId !== subcategory?.categoryId
				) {
					return NextResponse.json(
						{ error: 'Type does not belong to selected subcategory' },
						{ status: 400 }
					)
				}
			}
		}

		const updateData: Prisma.ServiceUpdateInput = {}

		if (validationResult.data.name !== undefined) {
			updateData.name = validationResult.data.name
		}
		if (validationResult.data.description !== undefined) {
			updateData.description = validationResult.data.description ?? null
		}
		if (validationResult.data.subcategoryId !== undefined) {
			updateData.subcategory = {
				connect: { id: validationResult.data.subcategoryId },
			}
		}
		if (validationResult.data.typeId !== undefined) {
			updateData.type = {
				connect: { id: validationResult.data.typeId },
			}
		}
		if (validationResult.data.price !== undefined) {
			updateData.price = validationResult.data.price ?? null
		}
		if (validationResult.data.duration !== undefined) {
			updateData.duration = validationResult.data.duration ?? null
		}
		if (validationResult.data.pricingOptions !== undefined) {
			updateData.pricingOptions =
				validationResult.data.pricingOptions as Prisma.InputJsonValue ?? null
		}
		if (validationResult.data.location !== undefined) {
			updateData.location =
				validationResult.data.location as Prisma.InputJsonValue ?? null
		}
		if (validationResult.data.requirements !== undefined) {
			updateData.requirements =
				validationResult.data.requirements as Prisma.InputJsonValue ?? null
		}
		if (validationResult.data.isActive !== undefined) {
			updateData.isActive = validationResult.data.isActive
		}
		if (validationResult.data.isFeatured !== undefined) {
			updateData.isFeatured = validationResult.data.isFeatured
		}

		// Проверяем, что есть хотя бы одно поле для обновления
		if (Object.keys(updateData).length === 0) {
			return NextResponse.json(
				{ error: 'No fields to update' },
				{ status: 400 }
			)
		}

		const updatedService = await prisma.service.update({
			where: { id: serviceId },
			data: updateData,
			include: {
				subcategory: {
					include: {
						category: true,
					},
				},
				type: true,
				photos: {
					orderBy: {
						order: 'asc',
					},
				},
			},
		})

		return NextResponse.json({ success: true, service: updatedService })
	} catch (error) {
		console.error('Error updating service:', error)

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
			{ error: 'Failed to update service' },
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
		// Soft delete
		await prisma.service.update({
			where: { id: serviceId },
			data: {
				deletedAt: new Date(),
			},
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error deleting service:', error)
		return NextResponse.json(
			{ error: 'Failed to delete service' },
			{ status: 500 }
		)
	}
}
