import { ProviderType } from '@prisma/client'
import { z } from 'zod'

export const providerTypeSchema = z.enum([
	ProviderType.INDIVIDUAL,
	ProviderType.COMPANY,
])

const coordinatesSchema = z.object({
	lat: z.number(),
	lng: z.number(),
})

const locationSchema = z
	.object({
		address: z.string().trim().max(255).optional(),
		coordinates: coordinatesSchema.optional(),
		city: z.string().trim().max(255).optional(),
		area: z.string().trim().max(255).optional(),
		formattedAddress: z.string().trim().max(255).optional(),
		placeId: z.string().trim().max(255).optional(),
		skiped: z.boolean().optional(),
	})
	.optional()

const companyInfoSchema = z
	.object({
		legalForm: z
			.string()
			.trim()
			.max(100)
			.optional()
			.transform(value => (value === '' ? undefined : value)),
		registrationNumber: z
			.string()
			.trim()
			.max(100)
			.optional()
			.transform(value => (value === '' ? undefined : value)),
		taxNumber: z
			.string()
			.trim()
			.max(100)
			.optional()
			.transform(value => (value === '' ? undefined : value)),
		website: z
			.union([z.string().trim().max(255).url(), z.literal('')])
			.optional()
			.transform(value => (value === '' ? undefined : value)),
		bankDetails: z.unknown().optional(),
		licenses: z.unknown().optional(),
		certificates: z.unknown().optional(),
		foundedYear: z
			.number()
			.int()
			.min(1800)
			.max(new Date().getFullYear())
			.optional(),
	})
	.optional()

export const createProviderSchema = z.object({
	businessName: z.string().trim().min(1).max(100),
	description: z
		.string()
		.trim()
		.max(500)
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	phone: z.string().trim().min(1).max(20),
	location: locationSchema,
	email: z
		.email()
		.trim()
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	type: providerTypeSchema,
})

export const updateProviderSchema = z.object({
	businessName: z.string().trim().min(1).max(100),
	description: z.string().trim().max(500).optional(),
	phone: z.string().trim().min(1).max(20),
	location: locationSchema,
	email: z
		.union([z.string().email().trim(), z.literal('')])
		.optional()
		.transform(value => (value === '' ? undefined : value)),
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

export type CreateProviderSchema = z.infer<typeof createProviderSchema>
export type UpdateProviderSchema = z.infer<typeof updateProviderSchema>
export type ChangeProviderTypeSchema = z.infer<typeof changeProviderTypeSchema>
