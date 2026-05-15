# Docker Setup Guide for CloakChat

This guide will help you dockerize and run the CloakChat application using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git

## Quick Start

### 1. Clone or navigate to your project directory
```bash
cd dock_cloakchat
```

### 2. Create environment file
```bash
# For production
cp .env.docker .env.production.local

# OR for development
cp .env.docker .env.local
```

### 3. Update environment variables
Edit the `.env.production.local` (or `.env.local` for dev) file and add your actual values:
```env
NEXTAUTH_SECRET=your-super-secret-key-here
RESEND_API_KEY=your_resend_api_key_here
MONGO_ROOT_PASSWORD=your_secure_password
```

### 4. Run with Docker Compose

#### Production Setup
```bash
docker-compose up -d
```

#### Development Setup (with hot reload)
```bash
docker-compose -f docker-compose.dev.yml up
```

### 5. Access your application

- **Main App**: http://localhost:3000
- **MongoDB Express** (Database UI): http://localhost:8081
- **API**: http://localhost:3000/api

## Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb
```

### Stop containers
```bash
docker-compose down
```

### Stop and remove volumes (WARNING: This deletes database data)
```bash
docker-compose down -v
```

### Rebuild image
```bash
docker-compose build --no-cache
```

### Execute commands in running container
```bash
# Access app shell
docker-compose exec app sh

# Run npm command
docker-compose exec app npm install <package-name>
```

## File Structure

```
.
├── Dockerfile                 # Production multi-stage build
├── Dockerfile.dev            # Development Dockerfile with hot reload
├── docker-compose.yml        # Production configuration
├── docker-compose.dev.yml    # Development configuration
├── .dockerignore             # Files to ignore when building Docker image
├── .env.docker               # Template for environment variables
└── DOCKER_SETUP.md          # This file
```

## Services

### App Service
- **Port**: 3000
- **Description**: Next.js application with Socket.IO server
- **Build**: Multi-stage build for production; development build with hot reload
- **Health Check**: Enabled (checks every 30s)

### MongoDB Service
- **Port**: 27017
- **Description**: MongoDB database
- **Default Credentials**: root/root
- **Data Persistence**: Stored in Docker volume `mongodb_data`
- **Health Check**: Enabled (checks every 10s)

### MongoDB Express Service
- **Port**: 8081
- **Description**: Web UI for MongoDB management
- **Default Access**: http://localhost:8081

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://root:password@mongodb:27017/cloakchat?authSource=admin` |
| `NEXTAUTH_URL` | NextAuth redirect URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth sessions | Generate with `openssl rand -base64 32` |
| `RESEND_API_KEY` | Email service API key | From Resend.com |
| `NODE_ENV` | Environment mode | `production` or `development` |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | Any secure string |

## Generating NEXTAUTH_SECRET

### On Linux/Mac:
```bash
openssl rand -base64 32
```

### On Windows (PowerShell):
```powershell
[Convert]::ToBase64String([System.Random]::new().Next(1000000000) | % {[byte]::MinValue..255 | Get-Random}) | Select-Object -First 32
```

Or use an online generator: https://generate-secret.vercel.app/

## Production Deployment Tips

1. **Change Default Passwords**
   - Always change `MONGO_ROOT_PASSWORD` from "root" to a strong password

2. **Update NEXTAUTH_SECRET**
   - Generate a secure secret using the commands above

3. **Configure CORS**
   - Update `NEXT_PUBLIC_API_URL` to your production domain
   - Update `NEXTAUTH_URL` to your production domain
   - Update Socket.IO CORS in `server.ts` if needed

4. **Use Environment-Specific Files**
   - `.env.production.local` for production
   - `.env.local` for development

5. **Database Backups**
   - Set up MongoDB backups before production deployment
   - Consider using MongoDB Atlas instead of self-hosted

6. **SSL/TLS**
   - Use a reverse proxy (nginx) with SSL certificates
   - Update all URLs to use `https://`

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
# On Linux/Mac
lsof -i :3000

# On Windows
netstat -ano | findstr :3000

# Kill the process or change port in docker-compose.yml
```

### Database Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection from app container
docker-compose exec app npm install -g mongodb-client-tools
docker-compose exec app mongosh mongodb://root:root@mongodb:27017 -u root -p root
```

### Out of Memory
```bash
# Increase Docker desktop memory limit
# Docker Desktop > Settings > Resources > Memory
```

### Slow Hot Reload (Development)
```bash
# Increase file watchers
# Linux: echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

## Advanced Configurations

### Using with Nginx Reverse Proxy

Create `nginx.conf`:
```nginx
upstream app {
    server app:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Update docker-compose.yml:
```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    networks:
      - cloakchat-network
```

### Using MongoDB Atlas (Cloud)

Replace MongoDB service in docker-compose:
```bash
# Update .env with MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cloakchat
```

Then remove MongoDB services from docker-compose.yml and run only the app.

## Security Considerations

1. ✅ Never commit `.env.production.local` to version control
2. ✅ Use strong passwords for all services
3. ✅ Enable authentication for MongoDB
4. ✅ Use HTTPS in production
5. ✅ Keep Docker images updated
6. ✅ Regularly backup your data
7. ✅ Use non-root user in containers

## Performance Optimization

1. **Multi-stage Docker build** - Reduces final image size
2. **Alpine Linux** - Lightweight base image
3. **Node modules caching** - Leveraged in Dockerfile
4. **Health checks** - Automatic container restart on failure
5. **Volume mounts** - For persistent data and hot reload

## Next Steps

1. Start your application: `docker-compose up -d`
2. Verify it's running: `docker-compose ps`
3. Check logs: `docker-compose logs -f app`
4. Access the app: http://localhost:3000
5. Manage database: http://localhost:8081

## Support

For issues with:
- **Docker**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Next.js**: https://nextjs.org/docs
- **Socket.IO**: https://socket.io/docs/
- **MongoDB**: https://docs.mongodb.com/

