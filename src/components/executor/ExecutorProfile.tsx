'use client'

import { useEffect, useState } from 'react'
import { useProvider } from '@/stores/provider/useProvider'
import ExecutorRegister from '@/components/executor/ExecutorRegister'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { useTranslations } from 'next-intl'
import ProfileHero from '@/components/profile/ProfileHero'
import { Badge } from '../ui/badge'
import { formatDateToString } from '@/utils/dateFormat'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateProviderSchema, updateProviderSchema } from '@/lib/schemas'
import { ProviderType } from '@prisma/client'
import { Input } from '../ui/input'
import InputPhone from '../ui/forms/InputPhone'
import PlacesAutocomplete from '../ui/forms/PlacesAutocomplete'
import Map from '../common/Map'
import type { LocationData } from '@/types'
import { useUserProfile } from '@/stores/auth/useUserProfile'
import { SkeletonForm, SkeletonProfileHero } from '../ui/sceletons'
import { Skeleton } from '../ui/sceletons/skeleton'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import ChangeTypeModal from '../modals/ChangeTypeModal'
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from '../ui/select'
import { Label } from '../ui/label'
import { Copy, Edit, Save, X } from 'lucide-react'
import ServiceAreasInput from '../ui/forms/ServiceAreasInput'
import useFlag from '@/hooks/useFlag'
import { TipTapEditor } from '../ui/tiptap-editor'
import { generateSlugWithId } from '@/utils/slug'

