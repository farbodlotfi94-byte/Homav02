# Multi-stage build for React application
FROM node:18-alpine AS builder

# Accept build argument for API URL
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Accept other environment variables
ARG VITE_API_TIMEOUT
ARG VITE_API_IMAGE_PROCESSING_TIMEOUT
ENV VITE_API_TIMEOUT=${VITE_API_TIMEOUT}
ENV VITE_API_IMAGE_PROCESSING_TIMEOUT=${VITE_API_IMAGE_PROCESSING_TIMEOUT}

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Create a non-root user for the application files
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of application files
RUN chown -R nextjs:nodejs /usr/share/nginx/html

# Note: nginx runs as root by default for proper operation

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
