/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
};

// Only loaded when running `pnpm run analyze`, so production builds don't
// depend on the analyzer being installed.
if (process.env.ANALYZE === 'true') {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: true,
        openAnalyzer: false, // Prevents opening the browser automatically
    });
    module.exports = withBundleAnalyzer(nextConfig);
} else {
    module.exports = nextConfig;
}
