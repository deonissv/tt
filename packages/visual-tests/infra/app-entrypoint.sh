#!/bin/sh
set -eu

npx prisma db push --schema packages/server/prisma/schema.prisma --skip-generate
npx ts-node --skip-project --compiler-options '{"esModuleInterop":true,"module":"CommonJS","moduleResolution":"node"}' packages/server/prisma/seed.ts

nginx
exec npm run server start
