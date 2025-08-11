import { authOptions } from '@/lib/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { ProviderType } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const createProviderSchema = z.object({
	businessName: z.string().min(1).max(50),
	description: z.string().max(500).optional(),
	phone: z.string().min(1).max(15),
	location: z.string().min(1).max(50).optional(),
	type: z.enum(ProviderType),
})

export async function GET() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id && !session?.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const provider = await prisma.provider.findUnique({
		where: {
			userId: session.user.id,
		},
	})

	if (!provider) {
		return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
	}

	return NextResponse.json({ success: true, provider })
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id && !session?.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const body = await req.json().catch(() => ({}))
	const validationResult = createProviderSchema.safeParse(body)

	if (!validationResult.success) {
		return NextResponse.json(
			{
				error: 'Invalid request body',
				details: validationResult.error.issues.map(issue => ({
					field: issue.path.join('.'),
					message: issue.message,
				})),
			},
			{ status: 400 }
		)
	}

	const existingProvider = await prisma.provider.findUnique({
		where: {
			userId: session.user.id,
		},
	})

	if (existingProvider) {
		return NextResponse.json(
			{ error: 'Provider already exists' },
			{ status: 400 }
		)
	}

	const provider = await prisma.provider.create({
		data: {
			...validationResult.data,
			userId: Number(session.user.id),
		},
	})

	await prisma.user.update({
		where: { id: session.user.id },
		data: {
			role: 'PROVIDER',
		},
	})

	return NextResponse.json({ success: true, provider })
}
