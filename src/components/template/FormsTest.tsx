'use client'
import React from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import InputPhone from '@/components/ui/forms/InputPhone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function FormsTest() {
	// Валидация для телефонных номеров
	const phoneValidationSchema = Yup.object().shape({
		phone: Yup.string()
			.matches(/^0[56789]\d{8}$/, 'Введите корректный номер телефона')
			.required('Номер телефона обязателен'),
		phoneOptional: Yup.string()
			.matches(/^0[56789]\d{8}$/, 'Введите корректный номер телефона')
			.nullable(),
		phoneWithHelper: Yup.string()
			.matches(/^0[56789]\d{8}$/, 'Введите корректный номер телефона')
			.required('Номер телефона обязателен'),
	})

	const initialValues = {
		phone: '',
		phoneOptional: '',
		phoneWithHelper: '',
	}

	const handleSubmit = (values: typeof initialValues) => {
		console.log('Form submitted:', values)
		alert(`Форма отправлена! Телефон: ${values.phone}`)
	}

	return (
		<div className='min-h-screen bg-gray-50 p-8'>
			<div className='max-w-6xl mx-auto space-y-8'>
				{/* Header */}
				<div className='text-center'>
					<div className='flex items-center justify-center gap-2 mb-4'>
						<div className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center'>
							<span className='text-white font-bold text-xl'>S</span>
						</div>
						<h1 className='text-4xl font-bold text-gray-900'>ServiceHub</h1>
					</div>
					<h2 className='text-2xl font-semibold text-gray-800 mb-2'>
						Компоненты форм
					</h2>
					<p className='text-gray-600'>
						Полная библиотека компонентов форм в стиле ServiceHub
					</p>
				</div>

				{/* Progress Bar */}
				<div className='bg-white rounded-xl p-6 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-4'>
						Прогресс заполнения
					</h3>
					<div className='w-full bg-gray-200 rounded-full h-2'>
						<div
							className='bg-gradient-to-r from-blue-600 to-orange-500 h-2 rounded-full transition-all duration-500'
							style={{ width: '65%' }}
						></div>
					</div>
					<p className='text-sm text-gray-600 mt-2'>65% заполнено</p>
				</div>

				{/* Text Inputs */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Текстовые поля
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label htmlFor='text-input'>Обычное поле *</Label>
							<Input id='text-input' placeholder='Введите текст' />
							<p className='text-sm text-gray-500'>
								Обычное текстовое поле для ввода данных
							</p>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='email-input'>Email</Label>
							<Input
								id='email-input'
								type='email'
								placeholder='example@email.com'
								defaultValue='user@example.com'
							/>
							<p className='text-sm text-green-600 flex items-center gap-2'>
								<span>✓</span>
								<span>Email адрес корректный</span>
							</p>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='phone-input'>Телефон</Label>
							<Input
								id='phone-input'
								type='tel'
								placeholder='+380 (XX) XXX-XX-XX'
								defaultValue='123'
							/>
							<p className='text-sm text-red-600 flex items-center gap-2'>
								<span>✗</span>
								<span>Неверный формат номера телефона</span>
							</p>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='disabled-input'>Заблокированное поле</Label>
							<Input
								id='disabled-input'
								placeholder='Недоступно для редактирования'
								disabled
							/>
						</div>
					</div>
				</div>

				{/* Special Inputs */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Специальные поля
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label htmlFor='search-input'>Поиск</Label>
							<Input
								id='search-input'
								type='search'
								placeholder='Поиск услуг...'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='password-input'>Пароль</Label>
							<Input
								id='password-input'
								type='password'
								placeholder='Введите пароль'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='url-input'>URL</Label>
							<Input
								id='url-input'
								type='url'
								placeholder='https://example.com'
							/>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='number-input'>Число</Label>
							<Input
								id='number-input'
								type='number'
								placeholder='0'
								min='0'
								max='100'
							/>
						</div>
					</div>
				</div>

				{/* Textarea */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Большие текстовые поля
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label htmlFor='service-description'>Описание услуги</Label>
							<Textarea
								id='service-description'
								placeholder='Подробно опишите вашу услугу...'
								rows={4}
							/>
							<p className='text-sm text-gray-500'>Минимум 50 символов</p>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='additional-info'>Дополнительная информация</Label>
							<Textarea
								id='additional-info'
								placeholder='Любая дополнительная информация...'
								rows={4}
							/>
						</div>
					</div>
				</div>

				{/* Select */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Выпадающие списки
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label htmlFor='category'>Категория услуги *</Label>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder='Выберите категорию' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='web-dev'>Веб-разработка</SelectItem>
									<SelectItem value='design'>Дизайн</SelectItem>
									<SelectItem value='marketing'>Маркетинг</SelectItem>
									<SelectItem value='writing'>Копирайтинг</SelectItem>
									<SelectItem value='photo'>Фотография</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='city'>Город</Label>
							<Select>
								<SelectTrigger>
									<SelectValue placeholder='Выберите город' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='kyiv'>Киев</SelectItem>
									<SelectItem value='kharkiv'>Харьков</SelectItem>
									<SelectItem value='odesa'>Одесса</SelectItem>
									<SelectItem value='dnipro'>Днепр</SelectItem>
									<SelectItem value='lviv'>Львов</SelectItem>
									<SelectItem value='remote'>Удаленно</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>

				{/* Checkboxes and Radio */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Флажки и переключатели
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						<div className='space-y-4'>
							<Label className='text-base font-medium'>
								Дополнительные услуги
							</Label>
							<div className='space-y-3'>
								<div className='flex items-center space-x-2'>
									<Checkbox id='seo' />
									<Label htmlFor='seo'>SEO оптимизация</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<Checkbox id='analytics' defaultChecked />
									<Label htmlFor='analytics'>Настройка аналитики</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<Checkbox id='support' />
									<Label htmlFor='support'>Техническая поддержка</Label>
								</div>
								<div className='flex items-center space-x-2'>
									<Checkbox id='training' />
									<Label htmlFor='training'>Обучение использованию</Label>
								</div>
							</div>
						</div>

						<div className='space-y-4'>
							<Label className='text-base font-medium'>
								Тип сотрудничества *
							</Label>
							<RadioGroup defaultValue='one-time'>
								<div className='space-y-3'>
									<div className='flex items-center space-x-2'>
										<RadioGroupItem value='one-time' id='one-time' />
										<Label htmlFor='one-time'>Разовый проект</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<RadioGroupItem value='ongoing' id='ongoing' />
										<Label htmlFor='ongoing'>Постоянное сотрудничество</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<RadioGroupItem value='part-time' id='part-time' />
										<Label htmlFor='part-time'>Частичная занятость</Label>
									</div>
									<div className='flex items-center space-x-2'>
										<RadioGroupItem value='full-time' id='full-time' />
										<Label htmlFor='full-time'>Полная занятость</Label>
									</div>
								</div>
							</RadioGroup>
						</div>
					</div>
				</div>

				{/* Switches */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Переключатели
					</h3>
					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<Label htmlFor='email-notifications'>Email уведомления</Label>
							<Switch id='email-notifications' defaultChecked />
						</div>
						<div className='flex items-center justify-between'>
							<Label htmlFor='sms-notifications'>SMS уведомления</Label>
							<Switch id='sms-notifications' />
						</div>
						<div className='flex items-center justify-between'>
							<Label htmlFor='push-notifications'>Push уведомления</Label>
							<Switch id='push-notifications' />
						</div>
					</div>
				</div>

				{/* Date and Time */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Дата и время
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label htmlFor='start-date'>Дата начала проекта</Label>
							<Input id='start-date' type='date' />
						</div>

						<div className='space-y-2'>
							<Label htmlFor='time-input'>Время</Label>
							<Input id='time-input' type='time' />
						</div>

						<div className='space-y-2'>
							<Label htmlFor='datetime-input'>Дата и время</Label>
							<Input id='datetime-input' type='datetime-local' />
						</div>

						<div className='space-y-2'>
							<Label>Период работы</Label>
							<div className='grid grid-cols-2 gap-3'>
								<Input type='date' placeholder='От' />
								<Input type='date' placeholder='До' />
							</div>
						</div>
					</div>
				</div>

				{/* Range */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>Ползунки</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label htmlFor='price-range'>
								Бюджет проекта:{' '}
								<span className='text-blue-600 font-medium'>5000</span> ₴
							</Label>
							<input
								type='range'
								id='price-range'
								min='1000'
								max='50000'
								step='500'
								defaultValue='5000'
								className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider'
							/>
							<p className='text-sm text-gray-600'>От 1,000₴ до 50,000₴</p>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='experience-range'>
								Опыт работы:{' '}
								<span className='text-blue-600 font-medium'>3</span> года
							</Label>
							<input
								type='range'
								id='experience-range'
								min='0'
								max='20'
								defaultValue='3'
								className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider'
							/>
						</div>
					</div>
				</div>

				{/* File Upload */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Загрузка файлов
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label>Портфолио (изображения)</Label>
							<div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer'>
								<div className='text-4xl mb-2'>📁</div>
								<div className='font-medium text-gray-700 mb-1'>
									Перетащите файлы сюда
								</div>
								<div className='text-sm text-gray-500'>
									или нажмите для выбора
								</div>
								<div className='text-sm text-gray-500 mt-1'>
									PNG, JPG до 10МБ
								</div>
							</div>
						</div>

						<div className='space-y-2'>
							<Label>Документы</Label>
							<div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer'>
								<div className='text-4xl mb-2'>📄</div>
								<div className='font-medium text-gray-700 mb-1'>
									Загрузить документы
								</div>
								<div className='text-sm text-gray-500'>
									PDF, DOC, DOCX до 5МБ
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Color Picker */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Выбор цвета
					</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div className='space-y-2'>
							<Label htmlFor='brand-color'>Основной цвет бренда</Label>
							<div className='flex items-center gap-3'>
								<input
									type='color'
									id='brand-color'
									defaultValue='#2563EB'
									className='w-16 h-12 border-2 border-gray-200 rounded-lg cursor-pointer'
								/>
								<span className='font-mono text-gray-600'>#2563EB</span>
							</div>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='accent-color'>Акцентный цвет</Label>
							<div className='flex items-center gap-3'>
								<input
									type='color'
									id='accent-color'
									defaultValue='#F59E0B'
									className='w-16 h-12 border-2 border-gray-200 rounded-lg cursor-pointer'
								/>
								<span className='font-mono text-gray-600'>#F59E0B</span>
							</div>
						</div>
					</div>
				</div>

				{/* Form Actions */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Кнопки действий
					</h3>
					<div className='space-y-6'>
						<div className='space-y-2'>
							<Label>Основные кнопки</Label>
							<div className='flex flex-wrap gap-3'>
								<Button variant='default'>💾 Сохранить</Button>
								<Button variant='accent'>🚀 Опубликовать</Button>
								<Button variant='secondary'>📋 Сохранить как черновик</Button>
							</div>
						</div>

						<div className='space-y-2'>
							<Label>Дополнительные действия</Label>
							<div className='flex flex-wrap gap-3'>
								<Button variant='outline'>👁️ Предпросмотр</Button>
								<Button variant='success'>✅ Подтвердить</Button>
								<Button variant='destructive'>🗑️ Удалить</Button>
								<Button variant='secondary' disabled>
									⏳ Обработка...
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Example Forms */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Примеры использования
					</h3>

					{/* Registration Form */}
					<div className='bg-blue-50 rounded-xl p-6 mb-6'>
						<h4 className='text-lg font-semibold text-gray-800 mb-4'>
							Регистрация исполнителя
						</h4>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
							<div className='space-y-2'>
								<Label htmlFor='full-name'>Полное имя *</Label>
								<Input id='full-name' placeholder='Иван Иванов' />
							</div>
							<div className='space-y-2'>
								<Label htmlFor='reg-email'>Email *</Label>
								<Input
									id='reg-email'
									type='email'
									placeholder='ivan@example.com'
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='reg-category'>Специализация *</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder='Выберите специализацию' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='web-dev'>Веб-разработка</SelectItem>
										<SelectItem value='design'>Дизайн</SelectItem>
										<SelectItem value='marketing'>Маркетинг</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='experience'>Опыт работы</Label>
								<Input
									id='experience'
									type='number'
									placeholder='0'
									min='0'
									max='50'
									defaultValue='2'
								/>
							</div>
						</div>

						<div className='space-y-2 mb-4'>
							<Label htmlFor='about-me'>О себе</Label>
							<Textarea
								id='about-me'
								placeholder='Расскажите о своем опыте и навыках...'
								rows={3}
							/>
						</div>

						<div className='mt-4 space-y-3'>
							<div className='flex items-center space-x-2'>
								<Checkbox id='terms' required />
								<Label htmlFor='terms'>
									Я согласен с условиями использования
								</Label>
							</div>
							<div className='flex items-center space-x-2'>
								<Checkbox id='newsletter' />
								<Label htmlFor='newsletter'>Хочу получать email рассылку</Label>
							</div>
						</div>

						<div className='flex flex-wrap gap-3 mt-6'>
							<Button variant='default'>Зарегистрироваться</Button>
							<Button variant='outline'>Уже есть аккаунт?</Button>
						</div>
					</div>

					{/* Service Order Form */}
					<div className='bg-green-50 rounded-xl p-6'>
						<h4 className='text-lg font-semibold text-gray-800 mb-4'>
							Заказ услуги
						</h4>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
							<div className='space-y-2'>
								<Label htmlFor='order-service'>Тип услуги *</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder='Выберите услугу' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='website'>Создание сайта</SelectItem>
										<SelectItem value='logo'>Разработка логотипа</SelectItem>
										<SelectItem value='seo'>SEO продвижение</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='order-budget'>
									Бюджет:{' '}
									<span className='text-green-600 font-medium'>10000</span> ₴
								</Label>
								<input
									type='range'
									id='order-budget'
									min='1000'
									max='100000'
									step='1000'
									defaultValue='10000'
									className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='deadline'>Срок выполнения *</Label>
								<Input id='deadline' type='date' required />
							</div>

							<div className='space-y-2'>
								<Label className='text-base font-medium'>Приоритет *</Label>
								<RadioGroup defaultValue='medium'>
									<div className='space-y-2'>
										<div className='flex items-center space-x-2'>
											<RadioGroupItem value='low' id='priority-low' />
											<Label htmlFor='priority-low'>Низкий</Label>
										</div>
										<div className='flex items-center space-x-2'>
											<RadioGroupItem value='medium' id='priority-medium' />
											<Label htmlFor='priority-medium'>Средний</Label>
										</div>
										<div className='flex items-center space-x-2'>
											<RadioGroupItem value='high' id='priority-high' />
											<Label htmlFor='priority-high'>Высокий</Label>
										</div>
									</div>
								</RadioGroup>
							</div>
						</div>

						<div className='space-y-2 mb-4'>
							<Label htmlFor='task-description'>Описание задачи *</Label>
							<Textarea
								id='task-description'
								placeholder='Подробно опишите что нужно сделать...'
								rows={3}
							/>
						</div>

						<div className='mt-4 space-y-2'>
							<Label>Дополнительные файлы</Label>
							<div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer'>
								<div className='text-3xl mb-2'>📎</div>
								<div className='font-medium text-gray-700 mb-1'>
									Прикрепить файлы
								</div>
								<div className='text-sm text-gray-500'>
									Техническое задание, примеры, референсы
								</div>
							</div>
						</div>

						<div className='flex flex-wrap gap-3 mt-6'>
							<Button variant='accent'>🚀 Создать заказ</Button>
							<Button variant='outline'>📋 Сохранить черновик</Button>
						</div>
					</div>
				</div>

				{/* Test InputPhone */}
				<div className='bg-white rounded-xl p-8 shadow-lg'>
					<h3 className='text-xl font-semibold text-gray-800 mb-6'>
						Тест компонента InputPhone
					</h3>
					<Card>
						<CardHeader>
							<CardTitle>Тест компонента InputPhone</CardTitle>
						</CardHeader>
						<CardContent>
							<Formik
								initialValues={initialValues}
								validationSchema={phoneValidationSchema}
								onSubmit={handleSubmit}
							>
								{({ errors, isValid, dirty }) => (
									<Form className='space-y-6'>
										<div>
											<h3 className='text-lg font-semibold mb-4'>
												Обязательное поле
											</h3>
											<Field
												name='phone'
												component={InputPhone}
												label='Номер телефона'
												required={true}
											/>
										</div>

										<div>
											<h3 className='text-lg font-semibold mb-4'>
												Необязательное поле
											</h3>
											<Field
												name='phoneOptional'
												component={InputPhone}
												label='Дополнительный телефон'
											/>
										</div>

										<div>
											<h3 className='text-lg font-semibold mb-4'>
												С подсказкой
											</h3>
											<Field
												name='phoneWithHelper'
												component={InputPhone}
												label='Рабочий телефон'
												required={true}
												helperText='Введите номер в формате 050 123 45 67'
											/>
										</div>

										<div className='pt-4'>
											<Button
												type='submit'
												disabled={!isValid || !dirty}
												className='w-full'
											>
												Отправить
											</Button>
										</div>

										{Object.keys(errors).length > 0 && (
											<div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
												<h4 className='font-semibold text-red-800 mb-2'>
													Ошибки валидации:
												</h4>
												<ul className='text-red-700 text-sm space-y-1'>
													{Object.entries(errors).map(([field, error]) => (
														<li key={field}>
															<strong>{field}:</strong> {String(error)}
														</li>
													))}
												</ul>
											</div>
										)}
									</Form>
								)}
							</Formik>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}
