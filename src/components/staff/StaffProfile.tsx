'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { Button } from '../ui/button'
import { Star, ArrowLeft, Award, Save, Trash2 } from 'lucide-react'
import { useProvider } from '@/stores/provider/useProvider'
import ProfileHero from '../profile/ProfileHero'
import { Badge } from '../ui/badge'
import { useStatusBadge } from '@/hooks/useStatusBadge'
import { Briefcase, Building2 } from 'lucide-react'
import {
	SkeletonForm,
	SkeletonProfileHero,
	SkeletonSectionHeader,
	SkeletonStatsGrid,
} from '../ui/sceletons'
import { StaffMember } from '@/types'
import { useForm } from 'react-hook-form'
import { Input } from '../ui/input'
import InputPhone from '../ui/forms/InputPhone'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select'
import { toast } from 'sonner'
import ConfirmDialog from '../modals/ConfirmDialog'
import { ROUTES } from '@/lib/constants'

type FormData = {
	phone: string
	position: string
	role: string
	status: string
}

const StaffProfile = () => {
	const params = useParams()
	const router = useRouter()
	const {
		staff,
		isLoadingStaff,
		fetchStaff,
		updateStaff,
		deleteStaff,
		uploadStaffAvatar,
		removeStaffAvatar,
	} = useProvider()
	const { getStatusBadge } = useStatusBadge()
	const [staffMember, setStaffMember] = useState<StaffMember | null>(null)
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			phone: '',
			position: '',
			role: '',
			status: '',
		},
	})

	useEffect(() => {
		if (staff.length === 0) {
			fetchStaff()
		}
	}, [staff.length, fetchStaff])

	useEffect(() => {
		if (params?.id && staff.length > 0) {
			const member = staff.find(m => m.id === Number(params.id))
			if (member) {
				setStaffMember(member)
				reset({
					phone: member.phone || '',
					position: member.position || '',
					role: member.role || '',
					status: member.status || '',
				})
			} else {
				// Если сотрудник не найден, попробуем обновить список
				fetchStaff(true)
			}
		}
	}, [params?.id, staff, fetchStaff, reset])

	// Обновляем staffMember при изменении staff, если он уже установлен
	useEffect(() => {
		if (staffMember && staff.length > 0) {
			const updatedMember = staff.find(m => m.id === staffMember.id)
			if (updatedMember && updatedMember.avatar !== staffMember.avatar) {
				setStaffMember(updatedMember)
			}
		}
	}, [staff, staffMember])

	const onSubmit = handleSubmit(async (data: FormData) => {
		if (!staffMember) return

		try {
			const updated = await updateStaff(staffMember.id, {
				phone: data.phone || undefined,
				position: data.position || undefined,
				role: data.role || undefined,
				status: data.status || undefined,
			})

			if (updated) {
				// Сохраняем старые значения статистики, если они отсутствуют в обновленных данных
				const enrichedUpdated: StaffMember = {
					...updated,
					rating: updated.rating ?? staffMember.rating,
					reviewCount: updated.reviewCount ?? staffMember.reviewCount,
					completedJobs: updated.completedJobs ?? staffMember.completedJobs,
					earnings: updated.earnings ?? staffMember.earnings,
				}
				setStaffMember(enrichedUpdated)
				toast.success('Профіль співробітника успішно оновлено')
			}
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Помилка при оновленні профіля співробітника'
			)
		}
	})

	const handleDeleteClick = () => {
		setDeleteConfirmOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!staffMember) return

		const success = await deleteStaff(staffMember.id)
		if (success) {
			toast.success('Співробітника успішно видалено')
			router.push(ROUTES.STAFF)
		} else {
			toast.error('Помилка видалення співробітника')
		}
	}

	const handleDeleteCancel = () => {
		setDeleteConfirmOpen(false)
	}

	const handleUploadAvatar = async (file: File) => {
		if (!staffMember) return
		try {
			await uploadStaffAvatar(staffMember.id, file)
			// useEffect автоматически обновит staffMember из обновленного списка staff
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Помилка завантаження аватара'
			)
		}
	}

	if (isLoadingStaff || !staffMember) {
		return (
			<div className='px-6 py-2'>
				<SkeletonSectionHeader />
				<SkeletonProfileHero />
				<SkeletonStatsGrid count={3} />
				<SkeletonForm count={3} />
			</div>
		)
	}

	if (!staffMember) {
		return (
			<div className='px-6 py-2'>
				<div className='flex items-center gap-4 mb-6'>
					<Button variant='outline' size='sm' onClick={() => router.back()}>
						<ArrowLeft className='w-4 h-4' />
						Назад
					</Button>
				</div>
				<div className='text-center py-12'>
					<p className='text-lg text-gray-600 mb-4'>
						Співробітника не знайдено
					</p>
					<Button variant='outline' onClick={() => router.back()}>
						Повернутися до списку
					</Button>
				</div>
			</div>
		)
	}

	return (
		<motion.section
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='px-6 py-2'
		>
			<Button
				variant='outline'
				size='sm'
				onClick={() => router.back()}
				className='flex items-center gap-2'
			>
				<ArrowLeft className='w-4 h-4' />
				Назад
			</Button>
			<div className='flex items-center gap-4 mb-6'>
				<div className='flex-1'>
					<h1 className='text-3xl font-bold mb-2'>Профіль співробітника</h1>
					<p className='text-secondary-foreground'>
						Детальна інформація про співробітника
					</p>
				</div>
			</div>

			{/* Hero Section */}
			<ProfileHero
				type='staff'
				avatar={staffMember.avatar}
				displayName={`${staffMember.firstName} ${staffMember.lastName}`}
				alt={`${staffMember.firstName} ${staffMember.lastName}`}
				onUpload={handleUploadAvatar}
				onRemove={async () => {
					try {
						await removeStaffAvatar(staffMember.id)
						// Обновляем локальное состояние
						setStaffMember(prev =>
							prev ? { ...prev, avatar: undefined } : null
						)
					} catch (error) {
						toast.error(
							error instanceof Error
								? error.message
								: 'Помилка видалення аватара'
						)
					}
				}}
				badges={
					<>
						{getStatusBadge(staffMember.status)}
						{staffMember.position && (
							<Badge variant='outline' size='md'>
								<Briefcase className='w-3 h-3 mr-1' />
								{staffMember.position}
							</Badge>
						)}
						{staffMember.department && (
							<Badge variant='outline' size='md'>
								<Building2 className='w-3 h-3 mr-1' />
								{staffMember.department}
							</Badge>
						)}
					</>
				}
			/>

			{/* Statistics */}
			{isLoadingStaff ? (
				<SkeletonStatsGrid count={2} />
			) : (
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
					<div className='bg-white border border-gray-200 rounded-lg p-4'>
						<div className='flex items-center gap-2 mb-2'>
							<Star className='w-5 h-5 fill-yellow-400 text-yellow-400' />
							<span className='text-sm text-gray-600'>Рейтинг</span>
						</div>
						<div className='text-2xl font-bold text-gray-900'>
							{staffMember.rating?.toFixed(1) ?? '—'}
						</div>
						<div className='text-sm text-gray-500'>
							{staffMember.reviewCount ?? 0} відгуків
						</div>
					</div>

					<div className='bg-white border border-gray-200 rounded-lg p-4'>
						<div className='flex items-center gap-2 mb-2'>
							<Award className='w-5 h-5 text-blue-500' />
							<span className='text-sm text-gray-600'>Завершених робіт</span>
						</div>
						<div className='text-2xl font-bold text-gray-900'>
							{staffMember.completedJobs ?? 0}
						</div>
					</div>
				</div>
			)}

			{/* Details */}
			<form onSubmit={onSubmit}>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
					<div className='bg-white border border-gray-200 rounded-lg p-6'>
						<h3 className='text-xl font-semibold mb-4'>Контактна інформація</h3>

						<div className='space-y-4'>
							<InputPhone
								value={watch('phone')}
								onChange={value => setValue('phone', value)}
								label='Телефон'
								placeholder='050 123 45 67'
								error={errors.phone?.message}
							/>
						</div>
					</div>

					<div className='bg-white border border-gray-200 rounded-lg p-6'>
						<h3 className='text-xl font-semibold mb-4'>
							Професійна інформація
						</h3>

						<div className='space-y-4'>
							<Input
								{...register('position')}
								label='Посада'
								placeholder='Введіть посаду'
							/>
							<div className='space-y-2'>
								<label className='text-sm font-medium text-gray-700'>
									Роль
								</label>
								<Select
									value={watch('role')}
									onValueChange={value => setValue('role', value)}
								>
									<SelectTrigger>
										<SelectValue placeholder='Виберіть роль' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='WORKER'>Працівник</SelectItem>
										<SelectItem value='MANAGER'>Менеджер</SelectItem>
										<SelectItem value='ADMIN'>Адміністратор</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<label className='text-sm font-medium text-gray-700'>
									Статус
								</label>
								<Select
									value={watch('status')}
									onValueChange={value => setValue('status', value)}
								>
									<SelectTrigger>
										<SelectValue placeholder='Виберіть статус' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='FREE'>Вільний</SelectItem>
										<SelectItem value='BUSY'>Зайнятий</SelectItem>
										<SelectItem value='ON_VACATION'>У відпустці</SelectItem>
										<SelectItem value='INACTIVE'>Неактивний</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</div>

				<div className='flex items-center gap-3 justify-end mb-6'>
					<Button
						type='button'
						variant='outline-destructive'
						onClick={handleDeleteClick}
						disabled={isLoadingStaff}
					>
						<Trash2 className='w-4 h-4 mr-2' />
						Видалити
					</Button>
					<Button type='submit' loading={isLoadingStaff}>
						<Save className='w-4 h-4 mr-2' />
						Зберегти
					</Button>
				</div>
			</form>

			<ConfirmDialog
				title='Видалити співробітника'
				text={`Ви впевнені, що хочете видалити співробітника "${staffMember?.firstName} ${staffMember?.lastName}"? Цю дію неможливо скасувати.`}
				isOpen={deleteConfirmOpen}
				onClose={handleDeleteCancel}
				onDestroy={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
				destroyText='Видалити'
				cancelText='Скасувати'
			/>
		</motion.section>
	)
}

export default StaffProfile
