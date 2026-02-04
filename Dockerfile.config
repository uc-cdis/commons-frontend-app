# docker build -t ff .
# docker run -p 3000:3000 -it ff
# Build stage
FROM --platform=$BUILDPLATFORM node:24.13.0-trixie-slim AS builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM
WORKDIR /gen3

# Copy dependency files first for better caching
COPY package.json package-lock.json ./

# Install ALL dependencies once (including dev deps for build)
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci && \
    npm cache clean --force

# Copy necessary config files
COPY next.config.js tsconfig.json tailwind.config.js postcss.config.js ./
COPY .env.production ./

# Copy source files
COPY ./src ./src
COPY ./public ./public
COPY ./config ./config
COPY ./start.sh ./

# Build and prune
RUN  npm run build:volume && \
    npm prune --omit=dev;

FROM node:24.13.0-trixie-slim AS runner

WORKDIR /gen3

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nextjs /gen3/.next/standalone ./.next/standalone
COPY --from=builder --chown=nextjs:nextjs /gen3/.next/static ./.next/standalone/.next/static
COPY --from=builder --chown=nextjs:nextjs /gen3/start.sh ./start.sh
COPY --from=builder --chown=nextjs:nextjs /gen3/config ./config
COPY --from=builder --chown=nextjs:nextjs /gen3/public ./public

#VOLUME /gen3/config
#VOLUME /gen3/public

RUN mkdir -p /gen3/.next/cache/images && \
   chmod -R 777 /gen3/.next/cache && \
   chown -R nextjs:nextjs /gen3/.next/cache

RUN chmod +x start.sh && \
    chown -R nextjs:nextjs start.sh

RUN rm -rf .next/standalone/config

RUN cd .next/standalone && \
    ln -s ../../config ./config && \
    ln -s ../../public ./public

USER nextjs:nextjs
CMD ["sh", "./start.sh"]