const ExecutorProfile = () => {
	const {
		provider,
		uploadAvatar,
		removeAvatar,
		isLoadingProvider,
		updateProvider,
		changeProviderType,
	} = useProvider()
	const { userLocation, isLoading } = useUserProfile()
	const t = useTranslations()
	const [isTypeModalOpen, openTypeModal, closeTypeModal] = useFlag()
	const [isEditingSlug, setIsEditingSlug] = useState(false)
	const [slugInputValue, setSlugInputValue] = useState('')

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
	} = useForm<UpdateProviderSchema>({
		// @ts-expect-error - zodResolver with preprocess returns unknown input types
		resolver: zodResolver(updateProviderSchema),
		defaultValues: {
			businessName: provider?.businessName ?? '',
			description: provider?.description ?? '',
			phone: provider?.phone ?? '',
			email: provider?.email ?? '',
			location: provider?.location ?? userLocation ?? undefined,
			serviceAreas:
				provider && Array.isArray(provider.serviceAreas)
					? (provider.serviceAreas as string[])
					: undefined,
			companyInfo: provider?.companyInfo ?? undefined,
			slug: provider?.slug ?? '',
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
			serviceAreas: Array.isArray(provider.serviceAreas)
				? (provider.serviceAreas as string[])
				: undefined,
			companyInfo: provider.companyInfo ?? undefined,
			slug: provider.slug ?? '',
		})
	}, [provider, reset, userLocation])

	const watchedLocation = watch('location') as LocationData | undefined
	const watchedBusinessName = watch('businessName')
	const watchedSlug = watch('slug')

	// Автоматически генерировать slug из businessName при изменении (если поле пустое)
	useEffect(() => {
		if (watchedBusinessName && !watchedSlug && provider?.id) {
			const generatedSlug = generateSlugWithId(watchedBusinessName, provider.id)
			setValue('slug', generatedSlug)
		}
	}, [watchedBusinessName, watchedSlug, provider?.id, setValue])

	const handleCopyLink = async () => {
		const slug = watch('slug') || provider?.slug
		if (!slug) {
			toast.error('Спочатку створіть посилання на профіль')
			return
		}

		const baseUrl = window.location.origin
		const profileUrl = `${baseUrl}/${slug}`

		try {
			await navigator.clipboard.writeText(profileUrl)
			toast.success('Посилання скопійовано в буфер обміну')
		} catch {
			toast.error('Не вдалося скопіювати посилання')
		}
	}

	const handleStartEditSlug = () => {
		const currentSlug = watch('slug') || provider?.slug || ''
		setSlugInputValue(currentSlug)
		setIsEditingSlug(true)
	}

	const handleCancelEditSlug = () => {
		setIsEditingSlug(false)
		setSlugInputValue('')
	}

	const handleSaveSlug = async () => {
		const trimmedSlug = slugInputValue.trim()

		// Валидация slug
		if (trimmedSlug && !/^[a-z0-9-]+$/.test(trimmedSlug)) {
			toast.error('Slug може містити тільки латинські літери, цифри та дефіси')
			return
		}

		setValue('slug', trimmedSlug || undefined)
		await trigger('slug')

		// Сохраняем через форму
		const currentData = watch()
		const payload = preparePayload({
			...currentData,
			slug: trimmedSlug || undefined,
		})

		try {
			await updateProvider(payload)
			setIsEditingSlug(false)
			toast.success('Посилання на профіль оновлено')
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Помилка при оновленні посилання'
			)
		}
	}

	// Обновляем slugInputValue при изменении slug в форме
	useEffect(() => {
		if (!isEditingSlug) {
			const currentSlug = watchedSlug || provider?.slug || ''
			setSlugInputValue(currentSlug)
		}
	}, [watchedSlug, provider?.slug, isEditingSlug])

	const preparePayload = (data: UpdateProviderSchema): UpdateProviderSchema => {
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
			serviceAreas: data.serviceAreas,
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
			slug: data.slug?.trim() || undefined,
		}
	}

	const onSubmit = handleSubmit(
		// @ts-expect-error - handleSubmit type inference issue with preprocess schemas
		async (data: UpdateProviderSchema) => {
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
			// Если текущий тип COMPANY, устанавливаем INDIVIDUAL, так как COMPANY недоступен
			setSelectedType(
				provider.type === ProviderType.COMPANY
					? ProviderType.INDIVIDUAL
					: provider.type
			)
		}
		openTypeModal()
	}

	const handleConfirmTypeChange = async () => {
		if (!provider) {
			return
		}

		// COMPANY недоступен для выбора, принудительно устанавливаем INDIVIDUAL
		const newType =
			selectedType === ProviderType.COMPANY
				? ProviderType.INDIVIDUAL
				: selectedType

		if (newType === provider.type) {
			closeTypeModal()
			return
		}

		try {
			await changeProviderType(newType)
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
			{isLoading ? (
				<div className='space-y-4'>
					<SkeletonProfileHero />
					<SkeletonForm count={4} />
					<Skeleton className='h-[300px] w-full rounded-lg' />
				</div>
			) : (
				<>
					<ProfileHero
						type='executor'
						avatar={provider?.avatar}
						displayName={
							provider?.businessName ||
							[provider?.firstName, provider?.lastName]
								.filter(Boolean)
								.join(' ') ||
							'—'
						}
						alt={provider?.businessName}
						onUpload={uploadAvatar}
						onRemove={removeAvatar}
						badges={
							<>
								{typeof provider?.location === 'object' &&
									(provider.location as { city?: string })?.city && (
										<Badge variant='default' size='md'>
											📍 {(provider.location as { city?: string }).city}
										</Badge>
									)}
								<Badge variant='default' size='md'>
									На платформі з{' '}
									{(provider as unknown as { createdAt?: string })?.createdAt
										? formatDateToString(
												(provider as unknown as { createdAt?: string })
													.createdAt!
										  )
										: '—'}
								</Badge>
								<Badge variant='default' size='md'>
									{(provider as unknown as { isVerified?: boolean })?.isVerified
										? '✅ Підтверджений'
										: '❌ Непідтверджений'}
								</Badge>
							</>
						}
					/>

					{/* Блок с ссылкой на профиль */}
					{(watchedSlug || provider?.slug || isEditingSlug) && (
						<div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<Label className='text-sm font-medium text-gray-700 mb-2 block'>
										Посилання на профіль:
									</Label>
									<div className='flex items-center gap-2'>
										{isEditingSlug ? (
											<>
												<div className='flex-1 flex items-center'>
													<span className='text-sm font-mono text-secondary-foreground whitespace-nowrap'>
														{typeof window !== 'undefined' &&
															window.location.origin}
														/
													</span>
													<Input
														value={slugInputValue}
														onChange={e => setSlugInputValue(e.target.value)}
														onKeyDown={e => {
															if (e.key === 'Enter') {
																e.preventDefault()
																handleSaveSlug()
															}
															if (e.key === 'Escape') {
																handleCancelEditSlug()
															}
														}}
														className='flex-1 font-mono text-sm py-1 px-2'
														containerClassName='mb-0'
														placeholder='ivan-petrov-123'
														autoFocus
													/>
												</div>
												<Button
													type='button'
													variant='outline-primary'
													size='icon'
													onClick={handleSaveSlug}
													className='shrink-0'
													disabled={isLoadingProvider}
												>
													<Save className='size-4' />
												</Button>
												<Button
													type='button'
													variant='outline'
													size='icon'
													onClick={handleCancelEditSlug}
													className='shrink-0'
												>
													<X className='size-4' />
												</Button>
											</>
										) : (
											<>
												<code className='flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono break-all'>
													{typeof window !== 'undefined' &&
														window.location.origin}
													/{watchedSlug || provider?.slug}
												</code>
												<Button
													type='button'
													variant='outline'
													size='icon'
													onClick={handleStartEditSlug}
													className='shrink-0'
												>
													<Edit className='size-4' />
												</Button>
												<Button
													type='button'
													variant='outline'
													size='icon'
													onClick={handleCopyLink}
													className='shrink-0'
												>
													<Copy className='size-4' />
												</Button>
											</>
										)}
									</div>
									<p className='text-xs text-gray-500 mt-2'>
										{isEditingSlug
											? 'Введіть нове посилання на профіль (тільки латинські літери, цифри та дефіси)'
											: 'Скопіюйте це посилання для поширення в соціальних мережах'}
									</p>
								</div>
							</div>
						</div>
					)}

					<form onSubmit={onSubmit}>
						<p className='text-sm text-destructive mb-2'>
							* Поля, позначені зірочкою, є обов&apos;язковими для заповнення
						</p>

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
								placeholder='Введіть ваш email'
								required
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
							<Label>Опис</Label>
							<Controller
								control={control}
								name='description'
								render={({ field }) => (
									<TipTapEditor
										value={field.value}
										onChange={field.onChange}
										placeholder='Розкажіть про свої навички та спеціалізацію...'
										error={!!errors.description}
									/>
								)}
							/>
							{errors.description && (
								<p className='text-sm text-destructive'>
									{errors.description.message}
								</p>
							)}
							<div className='text-sm text-gray-500'>
								Опис допоможе клієнтам краще зрозуміти ваші можливості
							</div>
						</div>

						<div className='space-y-2 mb-4'>
							<ServiceAreasInput
								name='serviceAreas'
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								control={control as any}
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								trigger={trigger as any}
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
								center={
									watchedLocation?.coordinates || userLocation?.coordinates
								}
								height={300}
								zoom={15}
							/>
						</div>
						<Button type='submit' size='lg' loading={isLoadingProvider}>
							{t('Profile.save')}
						</Button>
					</form>
				</>
			)}

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
