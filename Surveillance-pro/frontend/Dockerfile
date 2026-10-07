# ==========================================
# PulseOps Frontend - High Performance Static Runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

COPY dist ./dist
COPY server.js ./server.js

USER node

EXPOSE 80

CMD ["node", "server.js"]
