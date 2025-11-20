'use client'
import { useCallback, useEffect, useState } from 'react'
import useGeolocation from '@/hooks/useGeolocation'
import Modal from '../modals/Modal'

import PlacesAutocomplete from '../ui/forms/PlacesAutocomplete'
import { motion } from 'framer-motion'

import { LocationData } from '@/types'
import useFlag from '@/hooks/useFlag'
import { fadeScaleVariants } from '../ui/animate/variants'
import { useTranslations } from 'next-intl'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import { Button } from '../ui/button'
import { toast } from 'sonner'

const LocationSelector = () => {
	const t = useTranslations()
	const { user, updateUser, isLoading } = useUserProfile()
	const { location: userLocation } = user || {}
	const {
		location: currentLocation,
		getCurrentLocation,
		isLoading: isLoadingGeolocation,
	} = useGeolocation()
	const [location, setLocation] = useState<LocationData | null>(null)
	const [isOpenModal, openModal, closeModal] = useFlag()

	const handleSkip = useCallback(() => {
		setLocation(null)
		closeModal()
		if (!userLocation?.city) {
			updateUser({
				location: {
					skiped: true,
				},
			})
			toast.info(t('Notification.location_not_selected'))
		}
	}, [userLocation?.city, closeModal, t, updateUser])

	const handleConfirm = useCallback(() => {
		if (location) {
			updateUser({
				location,
			})
			closeModal()
			setLocation(null)
		}
	}, [location, updateUser, closeModal, setLocation])

	useEffect(() => {
		if (currentLocation) {
			setLocation(currentLocation)
		}
	}, [currentLocation])

	useEffect(() => {
		if (user && !userLocation?.city && !userLocation?.skiped && !isLoading) {
			setTimeout(() => {
				openModal()
			}, 3000)
		}
	}, [userLocation?.skiped, openModal, isLoading, userLocation, user])

	const modalActions = (
		<div className='flex flex-col gap-2'>
			<Button
				size='lg'
				variant='outline-primary'
				onClick={getCurrentLocation}
				disabled={isLoadingGeolocation}
			>
				<span>🎯</span>
				<span>{t('getCurrentLocation')}</span>
			</Button>

			<div className='grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2'>
				{!userLocation?.city && (
					<Button variant='outline-secondary' size='lg' onClick={handleSkip}>
						{t('skip')}
					</Button>
				)}
				<Button
					variant='accent'
					size='lg'
					onClick={handleConfirm}
					disabled={!location}
				>
					{t('confirm')}
				</Button>
			</div>
		</div>
	)

	return (
		<>
			{userLocation && userLocation.city && (
				<Button
					variant='outline-secondary'
					withoutTransform
					onClick={openModal}
					size='md'
					className='text-sm px-3'
				>
					<div className='flex flex-col items-start leading-none'>
						<span>{userLocation.city}</span>
						<span>{userLocation.area}</span>
					</div>
				</Button>
			)}
			<Modal
				title={t('chooseLocation')}
				subtitle={t('chooseLocationHelper')}
				position='top'
				footer={modalActions}
				isOpen={isOpenModal}
				onClose={handleSkip}
			>
				<PlacesAutocomplete
					location={location}
					onLocationSelect={setLocation}
					types={['(cities)']}
				/>

				{location && (
					<motion.div
						variants={fadeScaleVariants}
						initial='hidden'
						animate='visible'
						exit='exit'
						className='space-y-2 mt-4'
					>
						<div className='text-sm font-medium text-gray-500 uppercase tracking-widest'>
							Вибране місто
						</div>
						<div className='flex items-center gap-2 p-2 bg-gray-100 rounded-lg border border-gray-200'>
							<span className='text-2xl'>📍</span>
							<div className='flex flex-col items-start leading-none'>
								<div className='text-lg font-medium'>{location?.city}</div>
								<div className='text-sm text-gray-500'>{location?.area}</div>
							</div>
						</div>
					</motion.div>
				)}
			</Modal>
		</>
	)
}

export default LocationSelector
