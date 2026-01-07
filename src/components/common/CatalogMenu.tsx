'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from '@/components/ui/sheet'
import { useService } from '@/stores/service/useService'
import { useCommon } from '@/stores/common/useCommon'
import { Category, Subcategory } from '@/types'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import { InlinePreloader } from '../ui/preloader'

interface CatalogMenuProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	initialCategories?: Category[]
}

const CatalogMenu = ({
	open,
	onOpenChange,
	initialCategories,
}: CatalogMenuProps) => {
	const router = useRouter()
	const {
		categories: categoriesFromStore,
		isLoading,
		fetchCategories,
	} = useService()
	const { commonLocation } = useCommon()
	const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(
		null
	)
	const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Получаем текущий город для формирования URL
	// Используем полное название города, так как в БД хранится полное название
	const currentCity = useMemo(() => {
		return commonLocation?.city || 'Київ'
	}, [commonLocation])

	// Используем категории из пропсов, если они переданы, иначе используем store
	const categories = initialCategories || categoriesFromStore

	// Загружаем категории из store только если они не переданы через пропсы
	useEffect(() => {
		if (open && !initialCategories && categoriesFromStore.length === 0) {
			fetchCategories()
		}
	}, [open, initialCategories, categoriesFromStore.length, fetchCategories])

	// Фильтруем только активные категории
	const activeCategories = categories.filter(cat => cat.isActive)

	// Получаем подкатегории для hover-категории
	const hoveredCategory = activeCategories.find(
		cat => cat.id === hoveredCategoryId
	)
	const hoveredSubcategories = hoveredCategory
		? hoveredCategory.subcategories.filter(sub => sub.isActive)
		: []

	const handleCategoryMouseEnter = (categoryId: number) => {
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current)
			hoverTimeoutRef.current = null
		}
		setHoveredCategoryId(categoryId)
	}

	const handleCategoryClick = (category: Category) => {
		// const url = category.slug
		// 	? `${ROUTES.CATELOG}?category=${category.slug}`
		// 	: ROUTES.CATELOG
		// router.push(url)
		// onOpenChange(false)
		handleCategoryMouseEnter(category.id)
	}

	const handleSubcategoryClick = (subcategory: Subcategory) => {
		if (subcategory.slug) {
			// Используем маршрут /catalog/[city]/[subSlug]/
			const url = `/catalog/${encodeURIComponent(
				currentCity
			)}/${encodeURIComponent(subcategory.slug)}`
			router.push(url)
		} else {
			// Fallback на старый маршрут, если нет slug
			router.push(ROUTES.CATELOG)
		}
		onOpenChange(false)
	}

	// Очищаем timeout при размонтировании
	useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) {
				clearTimeout(hoverTimeoutRef.current)
			}
		}
	}, [])

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side='left' className='sm:max-w-xl p-0 flex flex-col'>
				<SheetHeader className='px-6 py-2.5 border-b'>
					<SheetTitle className='text-xl font-semibold'>Каталог</SheetTitle>
					<SheetDescription className='sr-only'>
						Меню каталогу послуг та категорій
					</SheetDescription>
				</SheetHeader>

				<div className='flex-1 flex overflow-hidden max-w-xl'>
					{/* Колонка с категориями */}
					<div className='flex-1 overflow-y-auto w-64 border-r'>
						{!initialCategories && isLoading ? (
							<InlinePreloader variant='wave' className='h-full' size='lg' />
						) : activeCategories.length === 0 ? (
							<div className='p-4 text-center text-muted-foreground'>
								Категорії не знайдено
							</div>
						) : (
							<ul className='py-2'>
								{activeCategories.map(category => {
									const hasSubcategories =
										category.subcategories.filter(sub => sub.isActive).length >
										0
									const isHovered = hoveredCategoryId === category.id

									return (
										<li key={category.id}>
											<button
												type='button'
												onMouseEnter={() =>
													handleCategoryMouseEnter(category.id)
												}
												//onMouseLeave={handleCategoryMouseLeave}
												onClick={() => handleCategoryClick(category)}
												className={cn(
													'w-full px-6 py-3 text-left flex items-center justify-between group',
													'hover:bg-primary/10 transition-colors',
													isHovered && 'bg-primary/10'
												)}
											>
												<div className='flex items-center gap-3 flex-1 min-w-0'>
													{category.icon && (
														<span className='text-xl flex-shrink-0'>
															{category.icon}
														</span>
													)}
													<span className='font-medium truncate'>
														{category.name}
													</span>
												</div>
												{hasSubcategories && (
													<ChevronRight
														className={cn(
															'size-4 flex-shrink-0 transition-transform',
															isHovered && 'translate-x-1'
														)}
													/>
												)}
											</button>
										</li>
									)
								})}
							</ul>
						)}
					</div>

					{/* Колонка с подкатегориями */}
					{hoveredSubcategories.length > 0 && (
						<div
							className='w-64 flex-shrink-0 overflow-y-auto bg-muted/30'
							//onMouseEnter={handleSubcategoryMouseEnter}
							//onMouseLeave={handleCategoryMouseLeave}
						>
							<div className='p-4'>
								<h3 className='text-sm font-semibold text-muted-foreground mb-2'>
									{hoveredCategory?.name}
								</h3>
								<ul className='space-y-1'>
									{hoveredSubcategories.map(subcategory => (
										<li key={subcategory.id}>
											<button
												type='button'
												onClick={() => handleSubcategoryClick(subcategory)}
												className='w-full px-4 py-2 text-left rounded-md hover:bg-primary/10 transition-colors text-sm'
											>
												<div className='flex items-center gap-2'>
													{subcategory.icon && (
														<span className='text-lg flex-shrink-0'>
															{subcategory.icon}
														</span>
													)}
													<span className='truncate'>{subcategory.name}</span>
												</div>
											</button>
										</li>
									))}
								</ul>
							</div>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	)
}

export default CatalogMenu
