import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Получаем __dirname в ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

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
			update: {},
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

async function mainTypes() {
	console.log('✅ Запуск сид-скрипта для типов...')

	const filePath = path.join(__dirname, 'types.json')

	if (!fs.existsSync(filePath)) {
		console.error(`❌ Файл не найден: ${filePath}`)
		process.exit(1)
	}

	const data = fs.readFileSync(filePath, 'utf-8')
	const typesData = JSON.parse(data)

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

	console.log(`✅ Найдено ${typesData.length} типов услуг`)

	for (const type of typesData) {
		const categoryId = categoryMap[type.categoryId]
		if (!categoryId) {
			console.warn(`⚠️ Категория не найдена: ${type.categoryId}`)
			continue
		}

		await prisma.type.upsert({
			where: { slug: type.slug },
			update: {},
			create: {
				name: type.name,
				slug: type.slug,
				icon: type.icon,
				description: type.description,
				categoryId: categoryId,
			},
		})
		console.log(`✅ Добавлено: ${type.name}`)
	}

	console.log('🎉 Все типы успешно загружены!')
}

// main()
// 	.then(async () => {
// 		console.log('🎉 Все категории успешно добавлены!')
// 		await prisma.$disconnect()
// 	})
// 	.catch(async e => {
// 		console.error('❌ Ошибка при добавлении категорий:', e)
// 		await prisma.$disconnect()
// 		process.exit(1)
// 	})

mainTypes()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async e => {
		console.error('❌ Ошибка:', e)
		await prisma.$disconnect()
		process.exit(1)
	})
