# ==========================================
# Étape 1 : Dépendances (Base)
# ==========================================
FROM node:20-bookworm-slim AS deps
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copie des fichiers de dépendances et du schéma Prisma
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Installation stricte des paquets
RUN npm ci

# ==========================================
# Étape 2 : Construction (Builder)
# ==========================================
FROM node:20-bookworm-slim AS builder
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables requises pour la compilation Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="mysql://build:build@localhost:3306/build"

# Génération des types Prisma
RUN npx prisma generate

# Construction du bundle optimisé en mode standalone
RUN npm run build

# ==========================================
# Étape 3 : Image Minimale de Production (Runner)
# ==========================================
FROM node:20-bookworm-slim AS runner
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Sécurité : utilisateur non-root dédié (Debian / glibc)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Assets publics statiques et artefacts Prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Fichiers compilés par Next.js standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
