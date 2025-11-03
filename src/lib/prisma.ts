import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
	const client = new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
		errorFormat: 'pretty',
	})

	// Обработка ошибок подключения
	client.$connect().catch(error => {
		if (
			error.code === 'P1001' ||
			error.message?.includes("Can't reach database server")
		) {
			console.error('❌ Ошибка подключения к базе данных')
			console.error('💡 Проверьте:')
			console.error('   1. Запущен ли PostgreSQL сервер')
			console.error('   2. Правильность DATABASE_URL в .env.local')
			console.error('   3. Доступность сервера: выполните npm run db:check')
			console.error('')
			console.error('Детали ошибки:', error.message)
		} else {
			console.error('Ошибка Prisma:', error)
		}
	})

	return client
}

export const prisma = globalThis.prisma || prismaClientSingleton()

declare global {
	var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

if (process.env.NODE_ENV !== 'production') {
	globalThis.prisma = prisma
}
