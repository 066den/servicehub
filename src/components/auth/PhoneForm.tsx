'use client'

import { Field, Form, Formik } from 'formik'
import { useTranslations } from 'next-intl'
import * as Yup from 'yup'
import InputPhone from '../ui/inputs/InputPhone'
import Button from '../ui/Button'
import Link from 'next/link'
import { SendResult } from '@/app/auth/sign-in/page'
import { sendCode } from '@/services/methods/auth'
import { motion } from 'framer-motion'

const initialValues = {
	phone: '',
}

type Props = {
	setSendResult: (sendResult: SendResult) => void
}

const PhoneForm = ({ setSendResult }: Props) => {
	const t = useTranslations('Auth')
	const tMain = useTranslations()

	const validationSchema = Yup.object().shape({
		phone: Yup.string()
			.required(t('phoneForm.phoneRequired'))
			.matches(/^\d{10}$/, t('phoneForm.phoneFormat')),
	})

	const onSubmit = async (values: typeof initialValues) => {
		const result = await sendCode(values.phone)
		console.log(values, result)
		setSendResult(result)
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<h2 className='form-title'>{t('phoneForm.title')}</h2>
			<p className='form-subtitle'>{t('phoneForm.subtitle')}</p>
			<div className='error-message' id='phone-error'></div>
			<div className='success-message' id='phone-success'></div>

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
							{t('phoneForm.info')}
						</div>
						<Button
							fullWidth
							size='md'
							type='submit'
							disabled={isSubmitting || !isValid || !dirty}
							className='mt-3 mb-4'
						>
							{t('phoneForm.getCode')}
						</Button>
						<div className='form-footer'>
							{t('phoneForm.termsInfo', { action: t('phoneForm.getCode') })}{' '}
							<Link href='#'>{t('phoneForm.terms')}</Link> {tMain('And')}{' '}
							<Link href='#'>{t('phoneForm.privacy')}</Link>.
						</div>
					</Form>
				)}
			</Formik>
		</motion.div>
	)
}

export default PhoneForm
