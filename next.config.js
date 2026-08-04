/** @type {import('next').NextConfig} */
const nextConfig = {
    output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
    experimental: {
        // Include pdfkit font data files (.afm) in the production bundle
        // so that Helvetica and other standard fonts work in Docker/Coolify
        outputFileTracingIncludes: {
            '/api/documents/\\[documentId\\]/routing-slip': [
                './node_modules/pdfkit/js/data/**/*',
            ],
            '/api/reports/pdf': [
                './node_modules/pdfkit/js/data/**/*',
            ],
        },
    },
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
