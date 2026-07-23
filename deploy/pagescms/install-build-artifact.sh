#!/usr/bin/env bash
set -euo pipefail

app_dir=/opt/pagescms/app-2.1.8-xvsf
archive=/tmp/pagescms-next-2.1.8-xvsf.tar.gz
backup_dir="$app_dir/.next.server-build-failed-20260723"
expected_commit=6f4e860a35d934406580287e7042e5e111e207a1

test -d "$app_dir"
test "$(git -C "$app_dir" rev-parse HEAD)" = "$expected_commit"
test -s "$archive"

tar -tzf "$archive" | awk '
  $0 ~ /^\// || $0 ~ /(^|\/)\.\.(\/|$)/ { bad=1 }
  END { exit bad }
'

if [[ -e "$backup_dir" ]]; then
  echo "Refusing to overwrite existing backup: $backup_dir" >&2
  exit 1
fi
if [[ -d "$app_dir/.next" ]]; then
  mv "$app_dir/.next" "$backup_dir"
fi

tar -xzf "$archive" -C "$app_dir"
test -s "$app_dir/.next/BUILD_ID"
printf 'BUILD_ID='
cat "$app_dir/.next/BUILD_ID"
du -sh "$app_dir/.next"
