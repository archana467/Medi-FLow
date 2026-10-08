const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

const files = {};

// 1. backend/Dockerfile
files[path.join(BASE_DIR, "backend", "Dockerfile")] = `
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Environment vars should be passed at runtime
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
`;

// 2. backend/.dockerignore
files[path.join(BASE_DIR, "backend", ".dockerignore")] = `
node_modules
.env
npm-debug.log
logs
test
`;

// 3. frontend/Dockerfile
files[path.join(BASE_DIR, "frontend", "Dockerfile")] = `
# Stage 1: Build React/Vite app
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Default to /api so Nginx can reverse proxy properly
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ../nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`;

// 4. frontend/.dockerignore
files[path.join(BASE_DIR, "frontend", ".dockerignore")] = `
node_modules
dist
.env
npm-debug.log
`;

// 5. nginx/nginx.conf
files[path.join(BASE_DIR, "nginx", "nginx.conf")] = `
server {
    listen 80;

    # Frontend SPA
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO proxy
    location /socket.io/ {
        proxy_pass http://backend:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;

// 6. docker-compose.yml
files[path.join(BASE_DIR, "docker-compose.yml")] = `
version: '3.8'

services:
  backend:
    build:
      context: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=\${MONGODB_URI}
      - JWT_ACCESS_SECRET=\${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=\${JWT_REFRESH_SECRET}
      - REDIS_URL=redis://redis:6379
      - FRONTEND_URL=http://localhost
    depends_on:
      - redis
    networks:
      - mediflow_net
    restart: unless-stopped

  worker:
    build:
      context: ./backend
    command: ["node", "src/worker.js"]
    environment:
      - NODE_ENV=production
      - MONGODB_URI=\${MONGODB_URI}
      - REDIS_URL=redis://redis:6379
      - SMTP_HOST=\${SMTP_HOST}
      - SMTP_PORT=\${SMTP_PORT}
      - SMTP_USER=\${SMTP_USER}
      - SMTP_PASSWORD=\${SMTP_PASSWORD}
      - SMTP_FROM=\${SMTP_FROM}
    depends_on:
      - redis
    networks:
      - mediflow_net
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    networks:
      - mediflow_net
    depends_on:
      - backend
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    networks:
      - mediflow_net
    restart: unless-stopped
    # Redis is intentionally NOT exposed to host via ports directive

networks:
  mediflow_net:
    driver: bridge
`;

// 7. GitHub Actions CI
files[path.join(BASE_DIR, ".github", "workflows", "ci.yml")] = `
name: MediFlow CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'

    - name: Install Backend Dependencies
      run: cd backend && npm ci

    - name: Install Frontend Dependencies
      run: cd frontend && npm ci

    # Add testing steps here once tests are configured
    # - name: Run Backend Tests
    #   run: cd backend && npm test
    # - name: Run Frontend Tests
    #   run: cd frontend && npm test

    - name: Build Frontend
      run: cd frontend && npm run build

    - name: Verify Backend Docker Build
      run: docker build -t mediflow-backend ./backend

    - name: Verify Frontend Docker Build
      run: docker build -t mediflow-frontend -f ./frontend/Dockerfile .
`;

// 8. GitHub Actions Deploy (AWS ECR/ECS)
files[path.join(BASE_DIR, ".github", "workflows", "deploy.yml")] = `
name: Deploy to AWS ECS

on:
  push:
    branches:
      - main
  # Allow manual trigger
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: mediflow
  ECS_CLUSTER: mediflow-cluster
  ECS_BACKEND_SERVICE: mediflow-backend-service
  ECS_WORKER_SERVICE: mediflow-worker-service

jobs:
  deploy:
    name: Deploy to AWS
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Configure AWS credentials from OIDC
      uses: aws-actions/configure-aws-credentials@v2
      with:
        role-to-assume: arn:aws:iam::\${{ secrets.AWS_ACCOUNT_ID }}:role/github-actions-role
        aws-region: \${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: \${{ github.sha }}
      run: |
        # Build Backend/Worker
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:backend-$IMAGE_TAG ./backend
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:backend-$IMAGE_TAG
        
        # Build Frontend
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:frontend-$IMAGE_TAG -f ./frontend/Dockerfile .
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:frontend-$IMAGE_TAG
        
        echo "image_backend=$ECR_REGISTRY/$ECR_REPOSITORY:backend-$IMAGE_TAG" >> $GITHUB_OUTPUT
        echo "image_frontend=$ECR_REGISTRY/$ECR_REPOSITORY:frontend-$IMAGE_TAG" >> $GITHUB_OUTPUT

    # The following steps assume task definitions are prepared in AWS or locally
    # - name: Update ECS Task Definition
    # ...
    # - name: Deploy Amazon ECS task definition
    # ...
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 7 Infrastructure generated successfully.");
