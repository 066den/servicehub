'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { containerVariants } from '../ui/animate/variants'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import AddStaffModal from '../modals/AddStaffModal'
import useFlag from '@/hooks/useFlag'
import { apiRequestAuth } from '@/lib/api'

type StaffMember = {
	id: number
	firstName: string
	lastName: string
	phone?: string | null
	role: string
	status: string
	position?: string | null
	department?: string | null
	specialization?: string | null
	experience?: number | null
}

const Staff = () => {
	const [isModalOpen, openModal, closeModal] = useFlag()
	const [staff, setStaff] = useState<StaffMember[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const fetchStaff = async () => {
		setIsLoading(true)
		try {
			const data = await apiRequestAuth<{
				success?: boolean
				staff?: StaffMember[]
			}>('/api/user/provider/staff', {
				method: 'GET',
			})
			if (data.success && data.staff) {
				setStaff(data.staff)
			}
		} catch (error) {
			console.error('Error fetching staff:', error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchStaff()
	}, [])

	const handleSuccess = () => {
		fetchStaff()
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

			{isLoading ? (
				<div className='text-center py-8 text-gray-500'>Завантаження...</div>
			) : staff.length === 0 ? (
				<div className='text-center py-8 text-gray-500'>
					Співробітників поки немає. Додайте першого співробітника.
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{staff.map(member => (
						<div
							key={member.id}
							className='p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow'
						>
							<div className='flex items-start justify-between mb-3'>
								<div>
									<h3 className='font-semibold text-lg'>
										{member.firstName} {member.lastName}
									</h3>
									{member.position && (
										<p className='text-sm text-gray-600'>{member.position}</p>
									)}
								</div>
								<span
									className={`px-2 py-1 text-xs rounded-full ${
										member.status === 'ACTIVE'
											? 'bg-green-100 text-green-800'
											: member.status === 'INACTIVE'
											? 'bg-gray-100 text-gray-800'
											: member.status === 'ON_VACATION'
											? 'bg-blue-100 text-blue-800'
											: 'bg-red-100 text-red-800'
									}`}
								>
									{member.status === 'ACTIVE'
										? 'Активний'
										: member.status === 'INACTIVE'
										? 'Неактивний'
										: member.status === 'ON_VACATION'
										? 'У відпустці'
										: 'Призупинено'}
								</span>
							</div>
							<div className='space-y-1 text-sm text-gray-600'>
								{member.phone && <p>📞 {member.phone}</p>}
								{member.department && <p>🏢 {member.department}</p>}
								{member.specialization && <p>⚙️ {member.specialization}</p>}
								{member.experience !== null &&
									member.experience !== undefined && (
										<p>📅 Досвід: {member.experience} років</p>
									)}
								<p className='text-xs text-gray-500'>
									Роль: {member.role === 'WORKER' ? 'Робітник' : member.role}
								</p>
							</div>
						</div>
					))}
				</div>
			)}

			<AddStaffModal
				isOpen={isModalOpen}
				onClose={closeModal}
				onSuccess={handleSuccess}
			/>
		</motion.section>
	)
}

export default Staff
