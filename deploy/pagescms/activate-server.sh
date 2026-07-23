#!/usr/bin/env bash
set -euo pipefail

app_dir=/opt/pagescms/app-2.1.8-xvsf
env_file=/etc/pagescms.env
service_source=/tmp/pagescms.service
service_target=/etc/systemd/system/pagescms.service
swap_file=/swapfile-pagescms-build

test -s "$app_dir/.next/BUILD_ID"
test -s "$env_file"

if ! sudo -u postgres psql -Atqc "SELECT 1 FROM pg_roles WHERE rolname='pagescms'" | grep -Fxq 1; then
  sudo -u postgres createuser pagescms
fi
if ! sudo -u postgres psql -Atqc "SELECT 1 FROM pg_database WHERE datname='pagescms'" | grep -Fxq 1; then
  sudo -u postgres createdb --owner=pagescms pagescms
fi

(
  set -a
  # The generated values use dotenv-compatible quoting.
  source "$env_file"
  set +a
  cd "$app_dir"
  runuser -u pagescms -- /usr/local/bin/node ./migrate-runtime.mjs
)

/usr/local/bin/npm --prefix "$app_dir" prune --omit=dev
install -d -o pagescms -g pagescms -m 700 "$app_dir/.next/cache"
install -o root -g root -m 644 "$service_source" "$service_target"
systemctl daemon-reload
systemctl enable --now pagescms.service

for _ in {1..20}; do
  if curl --fail --silent --show-error --output /dev/null http://127.0.0.1:3000/sign-in; then
    break
  fi
  sleep 1
done
curl --fail --silent --show-error --output /dev/null http://127.0.0.1:3000/sign-in

rm -f /etc/pagescms-build.env
if swapon --show=NAME --noheadings | grep -Fxq "$swap_file"; then
  swapoff "$swap_file"
fi
rm -f "$swap_file"

systemctl --no-pager status pagescms.service | sed -n '1,14p'
printf 'Pages CMS is healthy on http://127.0.0.1:3000/sign-in\n'
