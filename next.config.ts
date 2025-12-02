import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
				pathname: '/**',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
				pathname: '/**',
			},
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
	webpack: config => {
		const srcPath = path.resolve(process.cwd(), 'src')
		config.resolve = config.resolve || {}
		config.resolve.alias = {
			...config.resolve.alias,
			'@': srcPath,
		}
		return config
	},
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)

