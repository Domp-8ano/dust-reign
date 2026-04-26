FROM node:22.12.0-alpine AS builder
WORKDIR /app
# Copy package files first (better layer caching)
COPY package.json ./
# Install ALL deps including devDependencies (needed for vite build)
RUN npm install --include=dev --no-audit --no-fund
# Copy source files
COPY . .
# Build the app
RUN npm run build
# Confirm dist was created
RUN ls -la /app/dist && echo "✅ Build successful"
# ── RUNNER STAGE ─────────────────────────────────────────────────────────────
FROM node:22.12.0-alpine AS runner
WORKDIR /app
# Install serve
RUN npm install -g serve@14
# Copy built dist from builder
COPY --from=builder /app/dist ./dist
# Confirm files exist in runner
RUN ls -la /app/dist && echo "✅ dist copied to runner"
# Use shell form so $PORT env variable is expanded at runtime
CMD sh -c "serve -s dist -l ${PORT:-8080}"