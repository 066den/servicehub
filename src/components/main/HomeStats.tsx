'use client'
import { useEffect, useMemo, useRef } from 'react'
import Statistics, { StatItem } from '../common/Statistics'
import { useCommon } from '@/stores/common/useCommon'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

const HomeStats = () => {
	const { stats, fetchStats, lastStatsUpdate } = useCommon()
	const t = useTranslations()
	const hasFetched = useRef(false)

	useEffect(() => {
		// Загружаем статистику только один раз при монтировании или если данных нет
		if (!hasFetched.current && (!stats || lastStatsUpdate === 0)) {
			hasFetched.current = true
			fetchStats()
		}
	}, []) // Пустой массив зависимостей - загружаем только один раз

	const statsItems: StatItem[] = useMemo(() => {
		return [
			{ title: t('Statistics.performers'), count: stats?.performersCount || 0 },
			{ title: t('Statistics.clients'), count: stats?.clientsCount || 0 },
			{ title: t('Statistics.types'), count: stats?.typesCount || 0 },
		]
	}, [stats, t])

	return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, ease: 'easeOut' }}
			className='relative z-10 -mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
		>
			<div className='relative backdrop-blur-md rounded-2xl md:rounded-3xl shadow-2xl border border-border/50 p-4 md:p-6'>
				<div className='absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none bg-accent-gradient-light' />
				<div className='relative'>
					<Statistics
						items={statsItems}
						className='justify-center'
						numberClassName='text-3xl md:text-4xl lg:text-5xl xl:text-6xl'
						titleClassName='text-sm md:text-base lg:text-lg text-muted-foreground mt-2'
					/>
				</div>
			</div>
		</motion.div>
	)
}

export default HomeStats
