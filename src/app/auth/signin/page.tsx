'use client'
import { useEffect, Suspense } from 'react'
import PhoneForm from '@/components/auth/PhoneForm'
import SmsForm from '@/components/auth/SmsForm'
import { useAuthStore } from '@/stores/auth/authStore'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

const SignInContent = () => {
	const { status, data: session } = useSession()
	const { step } = useAuthStore()
	const router = useRouter()
	const searchParams = useSearchParams()

	useEffect(() => {
		if (
			status === 'authenticated' &&
			session?.user?.id &&
			session.user.isVerified
		) {
			// Получаем callbackUrl из query параметров или используем профиль по умолчанию
			const callbackUrl = searchParams.get('callbackUrl')
			const redirectUrl = callbackUrl
				? decodeURIComponent(callbackUrl)
				: ROUTES.PROFILE
			router.push(redirectUrl)
		}
	}, [status, session, router, searchParams])

	return (
		<div className='container'>
			{step === 'code' ? <SmsForm /> : <PhoneForm />}
		</div>
	)
}

const SignInPage = () => {
	return (
		<Suspense
			fallback={
				<div className='container'>
					<PhoneForm />
				</div>
			}
		>
			<SignInContent />
		</Suspense>
	)
}

export default SignInPage
