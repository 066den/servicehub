import { useState } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import useEffectOnce from '@/hooks/useEffectOnce'
import { AnimatePresence, motion, Variants } from 'framer-motion'

const SLOGAN_LENGTH = 6

const sloganVariants: Variants = {
	initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
	animate: {
		opacity: 1,
		y: 0,
		filter: 'blur(0px)',
		transition: {
			ease: 'easeOut',
		},
	},
	exit: {
		opacity: 0,
		y: -10,
		filter: 'blur(2px)',
		transition: {
			ease: 'easeIn',
		},
	},
}

const Logo = () => {
	const t = useTranslations()
	const [currentIndex, setCurrentIndex] = useState(0)

	useEffectOnce(() => {
		const interval = setInterval(() => {
			setCurrentIndex(prevIndex => (prevIndex + 1) % SLOGAN_LENGTH)
		}, 12000)
		return () => clearInterval(interval)
	})

	return (
		<Link href='/' className='link logo'>
			<div className='logo-main sm'>
				Service
				<div className='hub-icon' />
				Hub
			</div>
			<AnimatePresence mode='wait'>
				<motion.div
					key={currentIndex}
					className='logo-slogan'
					variants={sloganVariants}
					initial='initial'
					animate='animate'
					exit='exit'
				>
					{t(`Logo.slogan-${currentIndex + 1}`)}
				</motion.div>
			</AnimatePresence>
		</Link>
	)
}

export default Logo
