'use client'
import { useState } from 'react'
import { Input } from '../ui/input'
import PlacesAutocomplete from '../ui/forms/PlacesAutocomplete'
import Map from '../common/Map'
import { LocationData } from '@/types'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { Textarea } from '../ui/textarea'
import { useUserProfile } from '@/hooks/storeHooks/useUserProfile'
import InputPhone from '../ui/forms/InputPhone'
import { useProvider } from '@/hooks/storeHooks/useProvider'
import { ProviderType } from '@prisma/client'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { phoneMask } from '@/utils/phoneNumber'
import { Badge } from '../ui/badge'
import { containerVariants } from '../ui/animate/variants'
import { motion } from 'motion/react'

type FormData = {
	type: ProviderType
	businessName: string
	email?: string
	phone: string
	description?: string
}

const ExecutorRegister = () => {
	const { user, isLoading } = useUserProfile()
	const { createProvider } = useProvider()

	const [location, setLocation] = useState<LocationData | null>(null)

	const validationSchema: Yup.ObjectSchema<FormData> = Yup.object().shape({
		type: Yup.mixed<ProviderType>().required('Тип акаунту є обовʼязковим'),
		businessName: Yup.string().required('Назва є обовʼязковою'),
		email: Yup.string().email('Некоректний email').optional(),
		phone: Yup.string().required('Телефон є обовʼязковим'),
		description: Yup.string()
			.optional()
			.max(500, 'Опис не може бути більше 500 символів'),
	})

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isValid, isSubmitting },
	} = useForm<FormData>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			type: ProviderType.INDIVIDUAL,
			businessName: `${user?.lastName} ${user?.firstName}` || '',
			email: '',
			description: '',
			phone: phoneMask(user?.phone || ''),
		},
	})

	const watchedType = watch('type')

	const onSubmit = handleSubmit(async (data: FormData) => {
		try {
			await createProvider({
				type: data.type,
				business_name: data.businessName,
				email: data.email,
				phone: data.phone,
				description: data.description,
			})
		} catch (error) {
			console.error(error)
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

					<div
						className={cn(
							'border-2 border-gray-200 rounded-lg p-4 cursor-pointer text-center relative transition-all hover:border-primary hover:shadow-md hover:translate-y-[-2px]',
							watchedType === ProviderType.COMPANY &&
								'border-primary bg-primary/10'
						)}
						onClick={() => setValue('type', ProviderType.COMPANY)}
					>
						<input
							type='radio'
							{...register('type')}
							value={ProviderType.COMPANY}
							className='hidden'
						/>
						{watchedType === ProviderType.COMPANY && (
							<Badge variant='success' className='absolute top-2 right-2'>
								Обраний
							</Badge>
						)}
						<div className='account-type-icon'>🏢</div>
						<div className='account-type-title'>Компанія</div>
						<div className='account-type-desc'>
							Організація або команда, що надає професійні послуги
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
					<Input {...register('email')} type='email' label='Email' />

					<InputPhone
						value={watch('phone')}
						onChange={value => setValue('phone', value)}
						label='Телефон'
						required
					/>
				</div>

				<div className='space-y-2 mb-4'>
					<label className='text-base font-semibold text-gray-700 leading-none select-none'>
						Про себе
					</label>
					<Textarea
						{...register('description')}
						placeholder='Розкажіть про свій досвід, навички та підхід до роботи...'
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
					disabled={!isValid || isSubmitting}
					type='submit'
					loading={isLoading}
					size='md'
				>
					Зареєструватися як виконавець
				</Button>
			</form>
		</motion.section>
	)
}

export default ExecutorRegister
