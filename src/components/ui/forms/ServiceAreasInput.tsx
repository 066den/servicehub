'use client'

import { Controller } from 'react-hook-form'
import PlacesAutocomplete from './PlacesAutocomplete'
import type { LocationData } from '@/types'
import { X } from 'lucide-react'

interface ServiceAreasInputProps {
	name: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	trigger: any
}

const ServiceAreasInput = ({
	name,
	control,
	trigger,
}: ServiceAreasInputProps) => {
	return (
		<Controller
			name={name}
			control={control}
			rules={{
				required: "Регіон обслуговування є обов'язковим полем",
			}}
			render={({ field, fieldState }) => {
				const serviceAreas = Array.isArray(field.value)
					? field.value
					: field.value
					? [field.value]
					: []

				const handleAddArea = (location: LocationData) => {
					const cityName =
						location.city || location.address || location.formattedAddress
					if (!cityName) return

					const newAreas = Array.isArray(field.value) ? [...field.value] : []
					// Проверяем, не добавлен ли уже этот город
					const exists = newAreas.some(
						(area: unknown) =>
							(typeof area === 'string' && area === cityName) ||
							(typeof area === 'object' &&
								area !== null &&
								'city' in area &&
								(area as { city?: string }).city === cityName)
					)

					if (!exists) {
						// Сохраняем только название города для простоты
						newAreas.push(cityName)
						field.onChange(newAreas.length > 0 ? newAreas : undefined)
						trigger(name)
					}
				}

				const handleRemoveArea = (index: number) => {
					const newAreas = [...serviceAreas]
					newAreas.splice(index, 1)
					field.onChange(newAreas.length > 0 ? newAreas : undefined)
					trigger(name)
				}

				return (
					<div className='space-y-3'>
						<div>
							<PlacesAutocomplete
								onLocationSelect={handleAddArea}
								label='Регіони надання послуги'
								placeholder='Почніть вводити назву міста...'
								types={['(cities)']}
								required
							/>
							{fieldState.error && (
								<p className='text-sm text-destructive mt-1'>
									{fieldState.error.message}
								</p>
							)}
						</div>
						{serviceAreas.length > 0 && (
							<div className='space-y-2'>
								<div className='text-sm font-medium text-gray-700'>
									Вибрані регіони ({serviceAreas.length}):
								</div>
								<div className='flex flex-wrap gap-2'>
									{serviceAreas.map((area: unknown, index: number) => {
										const areaName =
											typeof area === 'string'
												? area
												: typeof area === 'object' &&
												  area !== null &&
												  'city' in area
												? (area as { city?: string }).city || 'Невідомо'
												: 'Невідомо'
										return (
											<div
												key={index}
												className='flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg'
											>
												<span className='text-sm text-blue-900'>
													{areaName}
												</span>
												<button
													type='button'
													onClick={() => handleRemoveArea(index)}
													className='text-blue-600 hover:text-blue-800 transition-colors'
												>
													<X className='w-4 h-4' />
												</button>
											</div>
										)
									})}
								</div>
							</div>
						)}
						<div className='text-sm text-gray-500'>
							Вкажіть міста або регіони, де ви надаєте послуги
						</div>
					</div>
				)
			}}
		/>
	)
}

export default ServiceAreasInput
