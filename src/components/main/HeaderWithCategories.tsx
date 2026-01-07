import { getCategoriesWithSubcategories } from '@/services/service/categoryServices'
import Header from './Header'

/**
 * Серверный wrapper компонент для Header
 * Получает категории на сервере и передает их в клиентский Header
 */
export default async function HeaderWithCategories() {
	try {
		const categories = await getCategoriesWithSubcategories()
		return <Header categories={categories} />
	} catch (error) {
		console.error('[HeaderWithCategories] Error loading categories:', error)
		// Возвращаем Header с пустым массивом категорий при ошибке
		// Это предотвращает падение всей страницы
		return <Header categories={[]} />
	}
}
