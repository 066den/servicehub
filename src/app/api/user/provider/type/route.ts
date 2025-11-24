import { authOptions } from '@/lib/auth/authOptions'
import { changeProviderTypeSchemaValidate } from '@/lib/schemas'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { ProviderType } from '@prisma/client'

export async function PATCH(req: Request) {
	const session = await getServerSession(authOptions)

	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const body = await req.json().catch(() => ({}))
	const validationResult = changeProviderTypeSchemaValidate(body)

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

	const userId = Number(session.user.id)

	const provider = await prisma.provider.findUnique({
		where: {
			userId,
		},
	})

	if (!provider) {
		return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
	}

	const newType = validationResult.data.type

	// Если меняем тип на COMPANY, проверяем наличие CompanyInfo
	if (newType === ProviderType.COMPANY && !provider.companyInfoId) {
		const updatedProvider = await prisma.$transaction(async tx => {
			// Создаем CompanyInfo с legalForm по умолчанию 'ФОП'
			const companyInfo = await tx.companyInfo.create({
				data: { legalForm: 'ФОП' },
			})

			// Обновляем провайдера с новым типом и companyInfoId
			return await tx.provider.update({
				where: { id: provider.id },
				data: {
					type: newType,
					companyInfoId: companyInfo.id,
					updatedAt: new Date(),
				},
				include: {
					companyInfo: true,
				},
			})
		})

		return NextResponse.json({
			success: true,
			provider: updatedProvider,
		})
	}

	// Если тип не COMPANY или CompanyInfo уже существует, просто обновляем тип
	const updatedProvider = await prisma.provider.update({
		where: { id: provider.id },
		data: {
			type: newType,
			updatedAt: new Date(),
		},
		include: {
			companyInfo: true,
		},
	})

	return NextResponse.json({
		success: true,
		provider: updatedProvider,
	})
}
