# -----------------------------
# Stage 1: Install Dependencies
# -----------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

# -----------------------------
# Stage 2: Build Application
# -----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Reuse installed dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy project files
COPY . .

# Increase Node.js heap during build
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build Next.js
RUN npm run build

# -----------------------------
# Stage 3: Production Image
# -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy production files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.server.json ./
COPY --from=builder /app/tsconfig.json ./

# Give ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "start"]