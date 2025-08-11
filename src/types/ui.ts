import { ReactElement } from 'react'

//Dropdown
export interface DropdownItem {
	id: string | number
	label: string
	value?: string | number | boolean | object | undefined
	icon?: string | ReactElement
	disabled?: boolean
	divider?: boolean
	description?: string
	badge?: string | number
	onClick?: (item: DropdownItem) => void
	className?: string
}

export interface DropdownGroup {
	title?: string
	items: DropdownItem[]
}

export interface DropdownPosition {
	top?: number
	left?: number
	right?: number
	bottom?: number
	maxHeight?: number
	minWidth?: number
	maxWidth?: number
}

export interface DropdownMenuProps {
	items?: DropdownItem[]
	groups?: DropdownGroup[]
	children?: React.ReactNode
	trigger: ReactElement
	triggerOn?: 'click' | 'hover' | 'focus' | 'contextmenu'
	isOpen?: boolean
	onToggle?: (isOpen: boolean) => void
	onItemSelect?: (item: DropdownItem) => void
	closeOnSelect?: boolean
	closeOnOutsideClick?: boolean
	closeOnEscape?: boolean
	position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'auto'
	offset?: { x: number; y: number }
	className?: string
	menuClassName?: string
	itemClassName?: string
	width?: 'auto' | 'trigger' | number | 'full'
	maxHeight?: number
	searchable?: boolean
	searchPlaceholder?: string
	onSearch?: (query: string) => void
	multiSelect?: boolean
	selectedItems?: (string | number)[]
	onSelectionChange?: (selectedIds: (string | number)[]) => void
	virtualized?: boolean
	itemHeight?: number
	ariaLabel?: string
	disabled?: boolean
	loading?: boolean
	loadingText?: string
	emptyText?: string
	emptyIcon?: string | ReactElement
}
