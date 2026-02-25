#!/bin/bash
# =============================================================
# Honey Travel Istanbul Gateway - VPS Deployment Script
# Compatible with: Ubuntu 22.04+, Hostinger VPS
# =============================================================

set -e

APP_DIR="/var/www/honeytravel"
REPO_URL="https://github.com/dzlancer/honeytravel.git"
BRANCH="main"
DOMAIN="${1:-yourdomain.com}"

echo "============================================"
echo "  Honey Travel Istanbul - VPS Deployment"
echo "============================================"

# 1. System dependencies
echo "[1/10] Installing system dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
    nginx curl git zip unzip \
    php8.3 php8.3-fpm php8.3-cli php8.3-pgsql php8.3-mbstring \
    php8.3-xml php8.3-curl php8.3-zip php8.3-gd php8.3-intl \
    php8.3-bcmath php8.3-redis php8.3-opcache \
    postgresql postgresql-contrib redis-server \
    nodejs npm certbot python3-certbot-nginx supervisor

# 2. Composer
echo "[2/10] Installing Composer..."
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
fi

# 3. Clone/update repository
echo "[3/10] Setting up application..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull origin "$BRANCH"
else
    sudo git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
    git checkout "$BRANCH"
fi

# 4. Setup PostgreSQL
echo "[4/10] Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE USER honeytravel WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE honeytravel OWNER honeytravel;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE honeytravel TO honeytravel;" 2>/dev/null || true

# 5. Configure environment
echo "[5/10] Configuring environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    sed -i "s|DB_CONNECTION=sqlite|DB_CONNECTION=pgsql|" .env
    sed -i "s|# DB_HOST=127.0.0.1|DB_HOST=127.0.0.1|" .env
    sed -i "s|# DB_PORT=5432|DB_PORT=5432|" .env
    sed -i "s|# DB_DATABASE=honeytravel|DB_DATABASE=honeytravel|" .env
    sed -i "s|# DB_USERNAME=honeytravel|DB_USERNAME=honeytravel|" .env
    sed -i "s|# DB_PASSWORD=secret|DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD|" .env
    sed -i "s|APP_URL=http://localhost:8000|APP_URL=https://$DOMAIN|" .env
    sed -i "s|APP_ENV=local|APP_ENV=production|" .env
    sed -i "s|APP_DEBUG=true|APP_DEBUG=false|" .env
    php artisan key:generate
fi

# 6. Install dependencies
echo "[6/10] Installing dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction
npm ci && npm run build

# 7. Laravel setup
echo "[7/10] Running Laravel setup..."
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
php artisan optimize:clear
php artisan optimize
php artisan filament:optimize

# 8. Permissions
echo "[8/10] Setting permissions..."
sudo chown -R www-data:www-data "$APP_DIR"
sudo chmod -R 755 "$APP_DIR"
sudo chmod -R 775 "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"

# 9. Nginx configuration
echo "[9/10] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/honeytravel > /dev/null <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $APP_DIR/public;
    index index.php;

    charset utf-8;
    client_max_body_size 50M;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2|woff|ttf|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/honeytravel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 10. Queue Worker (Supervisor)
echo "[10/10] Setting up queue worker..."
sudo tee /etc/supervisor/conf.d/honeytravel-worker.conf > /dev/null <<SUPERVISOR
[program:honeytravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php $APP_DIR/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=$APP_DIR/storage/logs/worker.log
stopwaitsecs=3600
SUPERVISOR

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start "honeytravel-worker:*"

# SSL Certificate
echo ""
echo "============================================"
echo "  Deployment Complete!"
echo "============================================"
echo ""
echo "  App URL: http://$DOMAIN"
echo "  Admin:   http://$DOMAIN/administration"
echo "  Login:   admin@honeytravelcheraga.com / HoneyTravel2026!"
echo ""
echo "  To enable SSL, run:"
echo "  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "  To restart queue workers:"
echo "  sudo supervisorctl restart honeytravel-worker:*"
echo ""
