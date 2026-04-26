FROM node:22.12.0-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --include=dev --no-audit --no-fund
COPY . .
RUN npm run build
RUN ls -la /app/dist && echo "BUILD OK"

FROM node:22.12.0-alpine AS runner
WORKDIR /app
RUN npm install -g serve@14
COPY --from=builder /app/dist ./dist
RUN ls -la /app/dist && echo "DIST OK"
CMD sh -c "serve -s dist -l ${PORT:-8080}"