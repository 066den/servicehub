import HeaderWithCategories from '@/components/main/HeaderWithCategories'
import Footer from '@/components/main/Footer'

export default function CatalogLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div>
			<HeaderWithCategories />
			{children}
			<Footer />
		</div>
	)
}
