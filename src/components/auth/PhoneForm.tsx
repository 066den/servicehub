'use client'

import { useTranslations } from 'next-intl'
import InputPhone, { VALID_PHONE_PATTERN } from '../ui/forms/InputPhone'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import Notification from '../ui/Notification'
import { containerVariants } from '../ui/animate/variants'
import { Button } from '../ui/button'
import { useForm, useController } from 'react-hook-form'
import { Smartphone } from 'lucide-react'
import { useUserProfile } from '@/stores/auth/useUserProfile'

type FormData = {
	phone: string
}

const PhoneForm = () => {
	const t = useTranslations()
	const { error, isLoading, setPhone, sendCode } = useUserProfile()
	const {
		control,
		handleSubmit,
		formState: { isValid },
	} = useForm<FormData>()

	const {
		field: { onChange, onBlur, value, name },
	} = useController({
		name: 'phone',
		control,
		rules: {
			required: t('Form.phoneRequired'),
			pattern: {
				value: VALID_PHONE_PATTERN,
				message: 'phoneInvalid',
			},
		},
	})
	const tMain = useTranslations()

	const onSubmit = handleSubmit(async (data: FormData) => {
		setPhone(data.phone)
		await sendCode(data.phone)
	})

	return (
		<motion.div
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			exit='hidden'
		>
			<h2 className='text-3xl font-bold text-primary-dark text-center mb-2'>
				{t('Auth.phoneForm.title')}
			</h2>
			<p className='text-md text-secondary-foreground text-center mb-6'>
				{t('Auth.phoneForm.subtitle')}
			</p>
			<AnimatePresence>
				{error && <Notification message={t('Error.' + error)} type='error' />}
			</AnimatePresence>

			<form onSubmit={onSubmit}>
				<InputPhone
					label={t('Auth.phoneForm.phone')}
					required
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					name={name}
				/>

				<div className='flex items-center gap-2 text-primary bg-primary-light/5 rounded-md py-3 px-4 mb-4 text-sm border-l-4 border-primary mt-6'>
					<Smartphone />
					{t('Auth.phoneForm.info')}
				</div>

				<Button
					size='lg'
					fullWidth
					type='submit'
					disabled={!isValid}
					loading={isLoading}
					className='mt-6 mb-4'
				>
					{t('Auth.phoneForm.getCode')}
				</Button>
			</form>
			<div className='text-center'>
				<div className='text-xs text-muted-foreground leading-relaxed'>
					{t('Auth.phoneForm.termsInfo', {
						action: t('Auth.smsForm.confirm'),
					})}{' '}
					<Link href='#' className='text-primary hover:underline'>
						{t('Auth.phoneForm.terms')}
					</Link>{' '}
					{tMain('And')}{' '}
					<Link href='#' className='text-primary hover:underline'>
						{t('Auth.phoneForm.privacy')}
					</Link>
				</div>
			</div>
		</motion.div>
	)
}

export default PhoneForm
