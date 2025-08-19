import Header from '@/components/main/Header'
import Footer from '@/components/main/Footer'

export default function HomeLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<Header />
			{children}
			<Footer />
		</>
	)
}
