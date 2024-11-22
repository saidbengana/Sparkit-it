# Docker Deployment Guide for Spark-It

This guide will help you deploy Spark-It using Docker.

## Quick Start

```bash
docker compose -f docker-compose.yml up -d
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
POSTGRES_DB=sparkit
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# App Configuration
NODE_ENV=production
PUBLIC_URL=https://your-domain.com
JWT_SECRET=your_jwt_secret
STORAGE_BUCKET=sparkit

# Optional: OpenAI Integration
OPENAI_API_KEY=your_api_key

# Optional: Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your_username
SMTP_PASSWORD=your_password
```

## Production Deployment

For production deployment, we recommend:
1. Using Docker Swarm or Kubernetes
2. Setting up SSL/TLS
3. Implementing proper backup strategies
4. Monitoring with Prometheus/Grafana

## Volumes

The following volumes are created:
- `postgres_data`: Database files
- `minio_data`: File storage
- `redis_data`: Cache storage

## Security Best Practices

1. Never use default passwords
2. Keep Docker and all images updated
3. Use Docker secrets for sensitive data
4. Implement rate limiting
5. Regular security audits

## Troubleshooting

Common issues and solutions:
1. Database connection issues: Check PostgreSQL logs
2. Storage issues: Verify Minio configuration
3. Email not working: Check SMTP settings
