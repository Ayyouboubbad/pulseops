#!/bin/bash
# ==============================================================================
# PulseOps - Automated Let's Encrypt SSL Provisioner & Nginx SSL Activator
# Usage: ./deploy/certbot/init-ssl.sh <domain> <email>
# Example: ./deploy/certbot/init-ssl.sh 2.28.37.97.sslip.io admin@example.com
# ==============================================================================

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "❌ Usage: $0 <domain> <email>"
    echo "💡 Example with sslip.io: $0 2.28.37.97.sslip.io admin@example.com"
    echo "💡 Example with custom domain: $0 pulseops.yourdomain.com admin@yourdomain.com"
    exit 1
fi

echo "=========================================================="
echo "🔒 PulseOps - SSL Activation for: $DOMAIN"
echo "📧 Notification Email: $EMAIL"
echo "=========================================================="

echo "🛑 [1/4] Freeing port 80 (temporarily stopping reverse-proxy)..."
docker compose -f docker-compose.prod.yml stop reverse-proxy || true

mkdir -p /etc/letsencrypt /var/lib/letsencrypt

echo "🔐 [2/4] Requesting Let's Encrypt SSL certificate via Certbot..."
docker run --rm --name certbot \
    -v "/etc/letsencrypt:/etc/letsencrypt" \
    -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
    -p 80:80 \
    certbot/certbot certonly --standalone \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email

if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "❌ [Error] Certificate generation failed. Re-starting standard HTTP proxy..."
    docker compose -f docker-compose.prod.yml up -d reverse-proxy
    exit 1
fi

echo "⚙️ [3/4] Activating SSL in Nginx..."
sed "s/__DOMAIN__/$DOMAIN/g" deploy/nginx/nginx.ssl.conf.template > deploy/nginx/nginx.conf

echo "🚀 [4/4] Restarting reverse-proxy with HTTPS enabled..."
docker compose -f docker-compose.prod.yml up -d reverse-proxy

echo "=========================================================="
echo "🎉 SUCCESS: SSL Certificate installed & HTTPS active!"
echo "👉 Web URL: https://$DOMAIN"
echo "👉 API URL: https://$DOMAIN/api/health"
echo "=========================================================="
