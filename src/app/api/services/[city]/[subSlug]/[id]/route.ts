import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ city: string; subSlug: string; id: string }> }
) {
	try {
		const { city, subSlug, id } = await params
		const serviceId = Number(id)

		if (isNaN(serviceId)) {
			return NextResponse.json(
				{ error: 'Invalid service ID' },
				{ status: 400 }
			)
		}

		// Находим услугу по ID
		const service = await prisma.service.findUnique({
			where: {
				id: serviceId,
				deletedAt: null,
				isActive: true,
			},
			include: {
				type: true,
				subcategory: {
					include: {
						category: true,
					},
				},
				provider: {
					include: {
						user: {
							select: {
								firstName: true,
								lastName: true,
								avatar: true,
							},
						},
					},
				},
				photos: {
					orderBy: {
						order: 'asc',
					},
				},
				addons: {
					where: {
						isActive: true,
					},
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

		// Проверяем, что slug подкатегории совпадает
		if (service.subcategory.slug !== decodeURIComponent(subSlug)) {
			return NextResponse.json(
				{ error: 'Service subcategory mismatch' },
				{ status: 404 }
			)
		}

		// Проверяем, что услуга доступна в указанном городе
		const serviceAreas = Array.isArray(service.location)
			? service.location
			: service.location
			? [service.location]
			: []

		// Нормализуем названия городов для сравнения (приводим к нижнему регистру)
		const normalizedCity = decodeURIComponent(city).toLowerCase().trim()
		const isAvailableInCity = serviceAreas.some(
			area => {
				if (typeof area === 'object' && area !== null && 'city' in area) {
					return String(area.city).toLowerCase().trim() === normalizedCity
				}
				return typeof area === 'string' &&
					area.toLowerCase().trim() === normalizedCity
			}
		)

		if (!isAvailableInCity && serviceAreas.length > 0) {
			return NextResponse.json(
				{ error: 'Service not available in this city' },
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

