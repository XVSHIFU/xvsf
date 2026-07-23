#!/usr/bin/env bash
set -euo pipefail

active=/etc/nginx/sites-available/default
backup=/etc/nginx/sites-available/default.sveltia-20260723
candidate=/tmp/pagescms-nginx.conf

test -f "$active"
test -f "$candidate"
test ! -e "$backup"

cp -a "$active" "$backup"
install -o root -g root -m 644 "$candidate" "$active"

if ! nginx -t; then
  cp -a "$backup" "$active"
  nginx -t
  exit 1
fi

systemctl reload nginx
printf 'Nginx switched to Pages CMS; rollback: %s\n' "$backup"
