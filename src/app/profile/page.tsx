'use client'

import Input from '@/components/ui/inputs/Input'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useTranslations } from 'next-intl'
import { containerVariants } from '@/components/ui/animate/variants'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

const ProfilePage = () => {
	const t = useTranslations('Profile')
	const tForm = useTranslations('Form')
	const initialValues = {
		firstName: '',
		lastName: '',
		city: '',
	}

	const validationSchema = Yup.object().shape({
		firstName: Yup.string().required(tForm('firstNameRequired')),
	})

	const onSubmit = async (values: typeof initialValues) => {
		console.log(values)
	}

	return (
		<motion.main
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			className='main-content'
		>
			<section className='content-section'>
				<div className='section-header'>
					<div>
						<h1 className='section-title'>{t('title')}</h1>
						<p className='section-subtitle'>{t('subtitle')}</p>
					</div>

					<Button color='primary'>{t('save')}</Button>
				</div>
				<Formik
					initialValues={initialValues}
					validationSchema={validationSchema}
					onSubmit={onSubmit}
				>
					<Form className='profile-form'>
						<div className='form-grid'>
							<Field
								component={Input}
								name='firstName'
								label={tForm('firstName')}
							/>
							<Field
								component={Input}
								name='lastName'
								label={tForm('lastName')}
							/>
						</div>
					</Form>
				</Formik>
			</section>
		</motion.main>
	)
}

export default ProfilePage
