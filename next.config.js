/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: false, // Prevents opening the browser automatically
});

const nextConfig = withBundleAnalyzer({
    output: 'standalone',
});

module.exports = nextConfig;
