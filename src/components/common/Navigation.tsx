'use client'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
		<nav className={cn('flex gap-7 items-center', className)}>
			{items.map(item => (
				<Link
					key={item.href}
					href={item.href}
					className={cn(
						'relative font-medium text-secondary-foreground px-2 py-1 transition-all duration-300',
						'after:content-[""] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5',
						'after:bg-primary after:transition-all after:duration-300 after:ease-in-out',
						'hover:after:w-full',
						pathname === item.href && 'after:w-full'
					)}
				>
					{item.label}
				</Link>
			))}
		</nav>
	)
}

export default Navigation
