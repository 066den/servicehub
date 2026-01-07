import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { StaffStatus, StaffRole } from '@prisma/client'

const updateStaffSchema = z.object({
	phone: z
		.string()
		.trim()
		.max(20)
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	position: z
		.string()
		.trim()
		.max(100)
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	role: z.enum(['WORKER', 'MANAGER', 'ADMIN']).optional(),
	status: z.enum(['FREE', 'BUSY', 'ON_VACATION', 'INACTIVE']).optional(),
})

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { id } = await params
	const staffId = Number(id)
	if (isNaN(staffId)) {
		return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 })
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

	// Проверяем, что сотрудник принадлежит этому провайдеру
	const staff = await prisma.staff.findFirst({
		where: {
			id: staffId,
			providerId: provider.id,
		},
	})

	if (!staff) {
		return NextResponse.json(
			{ error: 'Staff member not found' },
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

	const validationResult = updateStaffSchema.safeParse(body)

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

	const updateData: {
		phone?: string
		position?: string
		role?: StaffRole
		status?: StaffStatus
	} = {}

	try {
		if (validationResult.data.phone !== undefined) {
			updateData.phone = validationResult.data.phone
		}
		if (validationResult.data.position !== undefined) {
			updateData.position = validationResult.data.position
		}
		if (validationResult.data.role !== undefined) {
			updateData.role = validationResult.data.role as StaffRole
		}
		if (validationResult.data.status !== undefined) {
			updateData.status = validationResult.data.status as StaffStatus
		}

		// Проверяем, что есть хотя бы одно поле для обновления
		if (Object.keys(updateData).length === 0) {
			return NextResponse.json(
				{ error: 'No fields to update' },
				{ status: 400 }
			)
		}

		const updatedStaff = await prisma.staff.update({
			where: { id: staffId },
			data: updateData,
		})

		return NextResponse.json({ success: true, staff: updatedStaff })
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error'

		// Проверяем, является ли ошибка ошибкой Prisma
		if (
			errorMessage.includes('Invalid value for enum') ||
			errorMessage.includes('Unknown argument')
		) {
			return NextResponse.json(
				{
					error: 'Invalid status value',
					message: 'Статус не відповідає допустимим значенням',
				},
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{
				error: 'Failed to update staff member',
				message: errorMessage,
			},
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
	const staffId = Number(id)
	if (isNaN(staffId)) {
		return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 })
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

	// Проверяем, что сотрудник принадлежит этому провайдеру
	const staff = await prisma.staff.findFirst({
		where: {
			id: staffId,
			providerId: provider.id,
		},
	})

	if (!staff) {
		return NextResponse.json(
			{ error: 'Staff member not found' },
			{ status: 404 }
		)
	}

	try {
		await prisma.staff.delete({
			where: { id: staffId },
		})

		return NextResponse.json({ success: true })
	} catch {
		return NextResponse.json(
			{ error: 'Failed to delete staff member' },
			{ status: 500 }
		)
	}
}
