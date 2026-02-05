# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

This project includes comprehensive specification documents:

- **UI Specification**: @doc/UI_SPEC.md - Complete screen designs and wireframes
- **API Specification**: @doc/API_SPEC.md - RESTful API endpoints, request/response formats
- **Test Specification**: @doc/TEST_SPEC.md - Test cases, test data, and testing strategy
- **Database Design**: @doc/DATABASE.md - Prisma schema, setup guide, and query examples
- **ER Diagram**: @doc/ER_DIAGRAM.md - Entity-relationship diagram with detailed explanations

## Project Overview

This is a **Sales Daily Report System (営業日報システム)** designed for sales representatives to report their daily activities and for managers to provide feedback.

## System Requirements

### Core Features

1. **Daily Report Management**: Sales reps create one daily report per day containing:
   - Multiple visit records (customer, visit content, time)
   - Problem: Today's issues/concerns
   - Plan: Tomorrow's tasks

2. **Comment System**: Managers can comment on subordinates' reports

3. **Master Data Management**:
   - Customer Master: customer info, industry, assigned sales rep
   - Sales Master: sales info, department, manager hierarchy

### Key Business Rules

- One report per sales rep per day (unique constraint: `report_date + sales_id`)
- Only managers can comment on subordinate reports (enforced via `Sales.manager_id`)
- Visit records must reference existing customers
- Managers can only view/comment on their direct reports' daily reports

## Data Model

### Entity Relationships

```
Sales (1) ---> (N) DailyReport (1) ---> (N) VisitRecord
Sales (1) ---> (N) Customer (1) ---> (N) VisitRecord
Sales (1) ---> (N) Comment
Sales (self-ref) manager_id for hierarchy
DailyReport (1) ---> (N) Comment
```

### Core Tables

- `Sales`:営業マスタ (sales_id PK, manager_id FK for hierarchy)
- `Customer`: 顧客マスタ (customer_id PK, sales_id FK)
- `DailyReport`: 日報 (report_id PK, sales_id FK, report_date UNIQUE per sales)
- `VisitRecord`: 訪問記録 (visit_id PK, report_id FK, customer_id FK)
- `Comment`: コメント (comment_id PK, report_id FK, commenter_id FK)

All tables include `created_at` and `updated_at` timestamps.

## API Architecture

### Authentication

- JWT-based authentication
- Token in header: `Authorization: Bearer {token}`
- Endpoints: `/auth/login`, `/auth/logout`, `/auth/refresh`

### API Endpoints Structure

**Daily Reports** (`/daily-reports`)

- `GET /daily-reports` - List own reports
- `GET /daily-reports/subordinates` - List subordinate reports (managers only)
- `GET /daily-reports/{report_id}` - Get report details with visits and comments
- `POST /daily-reports` - Create report (status: draft or submitted)
- `PUT /daily-reports/{report_id}` - Update report (owner only)
- `DELETE /daily-reports/{report_id}` - Delete draft reports only

**Visit Records** (`/visits`)

- `POST /daily-reports/{report_id}/visits` - Add visit to report
- `PUT /visits/{visit_id}` - Update visit
- `DELETE /visits/{visit_id}` - Delete visit

**Comments** (`/comments`)

- `POST /daily-reports/{report_id}/comments` - Add comment (managers only)
- `PUT /comments/{comment_id}` - Update own comment
- `DELETE /comments/{comment_id}` - Delete own comment

**Customers** (`/customers`)

- Standard CRUD operations
- `GET /customers/{customer_id}` includes recent visit history
- Cannot delete customers with existing visit records

**Sales** (`/sales`)

- Admin-only CRUD operations
- `GET /sales/subordinates` - Get direct reports
- Cannot delete sales reps with existing reports

**Dashboard** (`/dashboard`)

- `GET /dashboard` - Weekly summary, recent reports, subordinate status

### Response Format

```json
{
  "success": true/false,
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  },
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_count": 195,
    "limit": 20
  }
}
```

### Date/Time Formats

- Date: `YYYY-MM-DD`
- Time: `HH:MM:SS`
- DateTime: ISO 8601 `YYYY-MM-DDTHH:MM:SSZ`

## UI/UX Design

### Main Screens

1. **Dashboard**: Quick actions, weekly summary, recent reports
2. **Daily Report Form**: Date selector, visit records table (add/edit/delete rows), Problem/Plan textareas
3. **Report List**: Own reports and subordinate reports (managers), filterable by date range
4. **Report Detail**: Read-only view with comment thread (managers can add comments)
5. **Customer/Sales Master**: Standard CRUD list and forms

### Key UI Patterns

