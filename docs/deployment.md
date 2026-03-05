# Deployment Guide — Travel Shop Algeria

## AWS Architecture

```
┌─────────────────────────────────────────────┐
│                 CloudFront CDN              │
└────────────────────┬────────────────────────┘
                     │
       ┌─────────────┼───────────────┐
       │             │               │
┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
│ ALB (web)   │ │ ALB (api)│ │ S3 (assets) │
└──────┬──────┘ └────┬─────┘ └─────────────┘
       │             │
┌──────▼──────┐ ┌────▼─────────┐
│ ECS Fargate │ │ ECS Fargate  │
│ (Next.js)   │ │ (NestJS API) │
└─────────────┘ └────┬─────────┘
                     │
    ┌────────────────┼──────────────┐
    │                │              │
┌───▼────────┐ ┌────▼────┐ ┌──────▼──────┐
│ RDS        │ │ Elasti- │ │ OpenSearch  │
│ PostgreSQL │ │ Cache   │ │ (ES)        │
└────────────┘ └─────────┘ └─────────────┘
```

## Prerequisites

- AWS CLI configured
- Docker installed
- ECR repository created
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- OpenSearch domain

## Step 1: Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build & push backend
docker build -f docker/Dockerfile.backend -t tsa-backend ./backend
docker tag tsa-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/tsa-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/tsa-backend:latest

# Build & push web
docker build -f docker/Dockerfile.web -t tsa-web ./web
docker tag tsa-web:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/tsa-web:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/tsa-web:latest
```

## Step 2: Create ECS Task Definitions

Create task definitions for both the backend and web services. Set environment
variables using AWS Secrets Manager for sensitive values (DB credentials, JWT
secrets, Stripe keys).

Key environment variables for the backend task:
- `DB_HOST` — RDS endpoint
- `DB_PASSWORD` — from Secrets Manager
- `REDIS_HOST` — ElastiCache endpoint
- `ELASTICSEARCH_NODE` — OpenSearch endpoint
- `JWT_SECRET` — from Secrets Manager
- `STRIPE_SECRET_KEY` — from Secrets Manager

## Step 3: Create ECS Services

```bash
# Create backend service
aws ecs create-service \
  --cluster tsa-cluster \
  --service-name tsa-backend \
  --task-definition tsa-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --load-balancers targetGroupArn=<arn>,containerName=tsa-backend,containerPort=3001

# Create web service
aws ecs create-service \
  --cluster tsa-cluster \
  --service-name tsa-web \
  --task-definition tsa-web:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --load-balancers targetGroupArn=<arn>,containerName=tsa-web,containerPort=3000
```

## Step 4: Run Database Migrations

```bash
# Run a one-off ECS task for migrations
aws ecs run-task \
  --cluster tsa-cluster \
  --task-definition tsa-backend:1 \
  --overrides '{"containerOverrides":[{"name":"tsa-backend","command":["npm","run","migration:run"]}]}' \
  --launch-type FARGATE
```

## Step 5: Set Up CloudFront

1. Create a CloudFront distribution
2. Point to the ALB for the web service as origin
3. Configure a second origin for `/api/*` pointing to the API ALB
4. Enable HTTPS with ACM certificate

## Step 6: Configure DNS

Point your domain (e.g., `travelshopalgeria.com`) to the CloudFront distribution using Route 53.

## Monitoring

- **CloudWatch** — container logs, metrics, alarms
- **X-Ray** — distributed tracing
- **CloudWatch Dashboards** — custom dashboard for key metrics

## Auto-Scaling

Configure auto-scaling policies on both ECS services:
- Target CPU utilization: 60%
- Min tasks: 2, Max tasks: 10

## Cost Optimization

- Use Fargate Spot for non-critical workloads
- Enable RDS reserved instances for production
- Use ElastiCache reserved nodes
- Set up S3 lifecycle policies for uploaded assets
