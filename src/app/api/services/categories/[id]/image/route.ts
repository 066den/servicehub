import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { mkdir, writeFile, unlink } from 'fs/promises'
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

		// Проверка на админа
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { role: true },
		})
		if (user?.role !== 'ADMIN') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const { id: idParam } = await params
		const id = parseInt(idParam)
		if (isNaN(id)) {
			return NextResponse.json(
				{ error: 'Invalid category ID' },
				{ status: 400 }
			)
		}

		const category = await prisma.category.findUnique({
			where: { id },
		})

		if (!category) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		const formData = await req.formData()
		const file = formData.get('image') as File | null

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

		const uploadDir = join(process.cwd(), 'public', 'uploads', 'categories')
		const filePath = join(uploadDir, fileName)

		try {
			await mkdir(uploadDir, { recursive: true })
		} catch (error) {
			console.error('Failed to ensure category image directory:', error)
		}

		// Удаляем старое изображение, если оно есть
		if (category.image) {
			try {
				const oldImagePath = join(process.cwd(), 'public', category.image)
				await unlink(oldImagePath)
			} catch (error) {
				console.error('Failed to delete old image:', error)
			}
		}

		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)
		await writeFile(filePath, buffer)

		const imageUrl = `/uploads/categories/${fileName}`

		const updatedCategory = await prisma.category.update({
			where: { id },
			data: { image: imageUrl },
		})

		return NextResponse.json({
			success: true,
			category: updatedCategory,
		})
	} catch (error) {
		console.error('Error uploading category image:', error)
		return NextResponse.json(
			{ error: 'Failed to upload image' },
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

		// Проверка на админа
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { role: true },
		})
		if (user?.role !== 'ADMIN') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const { id: idParam } = await params
		const id = parseInt(idParam)
		if (isNaN(id)) {
			return NextResponse.json(
				{ error: 'Invalid category ID' },
				{ status: 400 }
			)
		}

		const category = await prisma.category.findUnique({
			where: { id },
		})

		if (!category) {
			return NextResponse.json({ error: 'Category not found' }, { status: 404 })
		}

		if (category.image) {
			try {
				const imagePath = join(process.cwd(), 'public', category.image)
				await unlink(imagePath)
			} catch (error) {
				console.error('Failed to delete image file:', error)
			}
		}

		const updatedCategory = await prisma.category.update({
			where: { id },
			data: { image: null },
		})

		return NextResponse.json({
			success: true,
			category: updatedCategory,
		})
	} catch (error) {
		console.error('Error deleting category image:', error)
		return NextResponse.json(
			{ error: 'Failed to delete image' },
			{ status: 500 }
		)
	}
}

