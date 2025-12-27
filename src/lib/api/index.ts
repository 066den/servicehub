import { getSession } from 'next-auth/react'

export class ApiError extends Error {
	constructor(
		message: string,
		public statusCode: number,
		public code?: string
	) {
		super(message)
		this.name = 'ApiError'
	}
}

export async function apiRequest<T>(
	url: string,
	options: RequestInit = {}
): Promise<T> {
	try {
		const response = await fetch(url, {
			headers: {
				...options.headers,
			},
			...options,
		})

		// Check if response is HTML (error page) instead of JSON
		const contentType = response.headers.get('content-type')
		if (contentType && !contentType.includes('application/json')) {
			await response.text()
			throw new ApiError(
				'Server returned HTML instead of JSON. This usually indicates a server error.',
				response.status,
				'INVALID_RESPONSE_TYPE'
			)
		}

		const data = await response.json()
		if (!response.ok) {
			throw new ApiError(
				data.error || data.message || 'Request failed',
				response.status,
				data.code
			)
		}
		return data
	} catch (error) {
		if (error instanceof ApiError) {
			throw error
		}
		// Handle JSON parsing errors specifically
		if (error instanceof SyntaxError && error.message.includes('JSON')) {
			throw new ApiError(
				'Invalid JSON response from server. This usually indicates a server error.',
				0,
				'INVALID_JSON'
			)
		}
		throw new ApiError('Network error', 0, 'NETWORK_ERROR')
	}
}

export async function apiRequestAuth<T>(
	url: string,
	options: RequestInit = {}
): Promise<T> {
	const session = await getSession()
	if (!session?.accessToken) {
		throw new Error('Not access token')
	}

	// Если body является FormData, не устанавливаем Content-Type,
	// чтобы браузер мог автоматически установить правильный Content-Type с boundary
	const isFormData = options.body instanceof FormData
	const headers: HeadersInit = {
		...(isFormData ? {} : { 'Content-Type': 'application/json' }),
		...options.headers,
		Authorization: `Bearer ${session.accessToken}`,
	}

	try {
		const response = await fetch(url, {
			headers,
			...options,
		})

		// Check if response is HTML (error page) instead of JSON
		const contentType = response.headers.get('content-type')
		if (contentType && !contentType.includes('application/json')) {
			await response.text()
			throw new ApiError(
				'Server returned HTML instead of JSON. This usually indicates a server error.',
				response.status,
				'INVALID_RESPONSE_TYPE'
			)
		}

		const data = await response.json()
		if (!response.ok) {
			throw new ApiError(
				data.error || data.message || 'Request failed',
				response.status,
				data.code
			)
		}
		return data
	} catch (error) {
		if (error instanceof ApiError) {
			throw error
		}
		// Handle JSON parsing errors specifically
		if (error instanceof SyntaxError && error.message.includes('JSON')) {
			throw new ApiError(
				'Invalid JSON response from server. This usually indicates a server error.',
				0,
				'INVALID_JSON'
			)
		}
		throw new ApiError('Network error', 0, 'NETWORK_ERROR')
	}
}
