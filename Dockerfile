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

# Copy source code (including public folder)
COPY . .

# Verify public folder exists before build
RUN ls -la public/guidance-examples/ || echo "Warning: public/guidance-examples not found in source"

# Build the application
# Vite automatically copies public folder contents to build output root
RUN npm run build

# Verify that guidance-examples are in build output
# If not found, manually copy them (fallback)
RUN if [ ! -d "build/guidance-examples" ]; then \
      echo "Warning: guidance-examples not in build output, copying manually..." && \
      mkdir -p build/guidance-examples && \
      cp -r public/guidance-examples/* build/guidance-examples/ 2>/dev/null || true && \
      echo "Manually copied guidance-examples"; \
    else \
      echo "✓ guidance-examples found in build output"; \
    fi && \
    ls -la build/guidance-examples/ || echo "✗ Failed to copy guidance-examples"

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
