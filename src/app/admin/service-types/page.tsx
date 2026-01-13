import ServiceTypesManagement from '@/components/admin/ServiceTypesManagement'
import TopBarAdmin from '@/components/admin/TopBarAdmin'

export default function ServiceTypesPage() {
	return (
		<div className='space-y-6'>
			<TopBarAdmin title='Типи послуг' />
			<ServiceTypesManagement />
		</div>
	)
}
