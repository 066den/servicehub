import { UserProfile } from '@/types/auth'

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
}

export interface AuthActions {
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

	// avatar actions
	uploadAvatar: (file: File) => Promise<void>
	removeAvatar: () => Promise<void>

	// initialize
	initialize: (sessionStatus?: 'authenticated' | 'unauthenticated' | 'loading') => Promise<void>
}

export interface AuthStore extends AuthState {
	actions: AuthActions
}
