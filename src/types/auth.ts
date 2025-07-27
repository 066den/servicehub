import { EStatus } from '.'

export interface AuthTokens {
	accessToken: string
	refreshToken: string
}

export interface AuthUser {
	id: number
	phone: string
	phoneNormalized: string
	isVerified: boolean
	isActive: boolean
}

export interface LoginResponse {
	success: boolean
	user: AuthUser
	tokens: AuthTokens
	message: string
}

export interface SendCodeResponse {
	success: boolean
	expiresAt: Date
	operator?: string
	cost?: number
	messageId?: string
	testMode?: boolean
	message: string
}

export interface AuthError {
	error: string
	code?: string
}

export interface SMSResult {
	error?: string
	userId?: number
	message?: string
	status?: EStatus
	provider?: string
	cost?: number
}

export interface AuthState {
	// state
	user: UserProfile | null
	isLoading: boolean
	error: string | null

	// SMS flow
	phone: string
	step: 'phone' | 'code' | 'success'
	codeSent: boolean
	codeExpiresAt: Date | null

	// user profile
	isLoadingProfile: boolean
	profileError: string | null
	lastProfileUpdate: number

	// Refresh token logic
	isRefreshing: boolean
	refreshError: string | null

	resendCountdown: number // секунды до разрешения повторной отправки
	canResend: boolean // можно ли отправить код повторно
	resendAttempts: number // количество попыток отправки
	lastCodeSentAt: number // timestamp последней отправки

	// actions
	setPhone: (phone: string) => void
	sendCode: (phone: string) => Promise<void>
	verifyCode: (
		code: string,
		firstName?: string,
		lastName?: string
	) => Promise<void>
	logout: () => Promise<void>
	clearError: () => void
	setStep: (step: 'phone' | 'code' | 'success') => void

	// user profile actions
	fetchUserProfile: (force?: boolean) => Promise<UserProfile | null>
	updateLocalUser: (updates: Partial<UserProfile>) => Promise<void>
	refreshUserProfile: () => Promise<void>

	// Refresh token actions
	refreshSession: () => Promise<boolean>
	handleTokenExpiry: () => Promise<void>

	// timer methods
	startResendTimer: (seconds?: number) => void
	stopResendTimer: () => void
	resetResendTimer: () => void
	canResendCode: () => boolean

	// initialize
	initialize: () => Promise<void>
}
export interface UserProfile {
	id: number
	phone: string
	phoneNormalized: string
	firstName?: string
	lastName?: string
	displayName: string
	isVerified: boolean
	isActive: boolean
	createdAt: string
	updatedAt: string
	lastLoginAt?: string
	activeSessions: number
	activeTokens: number
	stats: {
		totalOrders: number
		completedOrders: number
		totalServices: number
		rating: number
		earnings: number
	}
}
