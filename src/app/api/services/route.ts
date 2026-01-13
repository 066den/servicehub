import { NextRequest, NextResponse } from 'next/server'
import {
	getServicesFromDB,
	type GetServicesParams,
} from '@/services/service/serviceServices'

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams

		// Парсим query параметры
		const city = searchParams.get('city') || undefined
		const categoryId = searchParams.get('categoryId')
			? parseInt(searchParams.get('categoryId') || '0')
			: undefined
		const subcategoryId = searchParams.get('subcategoryId')
			? parseInt(searchParams.get('subcategoryId') || '0')
			: undefined
		const subcategorySlug = searchParams.get('subcategorySlug') || undefined
		const typeId = searchParams.get('typeId')
			? parseInt(searchParams.get('typeId') || '0')
			: undefined
		const search = searchParams.get('search') || undefined
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

		// Формируем параметры для серверной функции
		const params: GetServicesParams = {
			city,
			categoryId,
			subcategoryId,
			subcategorySlug,
			typeId,
			search,
			page,
			limit,
		}

		// Получаем услуги через серверную функцию
		const result = await getServicesFromDB(params)

		return NextResponse.json(result)
	} catch (error) {
		console.error('Error fetching services:', error)
		return NextResponse.json(
			{ success: false, error: 'Failed to fetch services' },
			{ status: 500 }
		)
	}
}
