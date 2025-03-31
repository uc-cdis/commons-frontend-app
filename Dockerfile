# docker build -t ff .
# docker run -p 3000:3000 -it ff
# Build stage
FROM node:20-slim AS builder

WORKDIR /gen3

COPY ./package.json ./package-lock.json ./next.config.js ./tsconfig.json ./.env.development  ./tailwind.config.js ./postcss.config.js ./start.sh ./.env.production ./
RUN npm ci
COPY ./src ./src
COPY ./public ./public
COPY ./config ./config
COPY ./start.sh ./
RUN npm install @swc/core @napi-rs/magic-string && \
    npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /gen3

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /gen3/package.json ./
COPY --from=builder /gen3/node_modules ./node_modules
COPY --from=builder /gen3/config ./config
COPY --from=builder /gen3/.next ./.next
COPY --from=builder /gen3/public ./public
COPY --from=builder /gen3/start.sh ./start.sh
RUN mkdir -p /gen3/.next/cache/images
RUN chmod -R 777 /gen3/.next/cache
RUN chown nextjs:nextjs /gen3/.next

USER nextjs:nextjs
ENV PORT=3000
CMD bash ./start.sh
