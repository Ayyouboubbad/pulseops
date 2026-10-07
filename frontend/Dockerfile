# ==========================================
# PulseOps Frontend - Multi-Stage Build
# ==========================================

# Étape 1 : Build des assets statiques Vite
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Étape 2 : Serveur statique de production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

COPY package.json ./
COPY --from=builder /app/dist ./dist
COPY server.js ./server.js

USER node

EXPOSE 80

CMD ["node", "server.js"]
