'use client'

import * as React from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from './label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './select'
import { Button } from './button'
import { Input } from './input'

export type DurationUnit = 'mins' | 'hours' | 'days'

export interface DurationPickerProps
	extends Omit<
		React.ComponentProps<'input'>,
		'value' | 'onChange' | 'onBlur' | 'type' | 'ref'
	> {
	label?: string
	required?: boolean
	value?: number | null | string | undefined // Значение в минутах (базовая единица), может быть string из register
	unit?: DurationUnit // Единица для отображения
	onValueChange?: (value: number | null) => void // Возвращает значение в минутах
	onUnitChange?: (unit: DurationUnit) => void
	min?: number
	max?: number
	step?: number
	disabled?: boolean
	errorMessage?: string
	helperText?: string
	className?: string
	containerClassName?: string
	unitOptions?: DurationUnit[]
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

const DEFAULT_UNIT_OPTIONS: DurationUnit[] = ['mins', 'hours', 'days']

const UNIT_LABELS: Record<DurationUnit, string> = {
	mins: 'Mins',
	hours: 'Hours',
	days: 'Days',
}

// Конвертация из минут в выбранную единицу для отображения
const convertFromMinutes = (
	minutes: number | null,
	unit: DurationUnit
): number | null => {
	if (minutes === null) return null
	switch (unit) {
		case 'hours':
			return Math.round(minutes / 60)
		case 'days':
			return Math.round(minutes / (60 * 24))
		case 'mins':
		default:
			return minutes
	}
}

// Конвертация из выбранной единицы в минуты для сохранения
const convertToMinutes = (
	value: number | null,
	unit: DurationUnit
): number | null => {
	if (value === null) return null
	switch (unit) {
		case 'hours':
			return Math.round(value * 60)
		case 'days':
			return Math.round(value * 60 * 24)
		case 'mins':
		default:
			return Math.round(value)
	}
}

export const DurationPicker = React.forwardRef<
	HTMLInputElement,
	DurationPickerProps
>(
	(
		{
			label,
			required = false,
			value: controlledValue,
			unit = 'mins',
			onValueChange,
			onUnitChange,
			min = 1,
			max,
			step = 1,
			disabled = false,
			errorMessage,
			helperText,
			className,
			containerClassName,
			unitOptions = DEFAULT_UNIT_OPTIONS,
			name,
			onChange: externalOnChange,
			onBlur: externalOnBlur,
			...inputProps
		},
		ref
	) => {
		const generatedId = React.useId()
		const sanitizedGeneratedId = React.useMemo(
			() => generatedId.replace(/[^a-zA-Z0-9_-]/g, ''),
			[generatedId]
		)
		const inputId = name || `duration-${sanitizedGeneratedId || 'field'}`

		// Используем controlledValue если передан, иначе null
		// Преобразуем значение в number | null
		const value = React.useMemo(() => {
			if (controlledValue === null || controlledValue === undefined) return null
			if (typeof controlledValue === 'string') {
				const num = Number(controlledValue)
				return isNaN(num) ? null : num
			}
			return controlledValue
		}, [controlledValue])

		// Конвертируем значение из минут в выбранную единицу для отображения
		const displayValue = React.useMemo(
			() => convertFromMinutes(value, unit),
			[value, unit]
		)

		const numericDisplayValue = displayValue ?? 0

		// Обработчик переключения единицы измерения
		const handleUnitChange = (newUnit: DurationUnit) => {
			if (value !== null && value !== undefined) {
				// Конвертируем текущее значение в новую единицу
				const newDisplayValue = convertFromMinutes(value, newUnit)
				// Конвертируем обратно в минуты с округлением для целых значений
				const newValueInMinutes = newDisplayValue
					? convertToMinutes(newDisplayValue, newUnit)
					: null
				handleValueChange(newValueInMinutes)
			}
			onUnitChange?.(newUnit)
		}

		// Обертка для вызова onChange с конвертированным значением
		const handleValueChange = (newValueInMinutes: number | null) => {
			// Вызываем onValueChange если передан
			onValueChange?.(newValueInMinutes)

			// Вызываем внешний onChange из register, если передан
			if (externalOnChange && name) {
				// Создаем синтетическое событие для react-hook-form
				const target = {
					name,
					value: newValueInMinutes?.toString() || '',
				} as HTMLInputElement
				const syntheticEvent = {
					target,
					currentTarget: target,
				} as unknown as React.ChangeEvent<HTMLInputElement>
				externalOnChange(syntheticEvent)
			}
		}

		const handleDecrement = () => {
			if (disabled) return
			const newDisplayValue = Math.max(min, numericDisplayValue - step)
			// Конвертируем обратно в минуты
			const valueToConvert =
				newDisplayValue === min && numericDisplayValue === min
					? null
					: newDisplayValue
			const newValueInMinutes = valueToConvert
				? convertToMinutes(valueToConvert, unit)
				: null
			handleValueChange(newValueInMinutes)
		}

		const handleIncrement = () => {
			if (disabled) return
			const newDisplayValue = max
				? Math.min(max, numericDisplayValue + step)
				: numericDisplayValue + step
			// Конвертируем обратно в минуты
			const newValueInMinutes = convertToMinutes(newDisplayValue, unit)
			handleValueChange(newValueInMinutes)
		}

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			if (disabled) return
			const inputValue = e.target.value

			if (inputValue === '') {
				handleValueChange(null)
				return
			}

			const numValue = Number(inputValue)
			if (!isNaN(numValue)) {
				let finalDisplayValue = numValue
				if (min !== undefined && numValue < min) {
					finalDisplayValue = min
				}
				if (max !== undefined && numValue > max) {
					finalDisplayValue = max
				}
				// Конвертируем обратно в минуты
				const finalValueInMinutes = convertToMinutes(finalDisplayValue, unit)
				handleValueChange(finalValueInMinutes)
			}
		}

		const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
			if (disabled) return
			const inputValue = e.target.value

			if (inputValue === '') {
				handleValueChange(null)
				// Вызываем внешний onBlur если передан
				externalOnBlur?.(e)
				return
			}

			const numValue = Number(inputValue)
			if (!isNaN(numValue)) {
				let finalDisplayValue = numValue
				if (min !== undefined && numValue < min) {
					finalDisplayValue = min
				}
				if (max !== undefined && numValue > max) {
					finalDisplayValue = max
				}
				// Конвертируем обратно в минуты
				const finalValueInMinutes = convertToMinutes(finalDisplayValue, unit)
				handleValueChange(finalValueInMinutes)
			} else {
				handleValueChange(convertToMinutes(min, unit))
			}

			// Вызываем внешний onBlur если передан
			externalOnBlur?.(e)
		}

		const hasError = !!errorMessage

		return (
			<div className={cn('space-y-2', containerClassName)}>
				{label && (
					<Label htmlFor={inputId} required={required}>
						{label}
					</Label>
				)}

				<div className={cn('flex items-center gap-2', className)}>
					<div className='relative flex-1'>
						<Button
							type='button'
							variant='outline'
							size='icon'
							onClick={handleDecrement}
							disabled={disabled || numericDisplayValue <= min}
							className='absolute top-0 left-0 h-[52px] w-[52px]'
						>
							<Minus className='size-4' />
						</Button>

						<Input
							ref={ref}
							id={inputId}
							name={name}
							type='number'
							value={displayValue ?? ''}
							onChange={handleInputChange}
							onBlur={handleInputBlur}
							min={min}
							max={max}
							step={step}
							disabled={disabled}
							error={hasError}
							errorMessage={errorMessage}
							placeholder='0'
							containerClassName='mb-0'
							className='px-0 text-center'
							{...inputProps}
						/>

						<Button
							type='button'
							variant='outline'
							size='icon'
							onClick={handleIncrement}
							disabled={
								disabled || (max !== undefined && numericDisplayValue >= max)
							}
							className='absolute top-0 right-0 h-[52px] w-[52px]'
						>
							<Plus className='size-4' />
						</Button>
					</div>

					{/* Unit selector */}
					<Select
						value={unit}
						onValueChange={value => handleUnitChange(value as DurationUnit)}
						disabled={disabled}
					>
						<SelectTrigger
							className={cn(
								'h-[52px] w-[120px] shrink-0 rounded-lg border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100',
								hasError &&
									'border-red-500 focus:border-red-500 focus:ring-red-100'
							)}
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{unitOptions.map(option => (
								<SelectItem key={option} value={option}>
									{UNIT_LABELS[option]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Error message */}
				{hasError && (
					<div className='text-destructive text-sm'>{errorMessage}</div>
				)}

				{/* Helper text */}
				{helperText && !hasError && (
					<div className='text-gray-500 text-sm'>{helperText}</div>
				)}
			</div>
		)
	}
)

DurationPicker.displayName = 'DurationPicker'
