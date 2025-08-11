import { useState } from 'react'
import { Field, Form, Formik } from 'formik'
import Radio from '../ui/forms/Radio'
import Input from '../ui/forms/Input'
import PlacesAutocomplete from '../ui/forms/PlacesAutocomplete'
import Map from '../common/Map'
import { LocationData } from '@/types'
import Button from '../ui/Button'
import classNames from 'classnames'
import Textarea from '../ui/forms/Textarea'
import { useUserProfile } from '@/hooks/storeHooks/useUserProfile'
import LoadingSpinner from '../ui/LoadingSpinner'
import InputPhone from '../ui/forms/InputPhone'
import { useProvider } from '@/hooks/storeHooks/useProvider'
import { ProviderType } from '@prisma/client'
import * as Yup from 'yup'

const ProviderRegister = () => {
	const { user, isLoading } = useUserProfile()
	const { createProvider } = useProvider()

	const [location, setLocation] = useState<LocationData | null>(null)
	const [type, setType] = useState<ProviderType>(ProviderType.INDIVIDUAL)

	const initialValues = {
		type: ProviderType.INDIVIDUAL,
		businessName: `${user?.lastName} ${user?.firstName}` || '',
		email: '',
		phone: user?.phone || '',
		description: '',
	}

	const validationSchema = Yup.object().shape({
		businessName: Yup.string().required(
			type === ProviderType.COMPANY
				? 'Назва компанії є обовʼязковою'
				: 'Прізвище та імʼя є обовʼязковими'
		),
		phone: Yup.string().required('Телефон є обовʼязковим'),
		description: Yup.string().max(500, 'Опис не може бути більше 500 символів'),
	})

	const onSubmit = (values: typeof initialValues) => {
		createProvider({
			...values,
			type: values.type as ProviderType,
		})
	}

	if (isLoading) return <LoadingSpinner color='primary' size='lg' />

	return (
		<Formik
			initialValues={initialValues}
			validationSchema={validationSchema}
			onSubmit={onSubmit}
		>
			{({ isValid, isSubmitting, setFieldValue }) => (
				<Form>
					<div className='form-grid form-group'>
						<div
							className={classNames('account-type', {
								selected: type === ProviderType.INDIVIDUAL,
							})}
							onClick={() => {
								setType(ProviderType.INDIVIDUAL)
								setFieldValue('type', ProviderType.INDIVIDUAL)
							}}
						>
							<Field
								type='radio'
								name='type'
								value={ProviderType.INDIVIDUAL}
								component={Radio}
							/>
							<div className='account-type-icon'>🙋‍♂️</div>
							<div className='account-type-title'>Фізична особа</div>
							<div className='account-type-desc'>
								Для фрілансерів, майстрів, репетиторів та інших індивідуальних
								виконавців
							</div>
						</div>

						<div
							className={classNames('account-type', {
								selected: type === ProviderType.COMPANY,
							})}
							onClick={() => {
								setType(ProviderType.COMPANY)
								setFieldValue('type', ProviderType.COMPANY)
							}}
						>
							<Field
								name='type'
								value={ProviderType.COMPANY}
								component={Radio}
							/>
							<div className='account-type-icon'>🏢</div>
							<div className='account-type-title'>Компанія</div>
							<div className='account-type-desc'>
								Організація або команда, що надає професійні послуги
							</div>
						</div>
					</div>

					<Field
						name='businessName'
						component={Input}
						label={
							type === ProviderType.COMPANY
								? 'Назва компанії'
								: 'Прізвище та імʼя'
						}
						required
					/>

					<div className='form-grid'>
						<Field name='email' type='email' component={Input} label='Email' />
						<Field
							name='phone'
							component={InputPhone}
							label='Телефон'
							required
						/>
					</div>

					<Field
						name='description'
						component={Textarea}
						label='Про себе'
						placeholder='Розкажіть про свій досвід, навички та підхід до роботи...'
						helperText='Опис допоможе клієнтам краще зрозуміти ваші можливості'
						maxLength={500}
					/>

					<PlacesAutocomplete
						onLocationSelect={setLocation}
						label='Адреса'
						placeholder='Почніть вводити адресу...'
						types={['address']}
					/>
					<div className='map-container form-group'>
						<Map center={location?.coordinates} height={300} zoom={15} />
					</div>

					<Button
						color='accent'
						disabled={!isValid || isSubmitting}
						type='submit'
					>
						Зареєструватися як виконавець
					</Button>
				</Form>
			)}
		</Formik>
	)
}

export default ProviderRegister
