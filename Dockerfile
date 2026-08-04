FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables at build time (only needed for build)
ARG DATABASE_URL
ARG R2_ACCOUNT_ID
ARG R2_ACCESS_KEY_ID
ARG R2_SECRET_ACCESS_KEY
ARG R2_BUCKET_NAME
ARG AUTH_SECRET

ENV DATABASE_URL=$DATABASE_URL
ENV R2_ACCOUNT_ID=$R2_ACCOUNT_ID
ENV R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
ENV R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
ENV R2_BUCKET_NAME=$R2_BUCKET_NAME
ENV AUTH_SECRET=$AUTH_SECRET

RUN corepack enable pnpm && pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Enable pnpm in production stage
RUN corepack enable pnpm

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/db ./db
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Copy pdfkit font data files (.afm) required for Helvetica PDF generation
# These must be available at runtime for the routing-slip PDF endpoint
RUN mkdir -p /app/.next/server/chunks/data
COPY --from=builder /app/node_modules/pdfkit/js/data /app/.next/server/chunks/data
# Also ensure fonts are available in node_modules at runtime
COPY --from=builder /app/node_modules/pdfkit/js/data /app/node_modules/pdfkit/js/data

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# IMPORTANT: Only run next start at runtime.
# Run migrations separately using: pnpm run db:migrate
# Use entrypoint for better control
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
