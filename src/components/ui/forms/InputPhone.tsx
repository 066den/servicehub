'use client'

import { useEffect, useState, useCallback } from 'react'
import { formatPhone } from '@/utils/phoneNumber'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const PHONE_LENGTH = 10
export const VALID_PHONE_PATTERN = /^0[56789]\d{8}$/

type InputPhoneProps = {
	label: string
	required?: boolean
	disabled?: boolean
	error?: string
	helperText?: string
	countryCode?: string
	placeholder?: string
	value?: string
	onChange?: (value: string) => void
	onBlur?: () => void
	name?: string
	validateOnBlur?: boolean // Включить валидацию при потере фокуса
	showValidationErrors?: boolean // Показывать ли ошибки валидации
}

const InputPhone = ({
	label,
	required = false,
	disabled = false,
	error: externalError,
	helperText,
	countryCode = '+38',
	placeholder = '050 123 45 67',
	value: externalValue,
	onChange: externalOnChange,
	onBlur: externalOnBlur,
	name,
	validateOnBlur = true,
	showValidationErrors = true,
}: InputPhoneProps) => {
	const [customValue, setCustomValue] = useState('')
	const [isFocused, setIsFocused] = useState(false)
	const [internalError, setInternalError] = useState<string | undefined>()

	// Валидация телефона
	const validatePhone = useCallback(
		(phone: string): string | true => {
			if (!phone) {
				if (required) return 'Номер телефона обязателен'
				return true
			}

			if (phone.length < PHONE_LENGTH) {
				return 'Введите полный номер телефона'
			}

			if (!VALID_PHONE_PATTERN.test(phone)) {
				return 'Неверный формат номера'
			}

			return true
		},
		[required]
	)

	// Обновляем внутреннее значение при изменении внешнего
	useEffect(() => {
		if (externalValue) {
			const formatted = formatPhone(externalValue)
			setCustomValue(formatted)
			// Очищаем внутреннюю ошибку если внешнее значение валидно
			const validationResult = validatePhone(externalValue)
			if (validationResult === true) {
				setInternalError(undefined)
			}
		} else {
			setCustomValue('')
			setInternalError(undefined)
		}
	}, [externalValue, validatePhone])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = e.target.value.replace(/\D/g, '')
		const formatted = formatPhone(rawValue)

		setCustomValue(formatted)
		const truncatedValue = rawValue.slice(0, PHONE_LENGTH)

		// Вызываем внешний onChange
		if (externalOnChange) {
			externalOnChange(truncatedValue)
		}

		// Очищаем ошибку при вводе
		if (internalError) {
			setInternalError(undefined)
		}
	}

	const handleBlur = () => {
		setIsFocused(false)

		// Валидация при потере фокуса
		if (validateOnBlur && externalValue) {
			const validationResult = validatePhone(externalValue)
			if (validationResult !== true) {
				setInternalError(validationResult)
			}
		}

		// Вызываем внешний onBlur
		if (externalOnBlur) {
			externalOnBlur()
		}
	}

	const handleFocus = () => {
		setIsFocused(true)
		// Очищаем внутреннюю ошибку при фокусе
		setInternalError(undefined)
	}

	// Приоритет ошибок: внешняя ошибка > внутренняя ошибка
	const displayError = externalError || internalError

	const getInputState = () => {
		if (displayError) return 'error'
		if (isFocused) return 'focused'
		return 'default'
	}

	const inputState = getInputState()

	return (
		<>
			{label && (
				<Label
					htmlFor={name}
					className={`phone-label ${required ? 'required' : ''}`}
				>
					{label}
				</Label>
			)}

			<div
				className={cn(
					'flex border-2 border-gray-200 rounded-md bg-input focus-within:border-primary focus-within:bg-white',
					inputState,
					disabled ? 'disabled' : '',
					label ? 'mt-2' : ''
				)}
			>
				<div className='flex items-center gap-1 px-4 bg-input border-r rounded-l-md'>
					<svg viewBox='0 0 24 16' className='w-5 h-5'>
						<rect width='24' height='8' fill='#0057b7' />
						<rect y='8' width='24' height='8' fill='#ffd700' />
					</svg>
					<span className='font-medium text-secondary-foreground'>
						{countryCode}
					</span>
				</div>

				<Input
					type='tel'
					value={customValue}
					id={name}
					className='border-none rounded-l-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 rounded-r-md'
					placeholder={placeholder}
					autoComplete='tel'
					disabled={disabled}
					onChange={handleChange}
					onBlur={handleBlur}
					onFocus={handleFocus}
					maxLength={13} // 10 digits + 3 spaces
				/>
			</div>

			{helperText && !displayError && (
				<div className='text-sm text-secondary-foreground'>{helperText}</div>
			)}

			{/* Показываем ошибки только если включено */}
			{showValidationErrors && displayError && (
				<div className='text-sm text-destructive flex items-center gap-2 mt-2'>
					<span>✗</span>
					<span>{displayError}</span>
				</div>
			)}
		</>
	)
}

export default InputPhone
