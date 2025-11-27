'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'motion/react'
import { containerVariants } from '@/components/ui/animate/variants'
import { Shield } from 'lucide-react'

export default function AdminLoginPage() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setIsLoading(true)

		try {
			const result = await signIn('admin-login', {
				email,
				password,
				redirect: false,
			})

			if (result?.error) {
				setError('Невірний email або пароль')
				setIsLoading(false)
				return
			}

			if (result?.ok) {
				router.push('/admin')
				router.refresh()
			}
		} catch {
			setError('Помилка авторизації. Спробуйте ще раз.')
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4'>
			<motion.div
				variants={containerVariants}
				initial='hidden'
				animate='visible'
				className='w-full max-w-md'
			>
				<Card className='p-8 shadow-xl'>
					<div className='text-center mb-8'>
						<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4'>
							<Shield className='w-8 h-8 text-primary' />
						</div>
						<h1 className='text-3xl font-bold text-primary-dark mb-2'>
							Вхід для адміністратора
						</h1>
						<p className='text-secondary-foreground'>
							Введіть ваші облікові дані для доступу
						</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						{error && (
							<div className='p-3 rounded-lg bg-destructive-light border border-destructive text-destructive text-sm'>
								{error}
							</div>
						)}

						<Input
							type='email'
							label='Email'
							placeholder='admin@example.com'
							required
							value={email}
							onChange={e => setEmail(e.target.value)}
							disabled={isLoading}
							error={!!error}
						/>

						<Input
							type='password'
							label='Пароль'
							placeholder='Введіть пароль'
							required
							value={password}
							onChange={e => setPassword(e.target.value)}
							disabled={isLoading}
							error={!!error}
						/>

						<Button
							type='submit'
							size='lg'
							fullWidth
							loading={isLoading}
							className='mt-6'
						>
							Увійти
						</Button>
					</form>
				</Card>
			</motion.div>
		</div>
	)
}
