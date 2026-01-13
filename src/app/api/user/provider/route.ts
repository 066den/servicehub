import { authOptions } from '@/lib/auth/authOptions'
import {
	createProviderSchemaValidate,
	updateProviderSchemaValidate,
} from '@/lib/schemas'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { generateSlug, generateUniqueProviderSlug } from '@/utils/slug'

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
	const validationResult: ReturnType<typeof createProviderSchemaValidate> =
		createProviderSchemaValidate(body)

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

		// Создаем provider сначала с временным slug
		const tempSlug =
			generateSlug(validationResult.data.businessName) || undefined

		const provider = await tx.provider.create({
			data: {
				type: validationResult.data.type,
				businessName: validationResult.data.businessName,
				description: validationResult.data.description ?? undefined,
				phone: validationResult.data.phone,
				email: validationResult.data.email ?? undefined,
				location: validationResult.data.location ?? undefined,
				serviceAreas: validationResult.data.serviceAreas ?? undefined,
				slug: tempSlug,
				userId: Number(session.user.id),
				companyInfoId: companyInfo.id,
			} as Prisma.ProviderUncheckedCreateInput,
			include: {
				companyInfo: true,
			},
		})

		// Проверяем, что provider.id существует
		if (!provider.id) {
			throw new Error('Provider ID не был создан')
		}

		// Генерируем уникальный slug (добавляет id только если slug занят)
		const finalSlug = await generateUniqueProviderSlug(
			tx,
			validationResult.data.businessName,
			provider.id
		)

		// Обновляем slug только если он изменился
		const updatedProvider =
			finalSlug !== tempSlug
				? await tx.provider.update({
						where: { id: provider.id },
						data: { slug: finalSlug } as Prisma.ProviderUncheckedUpdateInput,
						include: {
							companyInfo: true,
						},
				  })
				: provider

		// Обновляем роль пользователя
		await tx.user.update({
			where: { id: session.user.id },
			data: {
				role: 'PROVIDER',
			},
		})

		return updatedProvider
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

		// Обработка slug
		let slug = providerUpdateData.slug as string | undefined
		let slugWarning: string | undefined = undefined

		// Если slug пустой, генерируем из businessName (добавляет id только если slug занят)
		if (!slug && providerUpdateData.businessName) {
			slug = await generateUniqueProviderSlug(
				tx,
				providerUpdateData.businessName as string,
				existingProvider.id,
				existingProvider.id
			)
		}

		// Проверяем уникальность slug, если он указан
		if (slug) {
			const existingSlugProvider = await tx.provider.findUnique({
				where: { slug } as unknown as Prisma.ProviderWhereUniqueInput,
			})

			if (
				existingSlugProvider &&
				existingSlugProvider.id !== existingProvider.id
			) {
				// Если slug занят, не обновляем его и добавляем предупреждение
				slug = existingProvider.slug ?? undefined // Оставляем текущий slug
				slugWarning =
					'Цей slug вже використовується іншим профілем. Slug не було оновлено.'
			}
		}

		// Формируем данные для обновления Provider
		const finalProviderUpdateData: Prisma.ProviderUncheckedUpdateInput = {
			...providerUpdateData,
			slug,
			location: providerUpdateData.location ?? undefined,
			serviceAreas: providerUpdateData.serviceAreas ?? undefined,
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

		return { provider: updatedProvider, warning: slugWarning }
	})

	// Формируем ответ с предупреждением, если оно есть
	const response: {
		success: boolean
		provider: typeof result.provider
		warning?: string
	} = {
		success: true,
		provider: result.provider,
	}

	if (result.warning) {
		response.warning = result.warning
	}

	return NextResponse.json(response)
}
