import { ProviderType, StaffRole, StaffStatus } from '@prisma/client'
import { z } from 'zod'

export const providerTypeSchema = z.enum([
	ProviderType.INDIVIDUAL,
	ProviderType.COMPANY,
])

const coordinatesSchema = z.object({
	lat: z.number(),
	lng: z.number(),
})

const locationSchema = z.preprocess(
	(value: unknown) => {
		// Если это строка, пытаемся распарсить JSON
		if (typeof value === 'string') {
			try {
				return JSON.parse(value)
			} catch {
				return undefined
			}
		}
		// Если это пустой объект или null, возвращаем undefined
		if (
			!value ||
			(typeof value === 'object' && Object.keys(value).length === 0)
		) {
			return undefined
		}
		return value
	},
	z
		.object({
			address: z.preprocess(
				(val: unknown) => (val === null ? undefined : val),
				z.string().trim().max(255).optional()
			),
			coordinates: coordinatesSchema.optional().nullable(),
			city: z.preprocess(
				(val: unknown) => (val === null ? undefined : val),
				z.string().trim().max(255).optional()
			),
			area: z.preprocess(
				(val: unknown) => (val === null ? undefined : val),
				z.string().trim().max(255).optional()
			),
			formattedAddress: z.preprocess(
				(val: unknown) => (val === null ? undefined : val),
				z.string().trim().max(255).optional()
			),
			placeId: z.preprocess(
				(val: unknown) => (val === null ? undefined : val),
				z.string().trim().max(255).optional()
			),
			skiped: z.boolean().optional().nullable(),
		})
		.optional()
		.nullable()
)

const companyInfoSchema = z.preprocess(
	(value: unknown) => {
		if (
			!value ||
			(typeof value === 'object' && Object.keys(value).length === 0)
		) {
			return undefined
		}
		return value
	},
	z
		.object({
			legalForm: z.preprocess(
				(val: unknown) => (val === null || val === '' ? undefined : val),
				z.string().trim().max(100).optional()
			),
			registrationNumber: z.preprocess(
				(val: unknown) => (val === null || val === '' ? undefined : val),
				z.string().trim().max(100).optional()
			),
			taxNumber: z.preprocess(
				(val: unknown) => (val === null || val === '' ? undefined : val),
				z.string().trim().max(100).optional()
			),
			website: z.preprocess(
				(val: unknown) => (val === null || val === '' ? undefined : val),
				z.union([z.string().trim().max(255).url(), z.literal('')]).optional()
			),
			bankDetails: z.preprocess(
				(val: unknown) => (val === null || val === '' ? undefined : val),
				z.unknown().optional()
			),
			licenses: z.preprocess(
				(val: unknown) => (val === null || val === '' ? undefined : val),
				z.unknown().optional()
			),
			certificates: z.preprocess(
				(val: unknown) => (val === null ? undefined : val),
				z.unknown().optional()
			),
			foundedYear: z
				.number()
				.int()
				.min(1800)
				.max(new Date().getFullYear())
				.optional()
				.nullable(),
		})
		.optional()
		.nullable()
)

export const createProviderSchema = z.object({
	businessName: z.string().trim().min(1).max(100),
	description: z
		.string()
		.trim()
		.max(500)
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	phone: z.string().trim().min(1).max(20),
	location: locationSchema.optional(),
	email: z
		.email()
		.trim()
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	type: providerTypeSchema,
})

export const updateProviderSchema = z.object({
	businessName: z.string().trim().min(1).max(100),
	description: z.preprocess(
		(val: unknown) => (val === null ? undefined : val),
		z.string().trim().max(500).optional()
	),
	phone: z.string().trim().min(1).max(20),
	location: locationSchema,
	email: z.preprocess((val: unknown) => {
		if (val === null || val === '') return undefined
		return val
	}, z.union([z.string().email().trim(), z.literal('')]).optional()),
	serviceAreas: z.preprocess((val: unknown) => {
		if (val === null || val === '') return undefined
		if (typeof val === 'string') {
			try {
				return JSON.parse(val)
			} catch {
				return undefined
			}
		}
		return val
	}, z.unknown().optional().nullable()),
	companyInfo: companyInfoSchema,
})

export const changeProviderTypeSchema = z.object({
	type: providerTypeSchema,
})

