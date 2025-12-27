import { UserProfile } from '@/types/auth'
import { StaffMember } from '@/types'
import { PricingOptions } from '@/lib/schemas'

export const getFirstLetters = (phrase: string, count = 2) => {
	return phrase
		.replace(/[.,!@#$%^&*()_+=\-`~[\]/\\{}:"|<>?]+/gi, '')
		.trim()
		.split(/\s+/)
		.slice(0, count)
		.map((word: string) => {
			if (!word.length) return ''
			return word.match(/./u)![0].toUpperCase()
		})
		.join('')
}

const avatarColors = [
	'#F59E0B', // amber
	'#10B981', // emerald
	'#3B82F6', // blue
	'#8B5CF6', // violet
	'#EC4899', // pink
	'#F43F5E', // rose
	'#14B8A6', // teal
	'#F97316', // orange
	'#22C55E', // green
	'#0EA5E9', // sky
]

export const getAvatarColor = (name: string): string => {
	let hash = 0

	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash)
	}

	const index = Math.abs(hash) % avatarColors.length
	return avatarColors[index]
}

export const getDisplayName = (user: UserProfile | StaffMember): string => {
	const { firstName, lastName } = user
	if (firstName && lastName) {
		return `${firstName} ${lastName}`
	}
	if (firstName) {
		return firstName
	}
	if (lastName) {
		return lastName
	}

	// if (phone) {
	// 	return phone.replace(/(\+\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1***$4$5')
	// }
	return 'Пользователь'
}

export const formatPrice = (
	price: number | null | undefined,
	pricingOptions?: PricingOptions
): string => {
	// Проверяем наличие pricingOptions
	if (
		pricingOptions &&
		typeof pricingOptions === 'object' &&
		pricingOptions !== null
	) {
		const options = pricingOptions
		const price = options.price

		if (!price || price <= 0) return 'Договірна'

		switch (options.format) {
			case 'FIXED':
				return `${price.toFixed(0)} ₴`
			case 'FROM':
				return `від ${price.toFixed(0)} ₴`
			case 'HOURLY':
				return `${price.toFixed(0)} ₴/год`
			case 'PER_UNIT':
				const unit = options.unit || ''
				return `${price.toFixed(0)} ₴/${unit}`
			default:
				return `${price.toFixed(0)} ₴`
		}
	}

	// Обратная совместимость: используем старое поле price
	if (price) {
		return `${price.toFixed(2)} ₴`
	}

	return 'Договірна'
}

export const formatDuration = (duration: number | null | undefined): string => {
	if (!duration || duration <= 0) return ''

	// Если больше или равно 60 минут, показываем в часах
	if (duration >= 60) {
		const hours = Math.floor(duration / 60)
		return `${hours} ч.`
	}

	// Иначе показываем в минутах
	return `${duration} хв.`
}

/**
 * Тип для узла TipTap JSON структуры
 */
type TipTapNode = {
	type: string
	text?: string
	content?: TipTapNode[]
	[key: string]: unknown
}

/**
 * Рекурсивно извлекает текст из узла TipTap JSON структуры
 */
const extractTextFromNode = (node: unknown): string => {
	if (!node || typeof node !== 'object') {
		return ''
	}

	const tipTapNode = node as TipTapNode

	// Если это текстовый узел, возвращаем его текст
	if (tipTapNode.type === 'text' && typeof tipTapNode.text === 'string') {
		return tipTapNode.text
	}

	// Если есть массив content, рекурсивно обрабатываем каждый элемент
	if (Array.isArray(tipTapNode.content)) {
		return tipTapNode.content
			.map((child: TipTapNode) => extractTextFromNode(child))
			.join('')
	}

	return ''
}

/**
 * Извлекает текст из TipTap контента (JSON или обычная строка)
 * и возвращает первые N слов
 * @param content - TipTap JSON строка или обычный текст
 * @param maxWords - Максимальное количество слов (по умолчанию 5)
 * @returns Первые N слов текста
 */
export const getTextFromTipTap = (
	content: string | null | undefined,
	maxWords: number = 5
): string => {
	if (!content) {
		return ''
	}

	let text = ''

	try {
		// Пытаемся распарсить как JSON (TipTap формат)
		const parsed: unknown =
			typeof content === 'string' ? JSON.parse(content) : content

		// Проверяем, что это валидный TipTap документ (объект с полем type)
		if (
			parsed &&
			typeof parsed === 'object' &&
			!Array.isArray(parsed) &&
			'type' in parsed
		) {
			// Извлекаем текст из TipTap структуры
			text = extractTextFromNode(parsed)
		} else {
			// Если не TipTap JSON, используем как обычный текст
			text = typeof content === 'string' ? content : String(content)
		}
	} catch {
		// Если не удалось распарсить, используем как обычный текст
		text = typeof content === 'string' ? content : String(content)
	}

	// Извлекаем первые N слов
	const words = text
		.trim()
		.split(/\s+/)
		.filter(word => word.length > 0)
	return words.slice(0, maxWords).join(' ')
}
