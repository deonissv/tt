# SETUP

rename _example-env_ to _.env_

## Via docker

```
docker compose up --build
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

- **Left mouse button** to pick object
- **RIght mouse button** to rotate camera
- **WASD** to move camera

- Key **G** to pick object from container (bag, deck)
- Key **R** to roll die
- Key **H** to shuffle items in container
- Key **E** to rotate object clockwise (while picked)
- Key **Q** to rotate object counter clockwise (while picked)
- Key **F** to flip object (while picked)

# Games examples are located in /static folder

- **castles** - Castles of Burgundy
- **chess5** - 5 mas chess
- **demo** - demo game with supported objects
