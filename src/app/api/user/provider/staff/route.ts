import { authOptions } from '@/lib/auth/authOptions'
import { createStaffSchemaValidate } from '@/lib/schemas'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { StaffStatus, Prisma } from '@prisma/client'

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const body = await req.json().catch(() => ({}))
	const validationResult = createStaffSchemaValidate(body)

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
		const staff = await prisma.staff.create({
			data: {
				...validationResult.data,
				workingHours: validationResult.data.workingHours as Prisma.InputJsonValue,
				providerId: provider.id,
				status: StaffStatus.FREE, // Автоматически устанавливаем статус "Вільний"
			},
		})

		return NextResponse.json(staff)
	} catch (error) {
		console.error('Error creating staff:', error)
		return NextResponse.json(
			{ error: 'Failed to create staff member' },
			{ status: 500 }
		)
	}
}

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
		const staff = await prisma.staff.findMany({
			where: {
				providerId: provider.id,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		return NextResponse.json({ success: true, staff })
	} catch (error) {
		console.error('Error fetching staff:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch staff' },
			{ status: 500 }
		)
	}
}

