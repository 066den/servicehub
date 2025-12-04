import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { mkdir, writeFile, unlink } from 'fs/promises'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
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

		// Проверяем, что услуга принадлежит этому provider
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

		const formData = await req.formData()
		const file = formData.get('photo') as File | null

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
			'services',
			serviceId.toString()
		)
		const filePath = join(uploadDir, fileName)

		try {
			await mkdir(uploadDir, { recursive: true })
		} catch (error) {
			console.error('Failed to ensure service photo directory:', error)
		}

		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)
		await writeFile(filePath, buffer)

		const photoUrl = `/uploads/services/${serviceId}/${fileName}`

		// Находим существующее главное фото
		const existingMainPhoto = await prisma.servicePhoto.findFirst({
			where: {
				serviceId: serviceId,
				isMain: true,
			},
		})

		// Удаляем старое главное фото (файл и запись)
		if (existingMainPhoto) {
			try {
				const previousFilePath = join(
					process.cwd(),
					'public',
					existingMainPhoto.url
				)
				await unlink(previousFilePath)
			} catch (error) {
				console.warn('Could not delete previous main photo file:', error)
			}

			await prisma.servicePhoto.delete({
				where: { id: existingMainPhoto.id },
			})
		}

		// Создаем новое главное фото
		const mainPhoto = await prisma.servicePhoto.create({
			data: {
				serviceId: serviceId,
				url: photoUrl,
				isMain: true,
				photoType: 'GALLERY',
				order: 0,
			},
		})

		return NextResponse.json({
			success: true,
			photo: mainPhoto,
		})
	} catch (error) {
		console.error('Service main photo upload error:', error)
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

		// Проверяем, что услуга принадлежит этому provider
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

		// Находим главное фото
		const mainPhoto = await prisma.servicePhoto.findFirst({
			where: {
				serviceId: serviceId,
				isMain: true,
			},
		})

		if (mainPhoto) {
			try {
				const filePath = join(process.cwd(), 'public', mainPhoto.url)
				await unlink(filePath)
			} catch (error) {
				console.warn('Could not delete main photo file:', error)
			}

			await prisma.servicePhoto.delete({
				where: { id: mainPhoto.id },
			})
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Service main photo removal error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

