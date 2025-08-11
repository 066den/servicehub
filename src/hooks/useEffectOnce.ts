import { useEffect } from 'react'

function useEffectOnce(effect: () => void) {
	// eslint-disable-next-line
	useEffect(effect, [])
}

export default useEffectOnce
