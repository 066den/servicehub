import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
	let databaseUrl = process.env.DATABASE_URL

	// Проверяем, что DATABASE_URL является строкой и не пустая
	if (
		!databaseUrl ||
		typeof databaseUrl !== 'string' ||
		databaseUrl.trim() === ''
	) {
		throw new Error(
			'DATABASE_URL is not set or is not a valid string. Please check your .env.local file and ensure DATABASE_URL is set correctly.'
		)
	}

	// Убеждаемся, что это строка (на случай, если Next.js передает другой тип)
	databaseUrl = String(databaseUrl).trim()

	// Проверяем базовый формат строки подключения
	if (
		!databaseUrl.startsWith('postgresql://') &&
		!databaseUrl.startsWith('postgres://')
	) {
		throw new Error(
			'DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql:// or postgres://. Current value does not match the expected format.'
		)
	}

	try {
		// Парсим URL для проверки корректности
		let parsedUrl: URL
		try {
			parsedUrl = new URL(databaseUrl)
		} catch (urlError) {
			throw new Error(
				`Invalid DATABASE_URL format: ${
					urlError instanceof Error ? urlError.message : 'Failed to parse URL'
				}`
			)
		}

		// Проверяем, что пароль присутствует и является строкой
		// parsedUrl.password может быть пустой строкой, но должна быть строкой
		const password = parsedUrl.password
		if (
			password !== null &&
			password !== undefined &&
			typeof password !== 'string'
		) {
			throw new Error(
				`Password in DATABASE_URL must be a string, but got: ${typeof password}. Please check your connection string.`
			)
		}

		// Убеждаемся, что connectionString правильно закодирован
		// Если пароль содержит специальные символы, они должны быть URL-encoded
		let finalConnectionString = databaseUrl

		// Проверяем и исправляем кодировку пароля, если необходимо
		if (password && password.length > 0) {
			try {
				// Пробуем декодировать и перекодировать пароль для нормализации
				const decoded = decodeURIComponent(password)
				// Если декодирование успешно, перекодируем обратно
				const reencoded = encodeURIComponent(decoded)
				// Если пароль изменился после перекодирования, заменяем в строке
				if (password !== reencoded) {
					finalConnectionString = databaseUrl.replace(
						`${parsedUrl.username}:${password}@`,
						`${parsedUrl.username}:${reencoded}@`
					)
				}
			} catch {
				// Если декодирование не удалось, используем исходную строку
				// возможно, пароль уже правильно закодирован
			}
		}

		// Используем connectionString - библиотека pg сама распарсит его
		// но мы убедились, что это валидная строка с правильными типами
		const pool = new Pool({
			connectionString: String(finalConnectionString),
		})
		const adapter = new PrismaPg(pool)

		return new PrismaClient({
			adapter,
			log:
				process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
			errorFormat: 'pretty',
		})
	} catch (error) {
		console.error('Failed to create Prisma client:', error)
		if (
			error instanceof Error &&
			error.message.includes('password must be a string')
		) {
			throw new Error(
				`Database password validation failed. Please check that your DATABASE_URL password is properly URL-encoded if it contains special characters. Original error: ${error.message}`
			)
		}
		throw new Error(
			`Failed to initialize database connection. Please check your DATABASE_URL format. Error: ${
				error instanceof Error ? error.message : 'Unknown error'
			}`
		)
	}
}

let prismaInstance: ReturnType<typeof prismaClientSingleton>

try {
	prismaInstance = globalThis.prisma || prismaClientSingleton()
} catch (error) {
	console.error(
		'❌ Failed to initialize Prisma client. Please check your DATABASE_URL in .env.local file.'
	)
	console.error('Error details:', error)
	throw error
}

export const prisma = prismaInstance

declare global {
	var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

if (process.env.NODE_ENV !== 'production') {
	globalThis.prisma = prismaInstance
}
