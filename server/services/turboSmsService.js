require('dotenv').config()
const axios = require('axios')
const i18n = require('../utils/i18n')

class TurboSMSService {
	constructor() {
		this.baseUrl = 'https://api.turbosms.ua'
		this.token = process.env.TURBOSMS_TOKEN
		this.sender = process.env.TURBOSMS_SENDER || 'InfoSMS'
		this.testMode = process.env.TURBOSMS_TEST_MODE === 'true'

		if (!this.token) {
			throw new Error('TURBOSMS_TOKEN не указан в .env файле')
		}
	}

	// Отправка SMS
	async sendSMS(phone, message) {
		try {
			if (this.testMode) {
				console.log(`[TEST MODE] SMS to ${phone}: ${message}`)
				return {
					success: true,
					messageId: 'test_' + Date.now(),
					status: 'sent',
					cost: 0.5,
					testMode: true,
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
				},
				timeout: 10000, // 10 секунд таймаут
			}

			console.log(`Отправка SMS через TurboSMS на ${phone}`)
			const response = await axios.post(url, data, config)

			if (response.data.success) {
				const result = response.data.result[0]

				console.log(
					`SMS успешно отправлена. ID: ${result.message_id}, Стоимость: ${result.cost} грн`
				)

				return {
					success: true,
					messageId: result.message_id,
					status: result.status || 'sent',
					cost: parseFloat(result.cost),
					phone: result.phone,
					testMode: false,
				}
			} else {
				throw new Error(
					`TurboSMS API error: ${response.data.message || 'Unknown error'}`
				)
			}
		} catch (error) {
			console.error('Ошибка отправки SMS через TurboSMS:', error)

			if (error.response) {
				const errorData = error.response.data
				throw new Error(
					`TurboSMS error: ${
						errorData.message || errorData.error || 'API error'
					}`
				)
			} else if (error.request) {
				throw new Error('Нет ответа от TurboSMS API')
			} else {
				throw error
			}
		}
	}

	// Проверка баланса
	async checkBalance() {
		try {
			if (!this.testMode) {
				const url = `${this.baseUrl}/user/balance.json`
				const config = {
					headers: {
						Authorization: `Bearer ${this.token}`,
					},
				}

				const response = await axios.get(url, config)
				const result = response.data.response_result
				if (result && result.balance) {
					const balance = parseFloat(result.balance)
					const limit = parseFloat(process.env.TURBOSMS_BALANCE_LIMIT || 5.0)

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
			} else {
				console.log('⚠️ TurboSMS в тестовом режиме')
			}
		} catch (error) {
			console.error('Ошибка проверки баланса:', error)
			throw error
		}
	}

	// Получение статуса SMS
	async getMessageStatus(messageId) {
		try {
			const url = `${this.baseUrl}/message/status.json`

			const data = {
				messages: [messageId],
			}

			const config = {
				headers: {
					Authorization: `Bearer ${this.token}`,
					'Content-Type': 'application/json',
				},
			}

			const response = await axios.post(url, data, config)

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
	validateConfig(req, res, next) {
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

		next()
	}
}

module.exports = new TurboSMSService()
