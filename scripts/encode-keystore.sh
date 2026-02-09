#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 path/to/release-keystore.jks > release-keystore.base64"
  exit 1
fi

FILE="$1"
if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE" >&2
  exit 2
fi

# Try GNU base64 with no wrap, then busybox-style, then fallback to openssl
if base64 --version >/dev/null 2>&1; then
  # GNU coreutils supports --wrap=0
  if base64 --wrap=0 "$FILE" >/dev/null 2>&1; then
    base64 --wrap=0 "$FILE"
    exit 0
  fi
fi

if base64 -w0 "$FILE" >/dev/null 2>&1; then
  base64 -w0 "$FILE"
  exit 0
fi

if command -v openssl >/dev/null 2>&1; then
  openssl base64 -A -in "$FILE"
  exit 0
fi

echo "No suitable base64 encoder found (install coreutils or openssl)" >&2
exit 3
