import { normalizePhone, validatePhone } from '@/utils/phoneUtils'
import { generateSecureCode } from '@/utils/codeGenerator'
import { turboSmsService } from '../turboSmsService'

class AuthController {
	async sendCode(phone: string) {
		let error = null
		try {
			if (!phone) {
				error = 'phone_is_required'
				return { error }
			}

			if (!validatePhone(phone)) {
				error = 'phone_is_invalid'
				return { error }
			}

			const normalizedPhone = normalizePhone(phone)

			const code = generateSecureCode(4)

			const codeExpiresMinutes = Number(process.env.CODE_EXPIRES_MINUTES) || 5
			const expiresAt = new Date(Date.now() + codeExpiresMinutes * 60 * 1000)

			let smsResult = null
			//let smsLog = null

			const message = `Ваш код для входу в систему: ${code}.`
			smsResult = await turboSmsService.sendSMS(normalizedPhone, message)

			return {
				...smsResult,
				error,
				normalizedPhone,
				code,
				expiresAt,
			}
		} catch (error) {
			throw error
		}
	}
}

export const authController = new AuthController()
