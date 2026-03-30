import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	devIndicators: false,
	experimental: {
		serverActions: {
			bodySizeLimit: "10mb",
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "spfhqgdaqohqnkvwllhf.supabase.co",
				pathname: "/storage/v1/object/public/**",
			},
		],
	},
}

export default nextConfig
