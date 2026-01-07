export interface GeneratedDescriptions {
	short: string
	medium: string
	selling: string
}

/**
 * Универсальная функция для генерации текста через OpenAI
 * @param prompt - Промпт для генерации
 * @returns Ответ от OpenAI (может быть JSON или текст, в зависимости от промпта)
 */
export async function generateText(prompt: string): Promise<string> {
	try {
		const response = await fetch('/api/generate-text', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				prompt,
			}),
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(
				errorData.error || `HTTP error! status: ${response.status}`
			)
		}

		const data = await response.json()

		if (!data.success) {
			throw new Error(data.error || 'Failed to generate text')
		}

		// Возвращаем текст ответа
		return data.text || ''
	} catch (error) {
		if (error instanceof Error) {
			throw error
		}
		throw new Error('Unknown error occurred while generating text')
	}
}

/**
 * Генерирует описание с тремя вариантами (short, medium, selling)
 * Промпт должен запрашивать JSON ответ в формате { short, medium, selling }
 */
export async function generateDescription(
	prompt: string
): Promise<GeneratedDescriptions> {
	const text = await generateText(prompt)

	// Парсим JSON ответ
	try {
		// Пытаемся извлечь JSON из ответа, если он обернут в markdown код блоки
		const jsonMatch =
			text.match(/```json\s*([\s\S]*?)\s*```/) ||
			text.match(/```\s*([\s\S]*?)\s*```/)
		const jsonString = jsonMatch ? jsonMatch[1] : text
		const parsed = JSON.parse(jsonString.trim())

		// Валидация структуры
		if (!parsed.short || !parsed.medium || !parsed.selling) {
			throw new Error(
				'Invalid response format: missing short, medium, or selling fields'
			)
		}

		return {
			short: String(parsed.short).trim(),
			medium: String(parsed.medium).trim(),
			selling: String(parsed.selling).trim(),
		}
	} catch (error) {
		console.error('Failed to parse JSON response:', error)
		console.error('Response text:', text)
		throw new Error(
			'Failed to parse response as JSON. Make sure your prompt requests JSON format with short, medium, and selling fields.'
		)
	}
}

// Устаревшая функция для обратной совместимости
interface GenerateServiceDescriptionParams {
	category: string
	subcategory: string
	type: string
	keywords: string[]
}

export async function generateServiceDescription(
	params: GenerateServiceDescriptionParams
): Promise<GeneratedDescriptions> {
	const { category, subcategory, type, keywords } = params

	const keywordsText = keywords.length > 0 ? keywords.join(', ') : 'не вказано'

	const prompt = `Створи опис послуги для:
- Категорія: ${category}
- Підкатегорія: ${subcategory}
- Тип послуги: ${type}
- Ключові слова: ${keywordsText}

Створи 3 варіанти опису українською мовою:
1. Короткий (до 200 символів) - стислий опис основної суті послуги
2. Середній (300-500 символів) - детальніший опис з основними характеристиками
3. Продаючий (500-800 символів) - переконливий опис з акцентом на переваги та вигоди для клієнта

Відповідь обов'язково у форматі JSON:
{
  "short": "...",
  "medium": "...",
  "selling": "..."
}

Важливо: відповідь має бути тільки JSON, без додаткового тексту.`

	return generateDescription(prompt)
}
