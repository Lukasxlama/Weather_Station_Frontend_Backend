#!/bin/sh
set -e

cat <<EOF > /usr/share/nginx/html/assets/config.json
{
  "apiBaseUrl": "${API_BASE_URL}",
  "logLevel": "${LOG_LEVEL}"
}
EOF

# Danach Nginx starten
exec nginx -g 'daemon off;'
