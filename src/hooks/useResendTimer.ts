import { useUserProfile } from '@/stores/auth/useUserProfile'

export const useResendTimer = () => {
	const {
		resendCountdown,
		canResend,
		resendAttempts,
		canResendCode,
		startResendTimer,
		stopResendTimer,
		resetResendTimer,
		sendCode,
		phone,
	} = useUserProfile()

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins}:${secs.toString().padStart(2, '0')}`
	}

	const resendCode = async () => {
		if (!canResendCode()) {
			throw new Error('Подождите перед повторной отправкой')
		}

		if (!phone) {
			throw new Error('Номер телефона не указан')
		}

		await sendCode(phone)
	}

	return {
		countdown: resendCountdown,
		canResend: canResend && canResendCode(),
		attempts: resendAttempts,
		formattedTime: formatTime(resendCountdown),

		// Методы
		resendCode,
		startTimer: startResendTimer,
		stopTimer: stopResendTimer,
		resetTimer: resetResendTimer,
	}
}
