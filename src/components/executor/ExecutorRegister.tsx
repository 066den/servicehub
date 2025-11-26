'use client'
import { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import PlacesAutocomplete from '../ui/forms/PlacesAutocomplete'
import Map from '../common/Map'
import { LocationData } from '@/types'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { Textarea } from '../ui/textarea'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import InputPhone from '../ui/forms/InputPhone'
import { useProvider } from '@/stores/provider/useProvider'
import { ProviderType } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { phoneMask } from '@/utils/phoneNumber'
import { Badge } from '../ui/badge'
import { containerVariants } from '../ui/animate/variants'
import { motion } from 'motion/react'
import { toast } from 'sonner'

import type { Executor } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProviderSchema } from '@/lib/schemas'
import type { z } from 'zod'

type FormData = z.input<typeof createProviderSchema>

const ExecutorRegister = () => {
	const { user, userLocation } = useUserProfile()
	const { createProvider, isLoadingProvider } = useProvider()

	const [location, setLocation] = useState<LocationData | null>(
		userLocation || null
	)

	const {
		register,
		handleSubmit,
		setValue,
		getValues,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		resolver: zodResolver(createProviderSchema, undefined, { raw: true }),
		defaultValues: {
			type: ProviderType.INDIVIDUAL,
			businessName: '',
			email: '',
			description: '',
			phone: '',
		},
	})

	useEffect(() => {
		if (!user) {
			return
		}

		const fullName = [user.lastName, user.firstName].filter(Boolean).join(' ')
		if (fullName && getValues('businessName') !== fullName) {
			setValue('businessName', fullName)
		}

		if (user.phone) {
			const maskedPhone = phoneMask(user.phone)
			if (getValues('phone') !== maskedPhone) {
				setValue('phone', maskedPhone)
			}
		}
	}, [user, getValues, setValue])

	useEffect(() => {
		if (userLocation) {
			setLocation(userLocation)
		}
	}, [userLocation])

	const watchedType = watch('type')

	const onSubmit = handleSubmit(async data => {
		// COMPANY недоступен для выбора, принудительно устанавливаем INDIVIDUAL
		const providerType =
			data.type === ProviderType.COMPANY
				? ProviderType.INDIVIDUAL
				: data.type

		const payload: Executor = {
			type: providerType,
			businessName: data.businessName.trim(),
			phone: data.phone?.trim() || undefined,
			description: data.description?.trim() || undefined,
			email: data.email?.trim() || undefined,
			location: location || undefined,
		}

		try {
			await createProvider(payload)
			toast.success('Профіль виконавця успішно створено')
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message)
			}
			toast.error('Помилка при створенні профіля виконавця')
		}
	})

	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='px-6 py-2'
		>
			<div className='flex justify-between items-center mb-6 border-b border-gray-200 pb-4'>
				<div>
					<h1 className='text-3xl font-bold mb-2'>Реєстрація виконавця</h1>
					<p className='text-secondary-foreground'>
						Заповніть форму, щоб стати виконавцем на платформі
					</p>
				</div>
			</div>
			<form onSubmit={onSubmit}>
				<p className='text-sm text-destructive mb-2'>
					* Поля, позначені зірочкою, є обов&apos;язковими для заповнення
				</p>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
					<div
						className={cn(
							'border-2 border-gray-200 rounded-lg p-4 cursor-pointer text-center relative transition-all hover:border-primary hover:shadow-md hover:translate-y-[-2px]',
							watchedType === ProviderType.INDIVIDUAL &&
								'border-primary bg-primary/10'
						)}
						onClick={() => setValue('type', ProviderType.INDIVIDUAL)}
					>
						<input
							type='radio'
							{...register('type')}
							value={ProviderType.INDIVIDUAL}
							className='hidden'
						/>
						{watchedType === ProviderType.INDIVIDUAL && (
							<Badge variant='success' className='absolute top-2 right-2'>
								Обраний
							</Badge>
						)}
						<div className='text-5xl mb-2'>🙋‍♂️</div>
						<div className='text-xl font-semibold mb-1'>Фізична особа</div>
						<div className='text-sm text-gray-500'>
							Для фрілансерів, майстрів, репетиторів та інших індивідуальних
							виконавців
						</div>
					</div>

					<div className='relative'>
						<div
							className={cn(
								'border-2 border-gray-200 rounded-lg p-4 text-center relative opacity-60',
								watchedType === ProviderType.COMPANY &&
									'border-primary bg-primary/10'
							)}
						>
							<input
								type='radio'
								{...register('type')}
								value={ProviderType.COMPANY}
								className='hidden'
								disabled
							/>
							<div className='text-5xl mb-4'>🏢</div>
							<div className='text-xl font-semibold mb-2 text-gray-900'>
								Компанія
							</div>
							<div className='text-sm text-gray-500 leading-relaxed'>
								Організація або команда, що надає професійні послуги
							</div>
						</div>
						<div className='absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center p-4'>
							<p className='text-sm text-gray-700 text-center font-medium'>
								Скоро ця можливість буде активована. У профілі можна буде
								змінити тип.
							</p>
						</div>
					</div>
				</div>

				<Input
					{...register('businessName')}
					label={
						watchedType === ProviderType.COMPANY
							? 'Назва компанії'
							: 'Прізвище та імʼя'
					}
					required
					errorMessage={errors.businessName?.message}
				/>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Input
						{...register('email')}
						type='email'
						label='Email'
						required
						placeholder='Введіть ваш email'
					/>

					<InputPhone
						value={watch('phone')}
						onChange={value => setValue('phone', value)}
						label='Телефон'
						required
					/>
				</div>

				<div className='space-y-2 mb-4'>
					<label className='text-base font-semibold text-gray-700 leading-none select-none'></label>
					<Textarea
						{...register('description')}
						placeholder='Розкажіть про свої навички та спеціалізацію...'
					/>
					<div className='text-sm text-gray-500'>
						Опис допоможе клієнтам краще зрозуміти ваші можливості
					</div>
				</div>

				<PlacesAutocomplete
					onLocationSelect={setLocation}
					label='Адреса'
					placeholder='Почніть вводити адресу...'
					types={['address']}
				/>

				<div className='mb-4 mt-4'>
					<Map center={location?.coordinates} height={300} zoom={15} />
				</div>

				<Button
					variant='accent'
					size='lg'
					disabled={isSubmitting}
					type='submit'
					loading={isLoadingProvider}
				>
					Зареєструватися як виконавець
				</Button>
			</form>
		</motion.section>
	)
}

export default ExecutorRegister
