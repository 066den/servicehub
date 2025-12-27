import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
	req: Request,
	{ params }: { params: { slug: string } }
) {
	try {
		const { slug } = params

		if (!slug) {
			return NextResponse.json(
				{ error: 'Slug is required' },
				{ status: 400 }
			)
		}

		const provider = await prisma.provider.findUnique({
			where: {
				slug: slug,
			},
			select: {
				id: true,
				businessName: true,
				description: true,
				avatar: true,
				rating: true,
				reviewCount: true,
				serviceAreas: true,
				location: true,
				type: true,
				createdAt: true,
				isDeleted: true,
				isActive: true,
				services: {
					where: {
						isActive: true,
						deletedAt: null,
					},
					select: {
						id: true,
						name: true,
						shortDescription: true,
						price: true,
						location: true,
						photos: {
							where: {
								isMain: true,
							},
							take: 1,
							select: {
								url: true,
							},
						},
						type: {
							select: {
								slug: true,
							},
						},
						subcategory: {
							select: {
								name: true,
								slug: true,
								category: {
									select: {
										name: true,
									},
								},
							},
						},
					},
					orderBy: {
						order: 'asc',
					},
					take: 20,
				},
				user: {
					select: {
						firstName: true,
						lastName: true,
					},
				},
			},
		})

		if (!provider) {
			return NextResponse.json(
				{ error: 'Provider not found' },
				{ status: 404 }
			)
		}

		// Проверяем, что профиль активен и не удален
		if (provider.isDeleted || !provider.isActive) {
			return NextResponse.json(
				{ error: 'Provider not available' },
				{ status: 404 }
			)
		}

		return NextResponse.json({
			success: true,
			provider: {
				...provider,
				// Убираем приватные поля
				isDeleted: undefined,
				isActive: undefined,
			},
		})
	} catch (error) {
		console.error('Error fetching public provider:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}

