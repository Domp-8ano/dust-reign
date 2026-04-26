FROM node:22.12.0-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --include=dev --no-audit --no-fund
COPY . .
RUN npm run build
# Verify dist was created and show contents
RUN ls -la /app/dist/
FROM node:22.12.0-alpine AS runner
WORKDIR /app
# Install serve globally
RUN npm install -g serve@14
# Copy built output from builder stage