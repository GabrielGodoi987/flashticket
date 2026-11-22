#!/bin/sh
set -eu

./mvnw -Pdevelopment -q compile
./mvnw -Pdevelopment -q spring-boot:run &
app_pid=$!

cleanup() {
  kill "$app_pid" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

while kill -0 "$app_pid" 2>/dev/null; do
  if inotifywait -q -r -t 2 -e close_write,create,delete,move src; then
    if ! ./mvnw -Pdevelopment -q compile; then
      echo "[dev] compilation failed; waiting for the next source change"
    fi
  fi
done

wait "$app_pid"
