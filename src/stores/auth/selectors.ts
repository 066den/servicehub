import { AuthStore } from './types'

export const authActionsSelector = (state: AuthStore) => state.actions

export const authUserSelector = (state: AuthStore) => state.user

export const authIsLoadingSelector = (state: AuthStore) => state.isLoading

export const authIsLoadingProfileSelector = (state: AuthStore) =>
	state.isLoadingProfile

export const authProfileErrorSelector = (state: AuthStore) => state.profileError

export const authIsInitializedSelector = (state: AuthStore) =>
	state.isInitialized

export const authIsRefreshingSelector = (state: AuthStore) => state.isRefreshing

export const authPhoneSelector = (state: AuthStore) => state.phone

export const authResendCountdownSelector = (state: AuthStore) =>
	state.resendCountdown

export const authCanResendSelector = (state: AuthStore) => state.canResend

export const authResendAttemptsSelector = (state: AuthStore) =>
	state.resendAttempts

export const authLastCodeSentAtSelector = (state: AuthStore) =>
	state.lastCodeSentAt

export const authStepSelector = (state: AuthStore) => state.step
