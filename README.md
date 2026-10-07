# ⚡ PulseOps — Distributed Uptime & Server Monitoring Platform

PulseOps est une plateforme distribuée de surveillance d'infrastructure, de serveurs et d'applications web (alternative open-source et DevOps-first à UptimeRobot et BetterUptime).

---

## 🏛️ Architecture Globale

```text
┌─────────────────┐       HTTP / REST        ┌─────────────────────────┐
│ React Dashboard │ ───────────────────────► │ Backend Core API        │
│ (Vite/Tailwind) │                          │ (Express + BullMQ Prod) │
└─────────────────┘                          └────────────┬────────────┘
                                                          │ Enqueue jobs
                                                          ▼
                                            ┌─────────────────────────┐
                                            │ Redis Queue (BullMQ)    │
                                            └─────────────┬───────────┘
                                                          │ Consume jobs
                                                          ▼
┌─────────────────────────┐                  ┌─────────────────────────┐
│ Alerts & Notifications  │ ◄─────────────── │ Worker Engine           │
│ (Telegram / Discord)    │  Downtime Event  │ (HTTP, Ping, SSL Check) │
└─────────────────────────┘                  └─────────────┬───────────┘
                                                           │ Store checks
                                                           ▼
                                             ┌─────────────────────────┐
                                             │ MongoDB Database        │
                                             └─────────────────────────┘
```

---

## 📁 Arborescence du Projet

```text
Surveillance-pro/
├── backend/                  # API Core & Producteur BullMQ
│   ├── src/
│   │   ├── config/           # Redis, MongoDB, Env configs
│   │   ├── controllers/      # Logique de gestion (Monitors, Metrics)
│   │   ├── models/           # Schémas Mongoose
│   │   ├── queues/           # BullMQ Queue & Schedulers
│   │   ├── routes/           # Endpoints Express
│   │   ├── app.js            # Configuration Express, middlewares, cors
│   │   └── server.js         # Entrypoint HTTP & Graceful Shutdown
│   ├── Dockerfile
│   └── package.json
│
├── worker/                   # Moteur Worker distribué
│   ├── src/
│   │   ├── checkers/         # HTTP Ping, ICMP, SSL Certificate inspector
│   │   ├── notifiers/        # Telegram Bot & Discord Webhooks
│   │   ├── worker.js         # Consommateur BullMQ
│   │   └── index.js          # Entrypoint Worker
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # Dashboard Web React
│   ├── src/
│   │   ├── components/       # Monitor cards, Status badges, Charts
│   │   ├── pages/            # Dashboard, Monitor detail, Settings
│   │   └── App.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── deploy/
│   ├── nginx/                # Reverse proxy Nginx & SSL Certbot
│   └── scripts/              # Scripts de déploiement VPS
│
├── .github/
│   └── workflows/
│       └── cd.yml            # CI/CD GitHub Actions vers VPS
│
├── docker-compose.yml        # Orchestration locale (Redis, Mongo)
├── docker-compose.prod.yml   # Orchestration production multi-conteneurs
├── .env.example
└── README.md
```

---

## 🚀 Démarrage Rapide (Local)

### 1. Démarrer l'infrastructure (Redis + MongoDB)
```bash
docker compose up -d redis mongodb
```

### 2. Démarrer le Backend Core
```bash
cd backend
npm install
npm run dev
```
### 2. Démarrer le Frontend Core
```bash
cd frontend
npm install
npm run dev
```
### 2. Démarrer le Worker Core
```bash
cd worker
npm install
npm run dev
```

### 3. Tester la santé du App 
- Health check complet : `GET http://localhost:5173/`
