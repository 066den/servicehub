'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import PlacesAutocomplete from '@/components/ui/forms/PlacesAutocomplete'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import { phoneMask } from '@/utils/phoneNumber'
import { LocationData } from '@/types'
import { containerVariants } from '@/components/ui/animate/variants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	SkeletonForm,
	SkeletonProfileHero,
	SkeletonSectionHeader,
} from '@/components/ui/sceletons'
import { toast } from 'sonner'
import ProfileHero from '@/components/profile/ProfileHero'

type FormData = {
	firstName: string
	lastName?: string
	phone: string
}

const ProfilePage = () => {
	const t = useTranslations()

	const { user, updateUser, isLoading, userLocation } = useUserProfile()
	const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
		null
	)

	const validationSchema = Yup.object({
		firstName: Yup.string().required(t('Form.firstNameRequired')),
		phone: Yup.string().required(),
	})

	const {
		register,
		reset,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<FormData>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			firstName: user?.firstName || '',
			lastName: user?.lastName || '',
			phone: phoneMask(user?.phoneNormalized || ''),
		},
	})

	const onSubmit = handleSubmit(async (values: FormData) => {
		try {
			await updateUser({
				firstName: values.firstName,
				lastName: values.lastName,
				...(selectedLocation && { location: selectedLocation }),
			})
			toast.success(t('Notification.profile_updated'))
		} catch (error) {
			if (error instanceof Error) {
				toast.error(t('Notification.profile_update_error'))
			}
		}
	})

	useEffect(() => {
		if (user) {
			reset({
				firstName: user.firstName,
				lastName: user.lastName,
				phone: phoneMask(user.phoneNormalized || ''),
			})
		}
	}, [reset, user, userLocation])

	if (isLoading)
		return (
			<div className='px-6 py-2'>
				<SkeletonSectionHeader />
				<SkeletonProfileHero />
				<SkeletonForm count={2} />
			</div>
		)

	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='px-6 py-2'
		>
			<div className='flex justify-between items-center mb-6 border-b border-gray-200 pb-4'>
				<div>
					<h1 className='text-3xl font-bold mb-2'>{t('Profile.title')}</h1>
					<p className='text-secondary-foreground'>{t('Profile.subtitle')}</p>
				</div>
			</div>

			<ProfileHero />

			<form onSubmit={onSubmit}>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Input
						label={t('Form.firstName')}
						placeholder={t('Form.firstNamePlaceholder')}
						{...register('firstName')}
						required
						error={!!errors.firstName}
						errorMessage={errors.firstName?.message}
					/>

					<Input
						label={t('Form.lastName')}
						placeholder={t('Form.lastNamePlaceholder')}
						{...register('lastName')}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<PlacesAutocomplete
						location={userLocation}
						label={t('Form.city')}
						helperText={`${t('chooseLocation')}. ${t('chooseLocationHelper')}`}
						onLocationSelect={setSelectedLocation}
						types={['(cities)']}
					/>

					<Input
						label={t('Form.phone')}
						placeholder={t('Form.phonePlaceholder')}
						{...register('phone', { required: t('Form.phoneRequired') })}
						disabled
						helperText={t('Form.phoneDisabled')}
					/>
				</div>
				<Button type='submit' size='lg' disabled={!isValid}>
					{t('Profile.save')}
				</Button>
			</form>
		</motion.section>
	)
}

export default ProfilePage
