# Dokploy Deployment Guide

This guide explains how to deploy the HomaV React application using Dokploy.

## Prerequisites

- Dokploy instance running
- Docker and Docker Compose installed on the server
- Git repository access

## Files Created

- `Dockerfile` - Multi-stage build configuration
- `docker-compose.yml` - Container orchestration
- `nginx.conf` - Nginx configuration for production
- `.dockerignore` - Build context optimization

## Deployment Steps

### 1. Prepare the Repository

Ensure all files are committed and pushed to your Git repository:

```bash
git add .
git commit -m "Add Docker configuration for Dokploy deployment"
git push origin main
```

### 2. Deploy via Dokploy Dashboard

1. **Create New Project**
   - Log into your Dokploy dashboard
   - Click "New Project"
   - Name: `homav-frontend`
   - Description: `HomaV React Frontend Application`

2. **Configure Git Repository**
   - Repository URL: Your Git repository URL
   - Branch: `main` (or your preferred branch)
   - Build Context: `.` (root directory)

3. **Docker Configuration**
   - Dockerfile: `Dockerfile`
   - Docker Compose: `docker-compose.yml`
   - Port: `3000` (mapped to container port 80)

4. **Environment Variables**

   **Required variables:**
   - `NODE_ENV=production`
   - `VITE_API_BASE_URL=https://api.myhoma.ir`
   - `VITE_PUBLIC_POSTHOG_KEY=phc_5ie0tXqbc7I6IFfLeuhZg7FA6fMnyEu1SoaylZktoRp`
   - `VITE_PUBLIC_POSTHOG_HOST=https://eu.posthog.com`

   **Optional variables:**
   - `VITE_API_TIMEOUT=300000` (default: 5 minutes)
   - `VITE_API_IMAGE_PROCESSING_TIMEOUT=600000` (default: 10 minutes)

5. **Deploy**
   - Click "Deploy" to start the build process
   - Monitor the build logs for any issues

### 3. Alternative: Manual Deployment

If you prefer to deploy manually:

```bash
# Clone the repository
git clone <your-repo-url>
cd Homav02

# Build and run with Docker Compose
docker-compose up -d --build

# Check container status
docker-compose ps

# View logs
docker-compose logs -f homav-app
```

## Configuration Details

### Dockerfile Features

- **Multi-stage build**: Optimized for production
- **Node.js 18 Alpine**: Lightweight base image
- **Nginx Alpine**: Efficient web server
- **Non-root user**: Security best practice
- **Health checks**: Container monitoring

### Nginx Configuration

- **Gzip compression**: Reduced bandwidth usage
- **Static asset caching**: Improved performance
- **Security headers**: Enhanced security
- **SPA routing**: Handles client-side routing
- **Health endpoint**: `/health` for monitoring

### Port Configuration

- **Container Port**: 80 (Nginx)
- **Host Port**: 3000 (configurable)
- **Health Check**: Built-in endpoint

## Monitoring and Maintenance

### Health Checks

The application includes health checks accessible at:
- `http://your-domain:3000/health`

### Logs

View application logs:
```bash
docker-compose logs -f homav-app
```

### Updates

To update the application:
1. Push changes to your Git repository
2. Redeploy via Dokploy dashboard
3. Or run: `docker-compose up -d --build`

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Review build logs for specific errors

2. **Port Conflicts**
   - Change the host port in docker-compose.yml
   - Ensure port 3000 is available

3. **Memory Issues**
   - Increase Docker memory limits
   - Optimize build process if needed

4. **Routing Issues**
   - Verify nginx.conf handles SPA routing
   - Check try_files directive

### Performance Optimization

- Enable gzip compression (already configured)
- Use CDN for static assets
- Implement proper caching headers
- Monitor resource usage

## Security Considerations

- Non-root user execution
- Security headers included
- Hidden file access denied
- Regular security updates recommended

## Support

For issues specific to:
- **Dokploy**: Check Dokploy documentation
- **Docker**: Refer to Docker documentation
- **Nginx**: Consult Nginx configuration guide
- **Application**: Review application logs and code
