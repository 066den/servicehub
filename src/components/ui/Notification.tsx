'use client'

import { motion } from 'motion/react'
import { notificationVariants } from './animate/variants'
import { cn } from '@/lib/utils'

type Props = {
	message: string
	type: 'error' | 'success' | 'info'
}

const Notification = ({ message, type }: Props) => {
	return (
		<motion.div
			variants={notificationVariants}
			initial='hidden'
			animate='visible'
			exit='hidden'
			className={cn(
				'px-4 py-3 rounded-md border-l-4 mb-4',
				type === 'error' &&
					'bg-destructive/10 text-destructive border-destructive',
				type === 'success' && 'bg-success/10 text-success border-success',
				type === 'info' && 'bg-info/10 text-info border-info'
			)}
		>
			{message}
		</motion.div>
	)
}

export default Notification
