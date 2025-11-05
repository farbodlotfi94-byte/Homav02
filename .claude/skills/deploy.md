# Deployment & Docker Skill

You are helping with deployment and Docker configuration for the HOMA application.

## Context

HOMA uses Docker for containerized deployment with Nginx serving static files. The app can be deployed to various platforms including Dokploy.

## Your Task

When working with deployment:

1. **Docker Architecture**
   - **Multi-stage Dockerfile**: Builder stage (Node 18) + Production stage (Nginx)
   - **Build stage**: npm install + npm run build with environment variables
   - **Production stage**: Nginx Alpine serving static files from `/usr/share/nginx/html`
   - **Port mapping**: 3000:80 (external:internal)
   - **Network**: homav-network

2. **Environment Variables**
   Required for build:
   ```bash
   VITE_API_BASE_URL=https://api.myhoma.ir
   VITE_API_TIMEOUT=300000
   VITE_API_IMAGE_PROCESSING_TIMEOUT=600000
   ```

3. **Docker Commands**

   **Build and Run:**
   ```bash
   # Build image
   docker build --build-arg VITE_API_BASE_URL=https://api.myhoma.ir \
                --build-arg VITE_API_TIMEOUT=300000 \
                --build-arg VITE_API_IMAGE_PROCESSING_TIMEOUT=600000 \
                -t homa-frontend .

   # Run container
   docker run -d -p 3000:80 --name homa-frontend homa-frontend

   # Using docker-compose
   docker-compose up -d --build

   # View logs
   docker-compose logs -f

   # Stop and remove
   docker-compose down
   ```

4. **Docker Compose Configuration**
   - Service name: `frontend`
   - Build context: `.`
   - Ports: `3000:80`
   - Network: `homav-network`
   - Restart policy: `unless-stopped`
   - Environment variables passed as build args
   - Health checks: Nginx status endpoint

5. **Nginx Configuration**
   - Serves from `/usr/share/nginx/html`
   - Default port: 80
   - SPA routing: All routes redirect to index.html
   - Gzip compression enabled
   - Cache headers for static assets
   - CORS headers if needed

6. **Dokploy Deployment**
   See `DEPLOYMENT.md` for detailed Dokploy instructions:
   - Git-based deployment
   - Environment variable configuration
   - Domain and SSL setup
   - Resource limits (CPU, memory)
   - Health check configuration
   - Zero-downtime deployments

7. **Build Process**
   ```bash
   # Local build
   npm run build
   # Output: build/ directory

   # Docker build
   # Stage 1: Install deps + build (Node 18)
   # Stage 2: Copy build/ to Nginx (Alpine)
   ```

8. **Production Checklist**
   - [ ] Environment variables configured
   - [ ] API base URL points to production backend
   - [ ] Build completes without errors
   - [ ] Static files served correctly
   - [ ] SPA routing works (no 404 on refresh)
   - [ ] HTTPS configured with valid SSL certificate
   - [ ] CORS headers allow frontend domain
   - [ ] Timeouts appropriate for production
   - [ ] Health checks working
   - [ ] Logs accessible for debugging

9. **Troubleshooting Deployment**

   **Build Fails:**
   - Check Node version (18+)
   - Verify all dependencies install
   - Check for TypeScript errors
   - Ensure environment variables set

   **Container Won't Start:**
   - Check Docker logs: `docker logs <container-id>`
   - Verify port not already in use
   - Check Nginx configuration
   - Ensure build/ directory populated

   **API Calls Fail:**
   - Verify VITE_API_BASE_URL correct
   - Check CORS configuration on backend
   - Verify SSL certificate valid
   - Check network connectivity
   - Ensure API endpoints accessible

   **404 on Page Refresh:**
   - Configure Nginx for SPA routing
   - Add try_files directive to nginx.conf
   - Ensure all routes point to index.html

10. **Performance Optimization**
    - Enable gzip compression in Nginx
    - Set cache headers for static assets
    - Minify JavaScript/CSS (Vite default)
    - Optimize images before build
    - Use CDN for static assets (optional)
    - Enable HTTP/2 in Nginx

## Key Files
- `Dockerfile` - Multi-stage Docker build
- `docker-compose.yml` - Docker Compose configuration
- `DEPLOYMENT.md` - Detailed deployment guide
- `.env` - Environment variables (not committed)
- `vite.config.ts` - Build configuration
- `nginx.conf` - Nginx server configuration (if custom)

## Deployment Platforms
- **Docker**: Direct container deployment
- **Docker Compose**: Multi-service orchestration
- **Dokploy**: Git-based PaaS deployment
- **Manual**: Nginx serving static files

## Conventions
- Environment variables prefixed with `VITE_`
- Port 3000 for frontend access (maps to :80 internally)
- Network name: `homav-network`
- Container name: `homa-frontend`
- Health checks on Nginx status endpoint
- Logs to stdout for Docker log collection