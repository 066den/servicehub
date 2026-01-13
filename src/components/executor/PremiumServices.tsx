'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { usePremiumService } from '@/stores/premium/usePremiumService'
import { useService } from '@/stores/service/useService'
import { PremiumServiceType, PremiumServiceInfo } from '@/types'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createPremiumServiceSchema } from '@/lib/schemas'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import Modal from '../modals/Modal'
import useFlag from '@/hooks/useFlag'
import { SkeletonForm } from '../ui/sceletons'
import { formatDateToString } from '@/utils/dateFormat'
import { Check, Clock } from 'lucide-react'

const PREMIUM_SERVICES: Record<PremiumServiceType, PremiumServiceInfo> = {
	SEARCH_BOOST: {
		type: 'SEARCH_BOOST',
		name: 'Поднять в поиске',
		description:
			'Ваші послуги будуть показуватися вище в результатах пошуку, що збільшить їх видимість для клієнтів.',
		icon: '🔍',
		requiresCategory: false,
	},
	CATEGORY_ADS: {
		type: 'CATEGORY_ADS',
		name: 'Реклама в категории',
		description:
			'Ваші послуги будуть виділені та показуватися на перших позиціях у вибраній категорії.',
		icon: '📢',
		requiresCategory: true,
	},
	TOP: {
		type: 'TOP',
		name: 'ТОП',
		description:
			'Максимальний пріоритет у пошуку. Ваші послуги завжди будуть на перших позиціях.',
		icon: '🏆',
		requiresCategory: false,
	},
	PRO: {
		type: 'PRO',
		name: 'ПРО',
		description:
			'Професійний статус з підвищеною видимістю та пріоритетом у пошуку.',
		icon: '⭐',
		requiresCategory: false,
	},
}

