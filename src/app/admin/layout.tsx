import SidebarAdmin from '@/components/common/SidebarAdmin'

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className='grid grid-cols-[17.5rem_1fr] gap-6'>
			<SidebarAdmin />
			<div>{children}</div>
		</div>
	)
}
