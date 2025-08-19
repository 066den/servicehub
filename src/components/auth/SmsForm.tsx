'use client'

import { useState } from 'react'
import { useForm, useController } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { phoneMask } from '@/utils/phoneNumber'
import { AnimatePresence, motion } from 'framer-motion'
import { containerVariants } from '../ui/animate/variants'
import { useAuthStore } from '@/stores/authStore'
import { useSession } from 'next-auth/react'
import Notification from '../ui/Notification'
import { useResendTimer } from '@/hooks/useResendTimer'
import { ArrowLeft, Clock, RefreshCw } from 'lucide-react'
import CodeDigits from '../ui/forms/CodeDigits'

type FormData = {
	code: string
	firstName?: string
	lastName?: string
}

const SmsForm = () => {
	const t = useTranslations()
	const tMain = useTranslations()
	const { setStep, verifyCode, error, clearError, isLoading } = useAuthStore()

	const { canResend, formattedTime, resendCode } = useResendTimer()
	const { data: session } = useSession()
	const [isResending, setIsResending] = useState(false)

	const isRegistered = session?.user?.id && session?.user?.id > 0

	const {
		control,
		handleSubmit,
		formState: { errors, isValid },
		setValue,
	} = useForm<FormData>({
		defaultValues: {
			code: '',
			firstName: '',
			lastName: '',
		},
	})

	// Контроллеры для полей
	const codeController = useController({
		name: 'code',
		control,
		rules: {
			required: t('Form.codeRequired'),
			pattern: {
				value: /^\d{4}$/,
				message: t('Auth.smsForm.codeInvalid'),
			},
		},
	})

	const firstNameController = useController({
		name: 'firstName',
		control,
		rules: {
			required: isRegistered ? false : t('Form.firstNameRequired'),
		},
	})

	const lastNameController = useController({
		name: 'lastName',
		control,
	})

	const onSubmit = handleSubmit(async (data: FormData) => {
		const { code, firstName, lastName } = data
		try {
			await verifyCode(code, firstName, lastName)
		} catch (error) {
			console.error('Ошибка верификации:', error)
		}
	})

	const handleResendCode = async () => {
		if (!canResend || isResending) return

		setValue('code', '')
		setIsResending(true)

		try {
			clearError()
			await resendCode()
		} catch (error) {
			console.error('Ошибка повторной отправки:', error)
		} finally {
			setIsResending(false)
		}
	}

	const handleBack = () => {
		clearError()
		setStep('phone')
	}

	return (
		<motion.div
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			exit='hidden'
			className='w-full max-w-md mx-auto'
		>
			<div className='text-center mb-4'>
				<h2 className='text-3xl font-bold text-primary-dark text-center mb-2'>
					{t('Auth.smsForm.title')}
				</h2>
				<p className='text-md text-secondary-foreground text-center'>
					{t('Auth.smsForm.subtitle')}
				</p>
				<p className='text-md font-bold text-secondary-foreground text-center'>
					{phoneMask(session?.user.phoneNormalized || '')}
				</p>
			</div>

			{/* Error Notification */}
			<AnimatePresence>
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className='mb-6'
					>
						<Notification message={t('Error.' + error)} type='error' />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Form */}

			<form onSubmit={onSubmit} className='space-y-6'>
				{session && !isRegistered && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						className='space-y-4'
					>
						<div className='space-y-2'>
							<Label htmlFor='firstName'>{t('Form.firstName')}</Label>
							<Input
								id='firstName'
								placeholder={t('Form.firstNamePlaceholder')}
								className={errors.firstName ? 'border-destructive' : ''}
								{...firstNameController.field}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='lastName'>{t('Form.lastName')}</Label>
							<Input
								id='lastName'
								placeholder={t('Form.lastNamePlaceholder')}
								className={errors.lastName ? 'border-destructive' : ''}
								{...lastNameController.field}
							/>
						</div>
					</motion.div>
				)}

				{/* SMS Code */}
				<p className='text-center text-muted-foreground'>
					Ваш код: {session?.code}
				</p>
				<CodeDigits
					value={codeController.field.value}
					onChange={codeController.field.onChange}
				/>

				{/* Resend Timer */}
				<div className='flex items-center justify-center'>
					{canResend ? (
						<Button
							variant='outline-secondary'
							size='sm'
							onClick={handleResendCode}
							disabled={isResending}
							className='flex items-center gap-2'
							withoutTransform
						>
							<RefreshCw
								className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`}
							/>
							{isResending
								? t('Auth.smsForm.resending')
								: t('Auth.smsForm.resend')}
						</Button>
					) : (
						<div className='flex items-center gap-2 text-sm text-muted-foreground'>
							<Clock className='w-4 h-4' />
							{t('Auth.smsForm.resendTimer')}
							<span className='font-mono font-medium text-foreground'>
								{formattedTime}
							</span>
							{t('seconds')}
						</div>
					)}
				</div>

				{/* Submit Button */}
				<Button
					type='submit'
					disabled={!isValid}
					loading={isLoading}
					fullWidth
					size='lg'
				>
					{t('Auth.smsForm.confirm')}
				</Button>
			</form>

			{/* Footer */}
			<div className='mt-6 text-center'>
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

			{/* Back Button */}
			<Button
				variant='ghost'
				size='sm'
				onClick={handleBack}
				className='absolute top-6 left-6 flex items-center gap-2'
				type='button'
			>
				<ArrowLeft className='w-4 h-4' />
				{t('Auth.phoneForm.back')}
			</Button>
		</motion.div>
	)
}

export default SmsForm
