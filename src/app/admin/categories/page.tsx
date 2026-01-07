import CategoriesList from '@/components/admin/CategoriesList'
import TopBarAdmin from '@/components/admin/TopBarAdmin'

export default function CategoriesPage() {
	return (
		<div className='space-y-6'>
			<TopBarAdmin title='Категорії' />
			<CategoriesList />
		</div>
	)
}
