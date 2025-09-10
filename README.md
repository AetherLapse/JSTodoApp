# TaskForge

Minimal MERN-style example with auth and task API.

## Setup

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

In another terminal:

```bash
cd client
npm install
npm run dev
```

## Docker

```bash
docker-compose up --build
```

## Tests

```bash
cd server
npm test
```
