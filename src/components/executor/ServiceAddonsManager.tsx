'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table'
import Modal from '../modals/Modal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { serviceAddonSchemaValidate, ServiceAddonSchema } from '@/lib/schemas'
import { Input } from '../ui/input'
import useFlag from '@/hooks/useFlag'
import { z } from 'zod'

interface ServiceAddonsManagerProps {
	addons: ServiceAddonSchema[]
	onChange: (addons: ServiceAddonSchema[]) => void
}

const ServiceAddonsManager = ({
	addons,
	onChange,
}: ServiceAddonsManagerProps) => {
	const [isModalOpen, openModal, closeModal] = useFlag()
	const [editingIndex, setEditingIndex] = useState<number | null>(null)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<z.input<typeof serviceAddonSchemaValidate>>({
		resolver: zodResolver(serviceAddonSchemaValidate),
		defaultValues: {
			title: '',
			duration: 5,
			price: 0,
			minQuantity: 1,
			maxQuantity: 10,
			order: 0,
			isActive: true,
		},
	})

	const handleAddNew = () => {
		setEditingIndex(null)
		reset({
			title: '',
			duration: 5,
			price: 0,
			minQuantity: 1,
			maxQuantity: 10,
			order: addons.length,
			isActive: true,
		})
		openModal()
	}

	const handleEdit = (index: number) => {
		setEditingIndex(index)
		const addon = addons[index]
		reset({
			title: addon.title,
			duration: addon.duration,
			price: addon.price,
			minQuantity: addon.minQuantity,
			maxQuantity: addon.maxQuantity,
			order: addon.order,
			isActive: addon.isActive,
		})
		openModal()
	}

	const handleDelete = (index: number) => {
		const newAddons = addons.filter((_, i) => i !== index)
		onChange(newAddons)
	}

	const onSubmit = (data: z.input<typeof serviceAddonSchemaValidate>) => {
		// Преобразуем input в output тип (с применением дефолтных значений)
		const processedData: ServiceAddonSchema =
			serviceAddonSchemaValidate.parse(data)
		const newAddons = [...addons]
		if (editingIndex !== null) {
			newAddons[editingIndex] = processedData
		} else {
			newAddons.push(processedData)
		}
		onChange(newAddons)
		closeModal()
		reset()
		setEditingIndex(null)
	}

	const formatPrice = (price: number) => {
		return `${price.toFixed(2)} ₴`
	}

	const formatDuration = (duration: number) => {
		return `${duration} м`
	}

	return (
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<div>
					<h3 className='text-lg font-semibold'>Додаткові послуги</h3>
					<p className='text-sm text-gray-500'>
						{addons.length} {addons.length === 1 ? 'послуга' : 'послуг'}
					</p>
				</div>
				<Button type='button' variant='success' onClick={handleAddNew}>
					<Plus className='size-4' /> Додати нову
				</Button>
			</div>

			{addons.length === 0 ? (
				<div className='text-center py-8 text-gray-500 border border-gray-200 rounded-lg'>
					Додаткових послуг поки немає. Додайте першу послугу.
				</div>
			) : (
				<div className='border border-gray-200 rounded-lg overflow-hidden'>
					<Table>
						<TableHeader>
							<TableRow className='hover:bg-transparent'>
								<TableHead>Назва</TableHead>
								<TableHead>Тривалість</TableHead>
								<TableHead>Ціна</TableHead>
								<TableHead>Мін. кількість</TableHead>
								<TableHead>Макс. кількість</TableHead>
								<TableHead></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{addons.map((addon, index) => (
								<TableRow
									key={index}
									className='group hover:bg-gray-50/50 transition-colors'
								>
									<TableCell className='py-4 font-medium'>
										{addon.title}
									</TableCell>
									<TableCell className='py-4 text-gray-700'>
										{formatDuration(addon.duration)}
									</TableCell>
									<TableCell className='py-4 text-gray-700 font-medium'>
										{formatPrice(addon.price)}
									</TableCell>
									<TableCell className='py-4 text-gray-700'>
										{addon.minQuantity}
									</TableCell>
									<TableCell className='py-4 text-gray-700'>
										{addon.maxQuantity}
									</TableCell>
									<TableCell className='py-4'>
										<div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
											<Button
												type='button'
												variant='ghost'
												size='icon'
												className='h-8 w-8'
												onClick={() => handleEdit(index)}
												title='Редагувати'
											>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												type='button'
												variant='ghost'
												size='icon'
												className='h-8 w-8 text-destructive hover:text-destructive'
												title='Видалити'
												onClick={() => handleDelete(index)}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title={
					editingIndex !== null
						? 'Редагувати додаткову послугу'
						: 'Додати нову послугу'
				}
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
							{editingIndex !== null ? 'Зберегти зміни' : 'Додати'}
						</Button>
					</div>
				}
			>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className='space-y-4'
					noValidate
				>
					<Input
						{...register('title')}
						label='Назва послуги'
						placeholder='Наприклад: Мийка волосся до'
						required
						errorMessage={errors.title?.message}
					/>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<Input
							type='number'
							{...register('duration', { valueAsNumber: true })}
							label='Тривалість (хвилин)'
							placeholder='5'
							min='1'
							required
							errorMessage={errors.duration?.message}
						/>

						<Input
							type='number'
							{...register('price', { valueAsNumber: true })}
							label='Ціна (₴)'
							placeholder='0.00'
							step='0.01'
							min='0'
							required
							errorMessage={errors.price?.message}
						/>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<Input
							type='number'
							{...register('minQuantity', { valueAsNumber: true })}
							label='Мінімальна кількість'
							placeholder='1'
							min='1'
							required
							errorMessage={errors.minQuantity?.message}
						/>

						<Input
							type='number'
							{...register('maxQuantity', { valueAsNumber: true })}
							label='Максимальна кількість'
							placeholder='10'
							min='1'
							required
							errorMessage={errors.maxQuantity?.message}
						/>
					</div>
				</form>
			</Modal>
		</div>
	)
}

export default ServiceAddonsManager
