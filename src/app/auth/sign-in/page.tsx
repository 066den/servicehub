'use client'
import { useState } from 'react'
import PhoneForm from '@/components/auth/PhoneForm'
import SmsForm from '@/components/auth/SmsForm'

export type SendResult = {
	success?: boolean
	normalizedPhone?: string
	code?: string
	expiresAt?: string
	status?: string
	testMode?: boolean
}

const SignInPage = () => {
	const [sendResult, setSendResult] = useState<SendResult | null>(null)

	return (
		<div className='form-container'>
			{!sendResult?.success ? (
				<PhoneForm setSendResult={setSendResult} />
			) : (
				<SmsForm sendResult={sendResult} setSendResult={setSendResult} />
			)}
		</div>
	)
}

export default SignInPage
