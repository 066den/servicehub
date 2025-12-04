'use client'

import { useEffect, useState, useMemo, ChangeEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { Button } from '../ui/button'
import { ArrowLeft, Save } from 'lucide-react'
import { useProviderService } from '@/stores/service/useProviderService'
import { useService } from '@/stores/service/useService'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	createServiceSchema,
	updateServiceSchema,
	type CreateServiceSchema,
	type UpdateServiceSchema,
	type PricingFormat,
	type PricingOptions,
} from '@/lib/schemas'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { ROUTES } from '@/lib/constants'
import { PagePreloader } from '../ui/preloader'
import { DurationPicker, type DurationUnit } from '../ui/duration-picker'
import { apiRequestAuth } from '@/lib/api'
import ServiceAddonsManager from './ServiceAddonsManager'
import { ServiceAddonSchema } from '@/lib/schemas'
import ServiceMainPhoto from './ServiceMainPhoto'
import ServiceGallery from './ServiceGallery'

type FormData = {
	name: string
	description?: string
	subcategoryId: number
	typeId: number
	price: number | null
	duration: number | null
	isActive: boolean
	isFeatured: boolean
	pricingOptions?: unknown
	location?: unknown
	requirements?: unknown
	addons?: ServiceAddonSchema[]
}

