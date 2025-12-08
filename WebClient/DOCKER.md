# Docker Deployment Guide

## Build Docker Image

```bash
docker build -t homee-webclient .
```

## Run Container

```bash
docker run -d -p 3000:80 --name homee-webclient homee-webclient
```

## Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Docker Commands

### View logs
```bash
docker logs homee-webclient
```

### Stop container
```bash
docker stop homee-webclient
```

### Start container
```bash
docker start homee-webclient
```

### Remove container
```bash
docker rm homee-webclient
```

### Remove image
```bash
docker rmi homee-webclient
```

## Push to Docker Hub

### 1. Login to Docker Hub
```bash
docker login
```

### 2. Tag your image
```bash
docker tag homee-webclient your-dockerhub-username/homee-webclient:latest
```

### 3. Push to Docker Hub
```bash
docker push your-dockerhub-username/homee-webclient:latest
```

### 4. Push with version tag
```bash
docker tag homee-webclient your-dockerhub-username/homee-webclient:v1.0.0
docker push your-dockerhub-username/homee-webclient:v1.0.0
```

## Pull and Run from Docker Hub

Anyone can pull and run your image:
```bash
docker pull your-dockerhub-username/homee-webclient:latest
docker run -d -p 3000:80 your-dockerhub-username/homee-webclient:latest
```

## Production Deployment

### Build for production with environment variables

1. Update `.env.production` with your production URLs

2. Build the image:
```bash
docker build -t your-dockerhub-username/homee-webclient:prod .
```

3. Push to Docker Hub:
```bash
docker push your-dockerhub-username/homee-webclient:prod
```

## Health Check

The container includes a health check endpoint:
```bash
curl http://localhost:3000/health
```

## Notes

- The Docker image uses a multi-stage build (Node.js for building, Nginx for serving)
- Final image size is optimized (~40MB)
- Nginx is configured for SPA routing (all routes serve index.html)
- Static assets are cached for 1 year
- Gzip compression is enabled
- Security headers are included
- Environment variables are baked in at build time from `.env.production`

