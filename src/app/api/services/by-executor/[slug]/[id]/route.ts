import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ slug: string; id: string }> }
) {
	try {
		const { slug, id } = await params
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

		// Проверяем, что slug исполнителя совпадает
		const executorSlug = service.provider.slug
		if (!executorSlug || executorSlug !== decodeURIComponent(slug)) {
			return NextResponse.json(
				{ error: 'Service executor mismatch' },
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

