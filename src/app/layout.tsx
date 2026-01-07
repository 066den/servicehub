import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { GoogleMapsProvider } from '@/components/providers/GoogleMapsProvider'
import { Toaster } from '@/components/ui/sonner'

const t = await getTranslations('home')
import './globals.css'

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
	variable: '--font-plus-jakarta-sans',
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
		<html
			lang={locale}
			className={`${plusJakartaSans.variable} ${inter.variable}`}
			suppressHydrationWarning
		>
			<body className={`${inter.className} custom-scroll`}>
				<div id='portal_root' />
				<AuthProvider>
					<NextIntlClientProvider>
						<GoogleMapsProvider loadOnMount={false}>
							<main className='flex flex-col min-h-screen'>{children}</main>
						</GoogleMapsProvider>
						<Toaster position='top-center' richColors />
						{/* <Notifications /> */}
					</NextIntlClientProvider>
				</AuthProvider>
			</body>
		</html>
	)
}

