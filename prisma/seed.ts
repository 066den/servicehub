import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import 'dotenv/config'
import { authService } from '../src/services/authService'
import { normalizePhone } from '../src/utils/phoneUtils'

// Получаем __dirname в ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
	adapter,
	log: ['error', 'warn'],
	errorFormat: 'pretty',
})

async function main() {
	console.log('✅ Запуск сид-скрипта...')

	const filePath = path.join(__dirname, 'categories.json')

	if (!fs.existsSync(filePath)) {
		console.error(`❌ Файл не найден: ${filePath}`)
		process.exit(1)
	}

	const data = fs.readFileSync(filePath, 'utf-8')
	const categories = JSON.parse(data)

	console.log(`✅ Загружено ${categories.length} категорий`)

	for (const cat of categories) {
		await prisma.category.upsert({
			where: { slug: cat.slug },
			update: {
				name: cat.name,
				icon: cat.icon,
				description: cat.description,
			},
			create: {
				name: cat.name,
				slug: cat.slug,
				icon: cat.icon,
				description: cat.description,
			},
		})
		console.log(`✅ Добавлено: ${cat.name}`)
	}
}

async function mainSubcategories() {
	console.log('✅ Запуск сид-скрипта для подкатегорий...')

	const filePath = path.join(__dirname, 'subcategories.json')

	if (!fs.existsSync(filePath)) {
		console.error(`❌ Файл не найден: ${filePath}`)
		process.exit(1)
	}

	const data = fs.readFileSync(filePath, 'utf-8')
	const subcategoriesData = JSON.parse(data)

	// Загружаем категории, чтобы получить id по slug
	const categories = await prisma.category.findMany({
		select: { id: true, slug: true },
	})
	const categoryMap: Record<string, number> = categories.reduce((acc, cat) => {
		if (cat.slug !== null) {
			acc[cat.slug] = cat.id
		}
		return acc
	}, {} as Record<string, number>)

	console.log(`✅ Найдено ${subcategoriesData.length} подкатегорий`)

	for (const subcat of subcategoriesData) {
		const categoryId = categoryMap[subcat.categoryId]
		if (!categoryId) {
			console.warn(`⚠️ Категория не найдена: ${subcat.categoryId}`)
			continue
		}

		await prisma.subcategory.upsert({
			where: { slug: subcat.slug },
			update: {
				name: subcat.name,
				icon: subcat.icon,
				description: subcat.description,
				categoryId: categoryId,
			},
			create: {
				name: subcat.name,
				slug: subcat.slug,
				icon: subcat.icon,
				description: subcat.description,
				categoryId: categoryId,
			},
		})
		console.log(`✅ Добавлено: ${subcat.name}`)
	}

	console.log('🎉 Все подкатегории успешно загружены!')
}

async function mainTypes() {
	console.log('✅ Запуск сид-скрипта для типов...')

	const filePath = path.join(__dirname, 'types.json')

	if (!fs.existsSync(filePath)) {
		console.error(`❌ Файл не найден: ${filePath}`)
		process.exit(1)
	}

	const data = fs.readFileSync(filePath, 'utf-8')
	const typesData = JSON.parse(data)

	// Загружаем категории и подкатегории, чтобы получить id по slug
	const categories = await prisma.category.findMany({
		select: { id: true, slug: true },
	})
	const categoryMap: Record<string, number> = categories.reduce((acc, cat) => {
		if (cat.slug !== null) {
			acc[cat.slug] = cat.id
		}
		return acc
	}, {} as Record<string, number>)

	const subcategories = await prisma.subcategory.findMany({
		select: { id: true, slug: true },
	})
	const subcategoryMap: Record<string, number> = subcategories.reduce(
		(acc, subcat) => {
			if (subcat.slug !== null) {
				acc[subcat.slug] = subcat.id
			}
			return acc
		},
		{} as Record<string, number>
	)

	console.log(`✅ Найдено ${typesData.length} типов услуг`)

	for (const type of typesData) {
		const categoryId = categoryMap[type.categoryId]
		if (!categoryId) {
			console.warn(`⚠️ Категория не найдена: ${type.categoryId}`)
			continue
		}

		const subcategoryId = type.subcategoryId
			? subcategoryMap[type.subcategoryId] || null
			: null

		if (type.subcategoryId && !subcategoryId) {
			console.warn(`⚠️ Подкатегория не найдена: ${type.subcategoryId}`)
		}

		await prisma.type.upsert({
			where: { slug: type.slug },
			update: {
				name: type.name,
				icon: type.icon,
				description: type.description,
				categoryId: categoryId,
				subcategoryId: subcategoryId,
			},
			create: {
				name: type.name,
				slug: type.slug,
				icon: type.icon,
				description: type.description,
				categoryId: categoryId,
				subcategoryId: subcategoryId,
			},
		})
		console.log(`✅ Добавлено: ${type.name}`)
	}

	console.log('🎉 Все типы успешно загружены!')
}