const ServiceForm = () => {
	const params = useParams()
	const router = useRouter()
	const serviceId = params.id as string
	const isNew = serviceId === 'new'

	const {
		currentService,
		isLoading: isLoadingService,
		fetchService,
		createService,
		updateService,
	} = useProviderService()

	const {
		categories,
		fetchCategories,
		fetchSubcategories,
		fetchTypes,
		getSubcategoriesByCategoryId,
		getTypesBySubcategoryId,
		getTypesByCategoryId,
	} = useService()

	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
		null
	)
	const [durationUnit, setDurationUnit] = useState<DurationUnit>('mins')
	const [addons, setAddons] = useState<ServiceAddonSchema[]>([])
	const [pricingFormat, setPricingFormat] = useState<PricingFormat>('FIXED')
	const [pricingPrice, setPricingPrice] = useState<number | null>(null)
	const [pricingUnit, setPricingUnit] = useState<string>('')
	const [mainPhotoFile, setMainPhotoFile] = useState<File | null>(null)
	const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null)
	const [galleryPhotos, setGalleryPhotos] = useState<
		Array<{ id?: number; file?: File; url: string }>
	>([])

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		control,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<FormData>({
		resolver: zodResolver(
			isNew ? createServiceSchema : updateServiceSchema
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		) as any, // Type assertion needed due to conditional schema types
		defaultValues: {
			name: '',
			description: '',
			subcategoryId: 0,
			typeId: 0,
			price: null,
			duration: null,
			isActive: true,
			isFeatured: false,
		},
	})

	const watchedSubcategoryId = watch('subcategoryId')

	const changePrice = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setPricingPrice(value === '' ? null : Number(value))
		setValue('price', value === '' ? null : Number(value), {
			shouldValidate: true,
		})
	}

	// Загружаем данные
	useEffect(() => {
		fetchCategories()
		fetchSubcategories()
		fetchTypes()
	}, [fetchCategories, fetchSubcategories, fetchTypes])

	// Загружаем услугу при редактировании
	useEffect(() => {
		if (!isNew && serviceId) {
			const id = Number(serviceId)
			if (!isNaN(id)) {
				fetchService(id)
			}
		}
	}, [isNew, serviceId, fetchService])

	// Устанавливаем значения формы при загрузке услуги
	useEffect(() => {
		if (!isNew && currentService) {
			const subcategoryId = currentService.subcategoryId
			const categoryId = currentService.subcategory?.category?.id

			setSelectedCategoryId(categoryId || null)

			// Восстанавливаем формат стоимости из pricingOptions или используем старый формат
			let format: PricingFormat = 'FIXED'
			let price: number | null = currentService.price ?? null
			let unit: string = ''

			if (
				currentService.pricingOptions &&
				typeof currentService.pricingOptions === 'object'
			) {
				const options = currentService.pricingOptions as PricingOptions
				format = options.format || 'FIXED'
				price = options.price ?? null
				unit = options.unit || ''
			}

			setPricingFormat(format)
			setPricingPrice(price)
			setPricingUnit(unit)

			reset({
				name: currentService.name,
				description: currentService.description || '',
				subcategoryId: subcategoryId,
				typeId: currentService.typeId,
				price: price,
				duration: currentService.duration ?? null,
				isActive: currentService.isActive,
				isFeatured: currentService.isFeatured,
			})
			// Устанавливаем единицу времени по умолчанию
			setDurationUnit('mins')
			// Загружаем дополнительные услуги
			if (currentService.addons && currentService.addons.length > 0) {
				setAddons(
					currentService.addons.map(addon => ({
						title: addon.title,
						duration: addon.duration,
						price: addon.price,
						minQuantity: addon.minQuantity,
						maxQuantity: addon.maxQuantity,
						order: addon.order,
						isActive: addon.isActive,
					}))
				)
			} else {
				setAddons([])
			}

			// Загружаем фото
			if (currentService.photos && currentService.photos.length > 0) {
				const mainPhoto = currentService.photos.find(p => p.isMain)
				if (mainPhoto) {
					setMainPhotoUrl(mainPhoto.url)
				}

				const galleryPhotosList = currentService.photos
					.filter(p => !p.isMain)
					.map(photo => ({
						id: photo.id,
						url: photo.url,
					}))
				setGalleryPhotos(galleryPhotosList)
			} else {
				setMainPhotoUrl(null)
				setGalleryPhotos([])
			}
		}
	}, [currentService, isNew, reset])

	// Обновляем доступные подкатегории при изменении категории
	useEffect(() => {
		if (selectedCategoryId) {
			setValue('subcategoryId', 0, { shouldValidate: false })
			setValue('typeId', 0, { shouldValidate: false })
		}
	}, [selectedCategoryId, setValue])

	// Обновляем доступные типы при изменении подкатегории
	useEffect(() => {
		if (watchedSubcategoryId && watchedSubcategoryId > 0) {
			setValue('typeId', 0, { shouldValidate: false })
		}
	}, [watchedSubcategoryId, setValue])

	// Получаем доступные подкатегории для выбранной категории
	const availableSubcategories = useMemo(() => {
		if (!selectedCategoryId) return []
		return getSubcategoriesByCategoryId(selectedCategoryId)
	}, [selectedCategoryId, getSubcategoriesByCategoryId])

	// Получаем доступные типы для выбранной подкатегории
	const availableTypes = useMemo(() => {
		if (!watchedSubcategoryId || watchedSubcategoryId === 0) return []
		const typesBySubcategory = getTypesBySubcategoryId(watchedSubcategoryId)
		const typesByCategory = selectedCategoryId
			? getTypesByCategoryId(selectedCategoryId)
			: []
		// Объединяем типы из подкатегории и категории
		const allTypes = [...typesBySubcategory, ...typesByCategory]
		// Удаляем дубликаты
		return Array.from(new Map(allTypes.map(type => [type.id, type])).values())
	}, [
		watchedSubcategoryId,
		selectedCategoryId,
		getTypesBySubcategoryId,
		getTypesByCategoryId,
	])

	const handlePricingFormatChange = (value: string) => {
		setPricingFormat(value as PricingFormat)
		if (value !== 'PER_UNIT') {
			setPricingUnit('')
		}
	}

	const onSubmit = handleSubmit(async (data: FormData) => {
		try {
			// Формируем pricingOptions на основе выбранного формата
			let pricingOptions: PricingOptions | null = null
			const priceValue = pricingPrice ?? data.price

			if (priceValue !== null && priceValue > 0) {
				const baseOptions: {
					format: PricingFormat
					price: number
					unit?: string
					minPrice?: number
				} = {
					format: pricingFormat,
					price: priceValue,
				}

				if (pricingFormat === 'PER_UNIT' && pricingUnit) {
					baseOptions.unit = pricingUnit
				}

				if (pricingFormat === 'FROM') {
					baseOptions.minPrice = priceValue
				}

				pricingOptions = baseOptions as PricingOptions
			}

			if (isNew) {
				const createData: CreateServiceSchema = {
					name: data.name.trim(),
					description: data.description?.trim() || undefined,
					subcategoryId: data.subcategoryId,
					typeId: data.typeId,
					price: pricingFormat === 'FIXED' ? priceValue : null,
					duration: data.duration ?? null,
					pricingOptions: pricingOptions,
					location: null,
					requirements: null,
					isActive: data.isActive ?? true,
					isFeatured: data.isFeatured ?? false,
					addons: addons,
				}

				const service = await createService(createData)
				if (service) {
					// Загружаем главное фото если есть
					if (mainPhotoFile && service.id) {
						try {
							const formData = new FormData()
							formData.append('photo', mainPhotoFile)
							await apiRequestAuth(
								`/api/user/provider/services/${service.id}/main-photo`,
								{
									method: 'POST',
									body: formData,
								}
							)
						} catch (error) {
							console.error('Error uploading main photo:', error)
						}
					}

					// Загружаем фото галереи если есть
					const newGalleryPhotos = galleryPhotos.filter(p => p.file)
					if (newGalleryPhotos.length > 0 && service.id) {
						try {
							const formData = new FormData()
							newGalleryPhotos.forEach(photo => {
								if (photo.file) {
									formData.append('photos', photo.file)
								}
							})
							await apiRequestAuth(
								`/api/user/provider/services/${service.id}/photos`,
								{
									method: 'POST',
									body: formData,
								}
							)
						} catch (error) {
							console.error('Error uploading gallery photos:', error)
						}
					}

					router.push(ROUTES.SERVICES)
				}
			} else {
				const updateData: UpdateServiceSchema = {
					name: data.name.trim(),
					description: data.description?.trim() || undefined,
					subcategoryId: data.subcategoryId,
					typeId: data.typeId,
					price: pricingFormat === 'FIXED' ? priceValue : null,
					duration: data.duration ?? null,
					pricingOptions: pricingOptions,
					isActive: data.isActive,
					isFeatured: data.isFeatured,
					addons: addons,
				}

				const service = await updateService(Number(serviceId), updateData)
				if (service) {
					// Загружаем главное фото если есть новое
					if (mainPhotoFile && service.id) {
						try {
							const formData = new FormData()
							formData.append('photo', mainPhotoFile)
							await apiRequestAuth(
								`/api/user/provider/services/${service.id}/main-photo`,
								{
									method: 'POST',
									body: formData,
								}
							)
						} catch (error) {
							console.error('Error uploading main photo:', error)
						}
					}

					// Загружаем новые фото галереи если есть
					const newGalleryPhotos = galleryPhotos.filter(p => p.file)
					if (newGalleryPhotos.length > 0 && service.id) {
						try {
							const formData = new FormData()
							newGalleryPhotos.forEach(photo => {
								if (photo.file) {
									formData.append('photos', photo.file)
								}
							})
							await apiRequestAuth(
								`/api/user/provider/services/${service.id}/photos`,
								{
									method: 'POST',
									body: formData,
								}
							)
						} catch (error) {
							console.error('Error uploading gallery photos:', error)
						}
					}

					router.push(ROUTES.SERVICES)
				}
			}
		} catch (error) {
			console.error('Error saving service:', error)
		}
	})

	if (isLoadingService && !isNew) {
		return (
			<motion.section
				variants={containerVariants}
				initial='hidden'
				animate='visible'
				className='px-6 py-2'
			>
				<PagePreloader />
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
			<div className='flex items-center gap-4 mb-6 border-b border-gray-200 pb-4'>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => router.push(ROUTES.SERVICES)}
				>
					<ArrowLeft className='size-4' />
				</Button>
				<div>
					<h1 className='text-3xl font-bold mb-2'>
						{isNew ? 'Створити послугу' : 'Редагувати послугу'}
					</h1>
					<p className='text-secondary-foreground'>
						{isNew
							? 'Додайте нову послугу до вашого профілю'
							: 'Внесіть зміни до послуги'}
					</p>
				</div>
			</div>

			<form onSubmit={onSubmit} noValidate>
				<p className='text-sm text-destructive mb-2'>
					* Поля, позначені зірочкою, є обов&apos;язковими для заповнення
				</p>

				<Input
					{...register('name')}
					label='Назва послуги'
					placeholder='Наприклад: Ремонт смартфонів'
					required
					errorMessage={errors.name?.message}
				/>

				<ServiceMainPhoto
					serviceId={isNew ? null : Number(serviceId)}
					initialPhotoUrl={mainPhotoUrl}
					onPhotoChange={(url, file) => {
						setMainPhotoUrl(url)
						setMainPhotoFile(file || null)
					}}
				/>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='space-y-2 mb-4'>
						<Label htmlFor='category'>
							Категорія <span className='text-destructive'>*</span>
						</Label>
						<Select
							value={selectedCategoryId?.toString() || ''}
							onValueChange={value => {
								const categoryId = Number(value)
								setSelectedCategoryId(categoryId || null)
							}}
						>
							<SelectTrigger id='category'>
								<SelectValue placeholder='Виберіть категорію' />
							</SelectTrigger>
							<SelectContent>
								{categories.map(category => (
									<SelectItem key={category.id} value={category.id.toString()}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{!selectedCategoryId && (
							<p className='text-sm text-destructive'>
								Оберіть категорію для початку
							</p>
						)}
					</div>

					<div className='space-y-2 mb-4'>
						<Label htmlFor='subcategory'>
							Підкатегорія <span className='text-destructive'>*</span>
						</Label>
						<Controller
							name='subcategoryId'
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
											const subcategoryId = Number(value)
											field.onChange(subcategoryId)
										}}
										disabled={
											!selectedCategoryId || availableSubcategories.length === 0
										}
									>
										<SelectTrigger
											id='subcategory'
											className={
												fieldState.error
													? 'border-red-500 focus:border-red-500'
													: ''
											}
										>
											<SelectValue placeholder='Виберіть підкатегорію' />
										</SelectTrigger>
										<SelectContent>
											{availableSubcategories.map(subcategory => (
												<SelectItem
													key={subcategory.id}
													value={subcategory.id.toString()}
												>
													{subcategory.name}
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
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='space-y-2 mb-4'>
						<Label htmlFor='type'>
							Тип послуги <span className='text-destructive'>*</span>
						</Label>
						<Controller
							name='typeId'
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
										disabled={
											!watchedSubcategoryId ||
											watchedSubcategoryId === 0 ||
											availableTypes.length === 0
										}
									>
										<SelectTrigger
											id='type'
											className={
												fieldState.error
													? 'border-red-500 focus:border-red-500'
													: ''
											}
										>
											<SelectValue placeholder='Виберіть тип послуги' />
										</SelectTrigger>
										<SelectContent>
											{availableTypes.map(type => (
												<SelectItem key={type.id} value={type.id.toString()}>
													{type.icon && (
														<span className='mr-2'>{type.icon}</span>
													)}
													{type.name}
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

					<Controller
						name='duration'
						control={control}
						render={({ field, fieldState }) => (
							<DurationPicker
								label='Тривалість'
								required
								value={field.value} // Значение в минутах
								unit={durationUnit}
								onValueChange={field.onChange} // Получаем значение в минутах
								onUnitChange={setDurationUnit}
								min={1}
								errorMessage={fieldState.error?.message}
							/>
						)}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='space-y-2 mb-4'>
						<Label htmlFor='pricingFormat'>
							Формат вартості <span className='text-destructive'>*</span>
						</Label>
						<Select
							value={pricingFormat}
							onValueChange={handlePricingFormatChange}
						>
							<SelectTrigger id='pricingFormat'>
								<SelectValue placeholder='Виберіть формат вартості' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='FIXED'>Фіксована</SelectItem>
								<SelectItem value='FROM'>Від</SelectItem>
								<SelectItem value='HOURLY'>Погодинна</SelectItem>
								<SelectItem value='PER_UNIT'>За одиницю</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className='flex gap-4'>
						{pricingFormat === 'FIXED' && (
							<Input
								type='number'
								label='Ціна (₴)'
								placeholder='0.00'
								step='0.01'
								min='0'
								value={pricingPrice ?? ''}
								onChange={changePrice}
								errorMessage={errors.price?.message}
								helperText='Залиште порожнім для договірної ціни'
								containerClassName='flex-1'
							/>
						)}
						{pricingFormat === 'FROM' && (
							<Input
								type='number'
								label='Від (₴)'
								placeholder='0.00'
								step='0.01'
								min='0'
								value={pricingPrice ?? ''}
								onChange={changePrice}
								errorMessage={errors.price?.message}
								helperText='Мінімальна ціна послуги'
								containerClassName='flex-1'
							/>
						)}
						{pricingFormat === 'HOURLY' && (
							<Input
								type='number'
								label='Ціна за годину (₴)'
								placeholder='0.00'
								step='0.01'
								min='0'
								value={pricingPrice ?? ''}
								onChange={changePrice}
								errorMessage={errors.price?.message}
								helperText='Вартість однієї години роботи'
								containerClassName='flex-1'
							/>
						)}
						{pricingFormat === 'PER_UNIT' && (
							<>
								<Input
									type='number'
									label='Ціна (₴)'
									placeholder='0.00'
									step='0.01'
									min='0'
									value={pricingPrice ?? ''}
									onChange={changePrice}
									errorMessage={errors.price?.message}
									containerClassName='flex-1'
								/>
								<div className='space-y-2 mb-4'>
									<Label htmlFor='pricingUnit'>
										Одиниця виміру <span className='text-destructive'>*</span>
									</Label>
									<Select value={pricingUnit} onValueChange={setPricingUnit}>
										<SelectTrigger id='pricingUnit'>
											<SelectValue placeholder='-' />
										</SelectTrigger>
										<SelectContent className='max-h-[200px] overflow-y-auto'>
											<SelectItem value='м²'>м²</SelectItem>
											<SelectItem value='м³'>м³</SelectItem>
											<SelectItem value='шт.'>шт.</SelectItem>
											<SelectItem value='кг'>кг</SelectItem>
											<SelectItem value='л'>л</SelectItem>
											<SelectItem value='м'>м</SelectItem>
											<SelectItem value='км'>км</SelectItem>
											<SelectItem value='год'>год</SelectItem>
											<SelectItem value='день'>день</SelectItem>
											<SelectItem value='міс.'>міс.</SelectItem>
										</SelectContent>
									</Select>
									{!pricingUnit && (
										<p className='text-sm text-destructive'>
											Оберіть одиницю виміру
										</p>
									)}
								</div>
							</>
						)}
					</div>
				</div>

				<div className='space-y-2 mb-4'>
					<Label htmlFor='description'>Опис послуги</Label>
					<Textarea
						{...register('description')}
						id='description'
						placeholder='Опишіть послугу детально...'
						rows={6}
					/>
				</div>

				<div className='mb-6 pt-4'>
					<ServiceAddonsManager addons={addons} onChange={setAddons} />
				</div>

				<div className='mb-6 pt-4'>
					<ServiceGallery
						serviceId={isNew ? null : Number(serviceId)}
						initialPhotos={currentService?.photos?.filter(p => !p.isMain) || []}
						onPhotosChange={photos => {
							setGalleryPhotos(photos)
						}}
					/>
				</div>

				<div className='space-y-4 mb-6'>
					<div className='flex items-center space-x-2'>
						<Checkbox
							id='isActive'
							checked={watch('isActive')}
							onCheckedChange={checked => {
								setValue('isActive', checked as boolean)
							}}
							{...register('isActive')}
						/>
						<Label htmlFor='isActive' className='cursor-pointer'>
							Активна послуга (буде видно клієнтам)
						</Label>
					</div>

					{/* <div className='flex items-center space-x-2'>
						<Checkbox
							id='isFeatured'
							checked={watch('isFeatured')}
							onCheckedChange={checked => {
								setValue('isFeatured', checked as boolean)
							}}
							{...register('isFeatured')}
						/>
						<Label htmlFor='isFeatured' className='cursor-pointer'>
							Рекомендована послуга (буде виділена)
						</Label>
					</div> */}
				</div>

				<div className='flex gap-4 justify-end pt-4 border-t border-gray-200'>
					<Button
						type='button'
						size='md'
						variant='outline'
						onClick={() => router.push(ROUTES.SERVICES)}
						disabled={isSubmitting}
					>
						Скасувати
					</Button>
					<Button type='submit' loading={isSubmitting} size='md'>
						<Save className='size-4' />
						{isNew ? 'Створити послугу' : 'Зберегти зміни'}
					</Button>
				</div>
			</form>
		</motion.section>
	)
}

export default ServiceForm
