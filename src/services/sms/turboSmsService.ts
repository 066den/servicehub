import axios from 'axios'
import { EStatus } from '@/types'
import { SMSResult } from '@/types/auth'

interface TurboSMSResponse {
	success: boolean
	message?: string
	result?: Array<{
		message_id: string
		phone: string
		status: string
		cost: number
	}>
	error?: string
}

class TurboSMSService {
	private readonly baseUrl: string
	private readonly token: string
	private readonly sender: string
	private readonly testMode: boolean

	constructor() {
		this.baseUrl = process.env.TURBOSMS_BASE_URL || ''
		this.token = process.env.TURBOSMS_TOKEN || ''
		this.sender = process.env.TURBOSMS_SENDER || 'InfoSMS'
		this.testMode = process.env.TURBOSMS_TEST_MODE === 'true'
		if (!this.token && !this.testMode) {
			throw new Error('TURBOSMS_TOKEN не указан в переменных окружения')
		}
	}

	async sendSMS(phone: string, message: string): Promise<SMSResult> {
		try {
			if (this.testMode) {
				console.log(`[TEST MODE] SMS to ${phone}: ${message}`)
				return {
					status: EStatus.sent,
					cost: 0.5,
					provider: 'turbosms-test',
				}
			}

			// Проверка баланса перед отправкой
			await this.checkBalance()

			const url = `${this.baseUrl}/message/send.json`

			const data = {
				recipients: [phone.replace('+', '')],
				sms: {
					sender: this.sender,
					text: message,
				},
			}

			const config = {
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				timeout: 15000, // 15 секунд таймаут
			}

			console.log(`Отправка SMS через TurboSMS на ${phone}`)
			const response = await axios.post<TurboSMSResponse>(url, data, config)

			if (
				response.data.success &&
				response.data.result &&
				response.data.result.length > 0
			) {
				const result = response.data.result[0]

				console.log(
					`SMS успешно отправлена. ID: ${result.message_id}, Стоимость: ${result.cost} грн`
				)

				return {
					status: EStatus.sent,
					cost: result.cost,
					provider: 'turbosms',
				}
			} else {
				throw new Error(
					`TurboSMS API error: ${response.data.message || 'Unknown error'}`
				)
			}
		} catch (error) {
			console.error('Ошибка отправки SMS через TurboSMS:', error)
			if (axios.isAxiosError(error)) {
				if (error.response?.data) {
					const errorData = error.response.data
					throw new Error(
						`TurboSMS error: ${
							errorData.message || errorData.error || 'API error'
						}`
					)
				} else if (error.request) {
					throw new Error('No response from TurboSMS API')
				} else {
					throw new Error('Error setting up request to TurboSMS API')
				}
			}
			if (error instanceof Error) {
				throw new Error(error.message || 'Неизвестная ошибка TurboSMS')
			} else {
				throw new Error('Неизвестная ошибка TurboSMS')
			}
		}
	}

	// Проверка баланса
	async checkBalance() {
		if (this.testMode) {
			return 100
		}

		try {
			const url = `${this.baseUrl}/user/balance.json`

			const config = {
				headers: {
					Authorization: `Bearer ${this.token}`,
					Accept: 'application/json',
				},
				timeout: 10000,
			}

			const response = await axios.get<{
				success: boolean
				result?: { balance: string }
				message?: string
			}>(url, config)

			if (response.data.success && response.data.result) {
				const result = response.data.result
				const balance = parseFloat(result.balance)
				const limit = parseFloat(process.env.TURBOSMS_BALANCE_LIMIT ?? '5.0')

				console.log(`Баланс TurboSMS: ${balance} грн`)

				if (balance < limit) {
					throw new Error(
						`Недостаточно средств на балансе TurboSMS. Текущий баланс: ${balance} грн`
					)
				}

				return balance
			} else {
				throw new Error('Не удалось получить баланс TurboSMS')
			}
		} catch (error) {
			console.error('Ошибка проверки баланса:', error)
			throw error
		}
	}

	// Получение статуса SMS
	async getMessageStatus(
		messageId: string
	): Promise<{ status: string; delivered_at?: string; error?: string }> {
		if (this.testMode) {
			return {
				status: 'sent',
				delivered_at: new Date().toISOString(),
			}
		}

		try {
			const url = `${this.baseUrl}/message/status.json`

			const config = {
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
			}

			const response = await axios.post(
				url,
				{
					messages: [messageId],
				},
				config
			)

			if (response.data.success && response.data.result.length > 0) {
				return response.data.result[0]
			} else {
				throw new Error('Сообщение не найдено')
			}
		} catch (error) {
			console.error('Ошибка получения статуса SMS:', error)
			throw error
		}
	}

	// Получение списка отправителей
	async getSenders() {
		try {
			const url = `${this.baseUrl}/user/senders.json`

			const config = {
				headers: {
					Authorization: `Bearer ${this.token}`,
				},
			}

			const response = await axios.get(url, config)

			if (response.data.success) {
				return response.data.result
			} else {
				throw new Error('Не удалось получить список отправителей')
			}
		} catch (error) {
			console.error('Ошибка получения отправителей:', error)
			throw error
		}
	}

	// Валидация настроек
	validateConfig() {
		const errors = []

		if (!this.token) {
			errors.push('TURBOSMS_TOKEN не указан')
		}

		if (!this.sender) {
			errors.push('TURBOSMS_SENDER не указан')
		}

		if (errors.length > 0) {
			throw new Error(`Ошибки конфигурации TurboSMS: ${errors.join(', ')}`)
		}
	}

	formatVerificationMessage(
		code: string,
		language: 'uk' | 'ru' = 'uk'
	): string {
		const templates = {
			uk: `Ваш код підтвердження для ServiceHub: ${code}. Дійсний 5 хвилин. Нікому не повідомляйте цей код.`,
			ru: `Ваш код подтверждения для ServiceHub: ${code}. Действителен 5 минут. Никому не сообщайте этот код.`,
		}

		return templates[language]
	}
}

export const turboSmsService = new TurboSMSService()
