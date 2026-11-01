# Managed production test stack. Local visual development attaches to host processes.
FROM node:22.9.0-bookworm-slim AS dependencies

WORKDIR /app

RUN apt-get update \
  && apt-get install --yes --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages/client/package.json ./packages/client/package.json
COPY packages/playground/package.json ./packages/playground/package.json
COPY packages/server/package.json ./packages/server/package.json
COPY packages/visual-tests/package.json ./packages/visual-tests/package.json
COPY libs/actions/package.json ./libs/actions/package.json
COPY libs/actors/package.json ./libs/actors/package.json
COPY libs/builtin-actors/package.json ./libs/builtin-actors/package.json
COPY libs/channel/package.json ./libs/channel/package.json
COPY libs/demo-saves/package.json ./libs/demo-saves/package.json
COPY libs/dto/package.json ./libs/dto/package.json
COPY libs/loader/package.json ./libs/loader/package.json
COPY libs/logger/package.json ./libs/logger/package.json
COPY libs/mime-resolver/package.json ./libs/mime-resolver/package.json
COPY libs/rules/package.json ./libs/rules/package.json
COPY libs/simulation/package.json ./libs/simulation/package.json
COPY libs/states/package.json ./libs/states/package.json
COPY libs/tts-parser/package.json ./libs/tts-parser/package.json
COPY libs/tts-save/package.json ./libs/tts-save/package.json
COPY libs/utils/package.json ./libs/utils/package.json
RUN npm ci

FROM dependencies AS source
COPY . .
RUN npm run db:gen

ARG VITE_API_HOST=http://web:8080
ARG VITE_STATIC_HOST=http://web:8080
ENV VITE_API_HOST=${VITE_API_HOST}
ENV VITE_STATIC_HOST=${VITE_STATIC_HOST}

FROM source AS build
RUN npm run build

FROM node:22.9.0-bookworm-slim

RUN apt-get update \
  && apt-get install --yes --no-install-recommends nginx \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/packages/server/package.json ./packages/server/package.json
COPY --from=build /app/packages/server/prisma ./packages/server/prisma
COPY --from=build /app/packages/server/tsconfig.json ./packages/server/tsconfig.json
COPY --from=build /app/tsconfig.base.json ./tsconfig.base.json
COPY --from=build /app/assets ./assets
COPY packages/visual-tests/infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY packages/visual-tests/infra/app-entrypoint.sh /usr/local/bin/visual-app-entrypoint

RUN chmod +x /usr/local/bin/visual-app-entrypoint \
  && mkdir -p /app/proxy \
  && rm -f /etc/nginx/sites-enabled/default

EXPOSE 8080

ENTRYPOINT ["visual-app-entrypoint"]
