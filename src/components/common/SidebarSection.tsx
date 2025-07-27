'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import classNames from 'classnames'

type Props = {
	title?: string
	items: {
		icon: string
		label: string
		href?: string
		action?: () => void
	}[]
}

const SidebarSection = ({ title, items }: Props) => {
	const t = useTranslations('Link')
	const pathname = usePathname()
	return (
		<div className='sidebar-section'>
			{title && <div className='sidebar-title'>{t(title)}</div>}
			<ul className='sidebar-menu'>
				{items.map(item => (
					<li className='sidebar-item' key={item.href || item.label}>
						<Link
							href={item.href || '#'}
							onClick={() => {
								if (item.action) {
									item.action()
								}
							}}
							className={classNames('sidebar-link', {
								active: pathname === item.href,
							})}
						>
							<span className='sidebar-icon'> {item.icon} </span>
							{t(item.label)}
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}

export default SidebarSection
