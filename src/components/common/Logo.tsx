'use client'

import React, { useState, ElementType } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/lib/utils'

import useEffectOnce from '@/hooks/useEffectOnce'
import { sloganVariants } from '../ui/animate/variants'
import Image from 'next/image'

// Constants
const SLOGAN_LENGTH = 6
const SLOGAN_INTERVAL = 12000

// Types
interface LogoProps {
	color?: 'default' | 'white'
	withSlogan?: boolean
	size?: 'sm' | 'md' | 'lg'
	variant?: 'text' | 'image'
	isLink?: boolean
	className?: string
	withImage?: boolean
}

// Component
const Logo: React.FC<LogoProps> = ({
	color = 'default',
	withSlogan = false,
	withImage = true,
	size,
	isLink = false,
	className,
}) => {
	const t = useTranslations()
	const [currentIndex, setCurrentIndex] = useState(0)

	// Auto-rotate slogans
	useEffectOnce(() => {
		const interval = setInterval(() => {
			setCurrentIndex(prevIndex => (prevIndex + 1) % SLOGAN_LENGTH)
		}, SLOGAN_INTERVAL)

		return () => clearInterval(interval)
	})

	// Determine wrapper component
	const Wrapper: ElementType = isLink ? Link : 'div'

	// Prepare wrapper props
	const wrapperProps = isLink ? { href: '/' } : {}

	// Prepare className with Tailwind classes
	const logoClassName = cn(
		// Size variants
		size === 'sm' && 'text-4xl',
		(size === 'md' || !size) && 'text-[2.5em]',
		size === 'lg' && 'text-[3.5em] mb-3',
		// Link styles
		isLink && 'cursor-pointer',
		className
	)

	// Logo main container styles
	const logoMainClassName = cn(
		'font-bold no-underline',
		color === 'default' && 'text-primary',
		color === 'white' && 'text-white',
		size === 'lg' && 'items-center'
	)

	const sloganClassName = cn(
		'text-[0.275em] font-medium text-secondary-foreground uppercase tracking-wider ml-0.5 leading-4',
		size === 'lg' && 'text-white text-xl font-light lowercase',
		withImage && 'text-right'
	)

	return (
		<Wrapper {...wrapperProps} className={logoClassName}>
			<div className={logoMainClassName}>
				<div className='flex items-center gap-1 font'>
					{withImage && (
						<Image
							src='/logo-img.png'
							alt='Logo'
							width={size === 'lg' ? 80 : 40}
							height={size === 'lg' ? 80 : 40}
							className='h-auto w-auto'
							priority
						/>
					)}
					Uslugi
					<span className='text-accent'>UA</span>
				</div>
			</div>

			{withSlogan && (
				<AnimatePresence mode='wait'>
					<motion.div
						key={currentIndex}
						className={sloganClassName}
						variants={sloganVariants}
						initial='initial'
						animate='animate'
						exit='exit'
					>
						{t(`Logo.slogan-${currentIndex + 1}`)}
					</motion.div>
				</AnimatePresence>
			)}
		</Wrapper>
	)
}

export default Logo

