'use client'
import { useState } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import useEffectOnce from '@/hooks/useEffectOnce'
import { AnimatePresence, motion } from 'framer-motion'
import { sloganVariants } from '../ui/animate/variants'
import classNames from 'classnames'

const SLOGAN_LENGTH = 6

type Props = {
	color?: 'default' | 'white'
	withSlogan?: boolean
	size?: 'sm' | 'md' | 'lg'
	isLink?: boolean
}

const Logo = ({ color = 'default', withSlogan, size, isLink }: Props) => {
	const t = useTranslations()
	const [currentIndex, setCurrentIndex] = useState(0)

	useEffectOnce(() => {
		const interval = setInterval(() => {
			setCurrentIndex(prevIndex => (prevIndex + 1) % SLOGAN_LENGTH)
		}, 12000)
		return () => clearInterval(interval)
	})

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const Wrapper: any = isLink ? Link : 'div'

	return (
		<Wrapper
			{...(isLink ? { href: '/' } : {})}
			className={classNames('logo', color, size, { link: isLink })}
		>
			<div className='logo-main'>
				Service
				<div className='hub-icon' />
				Hub
			</div>
			{withSlogan && (
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
			)}
		</Wrapper>
	)
}

export default Logo