- **Visit Record Input**: Modal dialog with customer dropdown (from master), time input, content textarea
- **Status Indicators**: draft (下書き) vs submitted (提出済)
- **Comment Threading**: Manager name, timestamp, content (only managers can post)
- **Navigation**: Top nav with Dashboard/Reports/Customers/Sales sections

### Access Control in UI

- Regular sales reps: Can only see own reports and create/edit them
- Managers: Can view subordinate reports (read-only) and add comments
- Admins: Can manage Sales and Customer masters

## Development Guidelines

### Permission Checks

Always verify:

- Report ownership before allowing edit/delete
- Manager-subordinate relationship before showing subordinate data
- Manager role before allowing comments
- Admin role before allowing master data changes

### Data Integrity

- Enforce unique constraint: one report per sales rep per day
- Validate customer_id exists before creating visit records
- Validate sales_id exists before assigning customers
- Validate manager_id exists and prevent circular references in Sales hierarchy

### Status Transitions

- Reports: `draft` → `submitted` (one-way, no return to draft once submitted)
- Only draft reports can be deleted
- Submitted reports can be edited but not deleted

## Testing Strategy

### API Testing

- Authentication: login/logout flows, token expiration
- Authorization: permission checks for each endpoint
- CRUD operations: success and error cases for all entities
- Business rules: unique constraints, referential integrity, status transitions

### Integration Testing

- Manager-subordinate workflows: create report → manager views → manager comments → sales rep sees comment
- Visit record lifecycle: add to report → edit → delete
- Customer assignment: create customer → use in visit record → attempt deletion (should fail)

### UI Testing

- Form validation: required fields, date formats, dropdown selections
- Modal interactions: visit record add/edit
- Pagination and filtering on list screens
- Responsive design: mobile vs desktop layouts

## Development Commands

### Makefile Commands

This project uses Makefile for common operations:

```bash
make help              # Show all available commands
make install           # Install dependencies
make dev               # Start development server
make test              # Run tests
make test-watch        # Run tests in watch mode
make test-coverage     # Run tests with coverage
make lint              # Run linter
make lint-fix          # Run linter and auto-fix issues
make format            # Format code with Prettier
make prisma-generate   # Generate Prisma Client
make prisma-migrate    # Run database migrations
make prisma-studio     # Open Prisma Studio
make prisma-seed       # Seed database with test data
make docker-build      # Build Docker image
make deploy-prod       # Deploy to Cloud Run (production)
make deploy-staging    # Deploy to Cloud Run (staging)
```

### NPM Scripts

```bash
npm run lint           # Run ESLint
npm run lint:fix       # Run ESLint with auto-fix
npm run format         # Format with Prettier
npm run format:check   # Check formatting
npm test               # Run Vitest tests
npm run test:ui        # Run tests with UI
npm run test:coverage  # Run tests with coverage report
```

## CI/CD Pipeline

### GitHub Actions Workflows

**CI Workflow** (`.github/workflows/ci.yml`):

- Triggers: Push or PR to `main`/`develop` branches
- Steps:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies
  4. Generate Prisma Client
  5. Run linter
  6. Check code formatting
  7. Run tests with coverage
  8. Upload coverage to Codecov

**Deploy Workflow** (`.github/workflows/deploy.yml`):

- Triggers: Push to `main` branch
- Steps:
  1. Authenticate with Google Cloud (Workload Identity)
  2. Build Docker image
  3. Push to Google Container Registry
  4. Deploy to Cloud Run

### Cloud Run Configuration

- **Project ID**: `useful-loop-352201`
- **Service Name**: `sales-daily-report-system`
- **Region**: `asia-northeast1`
- **Resources**:
  - Memory: 1Gi (production), 512Mi (staging)
  - CPU: 2 (production), 1 (staging)
  - Max Instances: 10 (production), 5 (staging)
- **Secrets**: `DATABASE_URL`, `JWT_SECRET` (managed via Google Secret Manager)

### Git Hooks (Husky)

**Pre-commit**:

- Runs `lint-staged` to automatically format and lint staged files
- Ensures code quality before commits

**Commit-msg**:

- Validates commit messages follow Conventional Commits format
- Enforced types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`

### Commit Message Format

```
<type>: <subject>

<optional body>
```

Examples:

- `feat: 日報一覧画面の実装`
- `fix: 顧客検索のバグ修正`
- `docs: API仕様書の更新`
- `test: 日報作成のテスト追加`

## Deployment Process

### Manual Deployment

```bash
# Authenticate with Google Cloud
make gcloud-auth

# Deploy to production
make deploy-prod

# Deploy to staging
make deploy-staging

# Quick deploy (skip build)
make deploy-quick
```

### Automated Deployment

- Push to `main` branch triggers automatic deployment to production
- GitHub Actions handles build, test, and deploy process
- Secrets are injected from Google Secret Manager

### Cloud Build

Alternative deployment using Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml
```
