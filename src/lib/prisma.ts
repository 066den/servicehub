import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
	const pool = new Pool({ connectionString: process.env.DATABASE_URL })
	const adapter = new PrismaPg(pool)

	return new PrismaClient({
		adapter,
		log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
		errorFormat: 'pretty',
	})
}

export const prisma = globalThis.prisma || prismaClientSingleton()

declare global {
	var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

if (process.env.NODE_ENV !== 'production') {
	globalThis.prisma = prisma
}
