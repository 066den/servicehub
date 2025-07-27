'use client'

import { Field, Form, Formik } from 'formik'
import { useTranslations } from 'next-intl'
import * as Yup from 'yup'
import InputPhone from '../ui/inputs/InputPhone'
import Button from '../ui/Button'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'

import Notification from '../ui/Notification'
import { containerVariants } from '../ui/animate/variants'
import { useAuthStore } from '@/stores/authStore'

const initialValues = {
	phone: '',
}

const PhoneForm = () => {
	const t = useTranslations()
	const { setPhone, sendCode, error } = useAuthStore()
	const tMain = useTranslations()

	const validationSchema = Yup.object().shape({
		phone: Yup.string()
			.required(t('Form.phoneRequired'))
			.matches(/^\d{10}$/, t('Form.phoneFormat')),
	})

	const onSubmit = async (values: typeof initialValues) => {
		setPhone(values.phone)
		await sendCode(values.phone)
	}

	return (
		<motion.div
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			exit='hidden'
		>
			<h2 className='form-title'>{t('Auth.phoneForm.title')}</h2>
			<p className='form-subtitle'>{t('Auth.phoneForm.subtitle')}</p>
			<AnimatePresence>
				{error && <Notification message={t('Error.' + error)} type='error' />}
			</AnimatePresence>

			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={onSubmit}
			>
				{({ isValid, dirty, isSubmitting }) => (
					<Form>
						<Field component={InputPhone} name='phone' autoComplete='off' />
						<div className='info-message'>
							<span>📱</span>
							{t('Auth.phoneForm.info')}
						</div>

						<Button
							fullWidth
							color='primary'
							size='md'
							type='submit'
							disabled={isSubmitting || !isValid || !dirty}
							className='mt-3 mb-4'
						>
							{t('Auth.phoneForm.getCode')}
						</Button>
						<div className='form-footer'>
							{t('Auth.phoneForm.termsInfo', {
								action: t('Auth.phoneForm.getCode'),
							})}
							<Link href='#'>{t('Auth.phoneForm.terms')}</Link> {tMain('And')}{' '}
							<Link href='#'>{t('Auth.phoneForm.privacy')}</Link>.
						</div>
					</Form>
				)}
			</Formik>
		</motion.div>
	)
}

export default PhoneForm
