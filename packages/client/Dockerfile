FROM node:22.1.0

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

COPY tsconfig.base.json ./
COPY client.tsconfig.json tsconfig.json

COPY packages/client packages/client
COPY packages/shared packages/shared

RUN npm run i:all
RUN npm run client build  

CMD ["npm", "run", "client", "start"]