// Validate
export const createProviderSchemaValidate = createProviderSchema.safeParse
export const updateProviderSchemaValidate = updateProviderSchema.safeParse
export const changeProviderTypeSchemaValidate =
	changeProviderTypeSchema.safeParse

export const staffRoleSchema = z.enum([
	StaffRole.OWNER,
	StaffRole.MANAGER,
	StaffRole.WORKER,
	StaffRole.SPECIALIST,
	StaffRole.ADMIN,
])

export const staffStatusSchema = z.enum([
	StaffStatus.FREE,
	StaffStatus.BUSY,
	StaffStatus.ON_VACATION,
	StaffStatus.INACTIVE,
])

export const createStaffSchema = z.object({
	firstName: z.string().trim().min(1).max(100),
	lastName: z.string().trim().min(1).max(100),
	phone: z
		.string()
		.trim()
		.max(20)
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	position: z
		.string()
		.trim()
		.max(100)
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	workingHours: z.unknown().optional().nullable(),
})

export const createCategorySchema = z.object({
	name: z.string().min(1).max(255),
	slug: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	isActive: z.boolean().optional(),
})

export const updateCategorySchema = z.object({
	name: z.string().min(1).max(255),
	slug: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	isActive: z.boolean().optional(),
})

export const createSubcategorySchema = z.object({
	name: z.string().min(1).max(255),
	categoryId: z.number().int().positive(),
	slug: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	isActive: z.boolean().optional(),
})

export const updateSubcategorySchema = z.object({
	name: z.string().min(1).max(255),
	categoryId: z.number().int().positive().optional(),
	slug: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	isActive: z.boolean().optional(),
})

export const createTypeSchema = z.object({
	name: z.string().min(1).max(255),
	categoryId: z.number().int().positive(),
	subcategoryId: z.number().int().positive().optional().nullable(),
	slug: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
})

export const updateTypeSchema = z.object({
	name: z.string().min(1).max(255),
	categoryId: z.number().int().positive().optional(),
	subcategoryId: z.number().int().positive().optional().nullable(),
	slug: z.string().optional().nullable(),
	icon: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
})

export const createCategorySchemaValidate = createCategorySchema.safeParse
export const updateCategorySchemaValidate = updateCategorySchema.safeParse
export const createStaffSchemaValidate = createStaffSchema.safeParse

export type CreateStaffSchema = z.infer<typeof createStaffSchema>
export type CreateProviderSchema = z.infer<typeof createProviderSchema>
export type UpdateProviderSchema = z.infer<typeof updateProviderSchema>
export type ChangeProviderTypeSchema = z.infer<typeof changeProviderTypeSchema>
export type CreateCategorySchema = z.infer<typeof createCategorySchema>
export type StaffRoleSchema = z.infer<typeof staffRoleSchema>
export type StaffStatusSchema = z.infer<typeof staffStatusSchema>
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>
export type CreateSubcategorySchema = z.infer<typeof createSubcategorySchema>
export type UpdateSubcategorySchema = z.infer<typeof updateSubcategorySchema>
export type CreateTypeSchema = z.infer<typeof createTypeSchema>
export type UpdateTypeSchema = z.infer<typeof updateTypeSchema>

// Форматы стоимости услуг
export const pricingFormatSchema = z.enum([
	'FIXED',
	'FROM',
	'HOURLY',
	'PER_UNIT',
])

export const pricingOptionsSchema = z
	.object({
		format: pricingFormatSchema,
		price: z.number().positive({
			message: 'Ціна повинна бути більше нуля',
		}),
		unit: z
			.string()
			.trim()
			.min(1)
			.max(20)
			.optional()
			.transform(value => (value === '' ? undefined : value)),
		minPrice: z
			.number()
			.positive()
			.optional()
			.transform(value =>
				value === null || value === undefined ? undefined : value
			),
	})
	.refine(
		data => {
			// PER_UNIT требует unit
			if (data.format === 'PER_UNIT' && !data.unit) {
				return false
			}
			return true
		},
		{
			message: "Одиниця виміру обов'язкова для формату 'За одиницю'",
			path: ['unit'],
		}
	)

