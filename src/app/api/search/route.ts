import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const query = searchParams.get('q') || ''
		const limit = parseInt(searchParams.get('limit') || '10')

		if (!query || query.trim().length < 2) {
			return NextResponse.json({
				success: true,
				suggestions: [],
				results: [],
				categories: [],
			})
		}

		const searchTerm = query.trim().toLowerCase()

		// Поиск услуг (services)
		const services = await prisma.service.findMany({
			where: {
				OR: [
					{
						name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
					{
						description: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				],
				deletedAt: null,
				isActive: true,
			},
			include: {
				provider: {
					select: {
						id: true,
						businessName: true,
						avatar: true,
						rating: true,
						reviewCount: true,
					},
				},
				subcategory: {
					include: {
						category: {
							select: {
								id: true,
								name: true,
								slug: true,
							},
						},
					},
				},
				type: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
				photos: {
					where: {
						isMain: true,
					},
					take: 1,
				},
			},
			take: limit,
			orderBy: [
				{
					isFeatured: 'desc',
				},
				{
					createdAt: 'desc',
				},
			],
		})

		// Поиск категорий
		const categories = await prisma.category.findMany({
			where: {
				OR: [
					{
						name: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
					{
						description: {
							contains: searchTerm,
							mode: 'insensitive',
						},
					},
				],
				isActive: true,
			},
			select: {
				id: true,
				name: true,
				slug: true,
				icon: true,
				image: true,
			},
			take: 5,
		})

		// Генерация подсказок на основе популярных запросов
		// Пока используем простую логику - берем первые слова из найденных услуг
		const suggestions: string[] = []
		const seenSuggestions = new Set<string>()

		// Добавляем сам запрос как первую подсказку
		if (searchTerm.length >= 2) {
			suggestions.push(searchTerm)
			seenSuggestions.add(searchTerm.toLowerCase())
		}

		// Генерируем подсказки из названий услуг
		services.forEach(service => {
			const words = service.name.toLowerCase().split(/\s+/)
			words.forEach(word => {
				if (
					word.startsWith(searchTerm) &&
					word.length > searchTerm.length &&
					!seenSuggestions.has(word) &&
					suggestions.length < 10
				) {
					suggestions.push(word)
					seenSuggestions.add(word)
				}
			})
		})

		// Форматируем результаты для фронтенда
		const formattedResults = services.map(service => ({
			id: service.id,
			name: service.name,
			description: service.description,
			price: service.price,
			category: {
				id: service.subcategory.category.id,
				name: service.subcategory.category.name,
				slug: service.subcategory.category.slug,
			},
			type: {
				id: service.type.id,
				name: service.type.name,
				slug: service.type.slug,
			},
			provider: {
				id: service.provider.id,
				businessName: service.provider.businessName,
				avatar: service.provider.avatar,
				rating: service.provider.rating,
				reviewCount: service.provider.reviewCount,
			},
			image: service.photos[0]?.url || null,
		}))

		return NextResponse.json({
			success: true,
			suggestions: suggestions.slice(0, 10),
			results: formattedResults,
			categories: categories,
		})
	} catch (error) {
		console.error('Error searching:', error)
		return NextResponse.json(
			{ success: false, error: 'Failed to search' },
			{ status: 500 }
		)
	}
}

