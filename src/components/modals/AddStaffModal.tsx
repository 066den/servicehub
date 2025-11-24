'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createStaffSchema, type CreateStaffSchema } from '@/lib/schemas'
import Modal from './Modal'
import { Input } from '../ui/input'
import InputPhone from '../ui/forms/InputPhone'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { apiRequestAuth } from '@/lib/api'
import { useState } from 'react'

type Props = {
	isOpen: boolean
	onClose: () => void
	onSuccess?: () => void
}

const AddStaffModal = ({ isOpen, onClose, onSuccess }: Props) => {
	const [isLoading, setIsLoading] = useState(false)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		trigger,
		reset,
		formState: { errors },
	} = useForm<CreateStaffSchema>({
		// @ts-expect-error - zodResolver with enum types returns incompatible types
		resolver: zodResolver(createStaffSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			phone: '',
			position: '',
		},
	})

	const onSubmit = handleSubmit(
		// @ts-expect-error - handleSubmit type inference issue with enum schemas
		async (data: CreateStaffSchema) => {
			setIsLoading(true)
			try {
				await apiRequestAuth('/api/user/provider/staff', {
					method: 'POST',
					body: JSON.stringify(data),
				})
				toast.success('Співробітника успішно додано')
				reset()
				onClose()
				onSuccess?.()
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: 'Помилка при додаванні співробітника'
				)
			} finally {
				setIsLoading(false)
			}
		}
	)

	const handleClose = () => {
		if (!isLoading) {
			reset()
			onClose()
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title='Додати співробітника'
			subtitle='Заповніть інформацію про нового співробітника'
			size='lg'
			classNameContent='overflow-y-auto'
			footer={
				<div className='flex gap-3 justify-end'>
					<Button variant='outline' onClick={handleClose} disabled={isLoading}>
						Скасувати
					</Button>
					<Button onClick={onSubmit} loading={isLoading}>
						Додати
					</Button>
				</div>
			}
		>
			<form onSubmit={onSubmit} className='space-y-4'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<Input
						{...register('firstName')}
						label='Імʼя'
						required
						errorMessage={errors.firstName?.message}
					/>
					<Input
						{...register('lastName')}
						label='Прізвище'
						required
						errorMessage={errors.lastName?.message}
					/>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<InputPhone
						value={watch('phone') || ''}
						onChange={value =>
							setValue('phone', value, { shouldValidate: true })
						}
						onBlur={() => trigger('phone')}
						label='Телефон'
						error={errors.phone?.message}
					/>
					<Input
						{...register('position')}
						label='Посада'
						placeholder='Наприклад: Майстер'
						errorMessage={errors.position?.message}
					/>
				</div>
			</form>
		</Modal>
	)
}

export default AddStaffModal
