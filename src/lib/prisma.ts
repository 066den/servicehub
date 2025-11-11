import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
	return new PrismaClient({
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
