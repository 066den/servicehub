'use client'
import ProviderRegister from '@/components/profile/ProviderRegister'
import { containerVariants } from '@/components/ui/animate/variants'
import { motion } from 'framer-motion'

const ProviderPage = () => {
	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='content-section'
		>
			<div className='section-header'>
				<div>
					<h1 className='section-title'>Реєстрація виконавця</h1>
					<p className='section-subtitle'>
						Заповніть форму, щоб стати виконавцем на платформі
					</p>
				</div>
			</div>
			<ProviderRegister />
		</motion.section>
	)
}

export default ProviderPage
