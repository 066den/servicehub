'use client'

import { useDescriptionGeneratorStore } from './descriptionGeneratorStore'

export const useDescriptionGenerator = () => {
	const keywords = useDescriptionGeneratorStore(state => state.keywords)
	const descriptions = useDescriptionGeneratorStore(state => state.descriptions)
	const setKeywords = useDescriptionGeneratorStore(state => state.setKeywords)
	const setDescriptions = useDescriptionGeneratorStore(
		state => state.setDescriptions
	)
	const clearData = useDescriptionGeneratorStore(state => state.clearData)

	return {
		keywords,
		descriptions,
		setKeywords,
		setDescriptions,
		clearData,
	}
}

