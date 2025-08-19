import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { GoogleMapsProvider } from '@/components/providers/GoogleMapsProvider'
import { Notifications } from '@/components/main/Notifications'

const t = await getTranslations('home')
import './globals.css'

const inter = Inter({
	variable: '--font-inter',

	subsets: ['latin'],
	display: 'swap',
})

export const metadata: Metadata = {
	title: t('title'),
	description: t('description'),
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const locale = await getLocale()

	return (
		<html lang={locale}>
			<body className={`${inter.variable} custom-scroll`}>
				<div id='portal_root' />
				<AuthProvider>
					<NextIntlClientProvider>
						<GoogleMapsProvider>
							<main className='flex flex-col min-h-screen'>{children}</main>
						</GoogleMapsProvider>
						<Notifications />
						{/* <LoadingPage /> */}
					</NextIntlClientProvider>
				</AuthProvider>
			</body>
		</html>
	)
}

