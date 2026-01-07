'use client'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface StatItem {
	title: string
	count: number
}

interface StatisticsProps {
	items: StatItem[]
	className?: string
	numberClassName?: string
	titleClassName?: string
	formatNumber?: (count: number) => string
}

const statsVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.3,
		},
	},
}

const statItemVariants = {
	hidden: { opacity: 0, y: 20, scale: 0.9 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring' as const,
			stiffness: 300,
			damping: 25,
		},
	},
}

const Statistics = ({
	items,
	className,
	numberClassName,
	titleClassName = 'text-sm md:text-base text-secondary-foreground',
	formatNumber = (count: number) => count.toLocaleString('uk-UA'),
}: StatisticsProps) => {
	return (
		<motion.div
			className={cn('flex flex-wrap gap-8 md:gap-12 lg:gap-16', className)}
			variants={statsVariants}
			initial='hidden'
			animate='visible'
		>
			{items.map((item, index) => (
				<motion.div
					key={`${item.title}-${index}`}
					className='text-center'
					variants={statItemVariants}
				>
					<motion.div
						className={cn(
							'text-4xl md:text-5xl lg:text-6xl font-bold text-accent',
							numberClassName
						)}
						key={item.count}
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: 'spring', stiffness: 300, damping: 25 }}
					>
						{formatNumber(item.count)}
					</motion.div>
					<div
						className={cn(
							'text-sm md:text-base text-secondary-foreground',
							titleClassName
						)}
					>
						{item.title}
					</div>
				</motion.div>
			))}
		</motion.div>
	)
}

export default Statistics
