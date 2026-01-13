'use client'

import { useState, KeyboardEvent, useRef } from 'react'
import { X } from 'lucide-react'
import { Badge } from './badge'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface TagsInputProps {
	value: string[]
	onChange: (tags: string[]) => void
	placeholder?: string
	maxTags?: number
	maxTagLength?: number
	disabled?: boolean
	className?: string
	label?: string
}

export const TagsInput = ({
	value,
	onChange,
	placeholder = 'Введіть ключове слово та натисніть Enter',
	maxTags = 10,
	maxTagLength = 50,
	disabled = false,
	className,
	label,
}: TagsInputProps) => {
	const [inputValue, setInputValue] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)

	const addTag = (tag: string) => {
		const trimmedTag = tag.trim()
		if (
			!trimmedTag ||
			value.includes(trimmedTag) ||
			value.length >= maxTags ||
			trimmedTag.length > maxTagLength
		) {
			return
		}
		onChange([...value, trimmedTag])
		setInputValue('')
	}

	const removeTag = (tagToRemove: string) => {
		onChange(value.filter(tag => tag !== tagToRemove))
	}

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (disabled) return

		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault()
			if (inputValue.trim()) {
				addTag(inputValue)
			}
		} else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
			removeTag(value[value.length - 1])
		}
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		// Разрешаем ввод запятой, но не добавляем тег автоматически
		if (newValue.includes(',')) {
			const parts = newValue.split(',').map(part => part.trim())
			if (parts.length > 1) {
				parts.slice(0, -1).forEach(part => {
					if (part) addTag(part)
				})
				setInputValue(parts[parts.length - 1] || '')
			} else {
				setInputValue(newValue)
			}
		} else {
			setInputValue(newValue)
		}
	}

	return (
		<div className={cn('space-y-2', className)}>
			{label && (
				<label className='text-sm font-medium text-gray-700'>{label}</label>
			)}
			<div
				className={cn(
					'flex flex-wrap gap-2 min-h-[48px] rounded-lg border-2 border-gray-200 bg-gray-50 p-2 transition-all duration-300',
					'focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100',
					'hover:border-gray-300',
					disabled && 'bg-gray-100 cursor-not-allowed opacity-60'
				)}
				onClick={() => !disabled && inputRef.current?.focus()}
			>
				{value.map(tag => (
					<Badge
						key={tag}
						variant='outline'
						className='flex items-center gap-1 pr-1'
					>
						<span className='text-sm'>{tag}</span>
						{!disabled && (
							<button
								type='button'
								onClick={e => {
									e.stopPropagation()
									removeTag(tag)
								}}
								className='ml-1 rounded-full hover:bg-gray-300 p-0.5 transition-colors'
								aria-label={`Видалити ${tag}`}
							>
								<X className='h-3 w-3' />
							</button>
						)}
					</Badge>
				))}
				<Input
					ref={inputRef}
					type='text'
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={value.length === 0 ? placeholder : ''}
					disabled={disabled || value.length >= maxTags}
					className='border-0 bg-transparent p-0 focus:ring-0 focus-visible:ring-0 h-auto'
					containerClassName='mb-0 flex-1 min-w-[120px]'
				/>
			</div>
			{value.length > 0 && (
				<p className='text-xs text-gray-500'>
					{value.length} / {maxTags} ключових слів
				</p>
			)}
		</div>
	)
}
