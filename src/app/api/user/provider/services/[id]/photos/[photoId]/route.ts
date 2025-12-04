import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { join } from 'path'

export async function DELETE(
	req: Request,
	{
		params,
	}: { params: Promise<{ id: string; photoId: string }> }
) {
	try {
		const session = await getServerSession(authOptions)

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id, photoId } = await params
		const serviceId = Number(id)
		const photoIdNum = Number(photoId)

		if (isNaN(serviceId) || isNaN(photoIdNum)) {
			return NextResponse.json(
				{ error: 'Invalid service ID or photo ID' },
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

		// Находим фото
		const photo = await prisma.servicePhoto.findFirst({
			where: {
				id: photoIdNum,
				serviceId: serviceId,
			},
		})

		if (!photo) {
			return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
		}

		// Удаляем файл
		try {
			const filePath = join(process.cwd(), 'public', photo.url)
			await unlink(filePath)
		} catch (error) {
			console.warn('Could not delete photo file:', error)
		}

		// Удаляем запись из БД
		await prisma.servicePhoto.delete({
			where: { id: photoIdNum },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Service photo deletion error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

