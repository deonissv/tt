# SETUP

rename _example-env_ to _.env_

## Via docker

```
docker compose up
```

## Manual

### Requirements:

Node.js 22 or higher

- Start a PostresSQL db
- Initialize a schema and init data (corresponding files located on _./init-scripts folder_)
- Edit data required to connect to db in .env file
- build apps

```
npm run build
```

- start apps

```
npm run start
```

# Simulation key bindings:

key **F** to pick object from container (bag, deck)
key **R** to roll die
key **H** to shuffle items in container
