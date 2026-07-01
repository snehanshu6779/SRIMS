# syntax=docker/dockerfile:1
#
# This intentionally is NOT a slim multi-stage build that strips dev
# dependencies — the startup command needs the full Prisma CLI (and
# ts-node, to run prisma/seed.ts, which itself imports from src/lib/data/
# for consistency with the in-memory demo data) available at container
# start, not just at build time. Optimizing image size by switching to
# Next.js's "standalone" output and a slim runner stage is a reasonable
# follow-up once you've moved schema syncing to a separate migration step
# that runs before deployment rather than at container start.

FROM node:20-alpine AS app
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# DATABASE_URL is only needed here so `prisma generate` can produce the
# typed client — the actual DB connection isn't used until runtime, when
# docker-compose injects the real one as an environment variable.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Sync the schema to the database (creates tables on first run, no-op if
# already up to date), seed the demo dataset (safe to re-run — every insert
# is an upsert), then start the server. We use `db push` rather than
# `migrate deploy` because this project doesn't have a migration history yet
# — see README "Deploying to Production" for how to switch to versioned
# migrations once you've run `prisma migrate dev` locally at least once.
# Comment out the seed line below for a real production rollout where you
# don't want the demo dataset loaded.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx prisma db seed && npm start"]