async function createAdmin() {
	console.log('✅ Запуск создания администратора...')

	const adminEmail = process.env.ADMIN_EMAIL || 'admin@servicehub.com'
	const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
	const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin'
	const adminLastName = process.env.ADMIN_LAST_NAME || 'User'
	const adminPhone = process.env.ADMIN_PHONE || '0500000000'

	// Проверяем, существует ли уже админ с таким email
	const existingAdmin = await prisma.user.findUnique({
		where: { email: adminEmail },
	})

	if (existingAdmin) {
		console.log(`⚠️ Администратор с email ${adminEmail} уже существует`)
		return
	}

	// Хешируем пароль
	const hashedPassword = await authService.hashPassword(adminPassword)

	// Нормализуем телефон
	const normalizedPhone = normalizePhone(adminPhone)

	// Создаем администратора
	const admin = await prisma.user.create({
		data: {
			email: adminEmail,
			password: hashedPassword,
			phone: adminPhone,
			phoneNormalized: normalizedPhone,
			firstName: adminFirstName,
			lastName: adminLastName,
			role: 'ADMIN',
			isVerified: true,
			isActive: true,
			isBlocked: false,
		},
	})

	console.log(`✅ Администратор успешно создан:`)
	console.log(`   Email: ${admin.email}`)
	console.log(`   ID: ${admin.id}`)
	console.log(`   Имя: ${admin.firstName} ${admin.lastName}`)
	console.log(`   ⚠️ Пароль: ${adminPassword} (сохраните его в безопасном месте!)`)
}

async function clearTables() {
	console.log('🧹 Очистка таблиц...')
	
	try {
		// Удаляем в обратном порядке из-за внешних ключей
		// Сначала Type (зависит от Subcategory и Category)
		const deletedTypes = await prisma.type.deleteMany({})
		console.log(`✅ Удалено ${deletedTypes.count} типов услуг`)

		// Затем Subcategory (зависит от Category)
		const deletedSubcategories = await prisma.subcategory.deleteMany({})
		console.log(`✅ Удалено ${deletedSubcategories.count} подкатегорий`)

		// Затем Category
		const deletedCategories = await prisma.category.deleteMany({})
		console.log(`✅ Удалено ${deletedCategories.count} категорий`)

		console.log('🎉 Таблицы успешно очищены!')
	} catch (e) {
		console.error('❌ Ошибка при очистке таблиц:', e)
		throw e
	}
}

async function runSeed() {
	try {
		// Сначала очищаем таблицы
		await clearTables()

		// Затем загружаем категории
		await main()
		console.log('🎉 Все категории успешно добавлены!')

		// Затем загружаем подкатегории
		await mainSubcategories()

		// Затем загружаем типы
		await mainTypes()

		// Создаем администратора
		await createAdmin()
	} catch (e) {
		console.error('❌ Ошибка:', e)
		process.exit(1)
	} finally {
		await prisma.$disconnect()
		await pool.end()
	}
}

runSeed()
