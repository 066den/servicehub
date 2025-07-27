'use client'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import './Navigation.scss'

type OwnProps = {
	items: {
		label: string
		href: string
	}[]
	className?: string
}

const Navigation = ({ items, className }: OwnProps) => {
	const pathname = usePathname()

	return (
		<nav className={classNames('Nav', className)}>
			{items.map(item => (
				<Link
					key={item.href}
					href={item.href}
					className={classNames('link', {
						active: pathname === item.href,
					})}
				>
					{item.label}
				</Link>
			))}
		</nav>
	)
}

export default Navigation
