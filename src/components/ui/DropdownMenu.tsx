import {
	cloneElement,
	CSSProperties,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import { DropdownItem, DropdownMenuProps } from '@/types/ui'
import { useDropdownPosition } from '@/hooks/useDropdownPosition'
import LoadingSpinner from './LoadingSpinner'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { dropdownVariants } from './animate/variants'

import './DropdownMenu.scss'

const DropdownMenu = ({
	items = [],
	groups = [],
	children,
	trigger,
	triggerOn = 'click',
	isOpen: controlledIsOpen,
	onToggle,
	onItemSelect,
	closeOnSelect = true,
	closeOnOutsideClick = true,
	closeOnEscape = true,
	position = 'bottom-left',
	offset,
	className = '',
	menuClassName = '',
	itemClassName = '',
	width = 'auto',
	maxHeight = 300,
	searchable = false,
	searchPlaceholder = 'Пошук...',
	onSearch,
	multiSelect = false,
	selectedItems = [],
	onSelectionChange,
	ariaLabel,
	disabled = false,
	loading = false,
	loadingText = 'Завантаження...',
	emptyText,
	emptyIcon,
}: DropdownMenuProps) => {
	const [internalIsOpen, setInternalIsOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const [internalSelectedItems, setInternalSelectedItems] =
		useState<(string | number)[]>(selectedItems)

	const triggerRef = useRef<HTMLElement>(null)
	const menuRef = useRef<HTMLDivElement>(null)

	// Контрольований або некерований стан
	const isOpen =
		controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
	const currentSelectedItems = useMemo(
		() =>
			multiSelect
				? onSelectionChange
					? selectedItems
					: internalSelectedItems
				: [],
		[multiSelect, onSelectionChange, selectedItems, internalSelectedItems]
	)

	const dropdownPosition = useDropdownPosition(
		triggerRef,
		menuRef,
		isOpen,
		position,
		offset
	)

	const allItems = useMemo(() => {
		const flatItems: DropdownItem[] = []

		flatItems.push(...items)

		groups.forEach((group, groupIndex) => {
			if (group.title) {
				flatItems.push({
					id: `group-title-${groupIndex}`,
					label: group.title,
					disabled: true,
					className: 'group-title',
				})
			}
			flatItems.push(...group.items)

			if (groupIndex < groups.length - 1) {
				flatItems.push({
					id: `divider-${groupIndex}`,
					label: '',
					divider: true,
				})
			}
		})

		return flatItems
	}, [items, groups])

	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return allItems

		return allItems.filter(
			item =>
				!item.divider &&
				(item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	}, [allItems, searchQuery])

	const toggleOpen = useCallback(
		(newIsOpen?: boolean) => {
			if (disabled) return
			const nextIsOpen = newIsOpen !== undefined ? newIsOpen : !isOpen

			if (controlledIsOpen === undefined) {
				setInternalIsOpen(nextIsOpen)
			}

			onToggle?.(nextIsOpen)

			if (nextIsOpen) {
				setHighlightedIndex(-1)
				if (searchable) {
					setSearchQuery('')
				}
			}
		},
		[disabled, isOpen, controlledIsOpen, onToggle, searchable]
	)

	const handleItemSelect = useCallback(
		(item: DropdownItem) => {
			if (item.disabled || item.divider) return
			item.onClick?.(item)

			if (multiSelect) {
				const newSelectedItems = currentSelectedItems.includes(item.id)
					? currentSelectedItems.filter(id => id !== item.id)
					: [...currentSelectedItems, item.id]

				if (onSelectionChange) {
					onSelectionChange(newSelectedItems)
				} else {
					setInternalSelectedItems(newSelectedItems)
				}
			}

			onItemSelect?.(item)

			if (closeOnSelect && !multiSelect) {
				toggleOpen(false)
			}
		},
		[
			multiSelect,
			currentSelectedItems,
			onSelectionChange,
			onItemSelect,
			closeOnSelect,
			toggleOpen,
		]
	)

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isOpen) return

			switch (e.key) {
				case 'Escape':
					if (closeOnEscape) {
						e.preventDefault()
						toggleOpen(false)
					}
					break

				case 'ArrowDown':
					e.preventDefault()
					setHighlightedIndex(prev => {
						const validItems = filteredItems.filter(
							item => !item.disabled && !item.divider
						)
						const currentIndex = validItems.findIndex(
							(_, index) => index === prev
						)
						return currentIndex < validItems.length - 1 ? currentIndex + 1 : 0
					})
					break

				case 'ArrowUp':
					e.preventDefault()
					setHighlightedIndex(prev => {
						const validItems = filteredItems.filter(
							item => !item.disabled && !item.divider
						)
						const currentIndex = validItems.findIndex(
							(_, index) => index === prev
						)
						return currentIndex > 0 ? currentIndex - 1 : validItems.length - 1
					})
					break

				case 'Enter':
					e.preventDefault()
					const validItems = filteredItems.filter(
						item => !item.disabled && !item.divider
					)
					if (highlightedIndex >= 0 && highlightedIndex < validItems.length) {
						handleItemSelect(validItems[highlightedIndex])
					}
					break
			}
		},
		[
			isOpen,
			closeOnEscape,
			filteredItems,
			highlightedIndex,
			toggleOpen,
			handleItemSelect,
		]
	)

	const handleOutsideClick = useCallback(
		(e: MouseEvent) => {
			if (!isOpen || !closeOnOutsideClick) return

			const target = e.target as Node
			if (
				triggerRef.current?.contains(target) ||
				menuRef.current?.contains(target)
			) {
				return
			}

			toggleOpen(false)
		},
		[isOpen, closeOnOutsideClick, toggleOpen]
	)

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('mousedown', handleOutsideClick)

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('mousedown', handleOutsideClick)
		}
	}, [handleKeyDown, handleOutsideClick])

	const handleSearch = useCallback(
		(query: string) => {
			setSearchQuery(query)
			setHighlightedIndex(-1)
			onSearch?.(query)
		},
		[onSearch]
	)

	useEffect(() => {
		if (multiSelect && !onSelectionChange) {
			setInternalSelectedItems(selectedItems)
		}
	}, [selectedItems, multiSelect, onSelectionChange])

	const enhancedTrigger = useMemo(() => {
		const triggerProps: Record<string, unknown> = {
			ref: triggerRef,
			'aria-expanded': isOpen,
			'aria-haspopup': 'listbox',
			'aria-label': ariaLabel,
		}

		const originalProps = (trigger.props as Record<string, unknown>) || {}

		switch (triggerOn) {
			case 'click':
				triggerProps.onClick = (e: React.MouseEvent) => {
					e.preventDefault()
					toggleOpen()
					if (
						originalProps.onClick &&
						typeof originalProps.onClick === 'function'
					) {
						originalProps.onClick(e)
					}
				}
				break

			case 'hover':
				triggerProps.onMouseEnter = () => toggleOpen(true)
				triggerProps.onMouseLeave = () => toggleOpen(false)
				break

			case 'focus':
				triggerProps.onFocus = () => toggleOpen(true)
				// triggerProps.onBlur = () => {
				// 	setTimeout(() => toggleOpen(false), 150)
				// }
				break

			case 'contextmenu':
				triggerProps.onContextMenu = (e: React.MouseEvent) => {
					e.preventDefault()
					toggleOpen()
				}
				break
		}

		return cloneElement(trigger, triggerProps)
	}, [trigger, triggerOn, isOpen, toggleOpen, ariaLabel])

	const renderMenu = () => {
		if (!isOpen) return null

		const menuStyle: CSSProperties = {
			...dropdownPosition,
			width:
				width === 'trigger' ? 'auto' : width === 'auto' ? 'max-content' : width,
			maxHeight,
		}

		return (
			<motion.div
				variants={dropdownVariants}
				initial='closed'
				animate={isOpen ? 'open' : 'closed'}
				ref={menuRef}
				className={`dropdown-menu ${menuClassName}`}
				style={menuStyle}
				role='listbox'
				aria-label={ariaLabel}
			>
				{searchable && (
					<DropdownSearch
						value={searchQuery}
						onChange={handleSearch}
						placeholder={searchPlaceholder}
						onKeyDown={e => e.stopPropagation()}
					/>
				)}

				<div
					className='dropdown-menu-content'
					style={{
						maxHeight: searchable ? maxHeight - 60 : maxHeight,
					}}
				>
					{loading ? (
						<div className='dropdown-menu-loading'>
							<LoadingSpinner color='secondary' />
							{loadingText}
						</div>
					) : children ? (
						children
					) : filteredItems.length === 0 ? (
						<div className='dropdown-menu-empty'>
							{emptyIcon && (
								<div className='dropdown-menu-empty-icon'>
									{typeof emptyIcon === 'string' ? emptyIcon : emptyIcon}
								</div>
							)}
							{emptyText}
						</div>
					) : (
						filteredItems.map(item => {
							const isSelected = currentSelectedItems.includes(item.id)
							const validItems = filteredItems.filter(
								i => !i.disabled && !i.divider
							)
							const validIndex = validItems.findIndex(i => i.id === item.id)
							const isHighlighted = validIndex === highlightedIndex
							return (
								<DropdownMenuItem
									key={item.id}
									item={item}
									isSelected={isSelected}
									isHighlighted={isHighlighted}
									onClick={() => handleItemSelect(item)}
									className={itemClassName}
									multiSelect={multiSelect}
								/>
							)
						})
					)}
				</div>
			</motion.div>
		)
	}

	return (
		<div className={`dropdown-container ${className}`}>
			{enhancedTrigger}
			{renderMenu()}
		</div>
	)
}

