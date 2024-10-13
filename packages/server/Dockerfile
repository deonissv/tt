FROM node:22.9.0-alpine3.20

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

COPY tsconfig.base.json ./
COPY server.tsconfig.json tsconfig.json

COPY packages/server packages/server

RUN npm run i:all
RUN npm run db:gen
RUN npm run server build  

CMD ["npm", "run", "server", "start"]