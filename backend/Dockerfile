# ==========================================
# PulseOps Backend - Multi-stage Dockerfile
# ==========================================

# Étape 1 : Builder / Dépendances
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Étape 2 : Image d'Exécution Finale
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# DevOps Best Practice : Exécuter l'application avec un utilisateur non-root
USER node

# Copier uniquement les dépendances de production et le code source
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src

EXPOSE 5000

CMD ["node", "src/server.js"]
