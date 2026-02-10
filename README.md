# SGU-HRM - Hệ thống Quản lý Nhân sự Trường Đại học Sài Gòn

## Cấu trúc dự án

```
SGU-HRM/
├── apps/
│   ├── api/              # NestJS Backend API
│   ├── hrm-app/          # Next.js HRM Internal App
│   └── cms-portal/       # Next.js CMS Public Portal
├── docs/                 # Documentation
├── docker-compose.yml    # Dev infrastructure
└── .env.example          # Environment template
```

## Quick Start

### 1. Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Docker & Docker Compose

### 2. Setup Infrastructure

```bash
# Copy environment file
cp .env.example .env

# Start databases
docker compose up -d

# Verify services
docker compose ps
```

### 3. Setup API

```bash
cd apps/api
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm dev
```

### 4. Setup HRM App

```bash
cd apps/hrm-app
pnpm install
pnpm dev
```

## Services

| Service       | Port | URL                   |
| ------------- | ---- | --------------------- |
| API           | 3001 | http://localhost:3001 |
| HRM App       | 3000 | http://localhost:3000 |
| CMS Portal    | 3002 | http://localhost:3002 |
| PostgreSQL    | 5432 | -                     |
| Redis         | 6379 | -                     |
| MinIO API     | 9000 | http://localhost:9000 |
| MinIO Console | 9001 | http://localhost:9001 |

## Documentation

- [Implementation Plan](./docs/implementation_plan.md)
- [SRS](./docs/SRS-SGU-HRM.md)
- [Merge Checklist (P0)](./docs/merge-checklist.md)
