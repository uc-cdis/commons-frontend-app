# docker build -t gen3ff .
# docker run -p 3000:3000 -it gen3ff
# for Macbook silicon M1/m2 uncomment the following lines and comment quay.io/cdis/ubuntu:20.04:
#FROM arm64v8/ubuntu:20.04 as build

FROM quay.io/cdis/ubuntu:20.04 AS build

ARG NODE_VERSION=20

ARG BASE_PATH
ARG NEXT_PUBLIC_PORTAL_BASENAME
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

WORKDIR /gen3

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl1.1 \
    libgnutls30 \
    ca-certificates \
    curl \
    git \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && npm install -g npm@10.5.2

RUN  addgroup --system --gid 1001 nextjs && adduser --system --uid 1001 nextjs
COPY ./package.json ./package-lock.json ./
COPY ./package-lock.json ./
COPY ./src ./src
COPY ./public ./public
COPY ./config ./config
COPY ./next.config.js ./
COPY ./tsconfig.json ./
COPY ./.env.development ./
COPY ./.env.production ./
COPY ./tailwind.config.js ./
COPY ./postcss.config.js ./
COPY ./start.sh ./
RUN npm ci
RUN npm install \
    "@swc/core" \
    "@napi-rs/magic-string"
RUN npm run build
ENV PORT=3000
CMD bash ./start.sh
