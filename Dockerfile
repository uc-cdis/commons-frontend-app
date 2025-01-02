# Build stage
FROM node:20-slim AS builder

WORKDIR /gen3

COPY ./package.json ./package-lock.json ./next.config.js ./tsconfig.json ./.env.development  ./tailwind.config.js ./postcss.config.js ./start.sh ./
RUN npm ci
COPY ./src ./src
COPY ./public ./public
COPY ./config ./config
RUN npm install @swc/core @napi-rs/magic-string && \
    npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /gen3
ENV PORT=3000

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /gen3/node_modules ./node_modules
COPY --from=builder /gen3/config ./config
COPY --from=builder /gen3/public ./public
COPY --from=builder --chown=nextjs:nextjs /gen3/.next ./.next
COPY --from=builder /gen3/start.sh  /gen3/package.json ./

USER nextjs
ENV PORT=3000
CMD bash ./start.sh
