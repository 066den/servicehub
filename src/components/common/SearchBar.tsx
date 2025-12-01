'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import LoadingSpinner from '../ui/LoadingSpinner'
import Image from 'next/image'
import Link from 'next/link'

interface SearchResult {
	id: number
	name: string
	description: string | null
	price: number | null
	category: {
		id: number
		name: string
		slug: string | null
	}
	type: {
		id: number
		name: string
		slug: string | null
	}
	provider: {
		id: number
		businessName: string
		avatar: string | null
		rating: number
		reviewCount: number
	}
	image: string | null
}

interface SearchCategory {
	id: number
	name: string
	slug: string | null
	icon: string | null
	image: string | null
}

interface SearchResponse {
	success: boolean
	suggestions: string[]
	results: SearchResult[]
	categories: SearchCategory[]
}

const SearchBar = () => {
	const t = useTranslations()
	const router = useRouter()
	const [query, setQuery] = useState('')
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [suggestions, setSuggestions] = useState<string[]>([])
	const [results, setResults] = useState<SearchResult[]>([])
	const [categories, setCategories] = useState<SearchCategory[]>([])
	const [highlightedIndex, setHighlightedIndex] = useState(-1)
	const [totalItems, setTotalItems] = useState(0)

	const inputRef = useRef<HTMLInputElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

	// Подсчет общего количества элементов для навигации
	useEffect(() => {
		let count = 0
		if (suggestions.length > 0) count += suggestions.length
		if (results.length > 0) count += results.length
		if (categories.length > 0) count += categories.length
		// Добавляем элементы "Search in Category"
		if (categories.length > 0) count += Math.min(categories.length, 2)
		setTotalItems(count)
	}, [suggestions, results, categories])

	// Закрытие dropdown при клике вне компонента
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
				setHighlightedIndex(-1)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Поиск с debounce
	const performSearch = useCallback(async (searchQuery: string) => {
		if (searchQuery.trim().length < 2) {
			setSuggestions([])
			setResults([])
			setCategories([])
			setIsOpen(false)
			return
		}

		setIsLoading(true)
		try {
			const response = await fetch(
				`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`
			)
			const data: SearchResponse = await response.json()

			if (data.success) {
				setSuggestions(data.suggestions || [])
				setResults(data.results || [])
				setCategories(data.categories || [])
				setIsOpen(true)
			}
		} catch (error) {
			console.error('Search error:', error)
			setSuggestions([])
			setResults([])
			setCategories([])
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Обработка изменения input
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setQuery(value)
		setHighlightedIndex(-1)

		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current)
		}

		debounceTimerRef.current = setTimeout(() => {
			performSearch(value)
		}, 300)
	}

	// Обработка фокуса
	const handleFocus = () => {
		if (query.trim().length >= 2) {
			setIsOpen(true)
		}
	}

	// Обработка нажатия Enter
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			if (highlightedIndex >= 0) {
				// Выбрать выделенный элемент
				handleSelectItem(highlightedIndex)
			} else if (query.trim().length > 0) {
				// Перейти на страницу поиска
				handleSearch()
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault()
			setHighlightedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev))
		} else if (e.key === 'ArrowUp') {
			e.preventDefault()
			setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
		} else if (e.key === 'Escape') {
			setIsOpen(false)
			setHighlightedIndex(-1)
			inputRef.current?.blur()
		}
	}

	// Выбор элемента
	const handleSelectItem = (index: number) => {
		let currentIndex = 0

		// Suggestions
		if (index < suggestions.length) {
			const suggestion = suggestions[index]
			setQuery(suggestion)
			performSearch(suggestion)
			return
		}
		currentIndex += suggestions.length

		// Results
		if (index < currentIndex + results.length) {
			const result = results[index - currentIndex]
			router.push(`/services/${result.id}`)
			setIsOpen(false)
			return
		}
		currentIndex += results.length

		// Categories
		if (index < currentIndex + categories.length) {
			const category = categories[index - currentIndex]
			if (category.slug) {
				router.push(`/categories/${category.slug}`)
			} else {
				router.push(`/categories/${category.id}`)
			}
			setIsOpen(false)
			return
		}
	}

	// Очистка поиска
	const handleClear = () => {
		setQuery('')
		setSuggestions([])
		setResults([])
		setCategories([])
		setIsOpen(false)
		setHighlightedIndex(-1)
		inputRef.current?.focus()
	}

	// Поиск (кнопка или Enter)
	const handleSearch = () => {
		if (query.trim().length > 0) {
			router.push(`/search?q=${encodeURIComponent(query.trim())}`)
			setIsOpen(false)
		}
	}

	// Получить индекс для подсветки
	const getItemIndex = (
		section: 'suggestions' | 'results' | 'categories',
		itemIndex: number
	) => {
		let index = 0
		if (section === 'suggestions') {
			return itemIndex
		}
		index += suggestions.length
		if (section === 'results') {
			return index + itemIndex
		}
		index += results.length
		if (section === 'categories') {
			return index + itemIndex
		}
		return -1
	}

	const hasContent =
		suggestions.length > 0 || results.length > 0 || categories.length > 0

	return (
		<div className='relative flex-1 max-w-2xl w-full' ref={dropdownRef}>
			<div className='relative flex items-center'>
				{/* Input с иконкой поиска */}
				<div className='relative flex-1 min-w-0'>
					<Search className='absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none z-10' />
					<Input
						ref={inputRef}
						type='text'
						placeholder={t('Search.placeholder')}
						value={query}
						onChange={handleInputChange}
						onFocus={handleFocus}
						onKeyDown={handleKeyDown}
						className={cn(
							'pl-10 pr-10 h-11 w-full rounded-r-none',
							query && 'pr-10',
							isLoading && 'pr-20'
						)}
						containerClassName='mb-0'
					/>
					{/* Кнопка очистки */}
					{query && !isLoading && (
						<Button
							variant='ghost'
							size='round'
							withoutTransform
							onClick={handleClear}
							className='absolute right-2 top-1/2 -translate-y-1/2 p-0 z-10'
						>
							<X className='size-4' />
						</Button>
					)}
					{/* Индикатор загрузки */}
					{isLoading && (
						<div className='absolute right-2 top-1/2 -translate-y-1/2 z-10'>
							<LoadingSpinner size='sm' color='secondary' />
						</div>
					)}
				</div>

				<Button
					variant='accent'
					size='md'
					onClick={handleSearch}
					disabled={!query.trim()}
					className='flex-shrink-0 rounded-l-none hover:translate-y-0 hover:shadow-none'
				>
					<span className='hidden sm:inline'>{t('Search.button')}</span>
					<span className='sm:hidden'>
						<Search className='size-4' />
					</span>
				</Button>
			</div>

			{/* Dropdown */}
			<AnimatePresence>
				{isOpen && hasContent && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className='absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[600px] overflow-auto'
					>
						{/* Suggestions */}
						{suggestions.length > 0 && (
							<div className='p-2'>
								{suggestions.map((suggestion, index) => {
									const itemIndex = getItemIndex('suggestions', index)
									return (
										<div
											key={`suggestion-${index}`}
											className={cn(
												'px-4 py-2 cursor-pointer rounded-md transition-colors',
												'hover:bg-gray-50',
												highlightedIndex === itemIndex && 'bg-blue-50'
											)}
											onClick={() => handleSelectItem(itemIndex)}
											onMouseEnter={() => setHighlightedIndex(itemIndex)}
										>
											<div className='flex items-center gap-2'>
												<Search className='size-4 text-gray-400' />
												<span className='text-gray-900'>{suggestion}</span>
											</div>
										</div>
									)
								})}
							</div>
						)}

						{/* Results */}
						{results.length > 0 && (
							<div className='border-t border-gray-100'>
								<div className='px-4 py-2 flex items-center justify-between'>
									<h3 className='text-sm font-semibold text-gray-700'>
										{t('Search.allResults')}
									</h3>
									<Link
										href={`/search?q=${encodeURIComponent(query)}`}
										className='text-sm text-primary hover:underline flex items-center gap-1'
										onClick={() => setIsOpen(false)}
									>
										<span>{t('Search.allResults')}</span>
										<ChevronRight className='size-4' />
									</Link>
								</div>
								<div className='p-2 space-y-2'>
									{results.slice(0, 3).map((result, index) => {
										const itemIndex = getItemIndex('results', index)
										return (
											<div
												key={`result-${result.id}`}
												className={cn(
													'px-4 py-3 cursor-pointer rounded-md transition-colors',
													'hover:bg-gray-50',
													highlightedIndex === itemIndex && 'bg-blue-50'
												)}
												onClick={() => handleSelectItem(itemIndex)}
												onMouseEnter={() => setHighlightedIndex(itemIndex)}
											>
												<div className='flex items-center gap-3'>
													{result.image && (
														<div className='relative size-16 rounded-lg overflow-hidden flex-shrink-0'>
															<Image
																src={result.image}
																alt={result.name}
																fill
																className='object-cover'
															/>
														</div>
													)}
													<div className='flex-1 min-w-0'>
														<h4 className='font-medium text-gray-900 truncate'>
															{result.name}
														</h4>
														{result.description && (
															<p className='text-sm text-gray-500 line-clamp-1'>
																{result.description}
															</p>
														)}
														<div className='flex items-center gap-4 mt-1 text-xs text-gray-400'>
															{result.price && <span>{result.price} ₴</span>}
															<span>{result.provider.businessName}</span>
														</div>
													</div>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						)}

						{/* Categories */}
						{categories.length > 0 && (
							<div className='border-t border-gray-100'>
								<h3 className='px-4 py-2 text-sm font-semibold text-gray-700'>
									{t('Search.goToCategory')}
								</h3>
								<div className='p-2 space-y-1'>
									{categories.map((category, index) => {
										const itemIndex = getItemIndex('categories', index)
										return (
											<div
												key={`category-${category.id}`}
												className={cn(
													'px-4 py-2 cursor-pointer rounded-md transition-colors',
													'hover:bg-gray-50',
													highlightedIndex === itemIndex && 'bg-blue-50'
												)}
												onClick={() => handleSelectItem(itemIndex)}
												onMouseEnter={() => setHighlightedIndex(itemIndex)}
											>
												<div className='flex items-center gap-2'>
													{category.icon && (
														<span className='text-lg'>{category.icon}</span>
													)}
													<span className='text-gray-900'>{category.name}</span>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						)}

						{/* Search in Category */}
						{categories.length > 0 && (
							<div className='border-t border-gray-100'>
								<h3 className='px-4 py-2 text-sm font-semibold text-gray-700'>
									{t('Search.searchInCategory')}
								</h3>
								<div className='p-2 space-y-1'>
									{categories.slice(0, 2).map((category, index) => {
										const baseIndex =
											suggestions.length + results.length + categories.length
										const itemIndex = baseIndex + index
										return (
											<Link
												key={`search-category-${category.id}`}
												href={`/categories/${
													category.slug || category.id
												}?q=${encodeURIComponent(query)}`}
												className={cn(
													'px-4 py-2 cursor-pointer rounded-md transition-colors block',
													'hover:bg-gray-50',
													highlightedIndex === itemIndex && 'bg-blue-50'
												)}
												onClick={() => setIsOpen(false)}
												onMouseEnter={() => setHighlightedIndex(itemIndex)}
											>
												<div className='flex items-center gap-2'>
													<Search className='size-4 text-gray-400' />
													<span className='text-gray-900'>
														{query} в {category.name}
													</span>
												</div>
											</Link>
										)
									})}
								</div>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default SearchBar
