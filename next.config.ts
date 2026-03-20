import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'tempwaglnyhscsnwupne.supabase.co',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;