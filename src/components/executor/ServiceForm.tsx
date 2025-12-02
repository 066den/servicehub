'use client'

import { useEffect, useState, useMemo } from 'react'
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

			reset({
				name: currentService.name,
				description: currentService.description || '',
				subcategoryId: subcategoryId,
				typeId: currentService.typeId,
				price: currentService.price ?? null,
				duration: currentService.duration ?? null,
				isActive: currentService.isActive,
				isFeatured: currentService.isFeatured,
			})
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
		return Array.from(
			new Map(allTypes.map(type => [type.id, type])).values()
		)
	}, [
		watchedSubcategoryId,
		selectedCategoryId,
		getTypesBySubcategoryId,
		getTypesByCategoryId,
	])

	const onSubmit = handleSubmit(async (data: FormData) => {
		try {
			if (isNew) {
				const createData: CreateServiceSchema = {
					name: data.name.trim(),
					description: data.description?.trim() || undefined,
					subcategoryId: data.subcategoryId,
					typeId: data.typeId,
					price: data.price ?? null,
					duration: data.duration ?? null,
					pricingOptions: null,
					location: null,
					requirements: null,
					isActive: data.isActive ?? true,
					isFeatured: data.isFeatured ?? false,
				}

				const service = await createService(createData)
				if (service) {
					router.push(ROUTES.SERVICES)
				}
			} else {
				const updateData: UpdateServiceSchema = {
					name: data.name.trim(),
					description: data.description?.trim() || undefined,
					subcategoryId: data.subcategoryId,
					typeId: data.typeId,
					price: data.price ?? null,
					duration: data.duration ?? null,
					isActive: data.isActive,
					isFeatured: data.isFeatured,
				}

				const service = await updateService(Number(serviceId), updateData)
				if (service) {
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

			<form onSubmit={onSubmit} className='space-y-6'>
				<p className='text-sm text-destructive mb-2'>
					* Поля, позначені зірочкою, є обов&apos;язковими для заповнення
				</p>

				<div className='grid grid-cols-1 gap-4'>
					<Input
						{...register('name')}
						label='Назва послуги'
						placeholder='Наприклад: Ремонт смартфонів'
						required
						errorMessage={errors.name?.message}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='space-y-2'>
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

					<div className='space-y-2'>
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
										disabled={!selectedCategoryId || availableSubcategories.length === 0}
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

				<div className='grid grid-cols-1 gap-4'>
					<div className='space-y-2'>
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
												<SelectItem
													key={type.id}
													value={type.id.toString()}
												>
													{type.icon && <span className='mr-2'>{type.icon}</span>}
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
				</div>

				<div className='space-y-2'>
					<Label htmlFor='description'>Опис послуги</Label>
					<Textarea
						{...register('description')}
						id='description'
						placeholder='Опишіть послугу детально...'
						rows={6}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Controller
						name='price'
						control={control}
						render={({ field, fieldState }) => (
							<Input
								type='number'
								label='Ціна (₴)'
								placeholder='0.00'
								step='0.01'
								min='0'
								value={field.value ?? ''}
								onChange={e => {
									const value = e.target.value
									field.onChange(value === '' ? null : Number(value))
								}}
								errorMessage={fieldState.error?.message}
								helperText='Залиште порожнім для договірної ціни'
							/>
						)}
					/>

					<Controller
						name='duration'
						control={control}
						render={({ field, fieldState }) => (
							<Input
								type='number'
								label='Тривалість (хвилин)'
								placeholder='60'
								min='1'
								value={field.value ?? ''}
								onChange={e => {
									const value = e.target.value
									field.onChange(value === '' ? null : Number(value))
								}}
								errorMessage={fieldState.error?.message}
							/>
						)}
					/>
				</div>

				<div className='space-y-4'>
					<div className='flex items-center space-x-2'>
						<Controller
							name='isActive'
							control={control}
							render={({ field }) => (
								<Checkbox
									id='isActive'
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							)}
						/>
						<Label htmlFor='isActive' className='cursor-pointer'>
							Активна послуга (буде видно клієнтам)
						</Label>
					</div>

					<div className='flex items-center space-x-2'>
						<Controller
							name='isFeatured'
							control={control}
							render={({ field }) => (
								<Checkbox
									id='isFeatured'
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							)}
						/>
						<Label htmlFor='isFeatured' className='cursor-pointer'>
							Рекомендована послуга (буде виділена)
						</Label>
					</div>
				</div>

				<div className='flex gap-4 justify-end pt-4 border-t border-gray-200'>
					<Button
						type='button'
						variant='outline'
						onClick={() => router.push(ROUTES.SERVICES)}
						disabled={isSubmitting}
					>
						Скасувати
					</Button>
					<Button type='submit' loading={isSubmitting}>
						<Save className='size-4 mr-2' />
						{isNew ? 'Створити послугу' : 'Зберегти зміни'}
					</Button>
				</div>
			</form>
		</motion.section>
	)
}

export default ServiceForm
