'use client'

import { motion } from 'motion/react'
import { notificationVariants } from './animate/variants'

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
			className={`${type}-message`}
		>
			{message}
		</motion.div>
	)
}

export default Notification
