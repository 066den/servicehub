'use client'

import { motion } from 'motion/react'

interface LoadingSpinnerProps {
	color?: 'primary' | 'secondary' | 'accent' | 'error' | 'warning' | 'success'
	size?: 'sm' | 'md' | 'lg'
}

function LoadingSpinner({ color, size }: LoadingSpinnerProps) {
	return (
		<div className='spinner-container'>
			<motion.div
				className={`spinner ${color} ${size}`}
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
