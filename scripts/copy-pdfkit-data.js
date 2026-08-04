/**
 * Post-build script to copy pdfkit AFM font data files to .next/server/chunks/data/
 * so that pdfkit can find them at runtime in the Docker container.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'node_modules', 'pdfkit', 'js', 'data');
const DEST = path.join(__dirname, '..', '.next', 'server', 'chunks', 'data');
const DEST_STANDALONE = path.join(__dirname, '..', '.next', 'standalone', '.next', 'server', 'chunks', 'data');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

try {
    if (!fs.existsSync(SRC)) {
        console.warn('[copy-pdfkit-data] Source not found:', SRC);
        process.exit(0);
    }
    copyDir(SRC, DEST);
    if (fs.existsSync(path.join(__dirname, '..', '.next', 'standalone'))) {
        copyDir(SRC, DEST_STANDALONE);
    }
    const count = fs.readdirSync(DEST).filter(f => f.endsWith('.afm')).length;
    console.log(`[copy-pdfkit-data] Copied ${count} AFM files to ${DEST}`);
} catch (err) {
    console.error('[copy-pdfkit-data] Error:', err.message);
    process.exit(1);
}

