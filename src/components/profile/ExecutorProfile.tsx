'use client'

import { useEffect } from 'react'
import { useProvider } from '@/hooks/storeHooks/useProvider'
import ExecutorRegister from './ExecutorRegister'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { useTranslations } from 'next-intl'
import ExecutorProfileHero from './ExecutorProfileHero'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateProviderSchema, updateProviderSchema } from '@/lib/schemas'
import { ProviderType } from '@prisma/client'
import { Input } from '../ui/input'
import InputPhone from '../ui/forms/InputPhone'
import { Textarea } from '../ui/textarea'
import PlacesAutocomplete from '../ui/forms/PlacesAutocomplete'
import Map from '../common/Map'
import type { LocationData } from '@/types'
import { useUserProfile } from '@/hooks/storeHooks/useUserProfile'
import {
	SkeletonForm,
	SkeletonProfileHero,
	SkeletonSectionHeader,
} from '../ui/sceletons'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { toast } from 'sonner'

const ExecutorProfile = () => {
	const { provider, isLoadingProvider, updateProvider } = useProvider()
	const { userLocation, isLoading } = useUserProfile()

	const t = useTranslations()

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		trigger,
		reset,
		formState: { errors, isValid },
	} = useForm<UpdateProviderSchema>({
		resolver: zodResolver(updateProviderSchema),
		defaultValues: {
			businessName: provider?.businessName ?? '',
			description: provider?.description ?? '',
			phone: provider?.phone ?? '',
			email: provider?.email ?? '',
			location: provider?.location ?? userLocation ?? undefined,
		},
	})

	useEffect(() => {
		if (!provider) {
			return
		}

		reset({
			businessName: provider.businessName ?? '',
			description: provider.description ?? '',
			phone: provider.phone ?? '',
			email: provider.email ?? '',
			location: provider.location ?? userLocation ?? undefined,
		})
	}, [provider, reset, userLocation])

	const watchedLocation = watch('location') as LocationData | undefined
	const onSubmit = handleSubmit(async (data: UpdateProviderSchema) => {
		const payload: UpdateProviderSchema = {
			businessName: data.businessName.trim(),
			description: data.description || undefined,
			phone: data.phone,
			email: data.email || undefined,
			location: data.location,
		}

		try {
			await updateProvider(payload)
			toast.success('Профіль виконавця успішно оновлено')
		} catch (error) {
			if (error instanceof Error) {
				toast.error(error.message)
			}
			toast.error('Помилка при оновленні профіля виконавця')
		}
	})

	if (isLoading) {
		return (
			<div className='px-6 py-2 space-y-6'>
				<SkeletonSectionHeader />
				<SkeletonProfileHero />
				<SkeletonForm count={4} />
				<Skeleton className='h-[300px] w-full rounded-lg' />
			</div>
		)
	}

	if (!provider) {
		return <ExecutorRegister />
	}

	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='px-6 py-2'
		>
			<div className='flex justify-between items-center mb-6 border-b border-gray-200 pb-4'>
				<div>
					<h1 className='text-3xl font-bold mb-2'>
						{t('Profile.executorTitle')}
					</h1>
					<p className='text-secondary-foreground'>
						{t('Profile.executorSubtitle')}
					</p>
				</div>
			</div>
			<ExecutorProfileHero />
			<form onSubmit={onSubmit}>
				<Input
					{...register('businessName')}
					label={
						provider?.type === ProviderType.COMPANY
							? 'Назва компанії'
							: 'Імʼя виконавця'
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
						errorMessage={errors.email?.message}
					/>
					<InputPhone
						value={watch('phone')}
						onChange={value =>
							setValue('phone', value, { shouldValidate: true })
						}
						onBlur={() => trigger('phone')}
						label='Телефон'
						required
						error={errors.phone?.message}
					/>
				</div>
				<div className='space-y-2 mb-4'>
					<label className='text-base font-semibold text-gray-700 leading-none select-none'>
						Спеціалізація
					</label>
					<Textarea
						{...register('description')}
						placeholder='Розкажіть про свої навички та спеціалізацію...'
					/>
					<div className='text-sm text-gray-500'>
						Опис допоможе клієнтам краще зрозуміти ваші можливості
					</div>
				</div>
				<PlacesAutocomplete
					location={watchedLocation ?? userLocation ?? undefined}
					onLocationSelect={selected => {
						setValue('location', selected, {
							shouldDirty: true,
							shouldValidate: true,
						})
					}}
					label='Адреса'
					placeholder='Почніть вводити адресу...'
					types={['address']}
				/>

				<div className='mb-4 mt-4'>
					<Map
						center={watchedLocation?.coordinates || userLocation?.coordinates}
						height={300}
						zoom={15}
					/>
				</div>
				<Button
					type='submit'
					size='lg'
					loading={isLoadingProvider}
					disabled={!isValid}
				>
					{t('Profile.save')}
				</Button>
			</form>
		</motion.section>
	)
}

export default ExecutorProfile
