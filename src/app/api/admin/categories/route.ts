import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { createCategorySchema } from '@/lib/schemas'

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	//Проверка на админа (можно добавить проверку роли)
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { role: true },
	})
	if (user?.role !== 'ADMIN') {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
	}

	try {
		const body = await req.json()
		const validationResult = createCategorySchema.safeParse(body)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: 'Invalid request body',
					details: validationResult.error.issues,
				},
				{ status: 400 }
			)
		}

		const category = await prisma.category.create({
			data: validationResult.data,
		})

		return NextResponse.json({ success: true, category }, { status: 201 })
	} catch (error) {
		console.error('Error creating category:', error)
		return NextResponse.json(
			{ error: 'Failed to create category' },
			{ status: 500 }
		)
	}
}
