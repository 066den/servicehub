/**
 * Таблица транслитерации кириллицы в латиницу
 */
const transliterationMap: Record<string, string> = {
	а: 'a',
	б: 'b',
	в: 'v',
	г: 'g',
	д: 'd',
	е: 'e',
	ё: 'yo',
	ж: 'zh',
	з: 'z',
	и: 'i',
	й: 'y',
	к: 'k',
	л: 'l',
	м: 'm',
	н: 'n',
	о: 'o',
	п: 'p',
	р: 'r',
	с: 's',
	т: 't',
	у: 'u',
	ф: 'f',
	х: 'h',
	ц: 'ts',
	ч: 'ch',
	ш: 'sh',
	щ: 'sch',
	ъ: '',
	ы: 'y',
	ь: '',
	э: 'e',
	ю: 'yu',
	я: 'ya',
}

/**
 * Транслитерирует кириллицу в латиницу
 */
function transliterate(text: string): string {
	return text
		.split('')
		.map(char => {
			const lower = char.toLowerCase()
			return (
				transliterationMap[lower] || (lower.match(/[a-z0-9\s-]/) ? lower : '')
			)
		})
		.join('')
}

/**
 * Генерирует URL-friendly slug из текста
 * @param text - исходный текст
 * @returns slug или null, если текст пустой
 */
export function generateSlug(text: string): string | null {
	if (!text || !text.trim()) return null

	// Сначала транслитерируем кириллицу
	const transliterated = transliterate(text)

	const slug = transliterated
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim()

	// Проверяем, что после всех преобразований осталась непустая строка
	return slug && slug.length > 0 ? slug : null
}

/**
 * Генерирует slug в формате slug-id
 * @param text - исходный текст
 * @param id - идентификатор
 * @returns slug в формате slug-id
 */
export function generateSlugWithId(text: string, id: number): string {
	if (!text || !text.trim()) {
		return `provider-${id}`
	}
	const baseSlug = generateSlug(text)
	if (!baseSlug || baseSlug.length === 0) {
		return `provider-${id}`
	}
	return `${baseSlug}-${id}`
}

import type { PrismaClient } from '@prisma/client'

/**
 * Генерирует уникальный slug с проверкой существования в БД
 * @param prisma - экземпляр PrismaClient
 * @param model - название модели ('Category' | 'Subcategory' | 'Type')
 * @param baseText - исходный текст для генерации slug
 * @param excludeId - ID записи, которую нужно исключить из проверки (для обновления)
 * @returns уникальный slug
 */
export async function generateUniqueSlug(
	prisma: PrismaClient,
	model: 'Category' | 'Subcategory' | 'Type',
	baseText: string,
	excludeId?: number
): Promise<string> {
	const baseSlug = generateSlug(baseText)
	if (!baseSlug) {
		throw new Error(`Не удалось сгенерировать slug из текста: ${baseText}`)
	}

	let slug = baseSlug
	let counter = 1
	let isUnique = false

	while (!isUnique) {
		// Проверяем существование slug в БД
		const where: { slug: string; id?: { not: number } } = { slug }
		if (excludeId) {
			where.id = { not: excludeId }
		}

		let existing: unknown
		switch (model) {
			case 'Category':
				existing = await prisma.category.findFirst({ where })
				break
			case 'Subcategory':
				existing = await prisma.subcategory.findFirst({ where })
				break
			case 'Type':
				existing = await prisma.type.findFirst({ where })
				break
		}

		if (!existing) {
			isUnique = true
		} else {
			// Если slug занят, добавляем суффикс
			slug = `${baseSlug}-${counter}`
			counter++
		}
	}

	return slug
}

/**
 * Генерирует уникальный slug для Provider с проверкой существования в БД
 * Добавляет id только если slug занят
 * @param prisma - экземпляр PrismaClient (или транзакция)
 * @param baseText - исходный текст для генерации slug
 * @param providerId - ID провайдера (используется только если slug занят)
 * @param excludeId - ID записи, которую нужно исключить из проверки (для обновления)
 * @returns уникальный slug
 */
export async function generateUniqueProviderSlug(
	prisma:
		| PrismaClient
		| Omit<
				PrismaClient,
				'$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
		  >,
	baseText: string,
	providerId: number,
	excludeId?: number
): Promise<string> {
	const baseSlug = generateSlug(baseText)
	if (!baseSlug) {
		// Если не удалось сгенерировать slug, используем формат с id
		return `provider-${providerId}`
	}

	// Сначала проверяем базовый slug без id
	const where: { slug: string; id?: { not: number } } = { slug: baseSlug }
	if (excludeId) {
		where.id = { not: excludeId }
	}

	const existing = await prisma.provider.findFirst({ where })

	// Если slug свободен, возвращаем его без id
	if (!existing) {
		return baseSlug
	}

	// Если slug занят, добавляем id
	return `${baseSlug}-${providerId}`
}
