#!/usr/bin/env bash
set -euo pipefail
PORT="${1:-8081}"
PHP_BIN="/opt/homebrew/opt/php/bin/php"
ROOT="/opt/homebrew/share/phpmyadmin"

if ! /opt/homebrew/opt/mysql/bin/mysqladmin ping -h 127.0.0.1 -u root --silent 2>/dev/null; then
  echo "MySQL kapalı. Başlatıyorum..."
  brew services start mysql
  sleep 2
fi

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "phpMyAdmin zaten çalışıyor: http://127.0.0.1:${PORT}"
  open "http://127.0.0.1:${PORT}" 2>/dev/null || true
  exit 0
fi

echo "phpMyAdmin: http://127.0.0.1:${PORT}"
echo "Giriş: kullanıcı root · şifre boş · veritabanı akademi_koc"
open "http://127.0.0.1:${PORT}" 2>/dev/null || true
exec "$PHP_BIN" -S "127.0.0.1:${PORT}" -t "$ROOT"
