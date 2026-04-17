FROM node:20-alpine

WORKDIR /app

COPY services/api/package.json /app/package.json
COPY services/api/dist /app/dist
COPY services/api/prisma /app/prisma
COPY services/api/.env.docker /app/.env
COPY packages/shared /packages/shared

RUN npm install --no-fund --no-audit

EXPOSE 3001

CMD ["sh", "-lc", "npx prisma generate && npx prisma db push && node prisma/seed.mjs && node dist/index.js"]
