#!/bin/sh
set -e

echo "🚀 Starting GestorDoc production container..."

# Optional: Run database migrations if enabled
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "📦 Running database migrations..."
  pnpm run db:migrate
  echo "✅ Migrations completed"
else
  echo "⏭️  Skipping migrations (RUN_MIGRATIONS is not set to true)"
fi

# Start the application
echo "🌐 Starting Next.js server..."
if [ -f "server.js" ]; then
  exec node server.js
elif [ -f ".next/standalone/server.js" ]; then
  exec node .next/standalone/server.js
else
  exec pnpm run start:prod
fi

