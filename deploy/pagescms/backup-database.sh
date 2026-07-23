#!/usr/bin/env bash
set -euo pipefail

umask 077

backup_dir=/var/backups/pagescms
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
final_path="${backup_dir}/pagescms-${timestamp}.dump"
temporary_path="${final_path}.tmp"

mkdir -p "$backup_dir"
trap 'rm -f "$temporary_path"' EXIT

pg_dump --format=custom --compress=6 --file="$temporary_path" --dbname=pagescms
pg_restore --list "$temporary_path" >/dev/null
mv "$temporary_path" "$final_path"

find "$backup_dir" -maxdepth 1 -type f -name 'pagescms-*.dump' -mtime +13 -delete
printf 'Pages CMS database backup created: %s\n' "$final_path"
