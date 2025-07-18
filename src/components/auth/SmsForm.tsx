'use client'

import { Formik } from 'formik'
import { Field, Form } from 'formik'
import { useTranslations } from 'next-intl'
import * as Yup from 'yup'
import Button from '../ui/Button'
import Link from 'next/link'
import CodeDigits from '../ui/inputs/CodeDigits'
import Input from '../ui/inputs/Input'
import { SendResult } from '@/app/auth/sign-in/page'
import { formatPhoneNumber } from '@/utils/phoneNumber'
import { motion } from 'framer-motion'

const initialValues = {
	code: '',
	firstName: '',
}

type Props = {
	sendResult: SendResult
	setSendResult: (sendResult: SendResult) => void
}

const SmsForm = ({ sendResult, setSendResult }: Props) => {
	const t = useTranslations('Auth')
	const tMain = useTranslations()

	const { normalizedPhone } = sendResult

	const validationSchema = Yup.object().shape({
		firstName: Yup.string().required(t('smsForm.firstNameRequired')),
		code: Yup.string().required(t('smsForm.codeRequired')),
	})

	const onSubmit = (values: typeof initialValues) => {
		console.log(values)
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<Button className='back-button' onClick={() => setSendResult({})} isLink>
				← Изменить номер
			</Button>
			<h2 className='form-title'>{t('smsForm.title')}</h2>
			<p className='form-subtitle'>
				{t('smsForm.subtitle')}
				<br />
				<strong>{formatPhoneNumber(normalizedPhone || '')}</strong>
			</p>
			<div className='error-message' id='phone-error'></div>
			<div className='success-message' id='phone-success'></div>

			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={onSubmit}
			>
				{({ isValid, dirty, isSubmitting, errors }) => (
					<Form>
						<Field
							component={Input}
							name='firstName'
							label={t('smsForm.firstName')}
							placeholder={t('smsForm.firstName')}
							errorMessage={errors.firstName}
							className={errors.firstName ? 'error' : ''}
						/>

						<Field
							component={Input}
							name='lastName'
							label={t('smsForm.lastName')}
							placeholder={t('smsForm.lastName')}
						/>
						<Field component={CodeDigits} name='code' />

						<div className='resend-timer'>
							{t('smsForm.resendTimer')} <span id='timer'>60</span> сек
							<br />
							<Button isText onClick={() => {}}>
								{t('smsForm.resend')}
							</Button>
						</div>
						<Button
							fullWidth
							size='md'
							type='submit'
							disabled={isSubmitting || !isValid || !dirty}
							className='mt-3 mb-4'
						>
							{t('smsForm.confirm')}
						</Button>
						<div className='form-footer'>
							{t('phoneForm.termsInfo', { action: t('smsForm.confirm') })}{' '}
							<Link href='#'>{t('phoneForm.terms')}</Link> {tMain('And')}{' '}
							<Link href='#'>{t('phoneForm.privacy')}</Link>.
						</div>
					</Form>
				)}
			</Formik>
		</motion.div>
	)
}

export default SmsForm
