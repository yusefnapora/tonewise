#!/usr/bin/env bash
set -eu

URL=${1:-"http://localhost:8888"}

FIREFOX_PATHS=( \
  "/Applications/Firefox.app/Contents/MacOS/firefox" \
  "firefox"
)
for i in "${FIREFOX_PATHS[@]}"
do
  if command -v $i &> /dev/null; then
  FIREFOX=$i
  fi
done


DATA_DIR="$(mktemp -d -t 'firefox-unsafe_data_dir.XXXXXXXXXX')"
"${FIREFOX}" -profile $DATA_DIR -no-remote -new-instance \
        "${URL}" >/dev/null 2>&1 &!