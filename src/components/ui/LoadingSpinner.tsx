'use client'

import { motion } from 'motion/react'

function LoadingSpinner() {
	return (
		<div className='spinner-container'>
			<motion.div
				className='spinner'
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
