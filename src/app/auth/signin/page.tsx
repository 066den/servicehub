'use client'
import { useEffect } from 'react'
import PhoneForm from '@/components/auth/PhoneForm'
import SmsForm from '@/components/auth/SmsForm'
import { useAuthStore } from '@/stores/authStore'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

const SignInPage = () => {
	const { status, data: session } = useSession()
	const { step } = useAuthStore()
	const router = useRouter()

	useEffect(() => {
		if (
			status === 'authenticated' &&
			session?.user?.id &&
			session.user.isVerified
		) {
			router.push(ROUTES.PROFILE)
		}
	}, [status, session, router])

	return (
		<div className='container'>
			{step === 'code' ? <SmsForm /> : <PhoneForm />}
		</div>
	)
}

export default SignInPage