export const serviceAddonSchemaValidate = z.object({
	title: z
		.string({
			message: 'Введіть назву послуги',
		})
		.trim()
		.min(1, {
			message: "Це поле обов'язкове",
		})
		.max(255, {
			message: 'Назва не може перевищувати 255 символів',
		}),
	duration: z.preprocess(
		(val: unknown) => {
			if (val === null || val === '' || val === undefined) return undefined
			if (typeof val === 'string') {
				const trimmed = val.trim()
				if (trimmed === '') return undefined
				const num = Number(trimmed)
				return isNaN(num) ? undefined : num
			}
			return val
		},
		z
			.number({
				message: "Це поле обов'язкове",
			})
			.int({
				message: 'Тривалість повинна бути цілим числом',
			})
			.positive({
				message: 'Тривалість повинна бути більше нуля',
			})
	),
	price: z.preprocess(
		(val: unknown) => {
			if (val === null || val === '' || val === undefined) return undefined
			if (typeof val === 'string') {
				const trimmed = val.trim()
				if (trimmed === '') return undefined
				const num = Number(trimmed)
				return isNaN(num) ? undefined : num
			}
			return val
		},
		z
			.number({
				message: "Це поле обов'язкове",
			})
			.positive({
				message: 'Ціна повинна бути більше нуля',
			})
	),
	minQuantity: z.preprocess(
		(val: unknown) => {
			if (val === null || val === '' || val === undefined) return 1
			if (typeof val === 'string') {
				const trimmed = val.trim()
				if (trimmed === '') return 1
				const num = Number(trimmed)
				return isNaN(num) ? 1 : num
			}
			return val
		},
		z
			.number({
				message: "Це поле обов'язкове",
			})
			.int({
				message: 'Мінімальна кількість повинна бути цілим числом',
			})
			.positive({
				message: 'Мінімальна кількість повинна бути більше нуля',
			})
			.min(1, {
				message: 'Мінімальна кількість повинна бути не менше 1',
			})
			.default(1)
	),
	maxQuantity: z.preprocess(
		(val: unknown) => {
			if (val === null || val === '' || val === undefined) return 10
			if (typeof val === 'string') {
				const trimmed = val.trim()
				if (trimmed === '') return 10
				const num = Number(trimmed)
				return isNaN(num) ? 10 : num
			}
			return val
		},
		z
			.number({
				message: "Це поле обов'язкове",
			})
			.int({
				message: 'Максимальна кількість повинна бути цілим числом',
			})
			.positive({
				message: 'Максимальна кількість повинна бути більше нуля',
			})
			.min(1, {
				message: 'Максимальна кількість повинна бути не менше 1',
			})
			.default(10)
	),
	order: z.number().int().nonnegative().default(0),
	isActive: z.boolean().optional().default(true),
})

export const createServiceSchema = z.object({
	name: z.string().trim().min(1).max(255),
	description: z
		.string()
		.trim()
		.max(2000)
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	subcategoryId: z.number().int().positive(),
	typeId: z.number().int().positive(),
	price: z.preprocess(
		(val: unknown) => {
			if (val === null || val === '' || val === undefined) return null
			if (typeof val === 'string') {
				const trimmed = val.trim()
				if (trimmed === '') return null
				const num = Number(trimmed)
				return isNaN(num) ? undefined : num
			}
			return val
		},
		z
			.number({
				message: 'Введіть коректне число',
			})
			.positive({
				message: 'Ціна повинна бути більше нуля',
			})
			.optional()
			.nullable()
			.transform(value =>
				value === null || value === undefined ? null : value
			)
			.refine(
				val =>
					val === null ||
					val === undefined ||
					(typeof val === 'number' && !isNaN(val)),
				{
					message: 'Введіть коректне число',
				}
			)
	),
	duration: z.preprocess(
		(val: unknown) => {
			if (val === null || val === '' || val === undefined) return null
			if (typeof val === 'string') {
				const num = Number(val)
				return isNaN(num) ? null : num
			}
			return val
		},
		z
			.number()
			.int()
			.positive()
			.optional()
			.nullable()
			.transform(value =>
				value === null || value === undefined ? null : value
			)
	),
	pricingOptions: z.preprocess((val: unknown) => {
		if (val === null || val === '' || val === undefined) return undefined
		if (typeof val === 'string') {
			try {
				return JSON.parse(val)
			} catch {
				return undefined
			}
		}
		return val
	}, pricingOptionsSchema.optional().nullable()),
	location: locationSchema,
	requirements: z.preprocess((val: unknown) => {
		if (val === null || val === '' || val === undefined) return undefined
		if (typeof val === 'string') {
			try {
				return JSON.parse(val)
			} catch {
				return undefined
			}
		}
		return val
	}, z.unknown().optional().nullable()),
	isActive: z.boolean().optional().default(true),
	isFeatured: z.boolean().optional().default(false),
	addons: z.array(serviceAddonSchemaValidate).optional().default([]),
})

