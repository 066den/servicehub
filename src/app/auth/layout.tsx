import { useTranslations } from 'next-intl'
import Logo from '@/components/common/Logo'
import '@/components/auth/auth.scss'
import Link from 'next/link'
import { Home } from 'lucide-react'

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const t = useTranslations('Auth')
	return (
		<div className='flex flex-col items-center justify-center p-4 min-h-screen bg-secondary-gradient'>
			<Link
				className='fixed flex items-center gap-2 top-4 left-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/20 hover:translate-x-[-0.25rem] text-sm'
				href='/'
			>
				<Home className='w-5 h-5' /> На головну
			</Link>
			<div className='grid grid-cols-2 bg-white max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg min-h-[37.5rem]'>
				<div className='auth-visual relative flex flex-col items-center justify-center p-8 bg-primary-gradient text-white text-center'>
					<Logo color='white' size='lg' />
					<h2 className='text-3xl font-bold mb-2'>{t('authVisual.title')}</h2>
					<p className='text-xl font-medium mb-4'>{t('authVisual.subtitle')}</p>

					<ul className='list-none relative'>
						<li className='flex items-center gap-3 mb-2 opacity-90 text-lg'>
							<div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
								✨
							</div>
							<span>Перевірені фахівці</span>
						</li>
						<li className='flex items-center gap-3 mb-2 opacity-90 text-lg'>
							<div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
								🛡️
							</div>
							<span>Безпечні платежі</span>
						</li>
						<li className='flex items-center gap-3 mb-2 opacity-90 text-lg'>
							<div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
								⭐
							</div>
							<span>Система рейтингів</span>
						</li>
						<li className='flex items-center gap-3 mb-2 opacity-90 text-lg'>
							<div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
								📱
							</div>
							<span>Зручний інтерфейс</span>
						</li>
					</ul>
				</div>
				<div className='px-8 py-14 relative'>{children}</div>
			</div>
		</div>
	)
}
