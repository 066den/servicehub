import { ProviderType } from '@prisma/client'
import { z } from 'zod'

const providerTypeSchema = z.enum([
	ProviderType.INDIVIDUAL,
	ProviderType.COMPANY,
])

export const createProviderSchema = z.object({
	businessName: z.string().trim().min(1).max(100),
	description: z
		.string()
		.trim()
		.max(500)
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	phone: z
		.string()
		.trim()
		.min(1)
		.max(20)
		.transform(value => (value === '' ? undefined : value)),
	location: z
		.string()
		.trim()
		.max(255)
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	email: z
		.email()
		.trim()
		.optional()
		.transform(value => (value === '' ? undefined : value)),
	type: providerTypeSchema,
})

// Validate
export const createProviderSchemaValidate = createProviderSchema.safeParse
