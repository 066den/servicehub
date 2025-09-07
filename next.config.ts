import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['localhost', '127.0.0.1'],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
				pathname: '/uploads/**',
			},
		],
	},
	// Настройки для WebSocket
	async rewrites() {
		return [
			{
				source: '/socket.io/:path*',
				destination: '/api/socketio/:path*',
			},
		]
	},
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)

