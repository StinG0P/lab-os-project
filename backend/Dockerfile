FROM node:22-alpine

WORKDIR /app

# Copy dependency configuration
COPY package*.json ./

# Install clean dependencies
RUN npm ci

# Copy database schema definitions and generate Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source code and build compiled outputs
COPY . .
RUN npm run build

EXPOSE 5000

# Execute server boot using tsx runner
CMD ["npx", "tsx", "src/server.ts"]
