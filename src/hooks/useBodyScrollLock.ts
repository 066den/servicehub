import { useEffect } from 'react'

export const useBodyScrollLock = (lock: boolean) => {
	useEffect(() => {
		if (typeof window === 'undefined') return

		const body = document.body

		if (lock) {
			body.classList.add('no-scroll')
		} else {
			body.classList.remove('no-scroll')
		}

		return () => {
			body.classList.remove('no-scroll')
		}
	}, [lock])
}
