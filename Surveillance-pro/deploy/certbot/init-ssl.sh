#!/bin/bash
# ==============================================================================
# PulseOps - Automatic Let's Encrypt SSL Certbot Provisioner
# Usage: ./init-ssl.sh yourdomain.com admin@yourdomain.com
# ==============================================================================

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 pulseops.yourdomain.com admin@yourdomain.com"
    exit 1
fi

echo "🔒 [Certbot] Requesting Let's Encrypt SSL certificate for $DOMAIN..."

docker run -it --rm --name certbot \
    -v "/etc/letsencrypt:/etc/letsencrypt" \
    -v "/var/lib/letsencrypt:/var/lib/letsencrypt" \
    -p 80:80 \
    certbot/certbot certonly --standalone \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email

echo "✅ [Certbot] SSL Certificate successfully generated!"
echo "📁 Certs are stored in /etc/letsencrypt/live/$DOMAIN/"
