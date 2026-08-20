FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner

# Install PHP, Bash and Git for local c2f CLI execution support
RUN apk add --no-cache bash php82 php82-json php82-phar php82-mbstring php82-openssl git

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

ENTRYPOINT ["node", "dist/index.js"]
