#!/bin/sh
set -e

echo "[entrypoint] running migrations..."
node ./node_modules/typeorm/cli.js migration:run -d dist/database/data-source.js

echo "[entrypoint] starting application..."
exec node dist/main
