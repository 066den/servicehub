'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface TopBarProps {
	title: string
	description?: string
}

const TopBarAdmin = ({ title, description }: TopBarProps) => {
	const handleOpenSite = () => {
		if (typeof window !== 'undefined') {
			window.open('/', '_blank', 'noopener,noreferrer')
		}
	}

	return (
		<div className='sticky top-0 z-10 flex items-center justify-between bg-white p-6 shadow-md md:rounded-b-xl'>
			<div className='flex-1'>
				<h1 className='text-3xl font-bold text-primary'>{title}</h1>
				{description && (
					<p className='text-sm text-gray-500 mt-1'>{description}</p>
				)}
			</div>
			<Button
				variant='outline-secondary'
				onClick={handleOpenSite}
				className='ml-4'
			>
				<ExternalLink className='size-4 mr-2' />
				Відкрити сайт
			</Button>
		</div>
	)
}

export default TopBarAdmin
