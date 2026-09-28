# syntax=docker/dockerfile:1

FROM node:26 AS build

WORKDIR /src

# Install the exact pnpm version pinned by the packageManager field.
COPY package.json ./
RUN npm install --global "$(node -p 'require("./package.json").packageManager')"

COPY . .

# There is no git repository to install hooks into. Without the metadata
# cache in ~/.cache every rebuild refetches all package metadata.
RUN --mount=type=cache,target=/pnpm-store \
    --mount=type=cache,target=/root/.cache \
    HUSKY=0 pnpm install --frozen-lockfile --store-dir /pnpm-store

# webpack only transpiles, so the bundle needs neither `compile` nor git.
RUN pnpm run build --no-stats

# The root/ bundle is self-contained, it needs no node_modules.
FROM node:26-slim

ENV NODE_ENV=production

WORKDIR /opt/keybr

COPY --from=build /src/root ./
# The bundle carries third-party data whose licenses require these notices.
COPY LICENSE NOTICE.md ./

# Configuration comes from the environment or from /etc/keybr/env.
# Data (the sqlite database, sessions) goes to /var/lib/keybr by default.
RUN mkdir -p /var/lib/keybr && chown node:node /var/lib/keybr

USER node

EXPOSE 3000

CMD ["node", "--enable-source-maps", "index.js"]
