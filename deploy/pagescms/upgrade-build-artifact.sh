#!/usr/bin/env bash
set -euo pipefail

app_dir=/opt/pagescms/app-2.1.8-xvsf
archive=/tmp/pagescms-next-2.1.8-xvsf-cookiefix.tar.gz
current="$app_dir/.next"
backup="$app_dir/.next.pre-cookiefix-20260723"

test -s "$archive"
test -s "$current/BUILD_ID"
test ! -e "$backup"
test "$(realpath -m "$current")" = /opt/pagescms/app-2.1.8-xvsf/.next

tar -tzf "$archive" | awk '
  $0 ~ /^\// || $0 ~ /(^|\/)\.\.(\/|$)/ { bad=1 }
  END { exit bad }
'

systemctl stop pagescms.service
mv "$current" "$backup"
tar -xzf "$archive" -C "$app_dir"
install -d -o pagescms -g pagescms -m 700 "$current/cache"

if systemctl start pagescms.service; then
  for _ in {1..20}; do
    if curl --fail --silent --show-error --output /dev/null http://127.0.0.1:3000/sign-in; then
      printf 'Cookie-order build is healthy.\n'
      exit 0
    fi
    sleep 1
  done
fi

systemctl stop pagescms.service || true
rm -rf -- "$current"
mv "$backup" "$current"
systemctl start pagescms.service
echo 'Upgrade failed; restored the previous build.' >&2
exit 1
