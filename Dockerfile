FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20-slim

RUN useradd -m appuser
USER appuser
WORKDIR /home/appuser

COPY package.json package-lock.json* ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

RUN mkdir -p ./files

EXPOSE 3000

CMD ["node", "dist/server.js"]
