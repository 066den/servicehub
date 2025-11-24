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
	serviceAreas: z.preprocess(
		(val: unknown) => {
			if (val === null || val === '') return undefined
			if (typeof val === 'string') {
				try {
					return JSON.parse(val)
				} catch {
					return undefined
				}
			}
			return val
		},
		z.unknown().optional().nullable()
	),
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
	StaffStatus.ACTIVE,
	StaffStatus.INACTIVE,
	StaffStatus.ON_VACATION,
	StaffStatus.SUSPENDED,
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

export type CreateStaffSchema = z.infer<typeof createStaffSchema>

export const createStaffSchemaValidate = createStaffSchema.safeParse

export type CreateProviderSchema = z.infer<typeof createProviderSchema>
export type UpdateProviderSchema = z.infer<typeof updateProviderSchema>
export type ChangeProviderTypeSchema = z.infer<typeof changeProviderTypeSchema>
