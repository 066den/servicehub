import { useRef } from 'react'

function usePrevious<T>(next: T): T | undefined
function usePrevious<T>(
	next: T,
	shouldSkipUndefined: true
): Exclude<T, undefined> | undefined
function usePrevious<T>(
	next: T,
	shouldSkipUndefined?: boolean
): Exclude<T, undefined> | undefined
function usePrevious<T>(next: T, shouldSkipUndefined?: boolean) {
	const ref = useRef<T>(next)
	const { current } = ref
	if (!shouldSkipUndefined || next !== undefined) {
		ref.current = next
	}

	return current
}

export default usePrevious
