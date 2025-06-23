/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    env: {
        SERVER_URL: process.env.SERVER_URL || 'http://localhost:3001',
    },
};

export default nextConfig;