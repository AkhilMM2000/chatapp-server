# ----------------------------
# Stage 1: Builder
# ----------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the TypeScript code (compiles to dist/)
RUN npm run build

# ----------------------------
# Stage 2: Runtime
# ----------------------------
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy the compiled dist folder from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the backend port
EXPOSE 5001

# Start the server
CMD ["npm", "start"]
