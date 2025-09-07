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
}

// Component
const Logo: React.FC<LogoProps> = ({
	color = 'default',
	withSlogan = false,
	size,
	isLink = false,
	variant = 'text',
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
		size === 'sm' && 'text-[1.8em]',
		(size === 'md' || !size) && 'text-[2.5em]',
		size === 'lg' && 'text-[3.5em] mb-3',
		// Link styles
		isLink && 'cursor-pointer',
		className
	)

	// Logo main container styles
	const logoMainClassName = cn(
		'flex flex-col gap-1.5 font-bold no-underline',
		color === 'default' && 'text-primary',
		color === 'white' && 'text-white',
		size === 'lg' && 'items-center'
	)

	// Hub icon styles
	const hubIconClassName = cn(
		'flex items-center justify-center relative bg-accent rounded-full shadow-lg flex-shrink-0',
		(size === 'sm' || !size) && 'w-10 h-10',
		size === 'lg' && 'w-14 h-14 shadow-xl'
	)

	// Hub icon inner circle styles
	const hubIconInnerClassName = cn(
		'absolute bg-white rounded-full shadow-md',
		(size === 'sm' || !size) && 'w-3 h-3',
		size === 'lg' && 'w-4 h-4 shadow-lg'
	)

	// Slogan styles
	const sloganClassName = cn(
		'text-[0.375em] font-medium text-secondary-foreground uppercase tracking-wider ml-0.5',
		size === 'lg' && 'text-white text-xl font-light lowercase'
	)

	return (
		<Wrapper {...wrapperProps} className={logoClassName}>
			<div className={logoMainClassName}>
				Service
				<div className={hubIconClassName}>
					<div className={hubIconInnerClassName} />
				</div>
				Hub
				<Image src='/logo-wo.png' alt='Logo' width={370} height={90} />
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

