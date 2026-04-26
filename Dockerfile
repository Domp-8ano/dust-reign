FROM node:22.12.0-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --include=dev --no-audit --no-fund
COPY . .
RUN npm run build
FROM node:22.12.0-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]