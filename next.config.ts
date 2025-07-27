import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
	reactStrictMode: true,
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

