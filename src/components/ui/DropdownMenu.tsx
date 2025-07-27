import {
	cloneElement,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import { DropdownItem, DropdownMenuProps } from '@/types/ui'
import { useDropdownPosition } from '@/hooks/useDropdownPosition'

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
	offset = { x: 0, y: 4 },
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
	emptyText = 'Немає елементів',
	emptyIcon = '📭',
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

	// Позиціонування
	const dropdownPosition = useDropdownPosition(
		triggerRef,
		menuRef,
		isOpen,
		position,
		offset
	)

	// Обробка всіх елементів (items + groups)
	const allItems = useMemo(() => {
		const flatItems: DropdownItem[] = []

		// Додаємо прості items
		flatItems.push(...items)

		// Додаємо items з груп
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

			// Додаємо роздільник після групи (крім останньої)
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

	// Фільтрація за пошуковим запитом
	const filteredItems = useMemo(() => {
		if (!searchQuery.trim()) return allItems

		return allItems.filter(
			item =>
				!item.divider &&
				(item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	}, [allItems, searchQuery])

	// Функція для перемикання стану
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

	// Обробка вибору елемента
	const handleItemSelect = useCallback(
		(item: DropdownItem) => {
			if (item.disabled || item.divider) return

			// Викликаємо onClick елемента
			item.onClick?.(item)

			// Обробка мультиселекту
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

			// Викликаємо загальний callback
			onItemSelect?.(item)

			// Закриваємо меню
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

	// Навігація клавіатурою
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

	// Обробка кліків поза межами
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

	// Event listeners
	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('mousedown', handleOutsideClick)

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('mousedown', handleOutsideClick)
		}
	}, [handleKeyDown, handleOutsideClick])

	// Обробка пошуку
	const handleSearch = useCallback(
		(query: string) => {
			setSearchQuery(query)
			setHighlightedIndex(-1)
			onSearch?.(query)
		},
		[onSearch]
	)

	// Синхронізація selectedItems
	useEffect(() => {
		if (multiSelect && !onSelectionChange) {
			setInternalSelectedItems(selectedItems)
		}
	}, [selectedItems, multiSelect, onSelectionChange])

	// Створення тригера з обробниками подій
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
				triggerProps.onBlur = () => setTimeout(() => toggleOpen(false), 150)
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

	// Рендер меню
	const renderMenu = () => {
		if (!isOpen) return null

		const menuStyle: React.CSSProperties = {
			position: 'fixed',
			...dropdownPosition,
			width:
				width === 'trigger' ? 'auto' : width === 'auto' ? 'max-content' : width,
			maxHeight,
			background: 'white',
			border: '1px solid #e5e7eb',
			borderRadius: '8px',
			boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
			zIndex: 9999,
			overflow: 'hidden',
			fontFamily: 'Inter, sans-serif',
		}

		return (
			<div
				ref={menuRef}
				className={`dropdown-menu ${menuClassName}`}
				style={menuStyle}
				role='listbox'
				aria-label={ariaLabel}
			>
				{/* Пошук */}
				{searchable && (
					<DropdownSearch
						value={searchQuery}
						onChange={handleSearch}
						placeholder={searchPlaceholder}
						onKeyDown={e => e.stopPropagation()}
					/>
				)}

				{/* Контент меню */}
				<div
					style={{
						maxHeight: searchable ? maxHeight - 60 : maxHeight,
						overflowY: 'auto',
						overflowX: 'hidden',
					}}
				>
					{loading ? (
						<div
							style={{
								padding: '20px',
								textAlign: 'center',
								color: '#6b7280',
							}}
						>
							<div
								style={{
									width: '20px',
									height: '20px',
									border: '2px solid #e5e7eb',
									borderTop: '2px solid #2563EB',
									borderRadius: '50%',
									animation: 'spin 1s linear infinite',
									margin: '0 auto 10px',
								}}
							/>
							{loadingText}
						</div>
					) : children ? (
						children
					) : filteredItems.length === 0 ? (
						<div
							style={{
								padding: '20px',
								textAlign: 'center',
								color: '#6b7280',
							}}
						>
							<div style={{ fontSize: '2em', marginBottom: '10px' }}>
								{typeof emptyIcon === 'string' ? emptyIcon : emptyIcon}
							</div>
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
			</div>
		)
	}

	return (
		<div
			className={`dropdown-container ${className}`}
			style={{ position: 'relative', display: 'inline-block' }}
		>
			{enhancedTrigger}
			{renderMenu()}

			<style>
				{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .group-title {
            font-weight: 600 !important;
            color: #374151 !important;
            background: #f9fafb !important;
            font-size: 0.8em !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }
        `}
			</style>
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
	<div
		style={{
			padding: '8px 12px',
			borderBottom: '1px solid #e5e7eb',
			position: 'sticky',
			top: 0,
			background: 'white',
			zIndex: 1,
		}}
	>
		<input
			type='text'
			value={value}
			onChange={e => onChange(e.target.value)}
			onKeyDown={onKeyDown}
			placeholder={placeholder}
			style={{
				width: '100%',
				padding: '8px 12px',
				border: '2px solid #e5e7eb',
				borderRadius: '6px',
				fontSize: '0.9em',
				outline: 'none',
				transition: 'border-color 0.2s ease',
			}}
			onFocus={e => (e.target.style.borderColor = '#2563EB')}
			onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
			autoFocus
		/>
	</div>
)

// Компонент елемента меню
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
		return (
			<div
				style={{
					height: '1px',
					background: '#e5e7eb',
					margin: '4px 0',
				}}
			/>
		)
	}

	return (
		<div
			onClick={item.disabled ? undefined : onClick}
			className={className}
			style={{
				padding: '10px 16px',
				cursor: item.disabled ? 'not-allowed' : 'pointer',
				background: isHighlighted
					? '#f3f4f6'
					: isSelected
					? '#eff6ff'
					: 'transparent',
				borderLeft: isSelected ? '3px solid #2563EB' : '3px solid transparent',
				opacity: item.disabled ? 0.5 : 1,
				transition: 'all 0.2s ease',
				display: 'flex',
				alignItems: 'center',
				gap: '12px',
				fontSize: '0.9em',
				userSelect: 'none',
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
			{/* Мультиселект чекбокс */}
			{multiSelect && (
				<div
					style={{
						width: '16px',
						height: '16px',
						border: '2px solid #d1d5db',
						borderRadius: '3px',
						background: isSelected ? '#2563EB' : 'white',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexShrink: 0,
					}}
				>
					{isSelected && (
						<span
							style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}
						>
							✓
						</span>
					)}
				</div>
			)}

			{/* Іконка */}
			{item.icon && (
				<span
					style={{
						fontSize: '1.1em',
						flexShrink: 0,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					{typeof item.icon === 'string' ? item.icon : item.icon}
				</span>
			)}

			{/* Контент */}
			<div style={{ flex: 1, minWidth: 0 }}>
				<div
					style={{
						fontWeight: isSelected ? '600' : '500',
						color: item.disabled ? '#9ca3af' : '#1f2937',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
					}}
				>
					{item.label}
				</div>
				{item.description && (
					<div
						style={{
							fontSize: '0.8em',
							color: '#6b7280',
							marginTop: '2px',
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						{item.description}
					</div>
				)}
			</div>

			{/* Бейдж */}
			{item.badge && (
				<span
					style={{
						background: '#F59E0B',
						color: 'white',
						padding: '2px 6px',
						borderRadius: '10px',
						fontSize: '0.7em',
						fontWeight: '600',
						flexShrink: 0,
					}}
				>
					{item.badge}
				</span>
			)}
		</div>
	)
}

export default DropdownMenu
