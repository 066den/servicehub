import { ProviderStore } from './types'

export const providerActionsSelector = (state: ProviderStore) => state.actions

export const providerSelector = (state: ProviderStore) => state.provider

export const providerIsLoadingSelector = (state: ProviderStore) =>
	state.isLoadingProvider

export const providerErrorSelector = (state: ProviderStore) =>
	state.providerError

export const providerLastUpdateSelector = (state: ProviderStore) =>
	state.lastProviderUpdate

export const staffSelector = (state: ProviderStore) => state.staff

export const staffIsLoadingSelector = (state: ProviderStore) =>
	state.isLoadingStaff

export const staffErrorSelector = (state: ProviderStore) => state.staffError
