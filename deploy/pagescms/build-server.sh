#!/usr/bin/env bash
set -euo pipefail

app_dir=/opt/pagescms/app-2.1.8-xvsf
expected_commit=6f4e860a35d934406580287e7042e5e111e207a1
swap_file=/swapfile-pagescms-build
build_env=/etc/pagescms-build.env

test "$(git -C "$app_dir" rev-parse HEAD)" = "$expected_commit"

if ! swapon --show=NAME --noheadings | grep -Fxq "$swap_file"; then
  if [[ ! -f "$swap_file" ]]; then
    fallocate -l 2G "$swap_file"
    chmod 600 "$swap_file"
    mkswap "$swap_file" >/dev/null
  fi
  swapon "$swap_file"
fi

install -m 600 /dev/null "$build_env"
cat >"$build_env" <<'EOF'
DATABASE_URL=postgresql:///pagescms?host=/var/run/postgresql
BETTER_AUTH_SECRET=build-only-secret-0123456789abcdef
CRYPTO_KEY=build-only-key-0123456789abcdef0123456789abcdef
BASE_URL=https://39.106.48.91
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max-old-space-size=1024
GITHUB_APP_ID=1
GITHUB_APP_NAME=xvsf-pages-cms
GITHUB_APP_CLIENT_ID=Iv1.buildonly
GITHUB_APP_CLIENT_SECRET=build-only-secret
GITHUB_APP_PRIVATE_KEY=build-only-private-key
GITHUB_APP_WEBHOOK_SECRET=build-only-webhook-secret
EOF

systemctl stop pagescms-build.service 2>/dev/null || true
systemctl reset-failed pagescms-build.service 2>/dev/null || true
systemd-run \
  --unit=pagescms-build \
  --property="WorkingDirectory=$app_dir" \
  --property="EnvironmentFile=$build_env" \
  --property=Nice=10 \
  /usr/local/bin/npx next build

systemctl --no-pager status pagescms-build.service | sed -n '1,12p'
swapon --show