const PremiumServices = () => {
	const {
		premiumServices,
		activeServices,
		isLoading,
		fetchPremiumServices,
		activatePremiumService,
	} = usePremiumService()
	const { categories, fetchCategories } = useService()
	const [isModalOpen, openModal, closeModal] = useFlag()
	const [selectedServiceType, setSelectedServiceType] =
		useState<PremiumServiceType | null>(null)

	const {
		register,
		handleSubmit,
		control,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<z.input<typeof createPremiumServiceSchema>>({
		resolver: zodResolver(createPremiumServiceSchema),
		defaultValues: {
			type: 'SEARCH_BOOST',
			categoryId: null,
			durationDays: 30,
		},
	})

	const watchedType = watch('type')

	useEffect(() => {
		fetchPremiumServices()
		fetchCategories()
	}, [fetchPremiumServices, fetchCategories])

	useEffect(() => {
		if (watchedType === 'CATEGORY_ADS') {
			// Для CATEGORY_ADS категория обязательна
		} else {
			// Для других типов сбрасываем категорию
			reset({ ...watch(), categoryId: null })
		}
	}, [watchedType, reset, watch])

	const handleActivate = (type: PremiumServiceType) => {
		setSelectedServiceType(type)
		reset({
			type,
			categoryId: null,
			durationDays: 30,
		})
		openModal()
	}

	const onSubmit = async (
		data: z.output<typeof createPremiumServiceSchema>
	) => {
		try {
			const result = await activatePremiumService(data)
			if (result) {
				closeModal()
				reset()
				setSelectedServiceType(null)
			}
		} catch (error) {
			console.error('Error activating premium service:', error)
		}
	}

	const getActiveService = (type: PremiumServiceType) => {
		return activeServices.find(service => service.type === type)
	}

	const isServiceActive = (type: PremiumServiceType) => {
		return !!getActiveService(type)
	}

	if (isLoading && premiumServices.length === 0) {
		return (
			<motion.section
				variants={containerVariants}
				initial='hidden'
				animate='visible'
				className='px-6 py-2'
			>
				<SkeletonForm count={4} />
			</motion.section>
		)
	}

	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='px-6 py-2'
		>
			<div className='mb-6 border-b border-gray-200 pb-4'>
				<h1 className='text-3xl font-bold mb-2'>Преміум-послуги</h1>
				<p className='text-secondary-foreground'>
					Підвищте видимість ваших послуг та отримайте більше замовлень
				</p>
			</div>

			{activeServices.length > 0 && (
				<div className='mb-8'>
					<h2 className='text-xl font-semibold mb-4'>Активні послуги</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{activeServices.map(service => {
							const serviceInfo = PREMIUM_SERVICES[service.type]

							return (
								<Card
									key={service.id}
									className='p-4 border-2 border-green-200 bg-green-50/50'
								>
									<div className='flex items-start justify-between mb-2'>
										<div className='flex items-center gap-2'>
											<span className='text-2xl'>{serviceInfo.icon}</span>
											<h3 className='font-semibold text-lg'>
												{serviceInfo.name}
											</h3>
										</div>
										<Badge
											variant='success'
											className='flex items-center gap-1'
										>
											<Check className='w-3 h-3' />
											Активна
										</Badge>
									</div>
									{service.category && (
										<p className='text-sm text-gray-600 mb-2'>
											Категорія: {service.category.name}
										</p>
									)}
									<div className='flex items-center gap-2 text-sm text-gray-600'>
										<Clock className='w-4 h-4' />
										<span>
											Діє до:{' '}
											{formatDateToString(
												typeof service.expiresAt === 'string'
													? service.expiresAt
													: service.expiresAt.toISOString()
											)}
										</span>
									</div>
								</Card>
							)
						})}
					</div>
				</div>
			)}

			<div>
				<h2 className='text-xl font-semibold mb-4'>Доступні послуги</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					{Object.values(PREMIUM_SERVICES).map(serviceInfo => {
						const isActive = isServiceActive(serviceInfo.type)
						const activeService = getActiveService(serviceInfo.type)

						return (
							<Card key={serviceInfo.type} className='p-6'>
								<div className='flex items-start justify-between mb-4'>
									<div className='flex items-center gap-3'>
										<span className='text-3xl'>{serviceInfo.icon}</span>
										<div>
											<h3 className='font-semibold text-lg'>
												{serviceInfo.name}
											</h3>
											{isActive && (
												<Badge
													variant='success'
													className='mt-1 flex items-center gap-1 w-fit'
												>
													<Check className='w-3 h-3' />
													Активна
												</Badge>
											)}
										</div>
									</div>
								</div>
								<p className='text-gray-600 mb-4'>{serviceInfo.description}</p>
								{isActive && activeService && (
									<div className='mb-4 p-3 bg-green-50 rounded-lg'>
										<p className='text-sm text-gray-700'>
											Діє до:{' '}
											{formatDateToString(
												typeof activeService.expiresAt === 'string'
													? activeService.expiresAt
													: activeService.expiresAt.toISOString()
											)}
										</p>
									</div>
								)}
								<Button
									variant={isActive ? 'outline' : 'default'}
									onClick={() => handleActivate(serviceInfo.type)}
									disabled={isActive}
									className='w-full'
								>
									{isActive ? 'Вже активна' : 'Активувати'}
								</Button>
							</Card>
						)
					})}
				</div>
			</div>

			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title='Активувати преміум-послугу'
				size='md'
				footer={
					<div className='flex gap-2 justify-end'>
						<Button
							variant='outline'
							onClick={closeModal}
							disabled={isSubmitting}
						>
							Скасувати
						</Button>
						<Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
							Активувати
						</Button>
					</div>
				}
			>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='type'>
							Тип послуги <span className='text-destructive'>*</span>
						</Label>
						<Controller
							name='type'
							control={control}
							render={({ field }) => (
								<Select
									value={field.value}
									onValueChange={field.onChange}
									disabled
								>
									<SelectTrigger id='type'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.values(PREMIUM_SERVICES).map(service => (
											<SelectItem key={service.type} value={service.type}>
												{service.icon} {service.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
						{selectedServiceType && (
							<p className='text-sm text-gray-600'>
								{PREMIUM_SERVICES[selectedServiceType].description}
							</p>
						)}
					</div>

					{watchedType === 'CATEGORY_ADS' && (
						<div className='space-y-2'>
							<Label htmlFor='categoryId'>
								Категорія <span className='text-destructive'>*</span>
							</Label>
							<Controller
								name='categoryId'
								control={control}
								render={({ field, fieldState }) => (
									<div>
										<Select
											value={
												field.value && field.value > 0
													? field.value.toString()
													: ''
											}
											onValueChange={value => {
												field.onChange(Number(value))
											}}
										>
											<SelectTrigger
												id='categoryId'
												className={
													fieldState.error
														? 'border-red-500 focus:border-red-500'
														: ''
												}
											>
												<SelectValue placeholder='Виберіть категорію' />
											</SelectTrigger>
											<SelectContent>
												{categories.map(category => (
													<SelectItem
														key={category.id}
														value={category.id.toString()}
													>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{fieldState.error && (
											<p className='text-sm text-red-500 mt-1'>
												{fieldState.error.message}
											</p>
										)}
									</div>
								)}
							/>
						</div>
					)}

					<div className='space-y-2'>
						<Label htmlFor='durationDays'>
							Тривалість (днів) <span className='text-destructive'>*</span>
						</Label>
						<Input
							type='number'
							id='durationDays'
							min='1'
							max='365'
							{...register('durationDays', { valueAsNumber: true })}
							errorMessage={errors.durationDays?.message}
						/>
						<p className='text-sm text-gray-500'>
							Виберіть кількість днів, на які активується послуга (1-365)
						</p>
					</div>

					{Object.keys(errors).length > 0 && (
						<div className='text-destructive text-sm'>
							{Object.values(errors)
								.filter(error => error?.message)
								.map((error, index) => (
									<div key={index}>{error?.message}</div>
								))}
						</div>
					)}
				</form>
			</Modal>
		</motion.section>
	)
}

export default PremiumServices
