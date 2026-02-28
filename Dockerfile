# =============================================================================
# Publivite - Dockerfile Multi-Stage Optimisé pour Railway
# =============================================================================
# Compatible avec:
# - Service Web: npm start (ou CMD par défaut)
# - Service Worker: npm run worker
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Installation des dépendances système
# -----------------------------------------------------------------------------
FROM node:24-alpine AS base

# Installer les dépendances système nécessaires pour:
# - Prisma: openssl, libc6-compat
# - Playwright/Chromium et ses dépendances
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    && rm -rf /var/cache/apk/*

# Variables d'environnement pour Playwright (utiliser Chromium système)
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# -----------------------------------------------------------------------------
# Stage 2: Dependencies - Installation des dépendances npm
# -----------------------------------------------------------------------------
FROM base AS deps

# Copier uniquement les fichiers de dépendances pour optimiser le cache
COPY package.json package-lock.json* ./

# Installer toutes les dépendances (incluant devDependencies pour le build)
RUN npm ci --legacy-peer-deps

# -----------------------------------------------------------------------------
# Stage 3: Builder - Build de l'application Next.js
# -----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copier les dépendances installées
COPY --from=deps /app/node_modules ./node_modules

# Copier le reste du code source
COPY . .

# S'assurer que le dossier prisma existe (même vide)
RUN mkdir -p prisma

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Générer le client Prisma si le schema existe
RUN if [ -f "prisma/schema.prisma" ]; then \
        npx prisma generate; \
    fi

# Build de l'application Next.js (avec output: standalone)
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: Runner - Image de production optimisée
# -----------------------------------------------------------------------------
FROM base AS runner

WORKDIR /app

# Variables d'environnement de production
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier les fichiers publics
COPY --from=builder /app/public ./public

# Copier le build Next.js standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copier package.json et package-lock.json pour les scripts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Copier node_modules pour le worker (bullmq, playwright, etc.)
COPY --from=deps /app/node_modules ./node_modules

# Copier les scripts worker
COPY --from=builder /app/scripts ./scripts

# Copier le schema Prisma si présent
COPY --from=builder /app/prisma ./prisma

# Créer les répertoires nécessaires avec les bonnes permissions
RUN mkdir -p uploads/images uploads/screenshots && \
    chown -R nextjs:nodejs uploads && \
    chown -R nextjs:nodejs .next

# Passer à l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# =============================================================================
# COMMANDES DISPONIBLES:
# -----------------------------------------------------------------------------
# Service Web (défaut):
#   docker run <image>
#   OU: docker run <image> node server.js
#
# Service Worker:
#   docker run <image> npm run worker
#
# Sur Railway:
#   - Web Service: Utiliser la commande par défaut
#   - Worker Service: Définir Start Command = "npm run worker"
# =============================================================================

# Commande par défaut: lancer le serveur Next.js
CMD ["node", "server.js"]
