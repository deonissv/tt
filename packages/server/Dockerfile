FROM node:22.1.0

# RUN apt-get update && apt-get install libssl-dev -y

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

COPY tsconfig.base.json ./
COPY server.tsconfig.json tsconfig.json

COPY packages/server packages/server
COPY packages/shared packages/shared

RUN npm run i:all
RUN npm run server db -- --schema=./packages/server/prisma/schema.prisma
RUN npm run server build  

EXPOSE 3000

CMD ["npm", "run", "server", "start"]