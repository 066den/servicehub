import SidebarAdmin from '@/components/admin/SidebarAdmin'

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className='grid grid-cols-[17.5rem_1fr] gap-6'>
			<SidebarAdmin />
			{children}
		</div>
	)
}
