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

# Build Next.js + Compile custom server
# (Assumes package.json build script is:
# "build": "next build && tsc -p tsconfig.server.json")
RUN npm run build

# -----------------------------
# Stage 3: Production Image
# -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=384"

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Copy Next.js production build
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy compiled server output
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/server.js"]