const DropdownSearch = ({
	value,
	onChange,
	placeholder,
	onKeyDown,
}: {
	value: string
	onChange: (value: string) => void
	placeholder: string
	onKeyDown: (e: React.KeyboardEvent) => void
}) => (
	<div className='dropdown-menu-search'>
		<input
			type='text'
			value={value}
			onChange={e => onChange(e.target.value)}
			onKeyDown={onKeyDown}
			placeholder={placeholder}
			className='dropdown-menu-search-input'
			onFocus={e => (e.target.style.borderColor = '#2563EB')}
			onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
			autoFocus
		/>
	</div>
)

const DropdownMenuItem = ({
	item,
	isSelected,
	isHighlighted,
	onClick,
	className,
	multiSelect,
}: {
	item: DropdownItem
	isSelected?: boolean
	isHighlighted?: boolean
	onClick: () => void
	className?: string
	multiSelect?: boolean
}) => {
	if (item.divider) {
		return <div className='dropdown-menu-divider' />
	}
	const handleClick = () => {
		if (item.disabled) return
		onClick()
	}

	return (
		<div
			onClick={handleClick}
			className={classNames('dropdown-menu-item', className)}
			style={{
				cursor: item.disabled ? 'not-allowed' : 'pointer',
				background: isHighlighted
					? '#f3f4f6'
					: isSelected
					? '#eff6ff'
					: 'transparent',
				borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
				opacity: item.disabled ? 0.5 : 1,
			}}
			onMouseEnter={e => {
				if (!item.disabled && !isHighlighted) {
					e.currentTarget.style.background = '#f9fafb'
				}
			}}
			onMouseLeave={e => {
				if (!item.disabled && !isHighlighted) {
					e.currentTarget.style.background = isSelected
						? '#eff6ff'
						: 'transparent'
				}
			}}
		>
			{multiSelect && (
				<div className='dropdown-menu-item-checkbox'>
					{isSelected && (
						<span className='dropdown-menu-item-checkbox-checkmark'>✓</span>
					)}
				</div>
			)}

			{item.icon && (
				<span className='dropdown-menu-item-icon'>
					{typeof item.icon === 'string' ? item.icon : item.icon}
				</span>
			)}

			<div className='dropdown-menu-item-content'>
				<div
					className='dropdown-menu-item-label'
					style={{
						fontWeight: isSelected ? '600' : '500',
						color: item.disabled ? '#9ca3af' : '#1f2937',
					}}
				>
					{item.label}
				</div>
				{item.description && (
					<div className='dropdown-menu-item-description'>
						{item.description}
					</div>
				)}
			</div>

			{item.badge && (
				<span className='dropdown-menu-item-badge'>{item.badge}</span>
			)}
		</div>
	)
}

export default DropdownMenu
