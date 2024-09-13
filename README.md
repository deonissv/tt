# SETUP

rename _example-env_ to _.env_

## Via docker

```
docker compose up
```

## Manual

### Requirements:

Node.js 22 or higher, PostgreSQL

- Start a PostresSQL db
- Edit data required to connect to db in .env file
- Initialize a schema and init data

```
  npm run i:all
  npm run db:init

```

- Build apps

```
npm run build
```

- Start apps

```
npm run start
```

# Simulation key bindings:

- key **F** to pick object from container (bag, deck)
- key **R** to roll die
- key **H** to shuffle items in container
