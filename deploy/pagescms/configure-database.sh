#!/usr/bin/env bash
set -euo pipefail

env_file=/etc/pagescms.env
db_password="$(openssl rand -hex 32)"
database_url="postgresql://pagescms:${db_password}@127.0.0.1:5432/pagescms"

printf "ALTER ROLE pagescms PASSWORD '%s';\n" "$db_password" \
  | runuser -u postgres -- psql --quiet --set=ON_ERROR_STOP=1 >/dev/null

temp_env="$(mktemp /etc/pagescms.env.XXXXXX)"
chmod 600 "$temp_env"
awk -v replacement="DATABASE_URL=${database_url}" '
  /^DATABASE_URL=/ { print replacement; found=1; next }
  { print }
  END { if (!found) print replacement }
' "$env_file" >"$temp_env"
chown root:root "$temp_env"
mv "$temp_env" "$env_file"

printf 'Configured the pagescms database role for localhost password authentication.\n'
