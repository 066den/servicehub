import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import InputPhone from '@/components/ui/forms/InputPhone'

type FormData = {
	phone: string
	phoneWithController: string
}

const FormExamples: React.FC = () => {
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		watch,
		setValue,
	} = useForm<FormData>()

	const onSubmit = (data: FormData) => {
		console.log('Form data:', data)
	}

	const watchedPhone = watch('phone')

	return (
		<div className='p-8 space-y-8'>
			<h2 className='text-2xl font-bold text-dark-gray'>
				Примеры использования InputPhone с React Hook Form
			</h2>

			{/* Способ 1: С register (простой случай) */}
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold text-dark-gray'>
					1. Использование с register
				</h3>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<Controller
						name='phone'
						control={control}
						rules={{
							required: 'Номер телефона обязателен',
							validate: {
								phoneFormat: value => {
									if (!value) return true // Пустое значение не проверяем
									if (value.length < 10) return true // Неполный номер не проверяем
									return /^0[56789]\d{8}$/.test(value) || 'Неверный формат'
								},
							},
						}}
						render={({ field, fieldState }) => (
							<div>
								<InputPhone
									label='Номер телефона'
									error={fieldState.error?.message}
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									name={field.name}
									ref={field.ref}
								/>
								{/* Дополнительное отображение ошибок валидации */}
								{fieldState.error && (
									<div className='mt-2 text-sm text-destructive flex items-center gap-2'>
										<span>⚠️</span>
										<span>{fieldState.error.message}</span>
									</div>
								)}
							</div>
						)}
					/>

					<button
						type='submit'
						className='bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors'
					>
						Отправить
					</button>
				</form>

				{/* Показываем текущее значение */}
				<div className='p-4 bg-gray-100 rounded-lg'>
					<p className='text-sm text-gray-600'>Текущее значение:</p>
					<p className='font-mono'>{watchedPhone || 'Пусто'}</p>
				</div>
			</div>

			{/* Способ 2: С Controller (полный контроль) */}
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold text-dark-gray'>
					2. Использование с Controller
				</h3>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<Controller
						name='phoneWithController'
						control={control}
						rules={{
							required: 'Номер телефона обязателен',
							pattern: {
								value: /^0[56789]\d{8}$/,
								message: 'Неверный формат номера',
							},
						}}
						render={({ field, fieldState }) => (
							<InputPhone
								label='Номер телефона (Controller)'
								required
								placeholder='050 123 45 67'
								error={fieldState.error?.message}
								helperText='Используем Controller для полного контроля'
								value={field.value}
								onChange={field.onChange}
								onBlur={field.onBlur}
								name={field.name}
							/>
						)}
					/>

					<button
						type='submit'
						className='bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors'
					>
						Отправить
					</button>
				</form>
			</div>

			{/* Способ 3: Программное управление */}
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold text-dark-gray'>
					3. Программное управление
				</h3>

				<div className='space-y-4'>
					<InputPhone
						label='Номер телефона (программное управление)'
						placeholder='050 123 45 67'
						helperText='Значение устанавливается программно'
						value={watchedPhone}
						onChange={value => setValue('phone', value)}
						name='phone'
					/>

					<div className='flex gap-2'>
						<button
							type='button'
							onClick={() => setValue('phone', '0501234567')}
							className='bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary-hover transition-colors'
						>
							Установить номер
						</button>

						<button
							type='button'
							onClick={() => setValue('phone', '')}
							className='bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive-hover transition-colors'
						>
							Очистить
						</button>
					</div>
				</div>
			</div>

			{/* Способ 4: С кастомной валидацией */}
			<div className='space-y-4'>
				<h3 className='text-lg font-semibold text-dark-gray'>
					4. Кастомная валидация
				</h3>

				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<Controller
						name='phoneWithController'
						control={control}
						rules={{
							required: 'Номер телефона обязателен',
							validate: {
								validFormat: value => {
									if (!value) return true
									return /^0[56789]\d{8}$/.test(value) || 'Неверный формат'
								},
								notTestNumber: value => {
									if (!value) return true
									return (
										value !== '0501234567' ||
										'Нельзя использовать тестовый номер'
									)
								},
							},
						}}
						render={({ field, fieldState }) => (
							<InputPhone
								label='Номер телефона (кастомная валидация)'
								required
								placeholder='050 123 45 67'
								error={fieldState.error?.message}
								helperText='Дополнительные правила валидации'
								value={field.value}
								onChange={field.onChange}
								onBlur={field.onBlur}
								name={field.name}
							/>
						)}
					/>

					<button
						type='submit'
						className='bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors'
					>
						Отправить
					</button>
				</form>
			</div>
		</div>
	)
}

export default FormExamples
