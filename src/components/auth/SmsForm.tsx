'use client'
import { useRef } from 'react'
import { Formik, FormikProps } from 'formik'
import { Field, Form } from 'formik'
import { useTranslations } from 'next-intl'
import * as Yup from 'yup'
import Button from '../ui/Button'
import Link from 'next/link'
import CodeDigits from '../ui/inputs/CodeDigits'
import Input from '../ui/inputs/Input'
import { formatPhoneNumber } from '@/utils/phoneNumber'
import { AnimatePresence, motion } from 'framer-motion'
import { containerVariants } from '../ui/animate/variants'
import { useAuthStore } from '@/stores/authStore'
import { useSession } from 'next-auth/react'
import Notification from '../ui/Notification'
import { useResendTimer } from '@/hooks/useResendTimer'

const initialValues = {
	code: '',
	firstName: '',
	lastName: '',
}

const SmsForm = () => {
	const t = useTranslations()

	const tMain = useTranslations()
	const formikRef = useRef<FormikProps<typeof initialValues>>(null)
	const { setStep, verifyCode, error, isLoading, clearError } = useAuthStore()
	const { canResend, formattedTime, resendCode } = useResendTimer()
	const { data: session } = useSession()

	const isRegistered = session?.user?.id && session?.user?.id > 0

	const validationSchema = Yup.object().shape({
		firstName: Yup.string().when([], {
			is: () => isRegistered,
			then: schema => schema.notRequired(),
			otherwise: schema => schema.required(t('Form.firstNameRequired')),
		}),
		code: Yup.string()
			.matches(/^\d{4}$/, t('Auth.smsForm.codeInvalid'))
			.required(t('Form.codeRequired')),
	})

	const onSubmit = (values: typeof initialValues) => {
		verifyCode(values.code, values.firstName, values.lastName)
	}

	const handleResendCode = async () => {
		formikRef.current?.setFieldValue('code', '')
		try {
			clearError()
			await resendCode()
		} catch (error) {
			console.error('Ошибка повторной отправки:', error)
		}
	}

	return (
		<motion.div
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			exit='hidden'
		>
			<Button className='back-button' onClick={() => setStep('phone')} isLink>
				← {t('Auth.phoneForm.back')}
			</Button>
			<h2 className='form-title'>{t('Auth.smsForm.title')}</h2>
			<p className='form-subtitle'>
				{t('Auth.smsForm.subtitle')}
				<br />
				<strong>
					{formatPhoneNumber(session?.user.phoneNormalized || '')}
				</strong>
			</p>

			<AnimatePresence>
				{error && <Notification message={t('Error.' + error)} type='error' />}
			</AnimatePresence>

			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={onSubmit}
			>
				{({ isValid, dirty, isSubmitting, errors }) => (
					<Form>
						{session && !isRegistered && (
							<>
								<Field
									component={Input}
									name='firstName'
									label={t('Form.firstName')}
									placeholder={t('Form.firstName')}
									errorMessage={errors.firstName}
									className={errors.firstName ? 'error' : ''}
								/>
								<Field
									component={Input}
									name='lastName'
									label={t('Form.lastName')}
									placeholder={t('Form.lastName')}
								/>
							</>
						)}
						<Field component={CodeDigits} name='code' />

						<div className='resend-timer'>
							{canResend ? (
								<Button isText onClick={handleResendCode}>
									{t('Auth.smsForm.resend')}
								</Button>
							) : (
								<>
									{t('Auth.smsForm.resendTimer')} <span>{formattedTime}</span>{' '}
									сек
								</>
							)}
						</div>
						<Button
							fullWidth
							color='primary'
							size='md'
							type='submit'
							disabled={isSubmitting || !isValid || !dirty}
							loading={isLoading}
							className='mt-3 mb-4'
						>
							{t('Auth.smsForm.confirm')}
						</Button>
						<div className='form-footer'>
							{t('Auth.phoneForm.termsInfo', {
								action: t('Auth.smsForm.confirm'),
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

export default SmsForm
