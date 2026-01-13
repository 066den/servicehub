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
		const files = formData.getAll('photos') as File[]

		if (!files || files.length === 0) {
			return NextResponse.json({ error: 'No files provided' }, { status: 400 })
		}

		// Валидация файлов
		for (const file of files) {
			if (file.size > MAX_FILE_SIZE) {
				return NextResponse.json(
					{ error: `File ${file.name} is too large` },
					{ status: 400 }
				)
			}

			if (!ALLOWED_FILE_TYPES.includes(file.type)) {
				return NextResponse.json(
					{ error: `File ${file.name} has invalid type` },
					{ status: 400 }
				)
			}
		}

		const uploadDir = join(
			process.cwd(),
			'public',
			'uploads',
			'services',
			serviceId.toString(),
			'gallery'
		)

		try {
			await mkdir(uploadDir, { recursive: true })
		} catch (error) {
			console.error('Failed to ensure service gallery directory:', error)
		}

		// Получаем текущий максимальный order для фото галереи
		const maxOrderPhoto = await prisma.servicePhoto.findFirst({
			where: {
				serviceId: serviceId,
				isMain: false,
			},
			orderBy: {
				order: 'desc',
			},
		})

		let currentOrder = maxOrderPhoto ? maxOrderPhoto.order + 1 : 0

		const uploadedPhotos = []

		for (const file of files) {
			const fileExtension = file.name.split('.').pop()
			const fileName = `${uuidv4()}.${fileExtension}`
			const filePath = join(uploadDir, fileName)

			const bytes = await file.arrayBuffer()
			const buffer = Buffer.from(bytes)
			await writeFile(filePath, buffer)

			const photoUrl = `/uploads/services/${serviceId}/gallery/${fileName}`

			const photo = await prisma.servicePhoto.create({
				data: {
					serviceId: serviceId,
					url: photoUrl,
					isMain: false,
					photoType: 'GALLERY',
					order: currentOrder++,
				},
			})

			uploadedPhotos.push(photo)
		}

		return NextResponse.json({
			success: true,
			photos: uploadedPhotos,
		})
	} catch (error) {
		console.error('Service photos upload error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

