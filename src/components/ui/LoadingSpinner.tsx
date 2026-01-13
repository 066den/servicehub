'use client'

import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

interface LoadingSpinnerProps {
	color?: 'primary' | 'secondary' | 'accent' | 'error' | 'warning' | 'success'
	size?: 'sm' | 'md' | 'lg'
}

function LoadingSpinner({ color, size }: LoadingSpinnerProps) {
	return (
		<div className='flex items-center justify-center'>
			<motion.div
				className={cn(
					'w-10 h-10 border-4 border-white/20 rounded-full border-t-white',
					{
						'border-primary/50 border-t-transparent': color === 'primary',
						'border-gray-400/50 border-t-transparent': color === 'secondary',
						'border-t-accent': color === 'accent',
						'border-t-error': color === 'error',
						'border-t-warning': color === 'warning',
					},
					{
						'w-8 h-8': size === 'sm',
						'w-10 h-10': size === 'md',
						'w-14 h-14': size === 'lg',
					}
				)}
				animate={{ rotate: 360 }}
				transition={{
					duration: 1,
					repeat: Infinity,
					ease: 'linear',
				}}
			/>
		</div>
	)
}

export default LoadingSpinner