export const updateServiceSchema = z.object({
	name: z.string().trim().min(1).max(255).optional(),
	description: z.preprocess(
		(val: unknown) => (val === null || val === '' ? undefined : val),
		z.string().trim().max(2000).optional()
	),
	subcategoryId: z.number().int().positive().optional(),
	typeId: z.number().int().positive().optional(),
	price: z.preprocess(
		(val: unknown) => {
			if (val === null || val === '' || val === undefined) return null
			if (typeof val === 'string') {
				const trimmed = val.trim()
				if (trimmed === '') return null
				const num = Number(trimmed)
				return isNaN(num) ? undefined : num
			}
			return val
		},
		z
			.number({
				message: 'Введіть коректне число',
			})
			.positive({
				message: 'Ціна повинна бути більше нуля',
			})
			.optional()
			.nullable()
			.transform(value =>
				value === null || value === undefined ? null : value
			)
			.refine(
				val =>
					val === null ||
					val === undefined ||
					(typeof val === 'number' && !isNaN(val)),
				{
					message: 'Введіть коректне число',
				}
			)
	),
	duration: z.preprocess(
		(val: unknown) => {
			if (val === null || val === '' || val === undefined) return null
			if (typeof val === 'string') {
				const num = Number(val)
				return isNaN(num) ? null : num
			}
			return val
		},
		z
			.number()
			.int()
			.positive()
			.optional()
			.nullable()
			.transform(value =>
				value === null || value === undefined ? null : value
			)
	),
	pricingOptions: z.preprocess((val: unknown) => {
		if (val === null || val === '' || val === undefined) return undefined
		if (typeof val === 'string') {
			try {
				return JSON.parse(val)
			} catch {
				return undefined
			}
		}
		return val
	}, pricingOptionsSchema.optional().nullable()),
	location: locationSchema.optional(),
	requirements: z.preprocess((val: unknown) => {
		if (val === null || val === '' || val === undefined) return undefined
		if (typeof val === 'string') {
			try {
				return JSON.parse(val)
			} catch {
				return undefined
			}
		}
		return val
	}, z.unknown().optional().nullable()),
	isActive: z.boolean().optional(),
	isFeatured: z.boolean().optional(),
	addons: z.array(serviceAddonSchemaValidate).optional(),
})

export type ServiceAddonSchema = z.infer<typeof serviceAddonSchemaValidate>
export type PricingFormat = z.infer<typeof pricingFormatSchema>
export type PricingOptions = z.infer<typeof pricingOptionsSchema>

export type CreateServiceSchema = z.infer<typeof createServiceSchema>
export type UpdateServiceSchema = z.infer<typeof updateServiceSchema>

// Validate
export const createServiceSchemaValidate = createServiceSchema.safeParse
export const updateServiceSchemaValidate = updateServiceSchema.safeParse

export const premiumServiceTypeSchema = z.enum([
	'SEARCH_BOOST',
	'CATEGORY_ADS',
	'TOP',
	'PRO',
])

export const createPremiumServiceSchema = z
	.object({
		type: premiumServiceTypeSchema,
		categoryId: z.number().int().positive().optional().nullable(),
		durationDays: z.number().int().positive().min(1).max(365),
	})
	.refine(
		data => {
			// CATEGORY_ADS требует categoryId
			if (
				data.type === 'CATEGORY_ADS' &&
				(!data.categoryId || data.categoryId === null)
			) {
				return false
			}
			return true
		},
		{
			message: "Категорія обов'язкова для реклами в категорії",
			path: ['categoryId'],
		}
	)

export type CreatePremiumServiceSchema = z.infer<
	typeof createPremiumServiceSchema
>

export const createPremiumServiceSchemaValidate =
	createPremiumServiceSchema.safeParse
