'use client'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
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
import { useCommon } from '@/stores/common/useCommon'
import { DEFAULT_LOCATION } from '@/stores/common/commonStore'
import { useGoogleMaps } from '@/components/providers/GoogleMapsProvider'
import { MapPin, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationSelectorProps {
	variant?: 'default' | 'compact'
	className?: string
}

const LocationSelector = ({
	variant = 'default',
	className,
}: LocationSelectorProps) => {
	const t = useTranslations()
	const { user, updateUser, isLoading, isAuthenticated } = useUserProfile()
	const { commonLocation, setCommonLocation } = useCommon()

	// Определяем текущую локацию в зависимости от авторизации
	const userLocation = useMemo(() => {
		if (isAuthenticated && user) {
			// Для авторизованных - используем user.location или commonLocation как fallback
			return user.location || commonLocation || null
		} else {
			// Для неавторизованных - используем commonLocation
			return commonLocation || null
		}
	}, [isAuthenticated, user, commonLocation])

	const { loadMaps } = useGoogleMaps()
	const {
		location: currentLocation,
		getCurrentLocation,
		isLoading: isLoadingGeolocation,
		error: geolocationError,
		isSupported: isGeolocationSupported,
	} = useGeolocation()
	const [location, setLocation] = useState<LocationData | null>(null)
	const [isOpenModal, openModal, closeModal] = useFlag()
	const hasTriedAutoLocation = useRef(false)

	// Загружаем Google Maps API заранее для быстрого открытия модалки
	useEffect(() => {
		loadMaps()
	}, [loadMaps])
	const autoLocationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const currentLocationRef = useRef<LocationData | null>(null)

	// Обновляем ref при изменении currentLocation
	useEffect(() => {
		currentLocationRef.current = currentLocation
	}, [currentLocation])

	// Функция для автоматической установки локации (геолокация или Киев)
	const setAutoLocation = useCallback(() => {
		if (hasTriedAutoLocation.current) return
		hasTriedAutoLocation.current = true

		// Очищаем предыдущий таймаут, если есть
		if (autoLocationTimeoutRef.current) {
			clearTimeout(autoLocationTimeoutRef.current)
		}

		// Если геолокация не поддерживается - сразу подставляем Киев
		if (!isGeolocationSupported) {
			setCommonLocation(DEFAULT_LOCATION)
			hasTriedAutoLocation.current = false
			return
		}

		// Пытаемся получить геолокацию
		getCurrentLocation()

		// Устанавливаем таймаут: если через 5 секунд геолокация не получена - подставляем Киев
		autoLocationTimeoutRef.current = setTimeout(() => {
			// Если через 5 секунд currentLocation все еще null - подставляем Киев
			if (!currentLocationRef.current) {
				setCommonLocation(DEFAULT_LOCATION)
				hasTriedAutoLocation.current = false
			}
		}, 5000)
	}, [getCurrentLocation, setCommonLocation, isGeolocationSupported])

	const handleSkip = useCallback(() => {
		setLocation(null)
		closeModal()

		if (isAuthenticated && user) {
			// Для авторизованных: сохраняем skiped: true в профиле
			if (!userLocation?.city) {
				updateUser({
					location: {
						skiped: true,
					},
				})
				toast.info(t('Notification.location_not_selected'))
			}
		} else {
			// Для неавторизованных: пытаемся получить геолокацию или подставляем Киев
			setAutoLocation()
		}
	}, [
		userLocation?.city,
		closeModal,
		t,
		updateUser,
		isAuthenticated,
		user,
		setAutoLocation,
	])

	const handleConfirm = useCallback(() => {
		if (location) {
			if (isAuthenticated && user) {
				// Для авторизованных: сохраняем в профиль через updateUser
				updateUser({
					location,
				})
			} else {
				// Для неавторизованных: сохраняем в commonLocation
				setCommonLocation(location)
			}
			closeModal()
			setLocation(null)
		}
	}, [
		location,
		updateUser,
		closeModal,
		setLocation,
		isAuthenticated,
		user,
		setCommonLocation,
	])

	// Устанавливаем текущую геолокацию в состояние выбора
	useEffect(() => {
		if (currentLocation) {
			setLocation(currentLocation)
			// Очищаем таймаут, так как геолокация успешно получена
			if (autoLocationTimeoutRef.current) {
				clearTimeout(autoLocationTimeoutRef.current)
				autoLocationTimeoutRef.current = null
			}
			// Если это автоматическое определение - сохраняем сразу
			if (hasTriedAutoLocation.current) {
				if (isAuthenticated && user) {
					updateUser({ location: currentLocation })
				} else {
					setCommonLocation(currentLocation)
				}
				if (isOpenModal) {
					closeModal()
				}
				setLocation(null)
				hasTriedAutoLocation.current = false
			}
		}
	}, [
		currentLocation,
		isOpenModal,
		isAuthenticated,
		user,
		updateUser,
		setCommonLocation,
		closeModal,
	])

	// Обработка ошибки геолокации: если была ошибка и мы пытались автоматически определить локацию - подставляем Киев
	useEffect(() => {
		if (geolocationError && hasTriedAutoLocation.current && !currentLocation) {
			// Очищаем таймаут
			if (autoLocationTimeoutRef.current) {
				clearTimeout(autoLocationTimeoutRef.current)
				autoLocationTimeoutRef.current = null
			}
			// Подставляем Киев
			setCommonLocation(DEFAULT_LOCATION)
			hasTriedAutoLocation.current = false
		}
	}, [geolocationError, currentLocation, setCommonLocation])

	// Очистка таймаута при размонтировании
	useEffect(() => {
		return () => {
			if (autoLocationTimeoutRef.current) {
				clearTimeout(autoLocationTimeoutRef.current)
			}
		}
	}, [])

	// Логика показа модалки для авторизованных пользователей
	useEffect(() => {
		if (
			isAuthenticated &&
			user &&
			!userLocation?.city &&
			!userLocation?.skiped &&
			!isLoading
		) {
			setTimeout(() => {
				openModal()
			}, 3000)
		}
	}, [
		userLocation?.skiped,
		openModal,
		isLoading,
		userLocation,
		user,
		isAuthenticated,
	])

	// Логика показа модалки для неавторизованных пользователей
	useEffect(() => {
		if (!isAuthenticated && !commonLocation?.city && !isLoading) {
			setTimeout(() => {
				openModal()
			}, 3000)
		}
	}, [isAuthenticated, commonLocation?.city, openModal, isLoading])

	// Обработка закрытия модалки без выбора (для неавторизованных)
	const handleModalClose = useCallback(() => {
		if (!isAuthenticated && !location) {
			// Если модалка закрывается без выбора - пытаемся получить геолокацию или подставляем Киев
			setAutoLocation()
		}
		handleSkip()
	}, [isAuthenticated, location, setAutoLocation, handleSkip])

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
					<Button variant='outline' size='lg' onClick={handleSkip}>
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

	// Компактный вариант для SearchBar
	if (variant === 'compact') {
		return (
			<>
				{userLocation?.city ? (
					<button
						type='button'
						onClick={e => {
							e.preventDefault()
							e.stopPropagation()
							openModal()
						}}
						className={cn(
							'flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors flex-shrink-0',
							className
						)}
					>
						<MapPin className='size-4 text-primary' />
						<span className='text-sm font-medium text-gray-900'>
							{userLocation.city}
						</span>
						<ChevronDown className='size-4 text-gray-400' />
					</button>
				) : (
					<button
						type='button'
						onClick={e => {
							e.preventDefault()
							e.stopPropagation()
							openModal()
						}}
						className={cn(
							'flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors flex-shrink-0',
							className
						)}
					>
						<MapPin className='size-4 text-gray-400' />
						<span className='text-sm text-gray-500'>{t('chooseLocation')}</span>
						<ChevronDown className='size-4 text-gray-400' />
					</button>
				)}
				<Modal
					title={t('chooseLocation')}
					subtitle={t('chooseLocationHelper')}
					position='top'
					footer={modalActions}
					isOpen={isOpenModal}
					onClose={handleModalClose}
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

	// Дефолтный вариант
	return (
		<div className={cn('flex items-center gap-2', className)}>
			{userLocation && userLocation.city && (
				<Button
					variant='outline-muted'
					withoutTransform
					onClick={e => {
						e.preventDefault()
						e.stopPropagation()
						openModal()
					}}
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
				onClose={handleModalClose}
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
		</div>
	)
}

export default LocationSelector
