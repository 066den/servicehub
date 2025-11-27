'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface PreloaderProps {
	className?: string
	size?: 'sm' | 'md' | 'lg' | 'xl'
	variant?: 'spinner' | 'dots' | 'pulse' | 'wave'
	text?: string
	show?: boolean
}

const sizeClasses = {
	sm: 'h-4 w-4',
	md: 'h-6 w-6',
	lg: 'h-8 w-8',
	xl: 'h-12 w-12',
}

const textSizeClasses = {
	sm: 'text-xs',
	md: 'text-sm',
	lg: 'text-base',
	xl: 'text-lg',
}

export function Preloader({
	className,
	size = 'md',
	variant = 'spinner',
	text,
	show = true,
}: PreloaderProps) {
	const renderSpinner = () => (
		<motion.div
			className={cn(
				'rounded-full border-2 border-muted border-t-accent',
				sizeClasses[size]
			)}
			animate={{ rotate: 360 }}
			transition={{
				duration: 1,
				repeat: Infinity,
				ease: 'linear',
			}}
		/>
	)

	const renderDots = () => (
		<div className='flex space-x-1'>
			{[0, 1, 2].map(i => (
				<motion.div
					key={i}
					className={cn(
						'rounded-full bg-accent',
						size === 'sm'
							? 'h-1 w-1'
							: size === 'md'
							? 'h-1.5 w-1.5'
							: size === 'lg'
							? 'h-2 w-2'
							: 'h-2.5 w-2.5'
					)}
					animate={{
						scale: [1, 1.5, 1],
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						duration: 0.6,
						repeat: Infinity,
						delay: i * 0.2,
						ease: 'easeInOut',
					}}
				/>
			))}
		</div>
	)

	const renderPulse = () => (
		<motion.div
			className={cn('rounded-full bg-accent', sizeClasses[size])}
			animate={{
				scale: [1, 1.2, 1],
				opacity: [0.5, 1, 0.5],
			}}
			transition={{
				duration: 1,
				repeat: Infinity,
				ease: 'easeInOut',
			}}
		/>
	)

	const renderWave = () => (
		<div className='flex space-x-1'>
			{[0, 1, 2, 3, 4].map(i => (
				<motion.div
					key={i}
					className={cn(
						'bg-accent rounded-sm',
						size === 'sm'
							? 'h-3 w-0.5'
							: size === 'md'
							? 'h-4 w-0.5'
							: size === 'lg'
							? 'h-5 w-1'
							: 'h-6 w-1'
					)}
					animate={{
						scaleY: [1, 2, 1],
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						duration: 0.8,
						repeat: Infinity,
						delay: i * 0.1,
						ease: 'easeInOut',
					}}
				/>
			))}
		</div>
	)

	const renderVariant = () => {
		switch (variant) {
			case 'dots':
				return renderDots()
			case 'pulse':
				return renderPulse()
			case 'wave':
				return renderWave()
			default:
				return renderSpinner()
		}
	}

	return (
		<motion.div
			className={cn(
				'flex flex-col items-center justify-center space-y-2',
				show ? 'visible' : 'invisible',
				className
			)}
			initial={{ opacity: 0 }}
			animate={{
				opacity: show ? 1 : 0,
			}}
			exit={{ opacity: 0 }}
			transition={{
				duration: 0.3,
				ease: 'easeOut',
			}}
		>
			{renderVariant()}
			{text && (
				<motion.p
					className={cn(
						'text-muted-foreground font-medium',
						textSizeClasses[size]
					)}
					animate={{
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						duration: 1.5,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				>
					{text}
				</motion.p>
			)}
		</motion.div>
	)
}

// Full page preloader component
interface PagePreloaderProps {
	text?: string
	variant?: PreloaderProps['variant']
	size?: PreloaderProps['size']
}

export function PagePreloader({
	text = 'Loading...',
	variant = 'spinner',
	size = 'lg',
}: PagePreloaderProps) {
	return (
		<motion.div
			className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
		>
			<motion.div
				className='flex flex-col items-center justify-center space-y-4 p-8 rounded-lg bg-card border shadow-lg'
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.3, ease: 'easeOut' }}
			>
				<Preloader variant={variant} size={size} />
				<motion.p
					className='text-lg font-medium text-foreground'
					animate={{
						opacity: [0.5, 1, 0.5],
					}}
					transition={{
						duration: 1.5,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				>
					{text}
				</motion.p>
			</motion.div>
		</motion.div>
	)
}

// Inline preloader for content areas
interface InlinePreloaderProps {
	text?: string
	variant?: PreloaderProps['variant']
	size?: PreloaderProps['size']
	className?: string
	show?: boolean
}

export function InlinePreloader({
	text,
	variant = 'dots',
	size = 'md',
	className,
	show = true,
}: InlinePreloaderProps) {
	return (
		<motion.div
			className={cn('flex items-center justify-center py-8', className)}
			initial={{ opacity: 0, y: 20 }}
			animate={{
				opacity: show ? 1 : 0,
				y: show ? 0 : 20,
			}}
			exit={{ opacity: 0, y: -20 }}
			transition={{
				duration: 0.3,
				ease: 'easeOut',
			}}
		>
			<Preloader variant={variant} size={size} text={text} show={show} />
		</motion.div>
	)
}
