export const env = {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/gestordoc',
    AUTH_SECRET: process.env.AUTH_SECRET || 'secret',
    AUTH_URL: process.env.AUTH_URL || 'http://localhost:3000',
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'gestordoc-bucket',
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || 'account_id',
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || 'key_id',
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || 'secret_key',
};