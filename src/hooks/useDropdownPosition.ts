import { DropdownPosition } from '@/types/ui'
import { useCallback, useEffect, useState } from 'react'

export const useDropdownPosition = (
	triggerRef: React.RefObject<HTMLElement | null>,
	menuRef: React.RefObject<HTMLElement | null>,
	isOpen: boolean,
	position: string = 'bottom-left',
	offset: { x: number; y: number } = { x: 0, y: 0 }
) => {
	const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({})

	const calculatePosition = useCallback(() => {
		if (!isOpen || !triggerRef.current || !menuRef.current) return

		const trigger = triggerRef.current.getBoundingClientRect()
		const menu = menuRef.current.getBoundingClientRect()
		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight,
		}

		const newPosition: DropdownPosition = {
			minWidth: trigger.width,
		}

		if (position === 'auto') {
			const spaceBelow = viewport.height - trigger.bottom
			const spaceAbove = trigger.top
			const spaceRight = viewport.width - trigger.left
			const spaceLeft = trigger.right

			if (spaceBelow >= menu.height || spaceBelow >= spaceAbove) {
				newPosition.top = trigger.bottom + offset.y
			} else {
				newPosition.bottom = viewport.height - trigger.top + offset.y
			}

			if (spaceRight >= menu.width || spaceRight >= spaceLeft) {
				newPosition.left = trigger.left + offset.x
			} else {
				newPosition.right = viewport.width - trigger.right + offset.x
			}
		} else {
			// Фіксоване позиціонування
			switch (position) {
				case 'bottom-left':
					newPosition.top = trigger.bottom + offset.y
					newPosition.left = trigger.left + offset.x
					break
				case 'bottom-right':
					newPosition.top = trigger.bottom + offset.y
					newPosition.right = viewport.width - trigger.right + offset.x
					break
				case 'top-left':
					newPosition.bottom = viewport.height - trigger.top + offset.y
					newPosition.left = trigger.left + offset.x
					break
				case 'top-right':
					newPosition.bottom = viewport.height - trigger.top + offset.y
					newPosition.right = viewport.width - trigger.right + offset.x
					break
			}
		}

		// Обмеження по краях екрану
		if (newPosition.left !== undefined && newPosition.left < 10) {
			newPosition.left = 10
		}
		if (newPosition.right !== undefined && newPosition.right < 10) {
			newPosition.right = 10
		}
		if (
			newPosition.top !== undefined &&
			newPosition.top + menu.height > viewport.height - 10
		) {
			newPosition.maxHeight = viewport.height - newPosition.top - 20
		}

		setDropdownPosition(newPosition)
	}, [isOpen, position, offset.x, offset.y, triggerRef, menuRef])

	useEffect(() => {
		calculatePosition()

		const handleResize = () => calculatePosition()
		const handleScroll = () => calculatePosition()

		window.addEventListener('resize', handleResize)
		window.addEventListener('scroll', handleScroll, true)

		return () => {
			window.removeEventListener('resize', handleResize)
			window.removeEventListener('scroll', handleScroll, true)
		}
	}, [calculatePosition])

	return dropdownPosition
}
