'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { formatPhone } from '@/utils/phoneNumber'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Phone } from 'lucide-react'

const PHONE_LENGTH = 10
export const VALID_PHONE_PATTERN = /^0[56789]\d{8}$/

type InputPhoneProps = {
	label?: string
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
	validateOnBlur?: boolean
	showValidationErrors?: boolean
	className?: string
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
	className,
}: InputPhoneProps) => {
	const [customValue, setCustomValue] = useState('')
	const [internalError, setInternalError] = useState<string | undefined>()
	const inputRef = useRef<HTMLInputElement>(null)

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
		// Валидация при потере фокуса
		if (validateOnBlur) {
			const validationResult = validatePhone(externalValue || '')
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
		// Очищаем внутреннюю ошибку при фокусе
		setInternalError(undefined)
	}

	// Приоритет ошибок: внешняя ошибка > внутренняя ошибка
	const displayError = externalError || internalError

	return (
		<div className={cn('space-y-2 mb-4', className)}>
			{label && (
				<Label htmlFor={name} required={required}>
					{label}
				</Label>
			)}

			<div className='relative space-y-2'>
				<div className='flex items-stretch'>
					{/* Country code section */}
					<div className='flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-r-0 border-gray-200 rounded-l-lg text-sm font-medium text-gray-700 h-[52px]'>
						<Phone className='w-4 h-4 text-blue-600' />
						<span>{countryCode}</span>
					</div>

					{/* Phone input */}
					<div className='relative flex-1'>
						<input
							ref={inputRef}
							type='tel'
							value={customValue}
							id={name}
							className={cn(
								'w-full h-[52px] px-4 py-3 text-base font-normal text-gray-900 placeholder:text-gray-500',
								'border-2 border-l-0 border-gray-200 rounded-r-lg bg-white',
								'focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100',
								'hover:border-gray-300 transition-all duration-300 ease',
								'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
								displayError &&
									'border-red-500 focus:border-red-500 focus:ring-red-100'
							)}
							placeholder={placeholder}
							autoComplete='tel'
							disabled={disabled}
							onChange={handleChange}
							onBlur={handleBlur}
							onFocus={handleFocus}
							maxLength={13}
						/>
					</div>
				</div>

				{/* Error message */}
				{showValidationErrors && displayError && (
					<div className='flex items-center gap-1 text-sm text-red-600'>
						<span>✗</span>
						<span>{displayError}</span>
					</div>
				)}

				{/* Helper text */}
				{helperText && !displayError && (
					<div className='text-sm text-gray-500'>{helperText}</div>
				)}
			</div>
		</div>
	)
}

export default InputPhone
