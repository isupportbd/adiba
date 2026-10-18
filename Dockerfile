# ============================================================
# আদিবার স্মৃতিখানা — multi-stage production image
# Next.js 14 standalone output → small, secure runtime image.
# ============================================================

# ---- deps ----------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- build --------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env values are inlined only for NEXT_PUBLIC_* vars; a
# placeholder is fine because all data fetching happens at runtime/ISR.
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner -------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=80 \
    HOSTNAME=0.0.0.0

RUN apk add --no-cache curl

# Non-root user for the app process.
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Ensure bcryptjs (needed by migrate.mjs / scripts) is in node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
# Migrations + runner + seed — applied on container start.
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/migrate.mjs ./migrate.mjs
COPY --from=builder /app/scripts ./scripts

USER nextjs
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:80/api/health || exit 1

# Apply pending migrations, then start the server.
CMD ["sh", "-c", "node migrate.mjs && node server.js"]
