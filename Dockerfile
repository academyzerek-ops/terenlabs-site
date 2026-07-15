# TerenLabs site — multi-stage build на standalone-выводе Next.js.
# Итоговый образ несёт только рантайм (~200 МБ вместо гигабайта с node_modules).

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Railway передаёт git-sha как build-arg — печём в бандл для тега сборки в футере
ARG RAILWAY_GIT_COMMIT_SHA=dev
ENV NEXT_PUBLIC_BUILD=$RAILWAY_GIT_COMMIT_SHA
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# тег сборки и в рантайме: футер — серверный компонент, читает env при рендере
ARG RAILWAY_GIT_COMMIT_SHA=dev
ENV NEXT_PUBLIC_BUILD=$RAILWAY_GIT_COMMIT_SHA

# Безопасность: не работаем под root
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:${PORT}/ > /dev/null || exit 1

CMD ["node", "server.js"]
