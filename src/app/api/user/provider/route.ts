import { authOptions } from '@/lib/auth/authOptions'
import {
	createProviderSchemaValidate,
	updateProviderSchemaValidate,
} from '@/lib/schemas'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

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
	const validationResult = createProviderSchemaValidate(body)

	if (!validationResult.success) {
		console.log(
			validationResult.error.issues.map(issue => ({
				field: issue.path.join('.'),
				message: issue.message,
			}))
		)
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

	return NextResponse.json(provider)
}

export async function PUT(req: Request) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id && !session?.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const body = await req.json().catch(() => ({}))
	const validationResult = updateProviderSchemaValidate(body)

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

	const updateData = { ...body, ...validationResult.data }

	const existingProvider = await prisma.provider.findUnique({
		where: {
			userId: session.user.id,
		},
	})

	if (!existingProvider) {
		return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
	}

	const updatedProvider = await prisma.provider.update({
		where: { id: existingProvider.id },
		data: { ...updateData, updatedAt: new Date() },
	})

	return NextResponse.json(updatedProvider)
}
