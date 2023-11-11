FROM node:20.7-alpine3.17

WORKDIR /app

COPY . /app

RUN npm r i:all
RUN npm run build

EXPOSE 3000 5500

ENTRYPOINT ["npm", "run", "start"]