#!/usr/bin/env bash
set -euo pipefail

source_env=/tmp/pagescms.env.upload
target_env=/etc/pagescms.env

test -s "$source_env"
install -o root -g root -m 600 "$source_env" "$target_env"
printf '%s\n' 'DATABASE_URL=configure-with-configure-database.sh' >>"$target_env"
printf 'CRYPTO_KEY=%s\n' "$(openssl rand -base64 32)" >>"$target_env"

required=(
  BASE_URL
  BETTER_AUTH_SECRET
  CRYPTO_KEY
  DATABASE_URL
  GITHUB_APP_ID
  GITHUB_APP_NAME
  GITHUB_APP_CLIENT_ID
  GITHUB_APP_CLIENT_SECRET
  GITHUB_APP_PRIVATE_KEY
  GITHUB_APP_WEBHOOK_SECRET
)

for name in "${required[@]}"; do
  grep -Eq "^${name}=.+" "$target_env" || {
    echo "Missing required variable: $name" >&2
    exit 1
  }
done

rm -f "$source_env"
printf 'Installed /etc/pagescms.env with %s required variables.\n' "${#required[@]}"
