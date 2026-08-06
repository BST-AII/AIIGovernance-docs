#!/usr/bin/env bash
set -euo pipefail

deploy_root=/data/aiigovernance-docs
release_id="$(date -u +%Y%m%dT%H%M%SZ)-$$"
release_dir="$deploy_root/releases/$release_id"
next_link="$deploy_root/current.next"

mkdir -p "$release_dir"
trap 'rm -rf -- "$release_dir" "$next_link"' ERR
tar -xzf - -C "$release_dir" --no-same-owner --no-same-permissions
test -s "$release_dir/index.html"
test -d "$release_dir/_next"

ln -s "$release_dir" "$next_link"
mv -Tf "$next_link" "$deploy_root/current"
printf 'deployed=%s\n' "$release_id"
