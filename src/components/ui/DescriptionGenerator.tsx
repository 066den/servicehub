'use client'

import { useState } from 'react'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from './sheet'
import { Button } from './button'
import { Textarea } from './textarea'
import { TagsInput } from './TagsInput'
import { Label } from './label'
import { generateDescription } from '@/services/openaiService'
import { toast } from 'sonner'
import { Loader2, Copy, Check, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { useDescriptionGenerator } from '@/stores/descriptionGenerator/useDescriptionGenerator'
import { useEffect } from 'react'

export type DescriptionVariant = 'short' | 'medium' | 'selling'

export interface GeneratedDescriptions {
	short: string
	medium: string
	selling: string
}

export interface FormField {
	key: string
	label: string
	value: string | null
	required?: boolean
}

export interface DescriptionGeneratorConfig {
	type: 'service' | 'provider' | 'custom'
	title: string
	description: string
	fields: FormField[]
	customPrompt?: (fields: Record<string, string>, keywords: string[]) => string
}

interface DescriptionGeneratorProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	config: DescriptionGeneratorConfig
	onInsert: (description: string) => void
}

export const DescriptionGenerator = ({
	open,
	onOpenChange,
	config,
	onInsert,
}: DescriptionGeneratorProps) => {
	const {
		keywords,
		descriptions: storedDescriptions,
		setKeywords,
		setDescriptions,
	} = useDescriptionGenerator()

	const [isGenerating, setIsGenerating] = useState(false)
	const [editedDescriptions, setEditedDescriptions] =
		useState<GeneratedDescriptions | null>(storedDescriptions)
	const [copiedVariant, setCopiedVariant] = useState<DescriptionVariant | null>(
		null
	)

	// Загружаем сохраненные данные при открытии
	useEffect(() => {
		if (open && storedDescriptions) {
			setEditedDescriptions(storedDescriptions)
		}
	}, [open, storedDescriptions])

	// Проверяем обязательные поля
	const requiredFields = config.fields.filter(f => f.required)
	const missingFields = requiredFields.filter(f => !f.value)

	const handleGenerate = async () => {
		// Проверяем обязательные поля
		if (missingFields.length > 0) {
			toast.error(
				`Будь ласка, заповніть обов'язкові поля: ${missingFields
					.map(f => f.label)
					.join(', ')}`
			)
			onOpenChange(false)
			return
		}

		setIsGenerating(true)
		setEditedDescriptions(null)

		try {
			// Формируем данные для промпта
			const fieldsData: Record<string, string> = {}
			config.fields.forEach(field => {
				fieldsData[field.key] = field.value || ''
			})

			// Используем кастомный промпт или дефолтный
			const prompt = config.customPrompt
				? config.customPrompt(fieldsData, keywords)
				: getDefaultPrompt(config.type, fieldsData, keywords)

			const result = await generateDescription(prompt)

			setEditedDescriptions(result)
			// Сохраняем в стор
			setDescriptions(result)
		} catch (error) {
			console.error('Error generating description:', error)
			toast.error(
				error instanceof Error
					? error.message
					: 'Помилка генерації опису. Спробуйте ще раз.'
			)
		} finally {
			setIsGenerating(false)
		}
	}

	const handleInsert = (variant: DescriptionVariant) => {
		if (!editedDescriptions) return

		const description = editedDescriptions[variant]
		if (description.trim()) {
			onInsert(description)
			onOpenChange(false)
			toast.success('Опис вставлено')
		}
	}

	const handleCopy = async (variant: DescriptionVariant) => {
		if (!editedDescriptions) return

		const description = editedDescriptions[variant]
		try {
			await navigator.clipboard.writeText(description)
			setCopiedVariant(variant)
			toast.success('Опис скопійовано в буфер обміну')
			setTimeout(() => setCopiedVariant(null), 2000)
		} catch {
			toast.error('Не вдалося скопіювати опис')
		}
	}

	const handleDescriptionChange = (
		variant: DescriptionVariant,
		value: string
	) => {
		if (!editedDescriptions) return

		const updated = {
			...editedDescriptions,
			[variant]: value,
		}
		setEditedDescriptions(updated)
		// Сохраняем изменения в стор
		setDescriptions(updated)
	}

	const handleClose = () => {
		if (!isGenerating) {
			setCopiedVariant(null)
			onOpenChange(false)
			// Не очищаем данные при закрытии - они сохраняются в сторе
		}
	}

	return (
		<Sheet open={open} onOpenChange={handleClose}>
			<SheetContent side='right' className='w-full sm:max-w-xl overflow-y-auto'>
				<SheetHeader>
					<SheetTitle>{config.title}</SheetTitle>
					<SheetDescription>{config.description}</SheetDescription>
				</SheetHeader>

				<div className='p-4 space-y-6'>
					{/* Поля формы */}
					<div className='space-y-4'>
						{config.fields.map(field => (
							<div key={field.key} className='space-y-2'>
								<h5>
									{field.label}
									{field.required && (
										<span className='text-destructive ml-1'>*</span>
									)}
								</h5>{' '}
								{field.value ? field.value : 'не вказано'}
								{/* <Input
									value={field.value || ''}
									disabled
									readOnly
									className='bg-gray-100'
								/> */}
							</div>
						))}

						<div className='space-y-2'>
							<TagsInput
								value={keywords}
								onChange={setKeywords}
								label='Ключові слова'
								placeholder='Введіть ключове слово та натисніть Enter'
								maxTags={10}
								disabled={isGenerating}
							/>
						</div>
					</div>

					{/* Предупреждение о незаполненных полях */}
					{missingFields.length > 0 && !isGenerating && (
						<Alert variant='destructive'>
							<AlertCircle className='size-4' />
							<AlertTitle>
								Заповніть обов&apos;язкові поля перед генерацією
							</AlertTitle>
							<AlertDescription>
								<ul className='list-disc list-inside space-y-1 mt-2'>
									{missingFields.map(field => (
										<li key={field.key}>{field.label}</li>
									))}
								</ul>
							</AlertDescription>
						</Alert>
					)}

					{/* Кнопка генерации */}
					<Button
						onClick={handleGenerate}
						loading={isGenerating}
						fullWidth
						size='md'
					>
						{isGenerating ? (
							<>
								<Loader2 className='animate-spin' />
								Генерація...
							</>
						) : (
							'Згенерувати опис'
						)}
					</Button>

					{/* Результаты */}
					{isGenerating && (
						<div className='flex flex-col items-center justify-center py-12'>
							<Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
							<p className='text-sm text-gray-500'>Генеруємо опис...</p>
						</div>
					)}

					{editedDescriptions && !isGenerating && (
						<div className='space-y-6 pt-4 border-t'>
							<h3 className='text-lg font-semibold'>Варіанти опису</h3>

							{/* Короткий вариант */}
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<Label className='text-base font-semibold'>
										Короткий опис
									</Label>
									<div className='flex gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleCopy('short')}
											className='gap-2'
										>
											{copiedVariant === 'short' ? (
												<Check className='h-4 w-4' />
											) : (
												<Copy className='h-4 w-4' />
											)}
											Копіювати
										</Button>
										<Button size='sm' onClick={() => handleInsert('short')}>
											Вставити
										</Button>
									</div>
								</div>
								<Textarea
									value={editedDescriptions.short}
									onChange={e =>
										handleDescriptionChange('short', e.target.value)
									}
									rows={4}
									className='min-h-[100px]'
									placeholder='Короткий опис...'
								/>
							</div>

							{/* Средний вариант */}
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<Label className='text-base font-semibold'>
										Середній опис
									</Label>
									<div className='flex gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleCopy('medium')}
											className='gap-2'
										>
											{copiedVariant === 'medium' ? (
												<Check className='h-4 w-4' />
											) : (
												<Copy className='h-4 w-4' />
											)}
											Копіювати
										</Button>
										<Button size='sm' onClick={() => handleInsert('medium')}>
											Вставити
										</Button>
									</div>
								</div>
								<Textarea
									value={editedDescriptions.medium}
									onChange={e =>
										handleDescriptionChange('medium', e.target.value)
									}
									rows={6}
									className='min-h-[150px]'
									placeholder='Середній опис...'
								/>
							</div>

							{/* Продающий вариант */}
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<Label className='text-base font-semibold'>
										Продаючий опис
									</Label>
									<div className='flex gap-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => handleCopy('selling')}
											className='gap-2'
										>
											{copiedVariant === 'selling' ? (
												<Check className='h-4 w-4' />
											) : (
												<Copy className='h-4 w-4' />
											)}
											Копіювати
										</Button>
										<Button size='sm' onClick={() => handleInsert('selling')}>
											Вставити
										</Button>
									</div>
								</div>
								<Textarea
									value={editedDescriptions.selling}
									onChange={e =>
										handleDescriptionChange('selling', e.target.value)
									}
									rows={8}
									className='min-h-[200px]'
									placeholder='Продаючий опис...'
								/>
							</div>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	)
}

// Дефолтные промпты для разных типов
function getDefaultPrompt(
	type: string,
	fields: Record<string, string>,
	keywords: string[]
): string {
	const keywordsText = keywords.length > 0 ? keywords.join(', ') : 'не вказано'

	switch (type) {
		case 'service':
			return `Створи опис послуги для:
- Категорія: ${fields.category || 'не вказано'}
- Підкатегорія: ${fields.subcategory || 'не вказано'}
- Тип послуги: ${fields.type || 'не вказано'}
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

		case 'provider':
			return `Створи опис профілю виконавця для:
- Назва: ${fields.businessName || 'не вказано'}
- Тип: ${fields.type || 'не вказано'}
- Спеціалізація: ${fields.specialization || 'не вказано'}
- Ключові слова: ${keywordsText}

Створи 3 варіанти опису українською мовою:
1. Короткий (до 200 символів) - стислий опис профілю та спеціалізації
2. Середній (300-500 символів) - детальніший опис з навичками та досвідом
3. Продаючий (500-800 символів) - переконливий опис з акцентом на переваги та професійність

Відповідь обов'язково у форматі JSON:
{
  "short": "...",
  "medium": "...",
  "selling": "..."
}

Важливо: відповідь має бути тільки JSON, без додаткового тексту.`

		default:
			return `Створи опис на основі наступної інформації:
${Object.entries(fields)
	.map(([key, value]) => `- ${key}: ${value || 'не вказано'}`)
	.join('\n')}
- Ключові слова: ${keywordsText}

Створи 3 варіанти опису українською мовою:
1. Короткий (до 200 символів)
2. Середній (300-500 символів)
3. Продаючий (500-800 символів)

Відповідь обов'язково у форматі JSON:
{
  "short": "...",
  "medium": "...",
  "selling": "..."
}

Важливо: відповідь має бути тільки JSON, без додаткового тексту.`
	}
}
