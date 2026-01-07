import { NextRequest, NextResponse } from 'next/server'
import { getServicesFromDB } from '@/services/service/serviceServices'

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ city: string; subSlug: string }> }
) {
	try {
		const { city, subSlug } = await params
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get('page') || '1')
		const limit = parseInt(searchParams.get('limit') || '20')

		// Валидация параметров пагинации
		if (page < 1) {
			return NextResponse.json(
				{ error: 'Page must be greater than 0' },
				{ status: 400 }
			)
		}
		if (limit < 1 || limit > 100) {
			return NextResponse.json(
				{ error: 'Limit must be between 1 and 100' },
				{ status: 400 }
			)
		}

		// Получаем услуги через серверную функцию
		const result = await getServicesFromDB({
			city: decodeURIComponent(city),
			subcategorySlug: decodeURIComponent(subSlug),
			page,
			limit,
		})

		return NextResponse.json(result)
	} catch (error) {
		console.error('Error fetching services by subcategory:', error)
		return NextResponse.json(
			{ success: false, error: 'Failed to fetch services' },
			{ status: 500 }
		)
	}
}

