FROM node:22-alpine

WORKDIR /app

# Copy dependency configuration
COPY package*.json ./

# Install clean dependencies
RUN npm ci

# Copy source code and build compiled outputs
COPY . .
RUN npm run build
RUN cp -r public .next/standalone/public && cp -r .next/static .next/standalone/.next/static

EXPOSE 3000

# Execute server boot using Next.js standalone server
CMD ["node", ".next/standalone/server.js"]
