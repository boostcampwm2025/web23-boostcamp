FROM node:22.14.0-alpine

# Install pnpm and nest cli
RUN npm install -g pnpm @nestjs/cli

WORKDIR /app

# Copy root workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy backend package config
COPY packages/backend/package.json ./packages/backend/

# Install dependencies (frozen-lockfile for consistency)
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY packages/backend ./packages/backend

# Set working directory to backend
WORKDIR /app/packages/backend

# Expose port
EXPOSE 8000

# Start development server
CMD ["pnpm", "run", "start:dev"]
