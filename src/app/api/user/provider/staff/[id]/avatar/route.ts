import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { mkdir, writeFile } from 'fs/promises'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/jpg',
	'image/webp',
]

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const userId = Number(session.user.id)
		if (!userId) {
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
				userId,
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

		const formData = await req.formData()
		const file = formData.get('avatar') as File | null

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 })
		}

		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json({ error: 'File too large' }, { status: 400 })
		}

		if (!ALLOWED_FILE_TYPES.includes(file.type)) {
			return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
		}

		const fileExtension = file.name.split('.').pop()
		const fileName = `${uuidv4()}.${fileExtension}`

		const uploadDir = join(
			process.cwd(),
			'public',
			'uploads',
			'staff-avatars'
		)
		const filePath = join(uploadDir, fileName)

		try {
			await mkdir(uploadDir, { recursive: true })
		} catch (error) {
			console.error('Failed to ensure staff avatar directory:', error)
		}

		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)
		await writeFile(filePath, buffer)

		const avatarUrl = `/uploads/staff-avatars/${fileName}`

		if (staff.avatar) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const fs = require('fs/promises')
				const previousFilePath = join(process.cwd(), 'public', staff.avatar)
				await fs.unlink(previousFilePath)
			} catch (error) {
				console.warn('Could not delete staff avatar file:', error)
			}
		}

		const updatedStaff = await prisma.staff.update({
			where: { id: staffId },
			data: { avatar: avatarUrl },
		})

		return NextResponse.json({
			success: true,
			avatarUrl: updatedStaff.avatar,
		})
	} catch (error) {
		console.error('Staff avatar upload error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const userId = Number(session.user.id)
		if (!userId) {
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
				userId,
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

		if (staff.avatar) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const fs = require('fs/promises')
				const filePath = join(process.cwd(), 'public', staff.avatar)
				await fs.unlink(filePath)
			} catch (error) {
				console.warn('Could not delete staff avatar file:', error)
			}
		}

		await prisma.staff.update({
			where: { id: staffId },
			data: { avatar: null },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Staff avatar removal error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

