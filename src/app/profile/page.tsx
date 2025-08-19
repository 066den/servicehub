'use client'

import Input from '@/components/ui/forms/Input'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import PlacesAutocomplete from '@/components/ui/forms/PlacesAutocomplete'
import { useUserProfile } from '@/hooks/storeHooks/useUserProfile'
import { phoneMask } from '@/utils/phoneNumber'
import { LocationData } from '@/types'
import { useState } from 'react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { containerVariants } from '@/components/ui/animate/variants'
import { Button } from '@/components/ui/button'

const ProfilePage = () => {
	const t = useTranslations()

	const { user, updateUser, isLoading } = useUserProfile()
	const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
		null
	)

	const initialValues = {
		firstName: user?.firstName || '',
		lastName: user?.lastName || '',
		phone: phoneMask(user?.phoneNormalized || ''),
	}

	const validationSchema = Yup.object().shape({
		firstName: Yup.string().required(t('Form.firstNameRequired')),
	})

	const onSubmit = (values: typeof initialValues) => {
		updateUser({
			firstName: values.firstName,
			lastName: values.lastName,
			...(selectedLocation && { location: selectedLocation }),
		})
	}

	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='content-section'
		>
			{!isLoading ? (
				<>
					<div className='section-header'>
						<div>
							<h1 className='section-title'>{t('Profile.title')}</h1>
							<p className='section-subtitle'>{t('Profile.subtitle')}</p>
						</div>
					</div>
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={onSubmit}
					>
						{({ isValid, dirty, isSubmitting }) => (
							<Form className='profile-form'>
								<div className='form-grid'>
									<Field
										component={Input}
										name='firstName'
										label={t('Form.firstName')}
									/>
									<Field
										component={Input}
										name='lastName'
										label={t('Form.lastName')}
									/>
								</div>
								<div className='form-grid'>
									<PlacesAutocomplete
										label={t('Form.city')}
										helperText={`${t('chooseLocation')}. ${t(
											'chooseLocationHelper'
										)}`}
										onLocationSelect={setSelectedLocation}
									/>
									<Field
										component={Input}
										name='phone'
										disabled={true}
										label={t('Form.phone')}
										helperText={t('Form.phoneDisabled')}
									/>
								</div>
								<Button
									disabled={
										isSubmitting || !isValid || (!dirty && !selectedLocation)
									}
									type='submit'
									color='primary'
								>
									{t('Profile.save')}
								</Button>
							</Form>
						)}
					</Formik>
				</>
			) : (
				<LoadingSpinner color='primary' size='lg' />
			)}
		</motion.section>
	)
}

export default ProfilePage
