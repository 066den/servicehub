'use client'

import { useEffect } from 'react'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { useService } from '@/stores/service/useService'
import type { GetServicesResponse } from '@/services/service/serviceTypes'
import { ServiceCard } from './ServiceCard'

interface ServiceListPuplicProps {
	city: string
	subSlug: string
	initialServicesList?: GetServicesResponse
}

export const ServiceListPuplic = ({
	city,
	subSlug,
	initialServicesList,
}: ServiceListPuplicProps) => {
	const {
		publicServices: services,
		publicServicesPagination: pagination,
		publicServicesIsLoading: isLoading,
		setInitialPublicServices,
	} = useService()

	useEffect(() => {
		setInitialPublicServices(initialServicesList, city, subSlug)
	}, [city, subSlug, initialServicesList, setInitialPublicServices])

	const displayServices = initialServicesList?.services || services || []
	const displayPagination = initialServicesList?.pagination ||
		pagination || {
			total: 0,
			page: 1,
			limit: 20,
			totalPages: 0,
		}
	const displayIsLoading = isLoading && services.length === 0

	return (
		<motion.div
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='py-2'
		>
			<div className='mb-6'>
				<h1 className='text-3xl font-bold mb-2'></h1>
				<p className='text-gray-600'>
					Знайдено {displayPagination.total}{' '}
					{displayPagination.total === 1 ? 'послугу' : 'послуг'}
				</p>
			</div>

			{displayIsLoading ? (
				<div className='text-center py-12'>
					<p className='text-gray-600 text-lg'>Завантаження...</p>
				</div>
			) : displayServices.length === 0 ? (
				<div className='text-center py-12'>
					<p className='text-gray-600 text-lg'>
						Послуг у цій категорії поки немає
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
					{displayServices.map(service => (
						<ServiceCard key={service.id} service={service} />
					))}
				</div>
			)}
		</motion.div>
	)
}
