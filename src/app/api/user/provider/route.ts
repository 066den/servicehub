import { authOptions } from '@/lib/auth/authOptions'
import {
	createProviderSchemaValidate,
	updateProviderSchemaValidate,
} from '@/lib/schemas'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET() {
	const session = await getServerSession(authOptions)
	if (!session?.user?.id && !session?.user?.email) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const provider = await prisma.provider.findUnique({
		where: {
			userId: session.user.id,
		},
		include: {
			companyInfo: true,
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

	const result = await prisma.$transaction(async tx => {
		const companyInfo = await tx.companyInfo.create({
			data: { legalForm: 'ФОП' },
		})

		const provider = await tx.provider.create({
			data: {
				...validationResult.data,
				userId: Number(session.user.id),
				companyInfoId: companyInfo.id,
			},
			include: {
				companyInfo: true,
			},
		})

		// Обновляем роль пользователя
		await tx.user.update({
			where: { id: session.user.id },
			data: {
				role: 'PROVIDER',
			},
		})

		return provider
	})

	return NextResponse.json(result)
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

	// Извлекаем companyInfo из body, если он есть
	const { companyInfo: companyInfoData, ...providerUpdateData } = updateData

	const existingProvider = await prisma.provider.findUnique({
		where: {
			userId: session.user.id,
		},
		include: {
			companyInfo: true,
		},
	})

	if (!existingProvider) {
		return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
	}

	// Обновляем Provider и CompanyInfo в транзакции
	const result = await prisma.$transaction(async tx => {
		let newCompanyInfoId: number | undefined = undefined

		// Обновляем или создаем CompanyInfo, если данные есть
		if (companyInfoData && typeof companyInfoData === 'object') {
			// Фильтруем только переданные поля (не undefined, не null)
			const companyInfoFields: {
				legalForm?: string
				registrationNumber?: string
				taxNumber?: string
				website?: string
				bankDetails?: Prisma.InputJsonValue
				licenses?: Prisma.InputJsonValue
				certificates?: Prisma.InputJsonValue
				foundedYear?: number
			} = {}

			if (
				companyInfoData.legalForm !== undefined &&
				companyInfoData.legalForm !== null
			) {
				companyInfoFields.legalForm = companyInfoData.legalForm
			}
			if (
				companyInfoData.registrationNumber !== undefined &&
				companyInfoData.registrationNumber !== null
			) {
				companyInfoFields.registrationNumber =
					companyInfoData.registrationNumber
			}
			if (
				companyInfoData.taxNumber !== undefined &&
				companyInfoData.taxNumber !== null
			) {
				companyInfoFields.taxNumber = companyInfoData.taxNumber
			}
			if (
				companyInfoData.website !== undefined &&
				companyInfoData.website !== null
			) {
				companyInfoFields.website = companyInfoData.website
			}
			if (
				companyInfoData.bankDetails !== undefined &&
				companyInfoData.bankDetails !== null
			) {
				companyInfoFields.bankDetails = companyInfoData.bankDetails
			}
			if (
				companyInfoData.licenses !== undefined &&
				companyInfoData.licenses !== null
			) {
				companyInfoFields.licenses = companyInfoData.licenses
			}
			if (
				companyInfoData.certificates !== undefined &&
				companyInfoData.certificates !== null
			) {
				companyInfoFields.certificates = companyInfoData.certificates
			}
			if (
				companyInfoData.foundedYear !== undefined &&
				companyInfoData.foundedYear !== null
			) {
				companyInfoFields.foundedYear = companyInfoData.foundedYear
			}

			// Обновляем только если есть поля для обновления
			if (Object.keys(companyInfoFields).length > 0) {
				if (existingProvider.companyInfoId) {
					// Обновляем существующую CompanyInfo
					await tx.companyInfo.update({
						where: { id: existingProvider.companyInfoId },
						data: companyInfoFields as Prisma.CompanyInfoUpdateInput,
					})
				} else {
					// Создаем новую CompanyInfo
					const newCompanyInfo = await tx.companyInfo.create({
						data: companyInfoFields as Prisma.CompanyInfoCreateInput,
					})
					newCompanyInfoId = newCompanyInfo.id
				}
			}
		}

		// Формируем данные для обновления Provider
		const finalProviderUpdateData: Prisma.ProviderUncheckedUpdateInput = {
			...providerUpdateData,
		}

		// Удаляем companyInfo из данных Provider, так как это не поле Provider
		delete (finalProviderUpdateData as Record<string, unknown>).companyInfo

		// Добавляем companyInfoId, если создали новую CompanyInfo
		if (newCompanyInfoId !== undefined) {
			finalProviderUpdateData.companyInfoId = newCompanyInfoId
		}

		// Обновляем Provider
		const updatedProvider = await tx.provider.update({
			where: { id: existingProvider.id },
			data: finalProviderUpdateData,
			include: {
				companyInfo: true,
			},
		})

		return updatedProvider
	})

	return NextResponse.json(result)
}
