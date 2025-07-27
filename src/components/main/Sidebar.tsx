'use client'
import SidebarSection from '../common/SidebarSection'
import { ERoutes } from '@/types/enum'
import { signOut } from 'next-auth/react'

import './Sidebar.scss'

const orderItems = [
	{
		icon: '📋',
		label: 'myOrders',
		href: ERoutes.MY_ORDERS,
	},
]
const helpItems = [
	{
		icon: '🚪',
		label: 'logout',
		action: () => {
			signOut()
		},
	},
]

const profileItems = [
	{
		icon: '👤',
		label: 'profile',
		href: ERoutes.PROFILE,
	},
	{
		icon: '⚙️',
		label: 'settings',
		href: ERoutes.SETTINGS,
	},
]

const Sidebar = () => {
	return (
		<aside className='sidebar'>
			<SidebarSection items={orderItems} />
			<SidebarSection title='account' items={profileItems} />
			<SidebarSection title='help' items={helpItems} />
		</aside>
	)
}

export default Sidebar
