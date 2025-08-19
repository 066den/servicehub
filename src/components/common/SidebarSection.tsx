'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

type Props = {
	title?: string
	items: {
		icon: string
		title: string
		url?: string
		action?: () => void
	}[]
}

const SidebarSection = ({ title, items }: Props) => {
	const t = useTranslations('Link')
	const pathname = usePathname()
	const router = useRouter()
	const handleClick = (item: { url?: string; action?: () => void }) => {
		if (item.url) {
			router.push(item.url)
		} else {
			item.action?.()
		}
	}
	return (
		<div className='space-y-4'>
			{title && (
				<div className='font-medium text-secondary-foreground px-6'>
					{t(title)}
				</div>
			)}
			<ul className='space-y-1'>
				{items.map(item => (
					<li className='px-4' key={item.url || item.title}>
						<Button
							variant='ghost'
							fullWidth
							size='lg'
							withoutTransform
							onClick={() => handleClick(item)}
							className={cn(
								'justify-start items-center gap-2 text-left text-base text-secondary-foreground hover:bg-gray-100 hover:text-primary',
								pathname === item.url &&
									'bg-primary/10 text-primary hover:bg-primary/10'
							)}
						>
							<span className='text-lg'> {item.icon} </span>
							{t(item.title)}
						</Button>
					</li>
				))}
			</ul>
		</div>
	)
}

export default SidebarSection
