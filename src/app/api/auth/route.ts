import { authController } from '@/services/controllers/authController'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const { phone } = await request.json()

	const result = await authController.sendCode(phone)

	return NextResponse.json(result)
}
