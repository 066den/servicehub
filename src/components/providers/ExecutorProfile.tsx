'use client'

import { useEffect, useState } from 'react'
import { useProvider } from '@/stores/provider/useProvider'
import ExecutorRegister from '../profile/ExecutorRegister'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { useTranslations } from 'next-intl'
import ExecutorProfileHero from '../profile/ExecutorProfileHero'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProviderSchema } from '@/lib/schemas'
import type { z } from 'zod'

type FormData = z.infer<typeof updateProviderSchema>
import { ProviderType } from '@prisma/client'
import { Input } from '../ui/input'
import InputPhone from '../ui/forms/InputPhone'
import { Textarea } from '../ui/textarea'
import PlacesAutocomplete from '../ui/forms/PlacesAutocomplete'
import Map from '../common/Map'
import type { LocationData } from '@/types'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import {
	SkeletonForm,
	SkeletonProfileHero,
	SkeletonSectionHeader,
} from '../ui/sceletons'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import useFlag from '@/hooks/useFlag'
import ChangeTypeModal from '../modals/ChangeTypeModal'
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from '../ui/select'
import { Label } from '../ui/label'
import { X } from 'lucide-react'

const ExecutorProfile = () => {
	const { provider, isLoadingProvider, updateProvider, changeProviderType } =
		useProvider()
	const { userLocation, isLoading } = useUserProfile()
	const t = useTranslations()
	const [isTypeModalOpen, openTypeModal, closeTypeModal] = useFlag()
	const [selectedType, setSelectedType] = useState(
		provider?.type ?? ProviderType.INDIVIDUAL
	)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		trigger,
		reset,
		control,
		formState: { errors },
	} = useForm<FormData>({
		// @ts-expect-error - zodResolver with preprocess returns unknown input types
		resolver: zodResolver(updateProviderSchema),
		defaultValues: {
			businessName: provider?.businessName ?? '',
			description: provider?.description ?? '',
			phone: provider?.phone ?? '',
			email: provider?.email ?? '',
			location: provider?.location ?? userLocation ?? undefined,
			serviceAreas: provider?.serviceAreas ?? undefined,
			companyInfo: provider?.companyInfo ?? undefined,
		},
	})

	useEffect(() => {
		if (!provider) {
			return
		}

		reset({
			businessName: provider.businessName ?? '',
			description: provider.description ?? '',
			phone: provider.phone ?? '',
			email: provider.email ?? '',
			location: provider.location ?? userLocation ?? undefined,
			serviceAreas: provider.serviceAreas ?? undefined,
			companyInfo: provider.companyInfo ?? undefined,
		})
	}, [provider, reset, userLocation])

	const watchedLocation = watch('location') as LocationData | undefined

	const preparePayload = (
		data: FormData
	): z.output<typeof updateProviderSchema> => {
		const hasLocation =
			data.location?.coordinates ||
			data.location?.address ||
			data.location?.city
		const companyInfo = data.companyInfo
		const hasCompanyInfo =
			companyInfo && Object.values(companyInfo).some(Boolean)

		return {
			businessName: data.businessName.trim(),
			description: data.description || undefined,
			phone: data.phone,
			email: data.email || undefined,
			location: hasLocation ? data.location : undefined,
			serviceAreas: data.serviceAreas || undefined,
			companyInfo:
				hasCompanyInfo && companyInfo
					? {
							legalForm: companyInfo.legalForm || undefined,
							registrationNumber: companyInfo.registrationNumber || undefined,
							taxNumber: companyInfo.taxNumber || undefined,
							website: companyInfo.website || undefined,
							bankDetails: companyInfo.bankDetails,
							licenses: companyInfo.licenses,
							certificates: companyInfo.certificates,
							foundedYear: companyInfo.foundedYear,
					  }
					: undefined,
		}
	}

	const onSubmit = handleSubmit(
		// @ts-expect-error - handleSubmit type inference issue with preprocess schemas
		async (data: FormData) => {
			try {
				await updateProvider(preparePayload(data))
				toast.success('Профіль виконавця успішно оновлено')
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: 'Помилка при оновленні профіля виконавця'
				)
			}
		},
		errors => {
			const firstError = Object.values(errors).find(e => e?.message)
			toast.error(
				firstError?.message ||
					'Будь ласка, перевірте правильність заповнення форми'
			)
		}
	)

	const handleOpenTypeModal = () => {
		if (provider?.type) {
			setSelectedType(provider.type)
		}
		openTypeModal()
	}

	const handleConfirmTypeChange = async () => {
		if (!provider) {
			return
		}

		if (selectedType === provider.type) {
			closeTypeModal()
			return
		}

		try {
			await changeProviderType(selectedType)
			toast.success(t('Profile.changeTypeSuccess'))
			closeTypeModal()
		} catch (error) {
			toast.error(
				error instanceof Error && error.message
					? error.message
					: t('Profile.changeTypeError')
			)
		}
	}

	if (isLoading) {
		return (
			<div className='px-6 py-2 space-y-6'>
				<SkeletonSectionHeader />
				<SkeletonProfileHero />
				<SkeletonForm count={4} />
				<Skeleton className='h-[300px] w-full rounded-lg' />
			</div>
		)
	}

	if (!provider) {
		return <ExecutorRegister />
	}

	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='px-6 py-2'
		>
			<div className='flex justify-between items-center mb-6 border-b border-gray-200 pb-4'>
				<div>
					<h1 className='text-3xl font-bold mb-2'>
						{provider?.type === ProviderType.COMPANY
							? t('Profile.companyTitle')
							: t('Profile.executorTitle')}
					</h1>
					<p className='text-secondary-foreground'>
						{provider?.type === ProviderType.COMPANY
							? t('Profile.companySubtitle')
							: t('Profile.executorSubtitle')}
					</p>
				</div>
				<Button onClick={handleOpenTypeModal}>{t('Profile.changeType')}</Button>
			</div>
			<ExecutorProfileHero />
			<form onSubmit={onSubmit}>
				<div className='grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4'>
					<Input
						{...register('businessName')}
						label={
							provider?.type === ProviderType.COMPANY
								? 'Назва компанії'
								: 'Імʼя виконавця'
						}
						required
						errorMessage={errors.businessName?.message}
					/>
					{provider?.type === ProviderType.COMPANY && (
						<div className='space-y-2'>
							<Label htmlFor='legalForm'>Правова форма</Label>
							<Controller
								name='companyInfo.legalForm'
								control={control}
								render={({ field, fieldState }) => (
									<div>
										<Select
											value={field.value || ''}
											onValueChange={value => {
												field.onChange(value || undefined)
											}}
										>
											<SelectTrigger
												id='legalForm'
												className={
													fieldState.error
														? 'border-red-500 focus:border-red-500'
														: ''
												}
											>
												<SelectValue placeholder='Виберіть правову форму' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='ФОП'>
													ФОП (Фізична особа-підприємець)
												</SelectItem>
												<SelectItem value='ТОВ'>
													ТОВ (Товариство з обмеженою відповідальністю)
												</SelectItem>
												<SelectItem value='ПП'>
													ПП (Приватне підприємство)
												</SelectItem>
												<SelectItem value='ПАТ'>
													ПАТ (Публічне акціонерне товариство)
												</SelectItem>
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
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Input
						{...register('email')}
						type='email'
						label='Email'
						placeholder='Введіть ваш email (опціонально)'
						errorMessage={errors.email?.message}
					/>
					<InputPhone
						value={watch('phone')}
						onChange={value =>
							setValue('phone', value, { shouldValidate: true })
						}
						onBlur={() => trigger('phone')}
						label='Телефон'
						required
						error={errors.phone?.message}
					/>
				</div>

				{provider?.type === ProviderType.COMPANY && (
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<Input
							{...register('companyInfo.taxNumber')}
							label='ІПН'
							placeholder='Введіть ваш ІПН (опціонально)'
						/>
						<Input
							{...register('companyInfo.website')}
							label='Вебсайт'
							placeholder='Введіть ваш вебсайт (опціонально)'
						/>
						{/* <Input
							{...register('companyInfo.bankDetails')}
							label='Банківські реквізити'
						/>
						<Input {...register('companyInfo.licenses')} label='Ліцензії' /> */}
						{/* <Input
							{...register('companyInfo.certificates')}
							label='Сертифікати'
						/>
						<Input
							{...register('companyInfo.foundedYear')}
							label='Рік заснування'
						/> */}
					</div>
				)}

				<div className='space-y-2 mb-4'>
					<label className='text-base font-semibold text-gray-700 leading-none select-none'>
						Спеціалізація
					</label>
					<Textarea
						{...register('description')}
						placeholder='Розкажіть про свої навички та спеціалізацію...'
					/>
					<div className='text-sm text-gray-500'>
						Опис допоможе клієнтам краще зрозуміти ваші можливості
					</div>
				</div>
				<div className='space-y-2 mb-4'>
					<Controller
						name='serviceAreas'
						control={control}
						render={({ field }) => {
							const serviceAreas = Array.isArray(field.value)
								? field.value
								: field.value
								? [field.value]
								: []

							const handleAddArea = (location: LocationData) => {
								const cityName =
									location.city || location.address || location.formattedAddress
								if (!cityName) return

								const newAreas = Array.isArray(field.value)
									? [...field.value]
									: []
								// Проверяем, не добавлен ли уже этот город
								const exists = newAreas.some(
									(area: unknown) =>
										(typeof area === 'string' && area === cityName) ||
										(typeof area === 'object' &&
											area !== null &&
											'city' in area &&
											(area as { city?: string }).city === cityName)
								)

								if (!exists) {
									// Сохраняем только название города для простоты
									newAreas.push(cityName)
									field.onChange(newAreas.length > 0 ? newAreas : undefined)
								}
							}

							const handleRemoveArea = (index: number) => {
								const newAreas = [...serviceAreas]
								newAreas.splice(index, 1)
								field.onChange(newAreas.length > 0 ? newAreas : undefined)
							}

							return (
								<div className='space-y-3'>
									<PlacesAutocomplete
										onLocationSelect={handleAddArea}
										label='Додати область обслуговування'
										placeholder='Почніть вводити назву міста...'
										types={['(cities)']}
									/>
									{serviceAreas.length > 0 && (
										<div className='space-y-2'>
											<div className='text-sm font-medium text-gray-700'>
												Вибрані області ({serviceAreas.length}):
											</div>
											<div className='flex flex-wrap gap-2'>
												{serviceAreas.map((area: unknown, index: number) => {
													const areaName =
														typeof area === 'string'
															? area
															: typeof area === 'object' &&
															  area !== null &&
															  'city' in area
															? (area as { city?: string }).city || 'Невідомо'
															: 'Невідомо'
													return (
														<div
															key={index}
															className='flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg'
														>
															<span className='text-sm text-blue-900'>
																{areaName}
															</span>
															<button
																type='button'
																onClick={() => handleRemoveArea(index)}
																className='text-blue-600 hover:text-blue-800 transition-colors'
															>
																<X className='w-4 h-4' />
															</button>
														</div>
													)
												})}
											</div>
										</div>
									)}
									<div className='text-sm text-gray-500'>
										Вкажіть міста або регіони, де ви надаєте послуги
									</div>
								</div>
							)
						}}
					/>
				</div>
				<PlacesAutocomplete
					location={watchedLocation ?? userLocation ?? undefined}
					onLocationSelect={selected => {
						setValue('location', selected, {
							shouldDirty: true,
							shouldValidate: true,
						})
					}}
					label='Адреса'
					placeholder='Почніть вводити адресу...'
					types={['address']}
				/>

				<div className='mb-4 mt-4'>
					<Map
						center={watchedLocation?.coordinates || userLocation?.coordinates}
						height={300}
						zoom={15}
					/>
				</div>
				<Button type='submit' size='lg' loading={isLoadingProvider}>
					{t('Profile.save')}
				</Button>
			</form>

			<ChangeTypeModal
				isOpen={isTypeModalOpen}
				onClose={closeTypeModal}
				onConfirm={handleConfirmTypeChange}
				selectedType={selectedType}
				setSelectedType={setSelectedType}
			/>
		</motion.section>
	)
}

export default ExecutorProfile
