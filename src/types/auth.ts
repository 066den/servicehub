import { EStatus, LocationData } from '.'
import { ProviderType, Role } from '@prisma/client'
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
	isInitialized: boolean
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

	resendCountdown: number
	canResend: boolean
	resendAttempts: number
	lastCodeSentAt: number

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
	updateUser: (updates: Partial<UserProfile>) => Promise<void>
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
	location?: LocationData
	role?: Role
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

export interface Provider {
	type: ProviderType
	business_name?: string
	company_info?: CompanyInfo
	first_name?: string
	last_name?: string
	email?: string
	phone?: string
}

export interface CompanyInfo {
	legal_name: string
	registration_number?: string
	tax_number?: string
	legal_address?: string
}
