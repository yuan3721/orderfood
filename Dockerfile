FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/server ./apps/server
COPY packages/shared ./packages/shared
COPY tsconfig.json ./

# Generate Prisma client
RUN cd apps/server && npx prisma generate

# Build
RUN pnpm --filter @orderfood/shared build
RUN pnpm --filter @orderfood/server build

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "apps/server/dist/index.js"]
