'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { Button } from '../ui/button'
import { Plus, Star, Edit, Trash2, Calendar } from 'lucide-react'
import AddStaffModal from '../modals/AddStaffModal'
import ConfirmDialog from '../modals/ConfirmDialog'
import useFlag from '@/hooks/useFlag'
import { useState } from 'react'
import { toast } from 'sonner'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { formatPhone } from '@/utils/phoneNumber'
import Avatar from '../ui/Avatar'
import { useProvider } from '@/stores/provider/useProvider'
import { useProviderStore } from '@/stores/provider/providerStore'
import { ROUTES } from '@/lib/constants'
import { useStatusBadge } from '@/hooks/useStatusBadge'

const Staff = () => {
	const router = useRouter()
	const [isModalOpen, openModal, closeModal] = useFlag()
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
	const [staffToDelete, setStaffToDelete] = useState<{
		id: number
		name: string
	} | null>(null)
	const [openPopoverId, setOpenPopoverId] = useState<number | null>(null)
	const closeTimerRef = useRef<NodeJS.Timeout | null>(null)
	const { staff, isLoadingStaff, fetchStaff, deleteStaff, updateStaff } =
		useProvider()
	const { getStatusBadge } = useStatusBadge()

	const clearCloseTimer = () => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current)
			closeTimerRef.current = null
		}
	}

	const scheduleClose = (id: number) => {
		clearCloseTimer()
		closeTimerRef.current = setTimeout(() => {
			setOpenPopoverId(prev => (prev === id ? null : prev))
		}, 200)
	}

	useEffect(() => {
		fetchStaff()
	}, [fetchStaff])

	useEffect(() => {
		return () => {
			clearCloseTimer()
		}
	}, [])

	const handleSuccess = () => {
		fetchStaff(true)
	}

	const handleViewProfile = (id: number) => {
		router.push(ROUTES.STAFF_PROFILE(id))
	}

	const handleDeleteClick = (member: {
		id: number
		firstName: string
		lastName: string
	}) => {
		setStaffToDelete({
			id: member.id,
			name: `${member.firstName} ${member.lastName}`,
		})
		setDeleteConfirmOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!staffToDelete) return

		const success = await deleteStaff(staffToDelete.id)
		if (success) {
			toast.success('Співробітника успішно видалено')
			setDeleteConfirmOpen(false)
			setStaffToDelete(null)
		} else {
			toast.error('Помилка видалення співробітника')
		}
	}

	const handleDeleteCancel = () => {
		setDeleteConfirmOpen(false)
		setStaffToDelete(null)
	}

	const handleStatusChange = async (
		staffId: number,
		newStatus: string,
		currentStatus: string
	) => {
		if (newStatus === currentStatus) {
			setOpenPopoverId(null)
			return
		}

		// Optimistic update: сохраняем текущее состояние для возможного отката
		const previousStaff = [...staff]

		// Обновляем UI сразу (optimistic update)
		const optimisticUpdate = staff.map(member =>
			member.id === staffId ? { ...member, status: newStatus } : member
		)

		// Обновляем локальное состояние через store
		useProviderStore.setState({ staff: optimisticUpdate })

		// Закрываем popover
		setOpenPopoverId(null)

		try {
			const updated = await updateStaff(
				staffId,
				{
					status: newStatus,
				},
				true // skipLoading для optimistic update
			)

			if (!updated) {
				// Откатываем изменения при ошибке
				useProviderStore.setState({ staff: previousStaff })
				toast.error('Помилка при оновленні статусу')
			} else {
				// Обновление уже произошло в store через updateStaff, просто показываем успех
				toast.success('Статус співробітника успішно оновлено')
			}
		} catch (error) {
			// Откатываем изменения при ошибке
			useProviderStore.setState({ staff: previousStaff })
			toast.error(
				error instanceof Error ? error.message : 'Помилка при оновленні статусу'
			)
		}
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
					<h1 className='text-3xl font-bold mb-2'>Співробітники</h1>
					<p className='text-secondary-foreground'>
						Управління командою виконавців
					</p>
				</div>
				<Button onClick={openModal}>
					<Plus className='size-4' /> Додати співробітника
				</Button>
			</div>

			{isLoadingStaff ? (
				<div className='text-center py-8 text-gray-500'>Завантаження...</div>
			) : staff.length === 0 ? (
				<div className='text-center py-8 text-gray-500'>
					Співробітників поки немає. Додайте першого співробітника.
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow className='hover:bg-transparent'>
							<TableHead>Співробітник</TableHead>
							<TableHead>Телефон</TableHead>
							<TableHead>Рейтинг</TableHead>
							<TableHead>Завершених робіт</TableHead>
							<TableHead>Статус</TableHead>
							<TableHead></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{staff.map(member => {
							return (
								<TableRow
									key={member.id}
									className='group hover:bg-gray-50/50 transition-colors'
								>
									<TableCell className='py-4'>
										<div className='flex items-center gap-3'>
											<Avatar user={member} />
											<div>
												<div className='font-medium text-gray-900'>
													{`${member.firstName} ${member.lastName}`}
												</div>
												<div className='text-sm text-gray-500'>
													{member.position || 'Не вказано'}
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell className='py-4 text-gray-700'>
										{member.phone ? formatPhone(member.phone) : 'Не вказано'}
									</TableCell>
									<TableCell className='py-4'>
										<div className='flex items-center gap-1 text-gray-700'>
											<Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
											<span className='font-medium'>
												{member.rating?.toFixed(1)}
											</span>
											<span className='text-gray-400'>
												({member.reviewCount} відгуків)
											</span>
										</div>
									</TableCell>
									<TableCell className='py-4 text-gray-700'>
										<span className='font-medium'>
											{member.completedJobs ?? 0}
										</span>
									</TableCell>
									<TableCell className='py-4'>
										<Popover
											open={openPopoverId === member.id}
											onOpenChange={open =>
												setOpenPopoverId(open ? member.id : null)
											}
										>
											<PopoverTrigger asChild>
												<div
													className='cursor-pointer'
													title='Змінити статус'
													onMouseEnter={() => {
														clearCloseTimer()
														setOpenPopoverId(member.id)
													}}
													onMouseLeave={() => {
														scheduleClose(member.id)
													}}
												>
													{getStatusBadge(member.status)}
												</div>
											</PopoverTrigger>
											<PopoverContent
												className='w-56 p-3'
												onOpenAutoFocus={e => e.preventDefault()}
												onMouseEnter={() => {
													clearCloseTimer()
													setOpenPopoverId(member.id)
												}}
												onMouseLeave={() => {
													scheduleClose(member.id)
												}}
											>
												<div className='space-y-2'>
													<div className='text-sm font-medium mb-3'>
														Змінити статус
													</div>
													<div className='space-y-2'>
														<div
															className='flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors'
															onClick={() =>
																handleStatusChange(
																	member.id,
																	'FREE',
																	member.status
																)
															}
														>
															<Checkbox
																id={`status-free-${member.id}`}
																checked={member.status === 'FREE'}
																onCheckedChange={() =>
																	handleStatusChange(
																		member.id,
																		'FREE',
																		member.status
																	)
																}
															/>
															<Label
																htmlFor={`status-free-${member.id}`}
																className='cursor-pointer flex-1'
															>
																Вільний
															</Label>
														</div>
														<div
															className='flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors'
															onClick={() =>
																handleStatusChange(
																	member.id,
																	'BUSY',
																	member.status
																)
															}
														>
															<Checkbox
																id={`status-busy-${member.id}`}
																checked={member.status === 'BUSY'}
																onCheckedChange={() =>
																	handleStatusChange(
																		member.id,
																		'BUSY',
																		member.status
																	)
																}
															/>
															<Label
																htmlFor={`status-busy-${member.id}`}
																className='cursor-pointer flex-1'
															>
																Зайнятий
															</Label>
														</div>
														<div
															className='flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors'
															onClick={() =>
																handleStatusChange(
																	member.id,
																	'ON_VACATION',
																	member.status
																)
															}
														>
															<Checkbox
																id={`status-vacation-${member.id}`}
																checked={member.status === 'ON_VACATION'}
																onCheckedChange={() =>
																	handleStatusChange(
																		member.id,
																		'ON_VACATION',
																		member.status
																	)
																}
															/>
															<Label
																htmlFor={`status-vacation-${member.id}`}
																className='cursor-pointer flex-1'
															>
																У відпустці
															</Label>
														</div>
														<div
															className='flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors'
															onClick={() =>
																handleStatusChange(
																	member.id,
																	'INACTIVE',
																	member.status
																)
															}
														>
															<Checkbox
																id={`status-inactive-${member.id}`}
																checked={member.status === 'INACTIVE'}
																onCheckedChange={() =>
																	handleStatusChange(
																		member.id,
																		'INACTIVE',
																		member.status
																	)
																}
															/>
															<Label
																htmlFor={`status-inactive-${member.id}`}
																className='cursor-pointer flex-1'
															>
																Неактивний
															</Label>
														</div>
													</div>
												</div>
											</PopoverContent>
										</Popover>
									</TableCell>
									<TableCell className='py-4'>
										<div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
											<Button
												variant='ghost'
												size='icon'
												className='h-8 w-8'
												onClick={() => handleViewProfile(member.id)}
												title='Редагувати'
											>
												<Edit className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='icon'
												className='h-8 w-8'
												title='Завдання'
											>
												<Calendar className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='icon'
												className='h-8 w-8 text-destructive hover:text-destructive'
												title='Видалити'
												onClick={() => handleDeleteClick(member)}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			)}

			<AddStaffModal
				isOpen={isModalOpen}
				onClose={closeModal}
				onSuccess={handleSuccess}
			/>

			<ConfirmDialog
				title='Видалити співробітника'
				text={`Ви впевнені, що хочете видалити співробітника "${staffToDelete?.name}"? Цю дію неможливо скасувати.`}
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

export default Staff
