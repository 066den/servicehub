'use client'
import { useCallback, useEffect, useState } from 'react'
import useGeolocation from '@/hooks/useGeolocation'
import Modal from '../modals/Modal'

import PlacesAutocomplete from '../ui/forms/PlacesAutocomplete'
import { motion } from 'framer-motion'

import { LocationData } from '@/types'
import useFlag from '@/hooks/useFlag'
import { fadeScaleVariants } from '../ui/animate/variants'
import useNotifications from '@/hooks/storeHooks/useNotifications'
import { useTranslations } from 'next-intl'
import { useUserProfile } from '@/hooks/storeHooks/useUserProfile'
import { Button } from '../ui/button'

const LocationSelector = () => {
	const t = useTranslations()
	const { showInfo } = useNotifications()
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
			showInfo({
				message: t('Notification.location_not_selected'),
			})
		}
	}, [userLocation?.city, closeModal, showInfo, t, updateUser])

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
		<div className='modal-actions'>
			<Button onClick={getCurrentLocation} disabled={isLoadingGeolocation}>
				<span>🎯</span>
				<span>{t('getCurrentLocation')}</span>
			</Button>

			<div className='btn-row'>
				{!userLocation?.city && (
					<Button color='secondary' onClick={handleSkip}>
						{t('skip')}
					</Button>
				)}
				<Button color='accent' onClick={handleConfirm} disabled={!location}>
					{t('confirm')}
				</Button>
			</div>
		</div>
	)

	return (
		<>
			{userLocation && userLocation.city && (
				<Button className='location-selector' onClick={openModal}>
					<span className='location-icon'>📍</span>
					<div className='location-info'>
						<div className='location-name'>{userLocation.city}</div>
						<div className='location-area'>{userLocation.area}</div>
					</div>
				</Button>
			)}
			<Modal
				title={t('chooseLocation')}
				subtitle={t('chooseLocationHelper')}
				position='top'
				headerColor='primary'
				footer={modalActions}
				isOpen={isOpenModal}
				onClose={handleSkip}
			>
				<PlacesAutocomplete onLocationSelect={setLocation} />

				{location && (
					<motion.div
						variants={fadeScaleVariants}
						initial='hidden'
						animate='visible'
						exit='exit'
					>
						<div className='section-label'>Вибране місто</div>
						<div className='location-item'>
							<span className='location-icon'>📍</span>
							<div className='location-info'>
								<div className='location-name'>{location?.city}</div>
								<div className='location-area'>{location?.area}</div>
							</div>
						</div>
					</motion.div>
				)}
			</Modal>
		</>
	)
}

export default LocationSelector
