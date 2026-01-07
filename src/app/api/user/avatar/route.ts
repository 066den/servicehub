import { authOptions } from '@/lib/auth/authOptions'
import { mkdir, writeFile } from 'fs/promises'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/jpg',
	'image/webp',
]

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await req.formData()
		const file = formData.get('avatar') as File

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

		const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
		const filePath = join(uploadDir, fileName)

		try {
			await mkdir(uploadDir, { recursive: true })
		} catch (error) {
			console.error(error)
		}

		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)

		await writeFile(filePath, buffer)

		const avatarUrl = `/uploads/avatars/${fileName}`

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		})
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		if (user.avatar) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const fs = require('fs/promises')
				const filePath = join(process.cwd(), 'public', user.avatar)
				await fs.unlink(filePath)
			} catch (error) {
				console.warn('Could not delete avatar file:', error)
			}
		}

		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: { avatar: avatarUrl, updatedAt: new Date() },
		})

		return NextResponse.json({ success: true, avatarUrl: updatedUser.avatar })
	} catch (error) {
		console.error(error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

export async function DELETE() {
	try {
		const session = await getServerSession(authOptions)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		})

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 })
		}

		if (user.avatar) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const fs = require('fs/promises')
				const filePath = join(process.cwd(), 'public', user.avatar)
				await fs.unlink(filePath)
			} catch (error) {
				console.warn('Could not delete avatar file:', error)
			}
		}

		await prisma.user.update({
			where: { id: session.user.id },
			data: { avatar: null, updatedAt: new Date() },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Avatar removal error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
